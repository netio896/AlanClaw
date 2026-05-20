const teamEditorExperts = Array.isArray(window.ALANCLAW_EXPERTS) ? window.ALANCLAW_EXPERTS : [];
let editableTeamTemplates = Array.isArray(window.ALANCLAW_TEAM_TEMPLATES)
  ? structuredClone(window.ALANCLAW_TEAM_TEMPLATES)
  : [];
let baselineTeamTemplates = structuredClone(editableTeamTemplates);

const teamState = {
  selectedSlug: editableTeamTemplates[0]?.slug ?? "",
  apiAvailable: false,
  dirty: false,
};

const teamElements = {
  list: document.getElementById("teamEditorList"),
  listCount: document.getElementById("teamListCount"),
  editorTitle: document.getElementById("teamEditorTitle"),
  fieldTitle: document.getElementById("teamFieldTitle"),
  fieldIndustry: document.getElementById("teamFieldIndustry"),
  fieldSlug: document.getElementById("teamFieldSlug"),
  fieldSortOrder: document.getElementById("teamFieldSortOrder"),
  fieldSummary: document.getElementById("teamFieldSummary"),
  fieldUseCases: document.getElementById("teamFieldUseCases"),
  fieldLanguages: document.getElementById("teamFieldLanguages"),
  fieldChannels: document.getElementById("teamFieldChannels"),
  fieldFeatured: document.getElementById("teamFieldFeatured"),
  memberList: document.getElementById("teamMemberEditorList"),
  addMemberButton: document.getElementById("addTeamMemberButton"),
  saveButton: document.getElementById("saveTeamButton"),
  reloadButton: document.getElementById("reloadTeamButton"),
  saveStatus: document.getElementById("teamSaveStatus"),
  validationList: document.getElementById("teamValidationList"),
  diffSummary: document.getElementById("teamDiffSummary"),
  diffList: document.getElementById("teamDiffList"),
  expertSlugOptions: document.getElementById("expertSlugOptions"),
};

const teamFields = [
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

function teamEscapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function teamSplitList(value) {
  return String(value)
    .split(/[,\n|]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function selectedTeamTemplate() {
  return editableTeamTemplates.find((team) => team.slug === teamState.selectedSlug) ?? editableTeamTemplates[0];
}

function normalizeTeamTemplate(team) {
  return {
    ...team,
    slug: String(team.slug ?? "").trim(),
    title: String(team.title ?? "").trim(),
    industry: String(team.industry ?? "").trim(),
    card_summary: String(team.card_summary ?? "").trim(),
    use_cases: Array.isArray(team.use_cases) ? team.use_cases.map(String).map((item) => item.trim()).filter(Boolean) : teamSplitList(team.use_cases),
    recommended_experts: Array.isArray(team.recommended_experts)
      ? team.recommended_experts
          .map((member) => ({
            slug: String(member.slug ?? "").trim(),
            role: String(member.role ?? "").trim(),
            reason: String(member.reason ?? "").trim(),
          }))
          .filter((member) => member.slug || member.role || member.reason)
      : [],
    languages_supported: Array.isArray(team.languages_supported)
      ? team.languages_supported.map(String).map((item) => item.trim()).filter(Boolean)
      : teamSplitList(team.languages_supported),
    channels_supported: Array.isArray(team.channels_supported)
      ? team.channels_supported.map(String).map((item) => item.trim()).filter(Boolean)
      : teamSplitList(team.channels_supported),
    featured: team.featured === true || String(team.featured).toLowerCase() === "true",
    sort_order: Number(team.sort_order),
  };
}

function normalizeTeamCatalog(catalog) {
  return catalog.map(normalizeTeamTemplate).sort((a, b) => a.sort_order - b.sort_order);
}

function duplicateValues(values) {
  const seen = new Set();
  const duplicates = new Set();
  values.forEach((value) => {
    if (value === undefined || value === null || value === "" || Number.isNaN(value)) return;
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  });
  return duplicates;
}

function validateTeamCatalog(catalog = editableTeamTemplates) {
  const expertSlugs = new Set(teamEditorExperts.map((expert) => expert.slug));
  const slugDuplicates = duplicateValues(catalog.map((team) => team.slug));
  const sortDuplicates = duplicateValues(catalog.map((team) => Number(team.sort_order)));
  const missingRequired = catalog.filter((team) => !team.slug || !team.title || !team.industry || !team.card_summary);
  const missingArrays = catalog.filter(
    (team) =>
      !Array.isArray(team.use_cases) ||
      !Array.isArray(team.recommended_experts) ||
      !Array.isArray(team.languages_supported) ||
      !Array.isArray(team.channels_supported) ||
      team.use_cases.length === 0 ||
      team.recommended_experts.length === 0 ||
      team.languages_supported.length === 0 ||
      team.channels_supported.length === 0
  );
  const unknownMembers = catalog.flatMap((team) =>
    team.recommended_experts
      .filter((member) => !expertSlugs.has(member.slug))
      .map((member) => `${team.slug}: ${member.slug || "(empty)"}`)
  );
  const incompleteMembers = catalog.flatMap((team) =>
    team.recommended_experts
      .filter((member) => !member.slug || !member.role || !member.reason)
      .map((member) => `${team.slug}: ${member.slug || "(empty)"}`)
  );
  const duplicateMembers = catalog.flatMap((team) =>
    [...duplicateValues(team.recommended_experts.map((member) => member.slug))].map((slug) => `${team.slug}: ${slug}`)
  );

  return [
    {
      label: "模板数量",
      ok: catalog.length > 0,
      detail: `当前 ${catalog.length} 套模板。`,
    },
    {
      label: "团队标识唯一",
      ok: slugDuplicates.size === 0,
      detail: slugDuplicates.size ? `重复：${[...slugDuplicates].join(", ")}` : "没有重复团队标识。",
    },
    {
      label: "排序唯一",
      ok: sortDuplicates.size === 0,
      detail: sortDuplicates.size ? `重复：${[...sortDuplicates].join(", ")}` : "sort_order 没有重复。",
    },
    {
      label: "推荐专家存在",
      ok: unknownMembers.length === 0 && duplicateMembers.length === 0,
      detail:
        unknownMembers.length || duplicateMembers.length
          ? `未知/重复专家：${[...unknownMembers, ...duplicateMembers].join(", ")}`
          : "所有推荐专家标识都存在且不重复。",
    },
    {
      label: "必填字段",
      ok: missingRequired.length === 0 && incompleteMembers.length === 0,
      detail:
        missingRequired.length || incompleteMembers.length
          ? `缺字段：${[...missingRequired.map((team) => team.slug), ...incompleteMembers].join(", ")}`
          : "模板字段和成员角色/原因都有内容。",
    },
    {
      label: "数组字段",
      ok: missingArrays.length === 0,
      detail: missingArrays.length ? `数组异常：${missingArrays.map((team) => team.slug).join(", ")}` : "用例、成员、语言和渠道字段正常。",
    },
  ];
}

function readTeamDraft() {
  const current = selectedTeamTemplate();
  if (!current) return null;
  return normalizeTeamTemplate({
    ...current,
    title: teamElements.fieldTitle.value,
    industry: teamElements.fieldIndustry.value,
    sort_order: teamElements.fieldSortOrder.value,
    card_summary: teamElements.fieldSummary.value,
    use_cases: teamSplitList(teamElements.fieldUseCases.value),
    languages_supported: teamSplitList(teamElements.fieldLanguages.value),
    channels_supported: teamSplitList(teamElements.fieldChannels.value),
    featured: teamElements.fieldFeatured.checked,
  });
}

function applyTeamDraftToMemory() {
  const draft = readTeamDraft();
  if (!draft) return;
  editableTeamTemplates = editableTeamTemplates.map((team) => (team.slug === draft.slug ? draft : team));
}

function setTeamStatus(message, type = "neutral") {
  teamElements.saveStatus.textContent = message;
  teamElements.saveStatus.className = `save-status ${type}`;
}

function calculateTeamDiff(baseCatalog = baselineTeamTemplates, nextCatalog = editableTeamTemplates) {
  const baseBySlug = new Map(baseCatalog.map((team) => [team.slug, team]));
  const nextBySlug = new Map(nextCatalog.map((team) => [team.slug, team]));
  const added = nextCatalog.filter((team) => !baseBySlug.has(team.slug));
  const removed = baseCatalog.filter((team) => !nextBySlug.has(team.slug));
  const modified = [];

  nextCatalog.forEach((next) => {
    const base = baseBySlug.get(next.slug);
    if (!base) return;
    const changes = teamFields
      .filter((field) => JSON.stringify(base[field]) !== JSON.stringify(next[field]))
      .map((field) => ({ field, before: base[field], after: next[field] }));
    if (changes.length) modified.push({ slug: next.slug, title: next.title, changes });
  });

  return { added, removed, modified, total: added.length + removed.length + modified.length };
}

function renderTeamList() {
  teamElements.listCount.textContent = String(editableTeamTemplates.length);
  teamElements.list.innerHTML = editableTeamTemplates
    .map(
      (team) => `
        <button type="button" class="expert-row ${team.slug === teamState.selectedSlug ? "active" : ""}" data-team-slug="${teamEscapeHtml(team.slug)}">
          <strong>${teamEscapeHtml(team.title)}</strong>
          <span>${teamEscapeHtml(team.industry)} · ${team.recommended_experts.length} 位成员</span>
        </button>`
    )
    .join("");
}

function renderTeamEditor() {
  const team = selectedTeamTemplate();
  if (!team) return;

  teamElements.editorTitle.textContent = team.title;
  teamElements.fieldTitle.value = team.title;
  teamElements.fieldIndustry.value = team.industry;
  teamElements.fieldSlug.value = team.slug;
  teamElements.fieldSortOrder.value = team.sort_order;
  teamElements.fieldSummary.value = team.card_summary;
  teamElements.fieldUseCases.value = team.use_cases.join("\n");
  teamElements.fieldLanguages.value = team.languages_supported.join(", ");
  teamElements.fieldChannels.value = team.channels_supported.join(", ");
  teamElements.fieldFeatured.checked = team.featured;
  renderTeamMembers(team);
}

function renderTeamMembers(team) {
  teamElements.memberList.innerHTML = team.recommended_experts
    .map(
      (member, index) => `
        <article class="member-row" data-member-index="${index}">
          <label>
            <span>专家标识</span>
            <input list="expertSlugOptions" value="${teamEscapeHtml(member.slug)}" data-member-field="slug" />
          </label>
          <label>
            <span>成员角色</span>
            <input value="${teamEscapeHtml(member.role)}" data-member-field="role" />
          </label>
          <label class="wide">
            <span>加入原因</span>
            <textarea rows="2" data-member-field="reason">${teamEscapeHtml(member.reason)}</textarea>
          </label>
          <button type="button" class="secondary-button remove-member-button" data-remove-member="${index}">删除成员</button>
        </article>`
    )
    .join("");
}

function renderTeamValidation() {
  const checks = validateTeamCatalog();
  teamElements.validationList.innerHTML = checks
    .map(
      (check) => `
        <article class="check-item ${check.ok ? "ok" : "bad"}">
          <strong>${check.ok ? "通过" : "异常"} · ${teamEscapeHtml(check.label)}</strong>
          <p>${teamEscapeHtml(check.detail)}</p>
        </article>`
    )
    .join("");
}

function renderTeamDiff() {
  const diff = calculateTeamDiff();
  teamElements.diffSummary.textContent = diff.total
    ? `待保存变更：新增 ${diff.added.length}，删除 ${diff.removed.length}，修改 ${diff.modified.length}。`
    : "暂无变更。";

  const items = [
    ...diff.added.map((team) => `<article class="diff-item add"><strong>新增 · ${teamEscapeHtml(team.title)}</strong><p>${teamEscapeHtml(team.slug)}</p></article>`),
    ...diff.removed.map((team) => `<article class="diff-item remove"><strong>删除 · ${teamEscapeHtml(team.title)}</strong><p>${teamEscapeHtml(team.slug)}</p></article>`),
    ...diff.modified.map(
      (team) => `
        <article class="diff-item modify">
          <strong>修改 · ${teamEscapeHtml(team.title)}</strong>
          <p>${teamEscapeHtml(team.slug)} · ${team.changes.map((change) => teamEscapeHtml(change.field)).join(", ")}</p>
        </article>`
    ),
  ];

  teamElements.diffList.innerHTML = items.slice(0, 12).join("");
}

function renderTeamEditorApp() {
  renderTeamList();
  renderTeamEditor();
  renderTeamValidation();
  renderTeamDiff();
  teamElements.saveButton.disabled = !teamState.apiAvailable;
}

function updateTeamFromFields() {
  teamState.dirty = true;
  applyTeamDraftToMemory();
  renderTeamList();
  renderTeamValidation();
  renderTeamDiff();
  setTeamStatus(teamState.apiAvailable ? "团队模板有未保存修改，请检查右侧变更后保存。" : "静态模式无法保存。", teamState.apiAvailable ? "warn" : "bad");
}

function updateMemberField(index, field, value) {
  const team = selectedTeamTemplate();
  if (!team || !team.recommended_experts[index]) return;
  team.recommended_experts[index][field] = value;
  editableTeamTemplates = editableTeamTemplates.map((item) => (item.slug === team.slug ? normalizeTeamTemplate(team) : item));
  teamState.dirty = true;
  renderTeamList();
  renderTeamValidation();
  renderTeamDiff();
  setTeamStatus("团队成员有未保存修改，请检查右侧变更后保存。", "warn");
}

async function loadTeamTemplatesFromApi() {
  try {
    const response = await fetch("/api/team-templates");
    if (!response.ok) throw new Error(`GET /api/team-templates ${response.status}`);
    const payload = await response.json();
    editableTeamTemplates = normalizeTeamCatalog(payload.team_templates);
    baselineTeamTemplates = structuredClone(editableTeamTemplates);
    window.ALANCLAW_TEAM_TEMPLATES = editableTeamTemplates;
    teamState.apiAvailable = true;
    teamState.selectedSlug = editableTeamTemplates.find((team) => team.slug === teamState.selectedSlug)?.slug ?? editableTeamTemplates[0]?.slug ?? "";
    teamState.dirty = false;
    setTeamStatus("团队模板服务已连接。", "ok");
  } catch (error) {
    teamState.apiAvailable = false;
    setTeamStatus(error.message, "bad");
  }
  renderTeamEditorApp();
}

async function saveTeamTemplates() {
  if (!teamState.apiAvailable) {
    setTeamStatus("没有连接本地服务，无法保存团队模板。", "bad");
    return;
  }

  applyTeamDraftToMemory();
  const failed = validateTeamCatalog().filter((check) => !check.ok);
  if (failed.length) {
    renderTeamEditorApp();
    setTeamStatus(`保存被拦截：${failed.map((check) => check.label).join(", ")}`, "bad");
    return;
  }

  teamElements.saveButton.disabled = true;
  setTeamStatus("正在保存团队模板并重新生成 team-data.js。", "warn");

  try {
    const previewResponse = await fetch("/api/team-templates/preview", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ team_templates: editableTeamTemplates }),
    });
    const previewPayload = await previewResponse.json();
    if (!previewResponse.ok || !previewPayload.ok) {
      throw new Error((previewPayload.errors || [`POST /api/team-templates/preview ${previewResponse.status}`]).join("; "));
    }

    const response = await fetch("/api/team-templates", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ team_templates: editableTeamTemplates }),
    });
    const payload = await response.json();
    if (!response.ok || !payload.ok) {
      throw new Error((payload.errors || [`POST /api/team-templates ${response.status}`]).join("; "));
    }

    editableTeamTemplates = normalizeTeamCatalog(payload.team_templates);
    baselineTeamTemplates = structuredClone(editableTeamTemplates);
    window.ALANCLAW_TEAM_TEMPLATES = editableTeamTemplates;
    teamState.dirty = false;
    renderTeamEditorApp();
    setTeamStatus(`已保存 ${payload.count} 套团队模板，并重新生成 Web/Admin team-data.js。`, "ok");
  } catch (error) {
    setTeamStatus(error.message, "bad");
  } finally {
    teamElements.saveButton.disabled = !teamState.apiAvailable;
  }
}

teamElements.expertSlugOptions.innerHTML = teamEditorExperts
  .map((expert) => `<option value="${teamEscapeHtml(expert.slug)}">${teamEscapeHtml(expert.title)}</option>`)
  .join("");

[
  teamElements.fieldTitle,
  teamElements.fieldIndustry,
  teamElements.fieldSortOrder,
  teamElements.fieldSummary,
  teamElements.fieldUseCases,
  teamElements.fieldLanguages,
  teamElements.fieldChannels,
  teamElements.fieldFeatured,
].forEach((field) => {
  field.addEventListener("input", updateTeamFromFields);
  field.addEventListener("change", updateTeamFromFields);
});

document.addEventListener("click", (event) => {
  const teamButton = event.target.closest("[data-team-slug]");
  if (teamButton) {
    if (teamState.dirty) applyTeamDraftToMemory();
    teamState.selectedSlug = teamButton.dataset.teamSlug;
    teamState.dirty = false;
    renderTeamEditorApp();
    setTeamStatus(teamState.apiAvailable ? "团队模板服务已连接。" : "静态模式无法保存。", teamState.apiAvailable ? "ok" : "warn");
    return;
  }

  const removeButton = event.target.closest("[data-remove-member]");
  if (removeButton) {
    const team = selectedTeamTemplate();
    if (!team) return;
    const index = Number(removeButton.dataset.removeMember);
    team.recommended_experts.splice(index, 1);
    editableTeamTemplates = editableTeamTemplates.map((item) => (item.slug === team.slug ? normalizeTeamTemplate(team) : item));
    teamState.dirty = true;
    renderTeamEditor();
    renderTeamValidation();
    renderTeamDiff();
    setTeamStatus("团队成员有未保存修改，请检查右侧变更后保存。", "warn");
  }
});

teamElements.memberList.addEventListener("input", (event) => {
  const input = event.target.closest("[data-member-field]");
  if (!input) return;
  const row = input.closest("[data-member-index]");
  updateMemberField(Number(row.dataset.memberIndex), input.dataset.memberField, input.value);
});

teamElements.addMemberButton.addEventListener("click", () => {
  const team = selectedTeamTemplate();
  if (!team) return;
  team.recommended_experts.push({
    slug: teamEditorExperts[0]?.slug ?? "",
    role: "新成员角色",
    reason: "说明这个专家在团队中的职责。",
  });
  editableTeamTemplates = editableTeamTemplates.map((item) => (item.slug === team.slug ? normalizeTeamTemplate(team) : item));
  teamState.dirty = true;
  renderTeamEditor();
  renderTeamValidation();
  renderTeamDiff();
  setTeamStatus("已添加团队成员，请检查内容后保存。", "warn");
});

teamElements.reloadButton.addEventListener("click", loadTeamTemplatesFromApi);
teamElements.saveButton.addEventListener("click", saveTeamTemplates);

loadTeamTemplatesFromApi();
