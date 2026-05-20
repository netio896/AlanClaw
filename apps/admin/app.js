let experts = Array.isArray(window.ALANCLAW_EXPERTS) ? structuredClone(window.ALANCLAW_EXPERTS) : [];
let baselineExperts = structuredClone(experts);

const state = {
  selectedSlug: experts[0]?.slug ?? "",
  category: "全部",
  search: "",
  apiAvailable: false,
  dirty: false,
};

const elements = {
  catalogStatus: document.getElementById("catalogStatus"),
  summaryGrid: document.getElementById("summaryGrid"),
  listCount: document.getElementById("listCount"),
  searchInput: document.getElementById("searchInput"),
  categoryFilters: document.getElementById("categoryFilters"),
  expertList: document.getElementById("expertList"),
  editorTitle: document.getElementById("editorTitle"),
  fieldTitle: document.getElementById("fieldTitle"),
  fieldCategory: document.getElementById("fieldCategory"),
  fieldSlug: document.getElementById("fieldSlug"),
  fieldSortOrder: document.getElementById("fieldSortOrder"),
  fieldSummary: document.getElementById("fieldSummary"),
  fieldAbout: document.getElementById("fieldAbout"),
  fieldPrompt: document.getElementById("fieldPrompt"),
  fieldTags: document.getElementById("fieldTags"),
  fieldLanguages: document.getElementById("fieldLanguages"),
  fieldChannels: document.getElementById("fieldChannels"),
  fieldFeatured: document.getElementById("fieldFeatured"),
  saveButton: document.getElementById("saveButton"),
  reloadButton: document.getElementById("reloadButton"),
  saveStatus: document.getElementById("saveStatus"),
  previewFeatured: document.getElementById("previewFeatured"),
  previewTitle: document.getElementById("previewTitle"),
  previewSummary: document.getElementById("previewSummary"),
  validationList: document.getElementById("validationList"),
  recordMeta: document.getElementById("recordMeta"),
  importButton: document.getElementById("importButton"),
  importFileInput: document.getElementById("importFileInput"),
  exportJsonButton: document.getElementById("exportJsonButton"),
  exportCsvButton: document.getElementById("exportCsvButton"),
  importStatus: document.getElementById("importStatus"),
  diffSummary: document.getElementById("diffSummary"),
  diffList: document.getElementById("diffList"),
};

const editableFields = [
  "fieldTitle",
  "fieldCategory",
  "fieldSortOrder",
  "fieldSummary",
  "fieldAbout",
  "fieldPrompt",
  "fieldTags",
  "fieldLanguages",
  "fieldChannels",
  "fieldFeatured",
];

const diffFields = [
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
];

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function categories() {
  return ["全部", ...new Set(experts.map((expert) => expert.category))];
}

function selectedExpert() {
  return experts.find((expert) => expert.slug === state.selectedSlug) ?? experts[0];
}

function splitList(value) {
  return value
    .split(/[,\n|]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeExpert(expert) {
  return {
    ...expert,
    slug: String(expert.slug ?? "").trim(),
    title: String(expert.title ?? "").trim(),
    category: String(expert.category ?? "").trim(),
    card_summary: String(expert.card_summary ?? "").trim(),
    about_text: String(expert.about_text ?? "").trim(),
    system_prompt: String(expert.system_prompt ?? "").trim(),
    tags: Array.isArray(expert.tags) ? expert.tags.map(String).map((item) => item.trim()).filter(Boolean) : splitList(String(expert.tags ?? "")),
    languages_supported: Array.isArray(expert.languages_supported)
      ? expert.languages_supported.map(String).map((item) => item.trim()).filter(Boolean)
      : splitList(String(expert.languages_supported ?? "")),
    channels_supported: Array.isArray(expert.channels_supported)
      ? expert.channels_supported.map(String).map((item) => item.trim()).filter(Boolean)
      : splitList(String(expert.channels_supported ?? "")),
    featured: expert.featured === true || String(expert.featured).toLowerCase() === "true",
    sort_order: Number(expert.sort_order),
  };
}

function normalizeCatalog(catalog) {
  return catalog.map(normalizeExpert).sort((a, b) => a.sort_order - b.sort_order);
}

function filteredExperts() {
  const keyword = state.search.trim().toLowerCase();
  return experts.filter((expert) => {
    const categoryPass = state.category === "全部" || expert.category === state.category;
    const text = [expert.title, expert.category, expert.card_summary, ...expert.tags].join(" ").toLowerCase();
    return categoryPass && (!keyword || text.includes(keyword));
  });
}

function countDuplicates(values) {
  const seen = new Set();
  const duplicates = new Set();
  values.forEach((value) => {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  });
  return duplicates;
}

function validateCatalog(catalog = experts) {
  const slugDuplicates = countDuplicates(catalog.map((expert) => expert.slug));
  const sortDuplicates = countDuplicates(catalog.map((expert) => Number(expert.sort_order)));
  const missingRequired = catalog.filter(
    (expert) => !expert.slug || !expert.title || !expert.category || !expert.card_summary || !expert.about_text || !expert.system_prompt
  );
  const missingArrays = catalog.filter(
    (expert) =>
      !Array.isArray(expert.tags) ||
      !Array.isArray(expert.languages_supported) ||
      !Array.isArray(expert.channels_supported) ||
      expert.tags.length === 0 ||
      expert.languages_supported.length === 0 ||
      expert.channels_supported.length === 0
  );

  return [
    {
      label: "专家数量",
      ok: catalog.length === 18,
      detail: `当前 ${catalog.length} 条，v1 目标为 18 条。`,
    },
    {
      label: "Slug 唯一",
      ok: slugDuplicates.size === 0,
      detail: slugDuplicates.size ? `重复：${[...slugDuplicates].join(", ")}` : "没有重复 slug。",
    },
    {
      label: "排序唯一",
      ok: sortDuplicates.size === 0,
      detail: sortDuplicates.size ? `重复：${[...sortDuplicates].join(", ")}` : "sort_order 没有重复。",
    },
    {
      label: "必填字段",
      ok: missingRequired.length === 0,
      detail: missingRequired.length ? `缺字段：${missingRequired.map((item) => item.slug).join(", ")}` : "标题、分类、简介、关于我和系统提示词都有内容。",
    },
    {
      label: "数组字段",
      ok: missingArrays.length === 0,
      detail: missingArrays.length ? `标签/语言/渠道异常：${missingArrays.map((item) => item.slug).join(", ")}` : "标签、语言和渠道字段结构正常。",
    },
  ];
}

function readDraftExpert() {
  const current = selectedExpert();
  if (!current) return null;

  return normalizeExpert({
    ...current,
    title: elements.fieldTitle.value,
    category: elements.fieldCategory.value,
    sort_order: elements.fieldSortOrder.value,
    card_summary: elements.fieldSummary.value,
    about_text: elements.fieldAbout.value,
    system_prompt: elements.fieldPrompt.value,
    tags: splitList(elements.fieldTags.value),
    languages_supported: splitList(elements.fieldLanguages.value),
    channels_supported: splitList(elements.fieldChannels.value),
    featured: elements.fieldFeatured.checked,
  });
}

function applyDraftToMemory() {
  const draft = readDraftExpert();
  if (!draft) return;
  experts = experts.map((expert) => (expert.slug === draft.slug ? draft : expert));
}

function setSaveStatus(message, type = "neutral") {
  elements.saveStatus.textContent = message;
  elements.saveStatus.className = `save-status ${type}`;
}

function setImportStatus(message, type = "neutral") {
  elements.importStatus.textContent = message;
  elements.importStatus.className = `import-status ${type}`;
}

function calculateDiff(baseCatalog = baselineExperts, nextCatalog = experts) {
  const baseBySlug = new Map(baseCatalog.map((expert) => [expert.slug, expert]));
  const nextBySlug = new Map(nextCatalog.map((expert) => [expert.slug, expert]));
  const added = nextCatalog.filter((expert) => !baseBySlug.has(expert.slug));
  const removed = baseCatalog.filter((expert) => !nextBySlug.has(expert.slug));
  const modified = [];

  nextCatalog.forEach((next) => {
    const base = baseBySlug.get(next.slug);
    if (!base) return;
    const changes = diffFields
      .filter((field) => JSON.stringify(base[field]) !== JSON.stringify(next[field]))
      .map((field) => ({ field, before: base[field], after: next[field] }));
    if (changes.length) modified.push({ slug: next.slug, title: next.title, changes });
  });

  return { added, removed, modified, total: added.length + removed.length + modified.length };
}

function renderSummary() {
  const featured = experts.filter((expert) => expert.featured).length;
  const tagCount = new Set(experts.flatMap((expert) => expert.tags)).size;
  const channelCount = new Set(experts.flatMap((expert) => expert.channels_supported)).size;
  const cards = [
    ["专家", experts.length],
    ["分类", categories().length - 1],
    ["精选", featured],
    ["标签", tagCount],
    ["渠道", channelCount],
  ];

  elements.summaryGrid.innerHTML = cards
    .map(([label, value]) => `<article class="summary-card"><strong>${value}</strong><span>${label}</span></article>`)
    .join("");
}

function renderFilters() {
  elements.categoryFilters.innerHTML = categories()
    .map(
      (category) =>
        `<button type="button" class="chip ${state.category === category ? "active" : ""}" data-category="${escapeHtml(category)}">${escapeHtml(category)}</button>`
    )
    .join("");
}

function renderList() {
  const list = filteredExperts();
  elements.listCount.textContent = `${list.length} 条`;
  elements.expertList.innerHTML = list
    .map(
      (expert) => `
        <button type="button" class="expert-row ${expert.slug === state.selectedSlug ? "active" : ""}" data-slug="${escapeHtml(expert.slug)}">
          <strong>${escapeHtml(expert.title)}</strong>
          <span>${escapeHtml(expert.category)} · ${escapeHtml(expert.languages_supported.join(" / "))}</span>
        </button>`
    )
    .join("");
}

function renderEditor() {
  const expert = selectedExpert();
  if (!expert) return;

  elements.editorTitle.textContent = expert.title;
  elements.fieldTitle.value = expert.title;
  elements.fieldCategory.value = expert.category;
  elements.fieldSlug.value = expert.slug;
  elements.fieldSortOrder.value = expert.sort_order;
  elements.fieldSummary.value = expert.card_summary;
  elements.fieldAbout.value = expert.about_text;
  elements.fieldPrompt.value = expert.system_prompt;
  elements.fieldTags.value = expert.tags.join(", ");
  elements.fieldLanguages.value = expert.languages_supported.join(", ");
  elements.fieldChannels.value = expert.channels_supported.join(", ");
  elements.fieldFeatured.checked = expert.featured;
  elements.previewFeatured.hidden = !expert.featured;
  elements.previewTitle.textContent = expert.title;
  elements.previewSummary.textContent = expert.card_summary;
  renderRecordMeta(expert);
}

function renderRecordMeta(expert) {
  const rows = [
    ["Slug", expert.slug],
    ["分类", expert.category],
    ["标签", expert.tags.join(", ")],
    ["语言", expert.languages_supported.join(" / ")],
    ["渠道", expert.channels_supported.join(" / ")],
    ["精选", expert.featured ? "true" : "false"],
    ["排序", expert.sort_order],
  ];

  elements.recordMeta.innerHTML = rows.map(([key, value]) => `<dt>${escapeHtml(key)}</dt><dd>${escapeHtml(value)}</dd>`).join("");
}

function renderValidation() {
  const checks = validateCatalog();
  const allOk = checks.every((check) => check.ok);
  elements.catalogStatus.textContent = allOk ? "校验通过" : "需要检查";
  elements.catalogStatus.className = `status-pill ${allOk ? "ok" : "warn"}`;
  elements.validationList.innerHTML = checks
    .map(
      (check) => `
        <article class="check-item ${check.ok ? "ok" : "bad"}">
          <strong>${check.ok ? "通过" : "异常"} · ${escapeHtml(check.label)}</strong>
          <p>${escapeHtml(check.detail)}</p>
        </article>`
    )
    .join("");
}

function renderDiff() {
  const diff = calculateDiff();
  elements.diffSummary.textContent = diff.total
    ? `待保存变更：新增 ${diff.added.length}，删除 ${diff.removed.length}，修改 ${diff.modified.length}。`
    : "暂无变更。";

  const items = [
    ...diff.added.map((expert) => `<article class="diff-item add"><strong>新增 · ${escapeHtml(expert.title)}</strong><p>${escapeHtml(expert.slug)}</p></article>`),
    ...diff.removed.map((expert) => `<article class="diff-item remove"><strong>删除 · ${escapeHtml(expert.title)}</strong><p>${escapeHtml(expert.slug)}</p></article>`),
    ...diff.modified.map(
      (item) => `
        <article class="diff-item modify">
          <strong>修改 · ${escapeHtml(item.title)}</strong>
          <p>${escapeHtml(item.slug)} · ${item.changes.map((change) => escapeHtml(change.field)).join(", ")}</p>
        </article>`
    ),
  ];

  elements.diffList.innerHTML = items.slice(0, 12).join("");
  if (items.length > 12) {
    elements.diffList.insertAdjacentHTML("beforeend", `<p class="diff-more">还有 ${items.length - 12} 项变更未展开。</p>`);
  }
}

function render() {
  renderSummary();
  renderFilters();
  renderList();
  renderEditor();
  renderValidation();
  renderDiff();
  elements.saveButton.disabled = !state.apiAvailable;
  setSaveStatus(state.apiAvailable ? "本地服务已连接" : "静态预览模式", state.apiAvailable ? "ok" : "warn");
}

function updatePreviewFromFields() {
  state.dirty = true;
  applyDraftToMemory();
  const title = elements.fieldTitle.value || "未命名专家";
  const summary = elements.fieldSummary.value || "还没有卡片简介。";
  elements.previewTitle.textContent = title;
  elements.previewSummary.textContent = summary;
  elements.previewFeatured.hidden = !elements.fieldFeatured.checked;
  renderSummary();
  renderList();
  renderValidation();
  renderDiff();
  setSaveStatus(state.apiAvailable ? "有未保存修改，请检查右侧 diff 后保存" : "静态模式无法保存", state.apiAvailable ? "warn" : "bad");
}

async function loadFromApi() {
  try {
    const response = await fetch("/api/experts");
    if (!response.ok) throw new Error(`GET /api/experts ${response.status}`);
    const payload = await response.json();
    experts = normalizeCatalog(payload.experts);
    baselineExperts = structuredClone(experts);
    state.apiAvailable = true;
    state.selectedSlug = experts.find((expert) => expert.slug === state.selectedSlug)?.slug ?? experts[0]?.slug ?? "";
    setImportStatus("已从本地服务加载最新专家目录。", "ok");
  } catch {
    state.apiAvailable = false;
    setImportStatus("未连接本地服务，只能静态预览。", "warn");
  }
  state.dirty = false;
  render();
}

async function saveCatalog() {
  if (!state.apiAvailable) {
    setSaveStatus("没有连接本地服务，无法保存。", "bad");
    return;
  }

  applyDraftToMemory();
  const checks = validateCatalog();
  const failed = checks.filter((check) => !check.ok);
  if (failed.length) {
    render();
    setSaveStatus(`保存被拦截：${failed.map((check) => check.label).join(", ")}`, "bad");
    return;
  }

  const diff = calculateDiff();
  if (!diff.total) {
    setSaveStatus("没有检测到需要保存的变更。", "neutral");
    return;
  }

  elements.saveButton.disabled = true;
  setSaveStatus("正在保存并重新生成目录。", "warn");

  try {
    const response = await fetch("/api/experts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ experts }),
    });
    const payload = await response.json();
    if (!response.ok || !payload.ok) {
      throw new Error((payload.errors || [`POST /api/experts ${response.status}`]).join("; "));
    }
    experts = normalizeCatalog(payload.experts);
    baselineExperts = structuredClone(experts);
    state.dirty = false;
    render();
    setSaveStatus(`已保存 ${payload.count} 条专家，并重新生成派生文件。`, "ok");
    setImportStatus("保存完成，当前 diff 已清空。", "ok");
  } catch (error) {
    setSaveStatus(error.message, "bad");
  } finally {
    elements.saveButton.disabled = !state.apiAvailable;
  }
}

function parseCsv(text) {
  const rows = [];
  let field = "";
  let row = [];
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (quoted && char === '"' && next === '"') {
      field += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (!quoted && char === ",") {
      row.push(field);
      field = "";
    } else if (!quoted && (char === "\n" || char === "\r")) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(field);
      rows.push(row);
      field = "";
      row = [];
    } else {
      field += char;
    }
  }

  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }

  const [header, ...records] = rows.filter((item) => item.some((value) => value.trim()));
  if (!header || header.join(",") !== csvHeader.join(",")) {
    throw new Error("CSV 表头不符合 AlanClaw v1 导入契约。");
  }

  return records.map((record) => {
    const item = Object.fromEntries(header.map((key, index) => [key, record[index] ?? ""]));
    return normalizeExpert({
      slug: item.slug,
      title: item.title,
      category: item.category,
      card_summary: item.card_summary,
      about_text: item.about_text,
      tags: splitList(item.tags),
      languages_supported: splitList(item.languages_supported),
      channels_supported: splitList(item.channels_supported),
      featured: item.featured,
      sort_order: item.sort_order,
      system_prompt: item.system_prompt,
    });
  });
}

async function importFile(file) {
  if (!file) return;
  try {
    const text = await file.text();
    const imported = file.name.toLowerCase().endsWith(".csv") ? parseCsv(text) : normalizeCatalog(JSON.parse(text));
    const response = await fetch("/api/import/preview", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ experts: imported }),
    });
    const payload = await response.json();
    if (!response.ok || !payload.ok) {
      throw new Error((payload.errors || [`POST /api/import/preview ${response.status}`]).join("; "));
    }

    experts = normalizeCatalog(payload.experts);
    state.category = "全部";
    state.search = "";
    state.selectedSlug = experts[0]?.slug ?? "";
    state.dirty = true;
    elements.searchInput.value = "";
    render();
    setImportStatus(`导入预览已载入：${payload.count} 条，待保存变更 ${payload.diff.total_changes} 项。`, payload.diff.total_changes ? "warn" : "ok");
    setSaveStatus("导入内容尚未写盘，请检查 diff 后保存。", "warn");
  } catch (error) {
    setImportStatus(error.message, "bad");
  } finally {
    elements.importFileInput.value = "";
  }
}

function csvEscape(value) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

function buildCsv(catalog) {
  const rows = catalog.map((expert) =>
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
  return `${csvHeader.join(",")}\n${rows.join("\n")}\n`;
}

function downloadFile(filename, content, type) {
  applyDraftToMemory();
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

document.addEventListener("click", (event) => {
  const target = event.target.closest("[data-category], [data-slug]");
  if (!target) return;

  if (target.dataset.category) {
    state.category = target.dataset.category;
    renderFilters();
    renderList();
    return;
  }

  if (target.dataset.slug) {
    if (state.dirty) applyDraftToMemory();
    state.selectedSlug = target.dataset.slug;
    state.dirty = false;
    renderList();
    renderEditor();
    renderDiff();
    setSaveStatus(state.apiAvailable ? "本地服务已连接" : "静态预览模式", state.apiAvailable ? "ok" : "warn");
  }
});

elements.searchInput.addEventListener("input", (event) => {
  state.search = event.target.value;
  renderList();
});

editableFields.forEach((fieldName) => {
  elements[fieldName].addEventListener("input", updatePreviewFromFields);
  elements[fieldName].addEventListener("change", updatePreviewFromFields);
});

elements.saveButton.addEventListener("click", saveCatalog);
elements.reloadButton.addEventListener("click", loadFromApi);
elements.importButton.addEventListener("click", () => elements.importFileInput.click());
elements.importFileInput.addEventListener("change", (event) => importFile(event.target.files[0]));
elements.exportJsonButton.addEventListener("click", () =>
  downloadFile("alanclaw-experts.json", `${JSON.stringify(experts, null, 2)}\n`, "application/json;charset=utf-8")
);
elements.exportCsvButton.addEventListener("click", () => downloadFile("alanclaw-experts.csv", buildCsv(experts), "text/csv;charset=utf-8"));

loadFromApi();
