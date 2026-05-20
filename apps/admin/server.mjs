import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  generateExpertCatalog,
  loadExperts,
  validateExperts,
} from "../../scripts/generate_expert_catalog.mjs";

const adminDir = path.dirname(fileURLToPath(import.meta.url));
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

async function serveStatic(req, res, pathname) {
  const requestedPath = pathname === "/" ? "/index.html" : pathname;
  const resolvedPath = path.resolve(adminDir, `.${decodeURIComponent(requestedPath)}`);

  if (!resolvedPath.startsWith(adminDir)) {
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
