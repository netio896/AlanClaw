#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const allowedExecutionStatuses = new Set(["ready_candidate", "planned", "manual", "blocked_external_account"]);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

export function loadExecutionValidationInputs(repoRoot = root) {
  return {
    experts: readJson(path.join(repoRoot, "data", "experts", "alanclaw-experts.json")),
    skillMap: readJson(path.join(repoRoot, "data", "execution", "expert-skill-map.json")),
    teamTemplates: readJson(path.join(repoRoot, "data", "team-templates", "alanclaw-team-templates.json")),
  };
}

function isSlug(value) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(value));
}

function isIntent(value) {
  return /^[a-z0-9]+(?:_[a-z0-9]+)*$/.test(String(value));
}

export function validateExecutionMap({ experts, skillMap, teamTemplates }) {
  const errors = [];
  const expertSlugs = new Set(experts.map((expert) => expert.slug));
  const mapSlugs = new Set(Object.keys(skillMap));

  for (const expert of experts) {
    if (!skillMap[expert.slug]) errors.push(`Missing route for expert slug: ${expert.slug}`);
  }

  for (const [slug, route] of Object.entries(skillMap)) {
    if (!isSlug(slug)) errors.push(`Route key is not a valid expert slug: ${slug}`);
    if (!expertSlugs.has(slug)) errors.push(`Route references unknown expert slug: ${slug}`);
    if (!route || typeof route !== "object" || Array.isArray(route)) {
      errors.push(`${slug} route must be an object`);
      continue;
    }
    if (!allowedExecutionStatuses.has(route.status)) errors.push(`${slug} has invalid status: ${route.status}`);
    if (typeof route.skill_key !== "string" || route.skill_key.trim().length === 0) errors.push(`${slug} must define skill_key`);
    if (!isIntent(route.intent)) errors.push(`${slug} must define snake_case intent`);
    if (typeof route.requires_files !== "boolean") errors.push(`${slug} requires_files must be boolean`);
    if (typeof route.requires_external_account !== "boolean") errors.push(`${slug} requires_external_account must be boolean`);
    if (route.status === "blocked_external_account" && route.requires_external_account !== true) {
      errors.push(`${slug} is blocked_external_account but requires_external_account is not true`);
    }
  }

  for (const team of teamTemplates) {
    for (const member of team.recommended_experts ?? []) {
      if (!expertSlugs.has(member.slug)) errors.push(`Team ${team.slug} references unknown expert slug: ${member.slug}`);
      if (!skillMap[member.slug]) errors.push(`Team ${team.slug} member has no route: ${member.slug}`);
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    expert_count: experts.length,
    route_count: mapSlugs.size,
    team_count: teamTemplates.length,
    ready_candidate_count: Object.values(skillMap).filter((route) => route.status === "ready_candidate").length,
    blocked_external_account_count: Object.values(skillMap).filter((route) => route.status === "blocked_external_account").length,
  };
}

export function validateExecutionMapFromRepo(repoRoot = root) {
  return validateExecutionMap(loadExecutionValidationInputs(repoRoot));
}

function parseArgs(argv) {
  const args = {
    json: false,
    repoRoot: root,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--json") args.json = true;
    else if (arg === "--repo-root") args.repoRoot = path.resolve(argv[++index] ?? "");
    else if (arg === "--help" || arg === "-h") args.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}

function print(result, asJson) {
  if (asJson) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }
  if (result.ok) {
    console.log(`Execution map valid: ${result.route_count} routes for ${result.expert_count} experts and ${result.team_count} teams.`);
    return;
  }
  console.error(result.errors.join("\n"));
}

const isCli = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isCli) {
  try {
    const args = parseArgs(process.argv.slice(2));
    if (args.help) {
      print({ ok: true, usage: ["node scripts/validate_execution_map.mjs --json"] }, args.json);
      process.exit(0);
    }
    const result = validateExecutionMapFromRepo(args.repoRoot);
    print(result, args.json);
    process.exit(result.ok ? 0 : 1);
  } catch (error) {
    print({ ok: false, errors: [error.message] }, process.argv.includes("--json"));
    process.exit(1);
  }
}
