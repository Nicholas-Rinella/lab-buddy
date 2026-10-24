import { LAB_PRO_TIPS, getRandomTip, getTipOfTheDay } from './proTips.js';

// Master Tool Registry for Favorites & Recents
export const TOOLS_REGISTRY = {
  seeding: { id: 'seeding', name: 'Vessel Seeding Balancer', tab: 'culture', pane: 'seeding', icon: '🔬', module: 'Culture' },
  hemo: { id: 'hemo', name: 'Hemocytometer Solver', tab: 'culture', pane: 'hemo', icon: '🧮', module: 'Culture' },
  growth: { id: 'growth', name: 'Growth & Split Planner', tab: 'culture', pane: 'growth', icon: '📈', module: 'Culture' },
  solid: { id: 'solid', name: 'Solid Solutes & Buffers', tab: 'reagents', pane: 'solid', icon: '🧪', module: 'Reagents' },
  liquid: { id: 'liquid', name: 'Liquid Dilutions (C₁V₁)', tab: 'reagents', pane: 'liquid', icon: '💧', module: 'Reagents' },
  acid: { id: 'acid', name: 'Concentrated Acids & Bases', tab: 'reagents', pane: 'acid', icon: '⚗️', module: 'Reagents' },
  quick: { id: 'quick', name: 'Centrifuge RCF ↔ RPM', tab: 'conversions', pane: 'quick', icon: '🌀', module: 'Mechanics' },
  vessels: { id: 'vessels', name: 'Culture Vessel Scale-Up', tab: 'conversions', pane: 'vessels', icon: '📐', module: 'Mechanics' },
  flow: { id: 'flow', name: 'Flow Spectrum & Lasers', tab: 'conversions', pane: 'flow', icon: '🌈', module: 'Optics' },
  studio: { id: 'studio', name: 'Formula Studio (PRO)', tab: 'conversions', pane: 'studio', icon: '🛠️', module: 'Custom' }
};

export function initHomeEngine(auditLogger, navigateToTab) {
  let currentTip = getTipOfTheDay();

  // Tip DOM elements
  const tipCategoryEl = document.getElementById('home-tip-category');
  const tipIdEl = document.getElementById('home-tip-id');
  const tipContentEl = document.getElementById('home-tip-content');
  const nextTipBtn = document.getElementById('btn-next-tip');
  const copyTipBtn = document.getElementById('btn-copy-tip');

  function renderTip(tip) {
    if (!tipContentEl) return;
    currentTip = tip;
    tipCategoryEl.innerText = `[${tip.category}]`;
    tipIdEl.innerText = `Tip #${tip.id} of ${LAB_PRO_TIPS.length}`;
    tipContentEl.innerText = `"${tip.tip}"`;
  }

  if (nextTipBtn) {
    nextTipBtn.addEventListener('click', () => {
      const newTip = getRandomTip();
      renderTip(newTip);
      auditLogger.logEvent("HomeDashboard", "TipShuffled", { tipId: newTip.id });
    });
  }

  if (copyTipBtn) {
    copyTipBtn.addEventListener('click', () => {
      const text = `${currentTip.category} Pro-Tip #${currentTip.id}: ${currentTip.tip} — (Lab-Buddy Bioprocess Suite)`;
      navigator.clipboard.writeText(text).then(() => {
        alert("Lab Pro-Tip copied to clipboard!");
      });
    });
  }

  // ==========================================
  // FAVORITES & RECENTS SYSTEM
  // ==========================================
  let activeQuickView = 'favorites'; // 'favorites' or 'recents'
  let favorites = JSON.parse(localStorage.getItem('lab_buddy_favorites') || '["seeding", "vessels", "liquid", "quick"]');
  let recents = JSON.parse(localStorage.getItem('lab_buddy_recents') || '[]');

  const qaGrid = document.getElementById('quick-access-grid');
  const tabFavBtn = document.getElementById('qa-tab-fav');
  const tabRecentBtn = document.getElementById('qa-tab-recent');
  const favCountEl = document.getElementById('qa-fav-count');

  function saveFavorites() {
    localStorage.setItem('lab_buddy_favorites', JSON.stringify(favorites));
    if (favCountEl) favCountEl.innerText = favorites.length;
  }

  function saveRecents() {
    localStorage.setItem('lab_buddy_recents', JSON.stringify(recents));
  }

  // Function called whenever any tool is opened across the app
  function recordRecentTool(toolId) {
    if (!TOOLS_REGISTRY[toolId]) return;
    // Remove if already exists to push to front
    recents = recents.filter(item => item.id !== toolId);
    recents.unshift({ id: toolId, timestamp: Date.now() });
    if (recents.length > 8) recents.pop();
    saveRecents();
    if (activeQuickView === 'recents') renderQuickAccess();
  }

  function renderQuickAccess() {
    if (!qaGrid) return;
    qaGrid.innerHTML = '';

    if (favCountEl) favCountEl.innerText = favorites.length;

    if (activeQuickView === 'favorites') {
      if (favorites.length === 0) {
        qaGrid.innerHTML = `
          <div class="qa-empty-msg">
            No pinned favorites yet. Click the ⭐ star on any tool below to pin it here for rapid access!
          </div>
        `;
        return;
      }

      favorites.forEach(toolId => {
        const tool = TOOLS_REGISTRY[toolId];
        if (!tool) return;
        qaGrid.appendChild(createQACard(tool, true));
      });
    } else {
      // Recents View
      if (recents.length === 0) {
        qaGrid.innerHTML = `
          <div class="qa-empty-msg">
            No recent activity logged yet. Launch any calculator below to see it appear here!
          </div>
        `;
        return;
      }

      recents.forEach(item => {
        const tool = TOOLS_REGISTRY[item.id];
        if (!tool) return;
        const timeAgo = formatTimeAgo(item.timestamp);
        qaGrid.appendChild(createQACard(tool, favorites.includes(tool.id), timeAgo));
      });
    }
  }

  function createQACard(tool, isStarred, timeBadge = null) {
    const card = document.createElement('div');
    card.className = 'qa-card';

    card.innerHTML = `
      <div class="qa-card-left">
        <span class="qa-icon">${tool.icon}</span>
        <div class="qa-text-group">
          <span class="qa-title">${tool.name}</span>
          <span class="qa-subtitle">
            <span class="badge" style="font-size:0.62rem; padding:0.1rem 0.35rem;">${tool.module}</span>
            ${timeBadge ? `<span>• ${timeBadge}</span>` : ''}
          </span>
        </div>
      </div>
      <button class="qa-star-btn ${isStarred ? 'starred' : ''}" data-tool="${tool.id}" title="${isStarred ? 'Unpin from favorites' : 'Pin to favorites'}">
        ${isStarred ? '★' : '☆'}
      </button>
    `;

    // Click card body to launch
    card.addEventListener('click', (e) => {
      if (e.target.closest('.qa-star-btn')) return; // Ignore star button clicks
      recordRecentTool(tool.id);
      navigateToTab(tool.tab, tool.pane);
      auditLogger.logEvent("QuickAccess", "ToolLaunched", { toolId: tool.id });
    });

    // Star toggle button
    const starBtn = card.querySelector('.qa-star-btn');
    starBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFavorite(tool.id);
    });

    return card;
  }

  function toggleFavorite(toolId) {
    if (favorites.includes(toolId)) {
      favorites = favorites.filter(id => id !== toolId);
      auditLogger.logEvent("QuickAccess", "FavoriteRemoved", { toolId });
    } else {
      favorites.push(toolId);
      auditLogger.logEvent("QuickAccess", "FavoriteAdded", { toolId });
    }
    saveFavorites();
    renderQuickAccess();
  }

  function formatTimeAgo(timestamp) {
    const diffSec = Math.floor((Date.now() - timestamp) / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    return `${diffHr}h ago`;
  }

  // Switch between Favorites & Recents tabs
  tabFavBtn?.addEventListener('click', () => {
    activeQuickView = 'favorites';
    tabFavBtn.classList.add('active');
    tabRecentBtn?.classList.remove('active');
    renderQuickAccess();
  });

  tabRecentBtn?.addEventListener('click', () => {
    activeQuickView = 'recents';
    tabRecentBtn.classList.add('active');
    tabFavBtn?.classList.remove('active');
    renderQuickAccess();
  });

  // ==========================================
  // DEEP-LINKING LAUNCHPAD ROUTING
  // ==========================================
  document.querySelectorAll('[data-launch-tab]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tab = e.currentTarget.dataset.launchTab;
      const subPane = e.currentTarget.dataset.launchPane;

      // Find matching tool in registry to log to recents
      const matchedKey = Object.keys(TOOLS_REGISTRY).find(k => TOOLS_REGISTRY[k].tab === tab && TOOLS_REGISTRY[k].pane === subPane);
      if (matchedKey) recordRecentTool(matchedKey);

      navigateToTab(tab, subPane);
      auditLogger.logEvent("HomeDashboard", "DeepLinkLaunched", { targetTab: tab, subPane });
    });
  });

  // ==========================================
  // QUICK BENCH SCRATCHPAD MICRO-CONVERTERS
  // ==========================================
  const miniRcf = document.getElementById('mini-rcf');
  const miniRpm = document.getElementById('mini-rpm');
  const miniRadius = document.getElementById('mini-radius');

  function calcMiniCent() {
    const rcf = parseFloat(miniRcf.value) || 0;
    const r = parseFloat(miniRadius.value) || 8.4;
    if (rcf > 0 && r > 0) {
      miniRpm.value = Math.round(Math.sqrt(rcf / (1.118e-5 * r)));
    }
  }
  if (miniRcf) miniRcf.addEventListener('input', calcMiniCent);
  if (miniRadius) miniRadius.addEventListener('change', calcMiniCent);

  const miniC1 = document.getElementById('mini-c1');
  const miniC2 = document.getElementById('mini-c2');
  const miniV2 = document.getElementById('mini-v2');
  const miniV1Display = document.getElementById('mini-v1-result');

  function calcMiniDilution() {
    const c1 = parseFloat(miniC1.value) || 0;
    const c2 = parseFloat(miniC2.value) || 0;
    const v2 = parseFloat(miniV2.value) || 0;
    if (c1 > 0 && c2 > 0 && v2 > 0) {
      const v1 = (c2 * v2) / c1;
      const diluent = v2 - v1;
      miniV1Display.innerText = `${v1.toFixed(2)} mL stock + ${diluent.toFixed(2)} mL diluent`;
    } else {
      miniV1Display.innerText = "--";
    }
  }
  if (miniC1) miniC1.addEventListener('input', calcMiniDilution);
  if (miniC2) miniC2.addEventListener('input', calcMiniDilution);
  if (miniV2) miniV2.addEventListener('input', calcMiniDilution);

  const miniDec = document.getElementById('mini-dec');
  const miniSciOut = document.getElementById('mini-sci-out');

  if (miniDec) {
    miniDec.addEventListener('input', () => {
      const val = parseFloat(miniDec.value) || 0;
      if (val === 0) {
        miniSciOut.innerText = "0";
        return;
      }
      const exp = Math.floor(Math.log10(Math.abs(val)));
      const base = val / Math.pow(10, exp);
      miniSciOut.innerText = `${base.toFixed(2)} × 10^${exp}`;
    });
  }

  const sessionEl = document.getElementById('home-session-id');
  if (sessionEl) {
    sessionEl.innerText = window.__LAB_BUDDY_SESSION_ID__ || "SESSION_ACTIVE";
  }

  // Initial renders
  renderTip(currentTip);
  renderQuickAccess();

  return {
    recordRecentTool
  };
}