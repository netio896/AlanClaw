import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
export const root = path.resolve(scriptDir, "..");
export const dataDir = path.join(root, "data", "experts");
export const contentDir = path.join(root, "content", "experts");
export const webDir = path.join(root, "apps", "web");
export const adminDir = path.join(root, "apps", "admin");
export const sourceJsonPath = path.join(dataDir, "alanclaw-experts.json");

const requiredFields = [
  "slug",
  "title",
  "category",
  "card_summary",
  "about_text",
  "system_prompt",
  "sort_order",
  "featured",
  "tags",
  "languages_supported",
  "channels_supported",
];

function csvEscape(value) {
  const text = String(value).replace(/"/g, '""');
  return `"${text}"`;
}

function writeText(filePath, text) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, text, "utf8");
}

function uniqueDuplicateValues(values) {
  const seen = new Set();
  const duplicates = new Set();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return [...duplicates];
}

export function loadExperts() {
  return JSON.parse(fs.readFileSync(sourceJsonPath, "utf8"));
}

export function validateExperts(experts) {
  const errors = [];
  if (!Array.isArray(experts)) {
    return ["Expert catalog must be a JSON array."];
  }

  const slugs = [];
  const sortOrders = [];

  experts.forEach((expert, index) => {
    for (const field of requiredFields) {
      if (!(field in expert)) {
        errors.push(`experts[${index}] missing ${field}`);
      }
    }

    if (expert.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(expert.slug)) {
      errors.push(`${expert.slug} has an invalid slug format`);
    }

    if (!Number.isInteger(Number(expert.sort_order))) {
      errors.push(`${expert.slug || `experts[${index}]`} has invalid sort_order`);
    }

    for (const field of ["tags", "languages_supported", "channels_supported"]) {
      if (!Array.isArray(expert[field]) || expert[field].length === 0) {
        errors.push(`${expert.slug || `experts[${index}]`} has invalid ${field}`);
      }
    }

    for (const field of ["title", "category", "card_summary", "about_text", "system_prompt"]) {
      if (typeof expert[field] !== "string" || !expert[field].trim()) {
        errors.push(`${expert.slug || `experts[${index}]`} has empty ${field}`);
      }
    }

    slugs.push(expert.slug);
    sortOrders.push(Number(expert.sort_order));
  });

  for (const slug of uniqueDuplicateValues(slugs)) {
    errors.push(`duplicate slug: ${slug}`);
  }

  for (const sortOrder of uniqueDuplicateValues(sortOrders)) {
    errors.push(`duplicate sort_order: ${sortOrder}`);
  }

  return errors;
}

function buildCsv(experts) {
  const csvHeader = [
    "slug",
    "title",
    "category",
    "card_summary",
    "about_text",
    "tags",
    "languages_supported",
    "channels_supported",
    "featured",
    "sort_order",
    "system_prompt",
  ].join(",");

  const csvRows = experts.map((expert) =>
    [
      expert.slug,
      expert.title,
      expert.category,
      expert.card_summary,
      expert.about_text,
      expert.tags.join("|"),
      expert.languages_supported.join("|"),
      expert.channels_supported.join("|"),
      expert.featured,
      expert.sort_order,
      expert.system_prompt,
    ]
      .map(csvEscape)
      .join(",")
  );

  return `${csvHeader}\n${csvRows.join("\n")}\n`;
}

function buildMarkdown(expert) {
  return `---
slug: ${expert.slug}
title: ${expert.title}
category: ${expert.category}
tags:
${expert.tags.map((tag) => `  - ${tag}`).join("\n")}
languages_supported:
${expert.languages_supported.map((item) => `  - ${item}`).join("\n")}
channels_supported:
${expert.channels_supported.map((item) => `  - ${item}`).join("\n")}
featured: ${expert.featured}
sort_order: ${expert.sort_order}
---

## 卡片简介

${expert.card_summary}

## 关于我

${expert.about_text}

## 系统提示词

${expert.system_prompt}
`;
}

export function generateExpertCatalog({ experts = loadExperts() } = {}) {
  const errors = validateExperts(experts);
  if (errors.length) {
    const error = new Error(`Expert catalog validation failed:\n${errors.join("\n")}`);
    error.validationErrors = errors;
    throw error;
  }

  const normalizedExperts = experts.map((expert) => ({
    ...expert,
    sort_order: Number(expert.sort_order),
    featured: Boolean(expert.featured),
  }));

  writeText(sourceJsonPath, `${JSON.stringify(normalizedExperts, null, 2)}\n`);
  writeText(path.join(dataDir, "alanclaw-experts.csv"), buildCsv(normalizedExperts));
  writeText(
    path.join(webDir, "expert-data.js"),
    `window.ALANCLAW_EXPERTS = ${JSON.stringify(normalizedExperts, null, 2)};\n`
  );
  writeText(
    path.join(adminDir, "expert-data.js"),
    `window.ALANCLAW_EXPERTS = ${JSON.stringify(normalizedExperts, null, 2)};\n`
  );

  for (const expert of normalizedExperts) {
    writeText(path.join(contentDir, `${expert.slug}.md`), buildMarkdown(expert));
  }

  return normalizedExperts;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const generated = generateExpertCatalog();
  console.log(`Generated ${generated.length} experts.`);
}
