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

  const adminPage = await fetchText("/");
  record("GET /", adminPage.response.status === 200 && adminPage.text.includes("AlanClaw 专家管理台"), `status ${adminPage.response.status}`);

  const webPage = await fetchText("/web/index.html");
  record("GET /web/index.html", webPage.response.status === 200 && webPage.text.includes("AlanClaw Experts"), `status ${webPage.response.status}`);

  const webData = await fetchText("/web/expert-data.js");
  record(
    "GET /web/expert-data.js",
    webData.response.status === 200 && webData.text.includes("window.ALANCLAW_EXPERTS") && webData.text.includes("缅甸销售助理"),
    `status ${webData.response.status}`
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
