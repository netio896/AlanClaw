const experts = Array.isArray(window.ALANCLAW_EXPERTS) ? window.ALANCLAW_EXPERTS : [];
const teamTemplates = Array.isArray(window.ALANCLAW_TEAM_TEMPLATES) ? window.ALANCLAW_TEAM_TEMPLATES : [];

const storageKey = "alanclaw.myExperts";
const hotSlugs = [
  "myanmar-sales-assistant",
  "telegram-support-expert",
  "social-copywriting-expert",
  "facebook-ads-assistant",
  "quotation-followup-assistant",
  "content-topic-planner",
];
const fileRecommendationSlugs = [
  "document-summary-qa-expert",
  "excel-data-cleanup-expert",
  "document-organizer-master",
];

const state = {
  screen: "experts",
  marketMode: "experts",
  feed: "recommended",
  category: "全部",
  libraryCategory: "全部",
  search: "",
  selectedExpert: null,
  selectedTeam: null,
  savedSlugs: loadSavedSlugs(),
};

const elements = {
  expertCount: document.getElementById("expertCount"),
  featuredCount: document.getElementById("featuredCount"),
  feedTabs: document.getElementById("feedTabs"),
  categoryChips: document.getElementById("categoryChips"),
  libraryChips: document.getElementById("libraryChips"),
  searchInput: document.getElementById("searchInput"),
  expertList: document.getElementById("expertList"),
  marketModeSwitch: document.getElementById("marketModeSwitch"),
  expertSearchBar: document.querySelector(".search-bar"),
  expertControls: document.querySelector(".segment-group"),
  expertSectionTitle: document.getElementById("expertList").previousElementSibling,
  teamMarket: document.getElementById("teamMarket"),
  teamList: document.getElementById("teamList"),
  teamMeta: document.getElementById("teamMeta"),
  myExpertList: document.getElementById("myExpertList"),
  listHeading: document.getElementById("listHeading"),
  resultMeta: document.getElementById("resultMeta"),
  myExpertCount: document.getElementById("myExpertCount"),
  libraryEmpty: document.getElementById("libraryEmpty"),
  fileRecommendations: document.getElementById("fileRecommendations"),
  detailOverlay: document.getElementById("detailOverlay"),
  detailSheet: document.querySelector("#detailOverlay .detail-sheet"),
  detailCategory: document.getElementById("detailCategory"),
  detailTitle: document.getElementById("detailTitle"),
  detailTags: document.getElementById("detailTags"),
  detailLanguages: document.getElementById("detailLanguages"),
  detailChannels: document.getElementById("detailChannels"),
  detailSummary: document.getElementById("detailSummary"),
  detailAbout: document.getElementById("detailAbout"),
  detailPrompt: document.getElementById("detailPrompt"),
  detailAddButton: document.getElementById("detailAddButton"),
  teamOverlay: document.getElementById("teamOverlay"),
  teamDetailIndustry: document.getElementById("teamDetailIndustry"),
  teamDetailTitle: document.getElementById("teamDetailTitle"),
  teamDetailSummary: document.getElementById("teamDetailSummary"),
  teamUseCases: document.getElementById("teamUseCases"),
  teamMemberList: document.getElementById("teamMemberList"),
  teamAddButton: document.getElementById("teamAddButton"),
  screens: Array.from(document.querySelectorAll(".screen")),
  navItems: Array.from(document.querySelectorAll(".nav-item")),
  closeDetailControls: Array.from(document.querySelectorAll("[data-close-detail]")),
  closeTeamControls: Array.from(document.querySelectorAll("[data-close-team]")),
};

const feedOptions = [
  { key: "recommended", label: "推荐" },
  { key: "hot", label: "热门" },
  { key: "latest", label: "最新" },
];
const categories = ["全部", ...new Set(experts.map((expert) => expert.category))];

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function loadSavedSlugs() {
  try {
    const raw = window.localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persistSavedSlugs() {
  window.localStorage.setItem(storageKey, JSON.stringify(state.savedSlugs));
}

function isSaved(slug) {
  return state.savedSlugs.includes(slug);
}

function toggleSaved(slug) {
  state.savedSlugs = isSaved(slug)
    ? state.savedSlugs.filter((item) => item !== slug)
    : [...state.savedSlugs, slug];
  persistSavedSlugs();
  render();
  updateDetailButton();
}

function teamExpertSlugs(team) {
  return team.recommended_experts
    .map((member) => member.slug)
    .filter((slug) => experts.some((expert) => expert.slug === slug));
}

function addTeam(slugs) {
  state.savedSlugs = [...new Set([...state.savedSlugs, ...slugs])];
  persistSavedSlugs();
  render();
  updateTeamButton();
}

function getFeedExperts() {
  if (state.feed === "recommended") {
    return experts.filter((expert) => expert.featured);
  }

  if (state.feed === "hot") {
    return hotSlugs.map((slug) => experts.find((expert) => expert.slug === slug)).filter(Boolean);
  }

  return [...experts].sort((a, b) => b.sort_order - a.sort_order);
}

function applyFilters(list, category, search) {
  const keyword = search.trim().toLowerCase();
  return list.filter((expert) => {
    const categoryPass = category === "全部" || expert.category === category;
    const textPass =
      !keyword ||
      [expert.title, expert.category, expert.card_summary, ...expert.tags].join(" ").toLowerCase().includes(keyword);
    return categoryPass && textPass;
  });
}

function renderFeedTabs() {
  elements.feedTabs.innerHTML = feedOptions
    .map(
      (option) => `
        <button type="button" class="segment-button ${
          state.feed === option.key ? "segment-button-active" : ""
        }" data-feed="${option.key}">
          ${option.label}
        </button>`
    )
    .join("");
}

function renderChips(target, activeCategory, attrName) {
  target.innerHTML = categories
    .map(
      (category) => `
        <button type="button" class="chip ${activeCategory === category ? "chip-active" : ""}" ${attrName}="${escapeHtml(category)}">
          ${escapeHtml(category)}
        </button>`
    )
    .join("");
}

function buildExpertCard(expert) {
  const saved = isSaved(expert.slug);
  return `
    <article class="expert-card">
      <header>
        <div>
          ${expert.featured ? '<span class="featured-badge">精选</span>' : ""}
          <h3>${escapeHtml(expert.title)}</h3>
          <p>${escapeHtml(expert.card_summary)}</p>
        </div>
        <button type="button" class="card-action ${saved ? "saved" : ""}" data-save-slug="${escapeHtml(expert.slug)}">
          ${saved ? "已添加" : "添加"}
        </button>
      </header>
      <footer>
        <div class="expert-meta">
          <span>${escapeHtml(expert.category)}</span>
          <span>${escapeHtml(expert.languages_supported.join(" / "))}</span>
        </div>
        <button type="button" class="ghost-icon" data-open-slug="${escapeHtml(expert.slug)}" aria-label="查看详情">→</button>
      </footer>
    </article>
  `;
}

function buildTeamCard(team) {
  const memberCount = teamExpertSlugs(team).length;
  return `
    <article class="team-card">
      <div>
        <span class="featured-badge">${escapeHtml(team.industry)}</span>
        <h3>${escapeHtml(team.title)}</h3>
        <p>${escapeHtml(team.card_summary)}</p>
      </div>
      <div class="team-card-meta">
        <span>${memberCount} 位成员</span>
        <span>${escapeHtml(team.channels_supported.join(" / "))}</span>
      </div>
      <button type="button" class="primary-button" data-open-team="${escapeHtml(team.slug)}">查看团队</button>
    </article>
  `;
}

function renderExpertList() {
  const filtered = applyFilters(getFeedExperts(), state.category, state.search);
  const headingMap = {
    recommended: "推荐专家",
    hot: "热门专家",
    latest: "最新上架",
  };

  elements.listHeading.textContent = headingMap[state.feed];
  elements.resultMeta.textContent = `${filtered.length} 个结果`;
  elements.expertList.innerHTML = filtered.length
    ? filtered.map(buildExpertCard).join("")
    : `<div class="empty-state"><h3>没有匹配的专家</h3><p>试试换一个关键词，或者切回全部分类。</p></div>`;
}

function renderTeamMarket() {
  elements.teamMeta.textContent = `${teamTemplates.length} 套模板`;
  elements.teamList.innerHTML = teamTemplates.map(buildTeamCard).join("");
}

function renderMarketMode() {
  const isTeams = state.marketMode === "teams";
  elements.expertSearchBar.classList.toggle("hidden", isTeams);
  elements.expertControls.classList.toggle("hidden", isTeams);
  elements.expertSectionTitle.classList.toggle("hidden", isTeams);
  elements.expertList.classList.toggle("hidden", isTeams);
  elements.teamMarket.classList.toggle("hidden", !isTeams);
  elements.marketModeSwitch.querySelectorAll("[data-market-mode]").forEach((button) => {
    button.classList.toggle("mode-button-active", button.dataset.marketMode === state.marketMode);
  });
}

function renderLibrary() {
  const savedExperts = experts.filter((expert) => isSaved(expert.slug));
  const filtered = applyFilters(savedExperts, state.libraryCategory, "");

  elements.myExpertCount.textContent = `${savedExperts.length} 个已添加`;
  elements.libraryEmpty.classList.toggle("hidden", savedExperts.length > 0);
  elements.myExpertList.innerHTML = filtered.map(buildExpertCard).join("");
}

function renderFileRecommendations() {
  const items = fileRecommendationSlugs
    .map((slug) => experts.find((expert) => expert.slug === slug))
    .filter(Boolean);

  elements.fileRecommendations.innerHTML = items
    .map(
      (expert) => `
        <article class="mini-item">
          <strong>${escapeHtml(expert.title)}</strong>
          <p>${escapeHtml(expert.card_summary)}</p>
        </article>`
    )
    .join("");
}

function renderScreens() {
  elements.screens.forEach((screen) => {
    screen.classList.toggle("screen-active", screen.dataset.screen === state.screen);
  });

  elements.navItems.forEach((item) => {
    item.classList.toggle("nav-item-active", item.dataset.screenTarget === state.screen);
  });
}

function updateSummaryStats() {
  elements.expertCount.textContent = String(experts.length);
  elements.featuredCount.textContent = String(teamTemplates.length);
}

function openDetail(slug) {
  const expert = experts.find((item) => item.slug === slug);
  if (!expert) return;

  state.selectedExpert = expert;
  elements.detailCategory.textContent = expert.category;
  elements.detailTitle.textContent = expert.title;
  elements.detailTags.innerHTML = expert.tags.map((tag) => `<span class="tag-pill">${escapeHtml(tag)}</span>`).join("");
  elements.detailLanguages.textContent = expert.languages_supported.join(" / ");
  elements.detailChannels.textContent = expert.channels_supported.join(" / ");
  elements.detailSummary.textContent = expert.card_summary;
  elements.detailAbout.textContent = expert.about_text;
  elements.detailPrompt.textContent = expert.system_prompt;
  if (elements.detailSheet) elements.detailSheet.scrollTop = 0;
  updateDetailButton();
  elements.detailOverlay.classList.remove("hidden");
  elements.detailOverlay.setAttribute("aria-hidden", "false");
}

function closeDetail() {
  state.selectedExpert = null;
  elements.detailOverlay.classList.add("hidden");
  elements.detailOverlay.setAttribute("aria-hidden", "true");
}

function openTeam(slug) {
  const team = teamTemplates.find((item) => item.slug === slug);
  if (!team) return;

  state.selectedTeam = team;
  elements.teamDetailIndustry.textContent = team.industry;
  elements.teamDetailTitle.textContent = team.title;
  elements.teamDetailSummary.textContent = team.card_summary;
  elements.teamUseCases.innerHTML = team.use_cases.map((item) => `<span class="tag-pill">${escapeHtml(item)}</span>`).join("");
  elements.teamMemberList.innerHTML = team.recommended_experts
    .map((member) => {
      const expert = experts.find((item) => item.slug === member.slug);
      return `
        <article class="team-member">
          <strong>${escapeHtml(member.role)}</strong>
          <span>${escapeHtml(expert ? expert.title : member.slug)}</span>
          <p>${escapeHtml(member.reason)}</p>
        </article>
      `;
    })
    .join("");
  updateTeamButton();
  elements.teamOverlay.classList.remove("hidden");
  elements.teamOverlay.setAttribute("aria-hidden", "false");
}

function closeTeam() {
  state.selectedTeam = null;
  elements.teamOverlay.classList.add("hidden");
  elements.teamOverlay.setAttribute("aria-hidden", "true");
}

function updateDetailButton() {
  if (!state.selectedExpert) return;
  elements.detailAddButton.textContent = isSaved(state.selectedExpert.slug) ? "已添加到我的专家" : "添加专家";
}

function updateTeamButton() {
  if (!state.selectedTeam) return;
  const slugs = teamExpertSlugs(state.selectedTeam);
  const savedCount = slugs.filter(isSaved).length;
  elements.teamAddButton.textContent = savedCount === slugs.length ? "整套团队已添加" : `添加整套团队（${slugs.length} 位）`;
}

function render() {
  updateSummaryStats();
  renderFeedTabs();
  renderChips(elements.categoryChips, state.category, "data-category");
  renderChips(elements.libraryChips, state.libraryCategory, "data-library-category");
  renderExpertList();
  renderTeamMarket();
  renderMarketMode();
  renderLibrary();
  renderFileRecommendations();
  renderScreens();
}

document.addEventListener("click", (event) => {
  const target = event.target.closest(
    "[data-market-mode], [data-feed], [data-category], [data-library-category], [data-open-slug], [data-open-team], [data-save-slug], [data-screen-target], [data-jump-screen]"
  );
  if (!target) return;

  if (target.dataset.marketMode) {
    state.marketMode = target.dataset.marketMode;
    render();
    return;
  }

  if (target.dataset.feed) {
    state.feed = target.dataset.feed;
    render();
    return;
  }

  if (target.dataset.category) {
    state.category = target.dataset.category;
    render();
    return;
  }

  if (target.dataset.libraryCategory) {
    state.libraryCategory = target.dataset.libraryCategory;
    render();
    return;
  }

  if (target.dataset.openSlug) {
    openDetail(target.dataset.openSlug);
    return;
  }

  if (target.dataset.openTeam) {
    openTeam(target.dataset.openTeam);
    return;
  }

  if (target.dataset.saveSlug) {
    toggleSaved(target.dataset.saveSlug);
    return;
  }

  if (target.dataset.screenTarget) {
    state.screen = target.dataset.screenTarget;
    render();
    return;
  }

  if (target.dataset.jumpScreen) {
    state.screen = target.dataset.jumpScreen;
    render();
  }
});

elements.closeDetailControls.forEach((control) => {
  control.addEventListener("click", closeDetail);
});

elements.closeTeamControls.forEach((control) => {
  control.addEventListener("click", closeTeam);
});

elements.searchInput.addEventListener("input", (event) => {
  state.search = event.target.value;
  renderExpertList();
});

elements.detailAddButton.addEventListener("click", () => {
  if (state.selectedExpert) {
    toggleSaved(state.selectedExpert.slug);
  }
});

elements.teamAddButton.addEventListener("click", () => {
  if (state.selectedTeam) {
    addTeam(teamExpertSlugs(state.selectedTeam));
  }
});

render();
