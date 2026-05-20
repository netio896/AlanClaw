import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

const port = Number(process.env.SMOKE_PORT || 4180);
const baseUrl = `http://127.0.0.1:${port}`;
const checks = [];

function record(name, ok, detail = "") {
  checks.push({ name, ok, detail });
  const marker = ok ? "PASS" : "FAIL";
  console.log(`${marker} ${name}${detail ? ` - ${detail}` : ""}`);
}

async function waitForServer() {
  const deadline = Date.now() + 6000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl}/api/health`);
      if (response.ok) return;
    } catch {
      // Server is still starting.
    }
    await delay(200);
  }
  throw new Error(`Server did not start on ${baseUrl}`);
}

async function fetchText(pathname) {
  const response = await fetch(`${baseUrl}${pathname}`);
  return { response, text: await response.text() };
}

async function fetchJson(pathname, options) {
  const response = await fetch(`${baseUrl}${pathname}`, options);
  return { response, json: await response.json() };
}

const child = spawn(process.execPath, ["apps/admin/server.mjs"], {
  cwd: new URL("..", import.meta.url),
  env: { ...process.env, PORT: String(port) },
  stdio: ["ignore", "pipe", "pipe"],
});

let stderr = "";
child.stderr.on("data", (chunk) => {
  stderr += chunk.toString();
});

try {
  await waitForServer();

  const health = await fetchJson("/api/health");
  record("GET /api/health", health.response.status === 200 && health.json.ok === true, `status ${health.response.status}`);

  const experts = await fetchJson("/api/experts");
  record("GET /api/experts", experts.response.status === 200 && experts.json.count === 18, `count ${experts.json.count}`);

  const teamTemplates = await fetchJson("/api/team-templates");
  record(
    "GET /api/team-templates",
    teamTemplates.response.status === 200 && teamTemplates.json.count === 3,
    `count ${teamTemplates.json.count}`
  );

  const adminPage = await fetchText("/");
  record("GET /", adminPage.response.status === 200 && adminPage.text.includes("AlanClaw 专家管理台"), `status ${adminPage.response.status}`);

  const webPage = await fetchText("/web/index.html");
  record("GET /web/index.html", webPage.response.status === 200 && webPage.text.includes("AlanClaw 专家广场"), `status ${webPage.response.status}`);

  const webData = await fetchText("/web/expert-data.js");
  record(
    "GET /web/expert-data.js",
    webData.response.status === 200 && webData.text.includes("window.ALANCLAW_EXPERTS") && webData.text.includes("缅甸销售助理"),
    `status ${webData.response.status}`
  );

  const teamData = await fetchText("/web/team-data.js");
  record(
    "GET /web/team-data.js",
    teamData.response.status === 200 &&
      teamData.text.includes("window.ALANCLAW_TEAM_TEMPLATES") &&
      teamData.text.includes("construction-project-team"),
    `status ${teamData.response.status}`
  );

  const adminTeamData = await fetchText("/team-data.js");
  record(
    "GET /team-data.js",
    adminTeamData.response.status === 200 &&
      adminTeamData.text.includes("window.ALANCLAW_TEAM_TEMPLATES") &&
      adminTeamData.text.includes("construction-project-team"),
    `status ${adminTeamData.response.status}`
  );

  const exportJson = await fetchJson("/api/export/json");
  record(
    "GET /api/export/json",
    exportJson.response.status === 200 && exportJson.json.ok === true && exportJson.json.experts.length === 18,
    `count ${exportJson.json.experts?.length ?? 0}`
  );

  const exportCsv = await fetchText("/api/export/csv");
  record(
    "GET /api/export/csv",
    exportCsv.response.status === 200 && exportCsv.text.split("\n")[0].startsWith("slug,title,category"),
    `status ${exportCsv.response.status}`
  );

  const preview = await fetchJson("/api/import/preview", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ experts: experts.json.experts }),
  });
  record(
    "POST /api/import/preview",
    preview.response.status === 200 && preview.json.ok === true && preview.json.diff.total_changes === 0,
    `changes ${preview.json.diff?.total_changes ?? "n/a"}`
  );

  const teamPreview = await fetchJson("/api/team-templates/preview", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ team_templates: teamTemplates.json.team_templates }),
  });
  record(
    "POST /api/team-templates/preview",
    teamPreview.response.status === 200 && teamPreview.json.ok === true && teamPreview.json.diff.total_changes === 0,
    `changes ${teamPreview.json.diff?.total_changes ?? "n/a"}`
  );

  const duplicateMemberTemplates = structuredClone(teamTemplates.json.team_templates);
  duplicateMemberTemplates[0].recommended_experts = [
    ...duplicateMemberTemplates[0].recommended_experts,
    { ...duplicateMemberTemplates[0].recommended_experts[0] },
  ];
  const duplicateMemberPreview = await fetchJson("/api/team-templates/preview", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ team_templates: duplicateMemberTemplates }),
  });
  record(
    "POST /api/team-templates/preview rejects duplicate members",
    duplicateMemberPreview.response.status === 422 &&
      duplicateMemberPreview.json.ok === false &&
      duplicateMemberPreview.json.errors.some((error) => error.includes("duplicate recommended expert slug")),
    `status ${duplicateMemberPreview.response.status}`
  );

  const unknownMemberTemplates = structuredClone(teamTemplates.json.team_templates);
  unknownMemberTemplates[0].recommended_experts[0].slug = "unknown-expert";
  const unknownMemberPreview = await fetchJson("/api/team-templates/preview", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ team_templates: unknownMemberTemplates }),
  });
  record(
    "POST /api/team-templates/preview rejects unknown members",
    unknownMemberPreview.response.status === 422 &&
      unknownMemberPreview.json.ok === false &&
      unknownMemberPreview.json.errors.some((error) => error.includes("unknown expert slug")),
    `status ${unknownMemberPreview.response.status}`
  );

  const teamSave = await fetchJson("/api/team-templates", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ team_templates: teamTemplates.json.team_templates }),
  });
  record(
    "POST /api/team-templates",
    teamSave.response.status === 200 && teamSave.json.ok === true && teamSave.json.count === 3,
    `status ${teamSave.response.status}`
  );

  const save = await fetchJson("/api/experts", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ experts: experts.json.experts }),
  });
  record("POST /api/experts", save.response.status === 200 && save.json.ok === true && save.json.count === 18, `status ${save.response.status}`);

  const failed = checks.filter((check) => !check.ok);
  if (failed.length) {
    throw new Error(`${failed.length} smoke checks failed`);
  }

  console.log(`Smoke checks passed against ${baseUrl}`);
} catch (error) {
  console.error(error.message);
  if (stderr.trim()) {
    console.error(stderr.trim());
  }
  process.exitCode = 1;
} finally {
  child.kill();
}
