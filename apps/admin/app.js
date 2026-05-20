const experts = Array.isArray(window.ALANCLAW_EXPERTS) ? window.ALANCLAW_EXPERTS : [];

const state = {
  selectedSlug: experts[0]?.slug ?? "",
  category: "全部",
  search: "",
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
  previewFeatured: document.getElementById("previewFeatured"),
  previewTitle: document.getElementById("previewTitle"),
  previewSummary: document.getElementById("previewSummary"),
  validationList: document.getElementById("validationList"),
  recordMeta: document.getElementById("recordMeta"),
};

const categories = ["全部", ...new Set(experts.map((expert) => expert.category))];
const editableFields = [
  "fieldTitle",
  "fieldCategory",
  "fieldSortOrder",
  "fieldSummary",
  "fieldAbout",
  "fieldPrompt",
];

function selectedExpert() {
  return experts.find((expert) => expert.slug === state.selectedSlug) ?? experts[0];
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

function validateCatalog() {
  const slugDuplicates = countDuplicates(experts.map((expert) => expert.slug));
  const sortDuplicates = countDuplicates(experts.map((expert) => expert.sort_order));
  const missingRequired = experts.filter(
    (expert) => !expert.slug || !expert.title || !expert.category || !expert.card_summary || !expert.about_text || !expert.system_prompt
  );
  const missingArrays = experts.filter(
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
      ok: experts.length === 18,
      detail: `当前 ${experts.length} 条，v1 目标为 18 条。`,
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

function renderSummary() {
  const featured = experts.filter((expert) => expert.featured).length;
  const tagCount = new Set(experts.flatMap((expert) => expert.tags)).size;
  const channelCount = new Set(experts.flatMap((expert) => expert.channels_supported)).size;
  const cards = [
    ["专家", experts.length],
    ["分类", categories.length - 1],
    ["精选", featured],
    ["标签", tagCount],
    ["渠道", channelCount],
  ];

  elements.summaryGrid.innerHTML = cards
    .map(([label, value]) => `<article class="summary-card"><strong>${value}</strong><span>${label}</span></article>`)
    .join("");
}

function renderFilters() {
  elements.categoryFilters.innerHTML = categories
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
  elements.previewTitle.textContent = elements.fieldTitle.value || "未命名专家";
  elements.previewSummary.textContent = elements.fieldSummary.value || "还没有卡片简介。";
}

function render() {
  renderSummary();
  renderFilters();
  renderList();
  renderEditor();
  renderValidation();
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
    state.selectedSlug = target.dataset.slug;
    renderList();
    renderEditor();
  }
});

elements.searchInput.addEventListener("input", (event) => {
  state.search = event.target.value;
  renderList();
});

editableFields.forEach((fieldName) => {
  elements[fieldName].addEventListener("input", updatePreviewFromFields);
});

render();
