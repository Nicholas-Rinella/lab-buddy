import { initSeedingEngine } from './modules/culture/SeedingEngine.js';
import { initReagentEngine } from './modules/reagents/ReagentEngine.js';
import { initAuditLogger } from './modules/audit/AuditLogger.js';
import { initBatchSeedingGrid } from './modules/culture/BatchSeedingGrid.js';
import { initBatchReagentGrid } from './modules/reagents/BatchReagentGrid.js';
import { initConversionEngine } from './modules/conversions/ConversionEngine.js';
import { initHomeEngine } from './modules/home/HomeEngine.js';

// Traceable Session ID for audit loggers
window.__LAB_BUDDY_SESSION_ID__ = "SESSION_" + Math.random().toString(36).substring(2, 9).toUpperCase();

// Initialize Subsystems
const auditLogger = initAuditLogger();

try { initSeedingEngine(); } catch (err) { console.error("Seeding Engine Init Error:", err); }
try { initReagentEngine(); } catch (err) { console.error("Reagent Engine Init Error:", err); }
try { initBatchSeedingGrid(auditLogger); } catch (err) { console.error("Batch Seeding Init Error:", err); }
try { initBatchReagentGrid(auditLogger); } catch (err) { console.error("Batch Reagent Init Error:", err); }
try { initConversionEngine(auditLogger); } catch (err) { console.error("Conversion Engine Init Error:", err); }

// Module View Elements
const moduleViews = {
  home: document.getElementById('home-module'),
  culture: document.getElementById('culture-module'),
  reagents: document.getElementById('reagents-module'),
  conversions: document.getElementById('conversions-module')
};

const tabButtons = document.querySelectorAll('.tab-btn');

// Master Deep-Linking Navigator
function navigateToTab(tabKey, subPaneKey = null) {
  if (!tabKey || !moduleViews[tabKey]) return;

  // 1. Update Navigation Tabs Active Style
  tabButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabKey);
  });

  // 2. Switch Module View Visibility
  Object.keys(moduleViews).forEach(key => {
    if (moduleViews[key]) {
      moduleViews[key].style.display = key === tabKey ? 'block' : 'none';
    }
  });

  // 3. Sub-Pane Deep Linking Dispatcher
  if (subPaneKey) {
    if (tabKey === 'culture') {
      const btn = document.getElementById(`subBtn-${subPaneKey}`);
      if (btn) btn.click();
    } else if (tabKey === 'reagents') {
      const btn = document.getElementById(`rg-subtab-${subPaneKey}`);
      if (btn) btn.click();
    } else if (tabKey === 'conversions') {
      const btn = document.getElementById(`m3-tab-${subPaneKey}`);
      if (btn) btn.click();
    }
  }

  // Scroll to top of workspace
  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (auditLogger) {
    auditLogger.logEvent("Navigation", "TabNavigated", { activeTab: tabKey, subPane: subPaneKey });
  }
}

// Wire Header Navigation Bar
tabButtons.forEach(button => {
  button.addEventListener('click', () => {
    navigateToTab(button.dataset.tab);
  });
});

// Initialize Home Dashboard
try {
  initHomeEngine(auditLogger, navigateToTab);
} catch (err) {
  console.error("Home Engine Init Error:", err);
}

// Expert Mode Toggle Sync across Modules
const expertToggle = document.getElementById('expertToggle');

expertToggle?.addEventListener('change', (e) => {
  const isExpert = e.target.checked;

  // 1. Cell Culture Module Switches
  const cultureBatchGrid = document.getElementById('culture-batch-grid-section');
  const cultureVisualPane = document.getElementById('culture-seeding-pane');
  const cultureSubtabs = document.getElementById('culture-subtabs');

  if (cultureBatchGrid) cultureBatchGrid.style.display = isExpert ? 'block' : 'none';
  if (cultureVisualPane) cultureVisualPane.style.display = isExpert ? 'none' : 'grid';
  if (cultureSubtabs) cultureSubtabs.style.display = isExpert ? 'none' : 'flex';

  // 2. Reagents & Solutions Module Switches
  const reagentBatchGrid = document.getElementById('reagents-batch-grid-section');
  const reagentWizardContainer = document.getElementById('reagents-wizard-container');
  const reagentExpertBox = document.getElementById('rg-expert-container');

  if (reagentBatchGrid) reagentBatchGrid.style.display = isExpert ? 'block' : 'none';
  if (reagentWizardContainer) reagentWizardContainer.style.display = isExpert ? 'none' : 'block';
  if (reagentExpertBox) reagentExpertBox.style.display = isExpert ? 'block' : 'none';

  if (auditLogger) {
    auditLogger.logEvent("Settings", "ExpertModeToggled", { enabled: isExpert });
  }
});