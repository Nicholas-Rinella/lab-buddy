import { LAB_PRO_TIPS, getRandomTip, getTipOfTheDay } from './proTips.js';

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

  // Next / Shuffle Tip
  if (nextTipBtn) {
    nextTipBtn.addEventListener('click', () => {
      const newTip = getRandomTip();
      renderTip(newTip);
      auditLogger.logEvent("HomeDashboard", "TipShuffled", { tipId: newTip.id });
    });
  }

  // Copy Tip to Clipboard
  if (copyTipBtn) {
    copyTipBtn.addEventListener('click', () => {
      const text = `${currentTip.category} Pro-Tip #${currentTip.id}: ${currentTip.tip} — (Lab-Buddy Bioprocess Suite)`;
      navigator.clipboard.writeText(text).then(() => {
        alert("Lab Pro-Tip copied to clipboard!");
      });
    });
  }

  // ==========================================
  // DEEP-LINKING LAUNCHPAD ROUTING
  // ==========================================
  document.querySelectorAll('[data-launch-tab]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tab = e.currentTarget.dataset.launchTab;
      const subPane = e.currentTarget.dataset.launchPane;
      navigateToTab(tab, subPane);
      auditLogger.logEvent("HomeDashboard", "DeepLinkLaunched", { targetTab: tab, subPane });
    });
  });

  // ==========================================
  // QUICK BENCH SCRATCHPAD MICRO-CONVERTERS
  // ==========================================

  // 1. Centrifuge Quick-Check
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

  // 2. Micro Dilution Solver (C1V1 = C2V2)
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

  // 3. Scientific Notation Scratchpad
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

  // Session metadata
  const sessionEl = document.getElementById('home-session-id');
  if (sessionEl) {
    sessionEl.innerText = window.__LAB_BUDDY_SESSION_ID__ || "SESSION_ACTIVE";
  }

  // Initial tip render
  renderTip(currentTip);
}