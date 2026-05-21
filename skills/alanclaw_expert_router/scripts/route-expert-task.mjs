#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptPath = fileURLToPath(import.meta.url);
const skillRoot = path.resolve(path.dirname(scriptPath), "..");
const defaultRepoRoot = path.resolve(skillRoot, "..", "..");
const allowedStatuses = new Set(["ready_candidate", "planned", "manual", "blocked_external_account"]);

function parseArgs(argv) {
  const args = {
    files: [],
    json: false,
    list: false,
    validate: false,
    repoRoot: defaultRepoRoot,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--json") args.json = true;
    else if (arg === "--list") args.list = true;
    else if (arg === "--validate") args.validate = true;
    else if (arg === "--repo-root") args.repoRoot = path.resolve(argv[++index] ?? "");
    else if (arg === "--expert-slug") args.expertSlug = argv[++index];
    else if (arg === "--task") args.task = argv[++index];
    else if (arg === "--files") args.files = String(argv[++index] ?? "").split(",").map((item) => item.trim()).filter(Boolean);
    else if (arg === "--help" || arg === "-h") args.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function loadCatalog(repoRoot) {
  const expertsPath = path.join(repoRoot, "data", "experts", "alanclaw-experts.json");
  const mapPath = path.join(repoRoot, "data", "execution", "expert-skill-map.json");
  return {
    experts: readJson(expertsPath),
    skillMap: readJson(mapPath),
    expertsPath,
    mapPath,
  };
}

function validateCatalog(experts, skillMap) {
  const errors = [];
  const expertSlugs = new Set(experts.map((expert) => expert.slug));
  const mapSlugs = new Set(Object.keys(skillMap));

  for (const expert of experts) {
    if (!skillMap[expert.slug]) errors.push(`Missing route for expert slug: ${expert.slug}`);
  }

  for (const [slug, route] of Object.entries(skillMap)) {
    if (!expertSlugs.has(slug)) errors.push(`Route references unknown expert slug: ${slug}`);
    if (!allowedStatuses.has(route.status)) errors.push(`${slug} has invalid status: ${route.status}`);
    if (route.status !== "manual" && !route.skill_key) errors.push(`${slug} must define skill_key unless status is manual`);
    if (!route.intent) errors.push(`${slug} must define intent`);
    if (route.status === "blocked_external_account" && route.requires_external_account !== true) {
      errors.push(`${slug} is blocked_external_account but requires_external_account is not true`);
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    expert_count: experts.length,
    route_count: mapSlugs.size,
    ready_candidate_count: Object.values(skillMap).filter((route) => route.status === "ready_candidate").length,
    blocked_external_account_count: Object.values(skillMap).filter((route) => route.status === "blocked_external_account").length,
  };
}

function buildRoutePlan(expert, route, args) {
  const warnings = [];
  if (route.requires_external_account) {
    warnings.push("This route requires an external account adapter and explicit user confirmation before any real execution.");
  }
  if (route.requires_files && args.files.length === 0) {
    warnings.push("This route expects files, but no --files value was provided.");
  }
  if (route.status === "manual") {
    warnings.push("This expert is currently manual/prompt-only; no skill execution should be attempted.");
  }

  return {
    ok: true,
    execution_mode: "plan_only",
    expert: {
      slug: expert.slug,
      title: expert.title,
      category: expert.category,
    },
    task: args.task ?? "",
    files: args.files,
    route: {
      skill_key: route.skill_key,
      intent: route.intent,
      status: route.status,
      requires_files: route.requires_files === true,
      requires_external_account: route.requires_external_account === true,
    },
    warnings,
    next_step: route.requires_external_account
      ? "Stop at planning. Add authorization, confirmation, audit logging, and a dedicated adapter before execution."
      : `Prepare a ${route.skill_key} / ${route.intent} plan. Do not execute external side effects in this router.`,
  };
}

function print(result, asJson) {
  if (asJson) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }
  if (!result.ok) {
    console.error(result.errors?.join("\n") || "AlanClaw expert router failed.");
    return;
  }
  if (result.routes) {
    console.log(`AlanClaw expert routes: ${result.routes.length}`);
    return;
  }
  console.log(`${result.expert.title} -> ${result.route.skill_key} / ${result.route.intent} (${result.route.status})`);
}

function help() {
  return {
    ok: true,
    usage: [
      "node skills/alanclaw_expert_router/scripts/route-expert-task.mjs --validate --json",
      "node skills/alanclaw_expert_router/scripts/route-expert-task.mjs --list --json",
      "node skills/alanclaw_expert_router/scripts/route-expert-task.mjs --expert-slug excel-data-cleanup-expert --task \"clean customer table\" --files customers.xlsx --json",
    ],
  };
}

try {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    print(help(), args.json);
    process.exit(0);
  }

  const { experts, skillMap } = loadCatalog(args.repoRoot);
  const validation = validateCatalog(experts, skillMap);
  if (args.validate) {
    print(validation, args.json);
    process.exit(validation.ok ? 0 : 1);
  }
  if (!validation.ok) {
    print(validation, args.json);
    process.exit(1);
  }

  if (args.list) {
    const routes = experts.map((expert) => ({
      expert_slug: expert.slug,
      title: expert.title,
      ...skillMap[expert.slug],
    }));
    print({ ok: true, execution_mode: "plan_only", routes }, args.json);
    process.exit(0);
  }

  if (!args.expertSlug) {
    throw new Error("Missing required argument: --expert-slug");
  }

  const expert = experts.find((item) => item.slug === args.expertSlug);
  if (!expert) {
    print({ ok: false, errors: [`Unknown expert slug: ${args.expertSlug}`] }, args.json);
    process.exit(1);
  }

  print(buildRoutePlan(expert, skillMap[expert.slug], args), args.json);
} catch (error) {
  print({ ok: false, errors: [error.message] }, process.argv.includes("--json"));
  process.exit(1);
}
