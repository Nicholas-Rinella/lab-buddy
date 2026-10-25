import { LAB_PRO_TIPS, getRandomTip, getTipOfTheDay } from './proTips.js';

export function initHomeEngine(auditLogger, navigateToTab) {
  // 1. Pro-Tip Rotator Logic
  let currentTip = getTipOfTheDay();

  const tipCategoryEl = document.getElementById('home-tip-category');
  const tipContentEl = document.getElementById('home-tip-content');
  const nextTipBtn = document.getElementById('btn-next-tip');
  const copyTipBtn = document.getElementById('btn-copy-tip');

  function renderTip(tip) {
    if (!tipContentEl) return;
    currentTip = tip;
    if (tipCategoryEl) tipCategoryEl.innerText = `[${tip.category} Tip #${tip.id}]`;
    tipContentEl.innerText = `"${tip.tip}"`;
  }

  nextTipBtn?.addEventListener('click', () => {
    const newTip = getRandomTip();
    renderTip(newTip);
    auditLogger?.logEvent("MissionControl", "TipShuffled", { tipId: newTip.id });
  });

  copyTipBtn?.addEventListener('click', () => {
    const text = `${currentTip.category} Pro-Tip #${currentTip.id}: ${currentTip.tip} — (Lab-Buddy OS)`;
    navigator.clipboard.writeText(text).then(() => {
      alert("Pro-Tip copied to clipboard!");
    });
  });

  // 2. Protocol Initialization Logic
  const launchBtn = document.getElementById('btn-launch-session');
  const isoSelect = document.getElementById('session-iso-standard');
  const scopeSelect = document.getElementById('session-protocol-scope');

  launchBtn?.addEventListener('click', () => {
    const envStandard = isoSelect?.options[isoSelect.selectedIndex].text;
    const protocolScope = scopeSelect?.value;

    // Log the environmental constraints to the audit trail
    auditLogger?.logEvent("MissionControl", "SessionInitialized", { 
      environment: envStandard,
      scope: protocolScope
    });

    // In a future update, we will pass 'envStandard' into the Culture/Reagent modules 
    // so they can inject specific steps (like "Spray with IPA") into the generated SOPs.

    // Progress the user into the primary Cell Culture module to begin work
    navigateToTab('culture', 'seeding');
  });

  // Initial render
  renderTip(currentTip);
}