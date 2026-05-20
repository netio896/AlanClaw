const experts = Array.isArray(window.ALANCLAW_EXPERTS) ? window.ALANCLAW_EXPERTS : [];
const teamTemplates = Array.isArray(window.ALANCLAW_TEAM_TEMPLATES) ? window.ALANCLAW_TEAM_TEMPLATES : [];

const storageKey = "alanclaw.myExperts";
const onboardingDismissKey = "alanclaw.onboardingDismissed";
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
  browseView: "teams",
  category: "全部",
  libraryCategory: "全部",
  search: "",
  selectedExpert: null,
  selectedTeam: null,
  savedSlugs: loadSavedSlugs(),
  onboardingDismissed: loadOnboardingDismissed(),
  onboardingForced: false,
  onboardingTeamSlug: teamTemplates.find((team) => team.featured)?.slug ?? teamTemplates[0]?.slug ?? "",
  teamNotice: null,
};

const elements = {
  expertCount: document.getElementById("expertCount"),
  featuredCount: document.getElementById("featuredCount"),
  onboardingPanel: document.getElementById("onboardingPanel"),
  onboardingTeamSelector: document.getElementById("onboardingTeamSelector"),
  onboardingIndustry: document.getElementById("onboardingIndustry"),
  onboardingTitle: document.getElementById("onboardingTitle"),
  onboardingSummary: document.getElementById("onboardingSummary"),
  onboardingMembers: document.getElementById("onboardingMembers"),
  onboardingChannels: document.getElementById("onboardingChannels"),
  onboardingUseCases: document.getElementById("onboardingUseCases"),
  onboardingOpenTeam: document.getElementById("onboardingOpenTeam"),
  onboardingAddTeam: document.getElementById("onboardingAddTeam"),
  onboardingDismiss: document.getElementById("onboardingDismiss"),
  reopenOnboarding: document.getElementById("reopenOnboarding"),
  feedTabs: document.getElementById("feedTabs"),
  categoryChips: document.getElementById("categoryChips"),
  libraryChips: document.getElementById("libraryChips"),
  searchInput: document.getElementById("searchInput"),
  teamNotice: document.getElementById("teamNotice"),
  teamNoticeTitle: document.getElementById("teamNoticeTitle"),
  teamNoticeText: document.getElementById("teamNoticeText"),
  teamNoticeDismiss: document.getElementById("teamNoticeDismiss"),
  teamNoticeView: document.getElementById("teamNoticeView"),
  expertList: document.getElementById("expertList"),
  expertSearchBar: document.querySelector(".search-bar"),
  expertControls: document.querySelector(".segment-group"),
  expertSectionTitle: document.getElementById("expertList").previousElementSibling,
  listEyebrow: document.getElementById("listEyebrow"),
  teamMarket: document.getElementById("teamMarket"),
  teamList: document.getElementById("teamList"),
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

const browseOptions = [
  { key: "teams", label: "推荐行业团队" },
  { key: "recommended", label: "推荐专家" },
  { key: "hot", label: "热门精选" },
  { key: "latest", label: "最新发布" },
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

function loadOnboardingDismissed() {
  try {
    return window.localStorage.getItem(onboardingDismissKey) === "true";
  } catch {
    return false;
  }
}

function persistSavedSlugs() {
  window.localStorage.setItem(storageKey, JSON.stringify(state.savedSlugs));
}

function persistOnboardingDismissed() {
  window.localStorage.setItem(onboardingDismissKey, state.onboardingDismissed ? "true" : "false");
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

function selectedOnboardingTeam() {
  return teamTemplates.find((team) => team.slug === state.onboardingTeamSlug) ?? teamTemplates[0] ?? null;
}

function shouldShowOnboarding() {
  return (state.onboardingForced || (!state.onboardingDismissed && state.savedSlugs.length === 0)) && teamTemplates.length > 0;
}

function addTeam(slugs, teamTitle = state.selectedTeam?.title ?? "推荐团队", options = {}) {
  const before = state.savedSlugs.length;
  state.savedSlugs = [...new Set([...state.savedSlugs, ...slugs])];
  persistSavedSlugs();
  const addedCount = state.savedSlugs.length - before;
  const guideToLibrary = options.guideToLibrary === true || shouldShowOnboarding();
  state.teamNotice = {
    title: addedCount > 0 ? "已添加到我的专家" : "这套团队已在我的专家中",
    text:
      addedCount > 0
        ? `${teamTitle} 已加入工作区，共包含 ${slugs.length} 位专家。`
        : `${teamTitle} 的成员之前已经全部加入你的工作区。`,
  };
  if (guideToLibrary) {
    state.screen = "library";
    state.onboardingForced = false;
    state.onboardingDismissed = true;
    persistOnboardingDismissed();
  }
  closeTeam();
  render();
  updateTeamButton();
}

function dismissTeamNotice() {
  state.teamNotice = null;
  renderTeamNotice();
}

function dismissOnboarding() {
  state.onboardingForced = false;
  state.onboardingDismissed = true;
  persistOnboardingDismissed();
  render();
}

function reopenOnboarding() {
  state.screen = "experts";
  state.onboardingForced = true;
  state.onboardingTeamSlug = teamTemplates.find((team) => team.featured)?.slug ?? teamTemplates[0]?.slug ?? "";
  render();
}

function getBrowseExperts() {
  if (state.browseView === "recommended") {
    return experts.filter((expert) => expert.featured);
  }

  if (state.browseView === "hot") {
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
  elements.feedTabs.innerHTML = browseOptions
    .map(
      (option) => `
        <button type="button" class="segment-button ${
          state.browseView === option.key ? "segment-button-active" : ""
        }" data-browse-view="${option.key}">
          ${option.label}
        </button>`
    )
    .join("");
}

function renderOnboarding() {
  const visible = shouldShowOnboarding();
  elements.onboardingPanel.classList.toggle("hidden", !visible);
  if (!visible) return;

  const team = selectedOnboardingTeam();
  if (!team) return;

  elements.onboardingTeamSelector.innerHTML = teamTemplates
    .map(
      (item) => `
        <button type="button" class="chip ${item.slug === team.slug ? "chip-active" : ""}" data-onboarding-team="${escapeHtml(item.slug)}">
          ${escapeHtml(item.industry)}
        </button>`
    )
    .join("");

  elements.onboardingIndustry.textContent = team.industry;
  elements.onboardingTitle.textContent = team.title;
  elements.onboardingSummary.textContent = team.card_summary;
  elements.onboardingMembers.textContent = `${teamExpertSlugs(team).length} 位成员`;
  elements.onboardingChannels.textContent = team.channels_supported.join(" / ");
  elements.onboardingUseCases.innerHTML = team.use_cases
    .slice(0, 3)
    .map((item) => `<span>${escapeHtml(item)}</span>`)
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
  const isHot = hotSlugs.includes(expert.slug);
  return `
    <article class="expert-card">
      <header>
        <div>
          <div class="card-badge-row">
            ${expert.featured ? '<span class="featured-badge">推荐</span>' : ""}
            ${isHot ? '<span class="featured-badge hot-badge">热门</span>' : ""}
            <span class="featured-badge quiet-badge">${escapeHtml(expert.category)}</span>
          </div>
          <h3>${escapeHtml(expert.title)}</h3>
          <p>${escapeHtml(expert.card_summary)}</p>
        </div>
        <button type="button" class="card-action ${saved ? "saved" : ""}" data-save-slug="${escapeHtml(expert.slug)}">
          ${saved ? "移除" : "添加"}
        </button>
      </header>
      <footer>
        <div class="expert-meta">
          <span>${escapeHtml(expert.languages_supported.join(" / "))}</span>
          <span>${escapeHtml(expert.channels_supported.join(" / "))}</span>
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
        <div class="card-badge-row">
          <span class="featured-badge">团队</span>
          <span class="featured-badge quiet-badge">${escapeHtml(team.industry)}</span>
        </div>
        <h3>${escapeHtml(team.title)}</h3>
        <p>${escapeHtml(team.card_summary)}</p>
      </div>
      <div class="team-card-meta">
        <span>${memberCount} 位成员</span>
        <span>${escapeHtml(team.channels_supported.join(" / "))}</span>
      </div>
      <div class="use-case-row">
        ${team.use_cases.slice(0, 3).map((item) => `<span>${escapeHtml(item)}</span>`).join("")}
      </div>
      <button type="button" class="secondary-button" data-open-team="${escapeHtml(team.slug)}">查看团队</button>
    </article>
  `;
}

function renderExpertList() {
  const filtered = applyFilters(getBrowseExperts(), state.category, state.search);
  const headingMap = {
    recommended: "推荐专家",
    hot: "热门专家",
    latest: "最新上架",
  };

  elements.listEyebrow.textContent = state.browseView === "latest" ? "最新上新" : "专家目录";
  elements.listHeading.textContent = headingMap[state.browseView];
  elements.resultMeta.textContent = `${filtered.length} 个结果`;
  elements.expertList.innerHTML = filtered.length
    ? filtered.map(buildExpertCard).join("")
    : `<div class="empty-state"><h3>没有匹配的专家</h3><p>试试换一个关键词，或者切回全部分类。</p></div>`;
}

function renderTeamMarket() {
  const keyword = state.search.trim().toLowerCase();
  const filtered = teamTemplates.filter((team) => {
    const memberExperts = teamExpertSlugs(team)
      .map((slug) => experts.find((expert) => expert.slug === slug))
      .filter(Boolean);
    const categoryPass = state.category === "全部" || memberExperts.some((expert) => expert.category === state.category);
    const text = [
      team.title,
      team.industry,
      team.card_summary,
      ...team.use_cases,
      ...team.languages_supported,
      ...team.channels_supported,
    ]
      .join(" ")
      .toLowerCase();
    return categoryPass && (!keyword || text.includes(keyword));
  });

  elements.listEyebrow.textContent = "行业团队";
  elements.listHeading.textContent = "推荐行业团队";
  elements.resultMeta.textContent = `${filtered.length} 套模板`;
  elements.teamList.innerHTML = filtered.length
    ? filtered.map(buildTeamCard).join("")
    : `<div class="empty-state"><h3>没有匹配的团队</h3><p>试试切回全部分类，或搜索销售、客服、内容、项目等业务场景。</p></div>`;
}

function renderBrowseView() {
  const isTeams = state.browseView === "teams";
  elements.expertList.classList.toggle("hidden", isTeams);
  elements.teamMarket.classList.toggle("hidden", !isTeams);
  elements.feedTabs.querySelectorAll("[data-browse-view]").forEach((button) => {
    button.classList.toggle("segment-button-active", button.dataset.browseView === state.browseView);
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
      (expert) => {
        const saved = isSaved(expert.slug);
        return `
        <article class="mini-item">
          <div>
            <div class="card-badge-row">
              <span class="featured-badge quiet-badge">${escapeHtml(expert.category)}</span>
            </div>
            <strong>${escapeHtml(expert.title)}</strong>
            <p>${escapeHtml(expert.card_summary)}</p>
            <div class="expert-meta">
              <span>${escapeHtml(expert.languages_supported.join(" / "))}</span>
              <span>${escapeHtml(expert.channels_supported.join(" / "))}</span>
            </div>
          </div>
          <div class="mini-actions">
            <button type="button" class="secondary-button" data-open-slug="${escapeHtml(expert.slug)}">查看详情</button>
            <button type="button" class="card-action ${saved ? "saved" : ""}" data-save-slug="${escapeHtml(expert.slug)}">
              ${saved ? "已添加" : "添加"}
            </button>
          </div>
        </article>`;
      }
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

function renderTeamNotice() {
  const notice = state.teamNotice;
  elements.teamNotice.classList.toggle("hidden", !notice);
  if (!notice) return;
  elements.teamNoticeTitle.textContent = notice.title;
  elements.teamNoticeText.textContent = notice.text;
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
  elements.detailAddButton.textContent = isSaved(state.selectedExpert.slug) ? "移出我的专家" : "添加专家";
}

function updateTeamButton() {
  if (!state.selectedTeam) return;
  const slugs = teamExpertSlugs(state.selectedTeam);
  const savedCount = slugs.filter(isSaved).length;
  elements.teamAddButton.textContent = savedCount === slugs.length ? "整套团队已添加" : `添加整套团队（${slugs.length} 位）`;
}

function render() {
  updateSummaryStats();
  renderOnboarding();
  renderTeamNotice();
  renderFeedTabs();
  renderChips(elements.categoryChips, state.category, "data-category");
  renderChips(elements.libraryChips, state.libraryCategory, "data-library-category");
  renderExpertList();
  renderTeamMarket();
  renderBrowseView();
  renderLibrary();
  renderFileRecommendations();
  renderScreens();
}

document.addEventListener("click", (event) => {
  const target = event.target.closest(
    "[data-browse-view], [data-category], [data-library-category], [data-open-slug], [data-open-team], [data-save-slug], [data-screen-target], [data-jump-screen], [data-featured-team-action], [data-onboarding-team]"
  );
  if (!target) return;

  if (target.dataset.browseView) {
    state.browseView = target.dataset.browseView;
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
    return;
  }

  if ("featuredTeamAction" in target.dataset) {
    const featuredTeam = teamTemplates.find((team) => team.featured) ?? teamTemplates[0];
    if (featuredTeam) addTeam(teamExpertSlugs(featuredTeam), featuredTeam.title, { guideToLibrary: true });
    return;
  }

  if (target.dataset.onboardingTeam) {
    state.onboardingTeamSlug = target.dataset.onboardingTeam;
    renderOnboarding();
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
  render();
});

elements.detailAddButton.addEventListener("click", () => {
  if (state.selectedExpert) {
    toggleSaved(state.selectedExpert.slug);
  }
});

elements.teamAddButton.addEventListener("click", () => {
  if (state.selectedTeam) {
    addTeam(teamExpertSlugs(state.selectedTeam), state.selectedTeam.title);
  }
});

elements.onboardingOpenTeam.addEventListener("click", () => {
  const team = selectedOnboardingTeam();
  if (team) openTeam(team.slug);
});

elements.onboardingAddTeam.addEventListener("click", () => {
  const team = selectedOnboardingTeam();
  if (team) addTeam(teamExpertSlugs(team), team.title, { guideToLibrary: true });
});

elements.onboardingDismiss.addEventListener("click", dismissOnboarding);
elements.reopenOnboarding.addEventListener("click", reopenOnboarding);

elements.teamNoticeDismiss.addEventListener("click", dismissTeamNotice);
elements.teamNoticeView.addEventListener("click", () => {
  state.screen = "library";
  dismissTeamNotice();
  render();
});

render();
