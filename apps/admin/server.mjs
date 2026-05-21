import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildCsv,
  generateExpertCatalog,
  generateTeamTemplates,
  loadExperts,
  loadTeamTemplates,
  normalizeTeamTemplates,
  validateExperts,
  validateTeamTemplates,
} from "../../scripts/generate_expert_catalog.mjs";

const adminDir = path.dirname(fileURLToPath(import.meta.url));
const webDir = path.resolve(adminDir, "..", "web");
const rootDir = path.resolve(adminDir, "..", "..");
const port = Number(process.env.PORT || 4176);
const maxBodyBytes = 2_000_000;

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
};

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload, null, 2);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(body),
  });
  res.end(body);
}

function sendText(res, status, text, contentType = "text/plain; charset=utf-8") {
  res.writeHead(status, {
    "content-type": contentType,
    "content-length": Buffer.byteLength(text),
  });
  res.end(text);
}

function normalizeExperts(experts) {
  return experts.map((expert) => ({
    ...expert,
    sort_order: Number(expert.sort_order),
    featured: Boolean(expert.featured),
  }));
}

async function loadExecutionMap() {
  const mapPath = path.join(rootDir, "data", "execution", "expert-skill-map.json");
  return JSON.parse(await fs.readFile(mapPath, "utf8"));
}

function diffExperts(baseExperts, nextExperts) {
  const baseBySlug = new Map(baseExperts.map((expert) => [expert.slug, expert]));
  const nextBySlug = new Map(nextExperts.map((expert) => [expert.slug, expert]));
  const fields = [
    "title",
    "category",
    "card_summary",
    "about_text",
    "system_prompt",
    "tags",
    "languages_supported",
    "channels_supported",
    "featured",
    "sort_order",
  ];

  const added = nextExperts.filter((expert) => !baseBySlug.has(expert.slug)).map((expert) => expert.slug);
  const removed = baseExperts.filter((expert) => !nextBySlug.has(expert.slug)).map((expert) => expert.slug);
  const modified = [];

  for (const next of nextExperts) {
    const current = baseBySlug.get(next.slug);
    if (!current) continue;

    const changes = fields
      .filter((field) => JSON.stringify(current[field]) !== JSON.stringify(next[field]))
      .map((field) => ({
        field,
        before: current[field],
        after: next[field],
      }));

    if (changes.length) {
      modified.push({
        slug: next.slug,
        title: next.title,
        changes,
      });
    }
  }

  return {
    added,
    removed,
    modified,
    total_changes: added.length + removed.length + modified.length,
  };
}

function diffTeamTemplates(baseTemplates, nextTemplates) {
  const baseBySlug = new Map(baseTemplates.map((team) => [team.slug, team]));
  const nextBySlug = new Map(nextTemplates.map((team) => [team.slug, team]));
  const fields = [
    "title",
    "industry",
    "card_summary",
    "use_cases",
    "recommended_experts",
    "languages_supported",
    "channels_supported",
    "featured",
    "sort_order",
  ];

  const added = nextTemplates.filter((team) => !baseBySlug.has(team.slug)).map((team) => team.slug);
  const removed = baseTemplates.filter((team) => !nextBySlug.has(team.slug)).map((team) => team.slug);
  const modified = [];

  for (const next of nextTemplates) {
    const current = baseBySlug.get(next.slug);
    if (!current) continue;

    const changes = fields
      .filter((field) => JSON.stringify(current[field]) !== JSON.stringify(next[field]))
      .map((field) => ({
        field,
        before: current[field],
        after: next[field],
      }));

    if (changes.length) {
      modified.push({
        slug: next.slug,
        title: next.title,
        changes,
      });
    }
  }

  return {
    added,
    removed,
    modified,
    total_changes: added.length + removed.length + modified.length,
  };
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];

    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > maxBodyBytes) {
        reject(new Error("Request body is too large."));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

async function serveStaticFrom(res, baseDir, pathname) {
  const requestedPath = pathname === "/" ? "/index.html" : pathname;
  const resolvedPath = path.resolve(baseDir, `.${decodeURIComponent(requestedPath)}`);

  if (!resolvedPath.startsWith(baseDir)) {
    sendText(res, 403, "Forbidden");
    return;
  }

  try {
    const content = await fs.readFile(resolvedPath);
    const contentType = mimeTypes[path.extname(resolvedPath)] || "application/octet-stream";
    res.writeHead(200, {
      "content-type": contentType,
      "content-length": content.length,
    });
    res.end(content);
  } catch {
    sendText(res, 404, "Not Found");
  }
}

async function serveStatic(req, res, pathname) {
  if (pathname === "/web" || pathname === "/web/") {
    await serveStaticFrom(res, webDir, "/index.html");
    return;
  }

  if (pathname.startsWith("/web/")) {
    await serveStaticFrom(res, webDir, pathname.slice("/web".length));
    return;
  }

  await serveStaticFrom(res, adminDir, pathname);
}

async function handleApi(req, res, pathname) {
  if (req.method === "GET" && pathname === "/api/health") {
    sendJson(res, 200, { ok: true, service: "alanclaw-admin", port });
    return;
  }

  if (req.method === "GET" && pathname === "/api/experts") {
    const experts = loadExperts();
    sendJson(res, 200, { ok: true, count: experts.length, experts });
    return;
  }

  if (req.method === "GET" && pathname === "/api/team-templates") {
    const teamTemplates = loadTeamTemplates();
    sendJson(res, 200, { ok: true, count: teamTemplates.length, team_templates: teamTemplates });
    return;
  }

  if (req.method === "GET" && pathname === "/api/execution-map") {
    const executionMap = await loadExecutionMap();
    sendJson(res, 200, { ok: true, count: Object.keys(executionMap).length, execution_map: executionMap });
    return;
  }

  if (req.method === "POST" && pathname === "/api/team-templates/preview") {
    let payload;
    try {
      payload = JSON.parse(await readRequestBody(req));
    } catch (error) {
      sendJson(res, 400, { ok: false, errors: [error.message] });
      return;
    }

    const teamTemplates = Array.isArray(payload) ? payload : payload.team_templates;
    const experts = loadExperts();
    const inputErrors = validateTeamTemplates(teamTemplates, experts);
    if (inputErrors.length) {
      sendJson(res, 422, { ok: false, errors: inputErrors });
      return;
    }
    const normalizedTeamTemplates = normalizeTeamTemplates(teamTemplates);
    const errors = validateTeamTemplates(normalizedTeamTemplates, experts);
    if (errors.length) {
      sendJson(res, 422, { ok: false, errors });
      return;
    }

    const currentTeamTemplates = normalizeTeamTemplates(loadTeamTemplates());
    const diff = diffTeamTemplates(currentTeamTemplates, normalizedTeamTemplates);
    sendJson(res, 200, { ok: true, count: normalizedTeamTemplates.length, diff, team_templates: normalizedTeamTemplates });
    return;
  }

  if (req.method === "POST" && pathname === "/api/team-templates") {
    let payload;
    try {
      payload = JSON.parse(await readRequestBody(req));
    } catch (error) {
      sendJson(res, 400, { ok: false, errors: [error.message] });
      return;
    }

    const teamTemplates = Array.isArray(payload) ? payload : payload.team_templates;
    const experts = loadExperts();
    const inputErrors = validateTeamTemplates(teamTemplates, experts);
    if (inputErrors.length) {
      sendJson(res, 422, { ok: false, errors: inputErrors });
      return;
    }
    const normalizedTeamTemplates = normalizeTeamTemplates(teamTemplates);
    const errors = validateTeamTemplates(normalizedTeamTemplates, experts);
    if (errors.length) {
      sendJson(res, 422, { ok: false, errors });
      return;
    }

    try {
      const generated = generateTeamTemplates({ teamTemplates: normalizedTeamTemplates, experts });
      sendJson(res, 200, { ok: true, count: generated.length, team_templates: generated });
    } catch (error) {
      sendJson(res, 500, { ok: false, errors: [error.message] });
    }
    return;
  }

  if (req.method === "GET" && pathname === "/api/export/json") {
    const experts = loadExperts();
    sendJson(res, 200, { ok: true, count: experts.length, experts });
    return;
  }

  if (req.method === "GET" && pathname === "/api/export/csv") {
    const experts = loadExperts();
    sendText(res, 200, buildCsv(experts), "text/csv; charset=utf-8");
    return;
  }

  if (req.method === "POST" && pathname === "/api/import/preview") {
    let payload;
    try {
      payload = JSON.parse(await readRequestBody(req));
    } catch (error) {
      sendJson(res, 400, { ok: false, errors: [error.message] });
      return;
    }

    const experts = Array.isArray(payload) ? payload : payload.experts;
    const errors = validateExperts(experts);
    if (errors.length) {
      sendJson(res, 422, { ok: false, errors });
      return;
    }

    const normalizedExperts = normalizeExperts(experts);
    const currentExperts = loadExperts();
    const diff = diffExperts(currentExperts, normalizedExperts);
    sendJson(res, 200, { ok: true, count: normalizedExperts.length, diff, experts: normalizedExperts });
    return;
  }

  if (req.method === "POST" && pathname === "/api/experts") {
    let payload;
    try {
      payload = JSON.parse(await readRequestBody(req));
    } catch (error) {
      sendJson(res, 400, { ok: false, errors: [error.message] });
      return;
    }

    const experts = Array.isArray(payload) ? payload : payload.experts;
    const errors = validateExperts(experts);
    if (errors.length) {
      sendJson(res, 422, { ok: false, errors });
      return;
    }

    try {
      const generated = generateExpertCatalog({ experts });
      sendJson(res, 200, { ok: true, count: generated.length, experts: generated });
    } catch (error) {
      sendJson(res, 500, { ok: false, errors: [error.message] });
    }
    return;
  }

  sendJson(res, 404, { ok: false, errors: ["Unknown API route."] });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "127.0.0.1"}`);

  try {
    if (url.pathname.startsWith("/api/")) {
      await handleApi(req, res, url.pathname);
      return;
    }

    await serveStatic(req, res, url.pathname);
  } catch (error) {
    sendJson(res, 500, { ok: false, errors: [error.message] });
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`AlanClaw admin service listening on http://127.0.0.1:${port}/`);
});
