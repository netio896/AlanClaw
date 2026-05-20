let experts = Array.isArray(window.ALANCLAW_EXPERTS) ? [...window.ALANCLAW_EXPERTS] : [];

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

  return {
    ...current,
    title: elements.fieldTitle.value.trim(),
    category: elements.fieldCategory.value.trim(),
    sort_order: Number(elements.fieldSortOrder.value),
    card_summary: elements.fieldSummary.value.trim(),
    about_text: elements.fieldAbout.value.trim(),
    system_prompt: elements.fieldPrompt.value.trim(),
    tags: splitList(elements.fieldTags.value),
    languages_supported: splitList(elements.fieldLanguages.value),
    channels_supported: splitList(elements.fieldChannels.value),
    featured: elements.fieldFeatured.checked,
  };
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
        `<button type="button" class="chip ${state.category === category ? "active" : ""}" data-category="${category}">${category}</button>`
    )
    .join("");
}

function renderList() {
  const list = filteredExperts();
  elements.listCount.textContent = `${list.length} 条`;
  elements.expertList.innerHTML = list
    .map(
      (expert) => `
        <button type="button" class="expert-row ${expert.slug === state.selectedSlug ? "active" : ""}" data-slug="${expert.slug}">
          <strong>${expert.title}</strong>
          <span>${expert.category} · ${expert.languages_supported.join(" / ")}</span>
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

  elements.recordMeta.innerHTML = rows.map(([key, value]) => `<dt>${key}</dt><dd>${value}</dd>`).join("");
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
          <strong>${check.ok ? "通过" : "异常"} · ${check.label}</strong>
          <p>${check.detail}</p>
        </article>`
    )
    .join("");
}

function updatePreviewFromFields() {
  state.dirty = true;
  const title = elements.fieldTitle.value || "未命名专家";
  const summary = elements.fieldSummary.value || "还没有卡片简介。";
  elements.previewTitle.textContent = title;
  elements.previewSummary.textContent = summary;
  elements.previewFeatured.hidden = !elements.fieldFeatured.checked;
  setSaveStatus(state.apiAvailable ? "有未保存修改" : "静态模式无法保存", state.apiAvailable ? "warn" : "bad");
}

function render() {
  renderSummary();
  renderFilters();
  renderList();
  renderEditor();
  renderValidation();
  elements.saveButton.disabled = !state.apiAvailable;
  setSaveStatus(state.apiAvailable ? "本地服务已连接" : "静态预览模式", state.apiAvailable ? "ok" : "warn");
}

async function loadFromApi() {
  try {
    const response = await fetch("/api/experts");
    if (!response.ok) throw new Error(`GET /api/experts ${response.status}`);
    const payload = await response.json();
    experts = payload.experts;
    state.apiAvailable = true;
    state.selectedSlug = experts.find((expert) => expert.slug === state.selectedSlug)?.slug ?? experts[0]?.slug ?? "";
  } catch {
    state.apiAvailable = false;
  }
  render();
}

async function saveCatalog() {
  if (!state.apiAvailable) {
    setSaveStatus("没有连接本地服务，无法保存", "bad");
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

  elements.saveButton.disabled = true;
  setSaveStatus("正在保存并重新生成目录", "warn");

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
    experts = payload.experts;
    state.dirty = false;
    render();
    setSaveStatus(`已保存 ${payload.count} 条专家，并重新生成派生文件`, "ok");
  } catch (error) {
    setSaveStatus(error.message, "bad");
  } finally {
    elements.saveButton.disabled = !state.apiAvailable;
  }
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
    setSaveStatus(state.apiAvailable ? "本地服务已连接" : "静态预览模式", state.apiAvailable ? "ok" : "warn");
  }
});

elements.searchInput.addEventListener("input", (event) => {
  state.search = event.target.value;
  renderList();
});

editableFields.forEach((fieldName) => {
  elements[fieldName].addEventListener("input", updatePreviewFromFields);
});

elements.saveButton.addEventListener("click", saveCatalog);
elements.reloadButton.addEventListener("click", loadFromApi);

loadFromApi();
