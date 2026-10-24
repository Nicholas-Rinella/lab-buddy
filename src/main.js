import { initSeedingEngine } from './modules/culture/SeedingEngine.js';
import { initReagentEngine } from './modules/reagents/ReagentEngine.js';
import { initAuditLogger } from './modules/audit/AuditLogger.js';
import { initBatchSeedingGrid } from './modules/culture/BatchSeedingGrid.js';
import { initBatchReagentGrid } from './modules/reagents/BatchReagentGrid.js';
import { initConversionEngine } from './modules/conversions/ConversionEngine.js';

// Traceable Session ID for audit loggers
window.__LAB_BUDDY_SESSION_ID__ = "SESSION_" + Math.random().toString(36).substring(2, 9).toUpperCase();

// Initialize Subsystems Defensively
const auditLogger = initAuditLogger();

try { initSeedingEngine(); } catch (err) { console.error("Seeding Engine Init Error:", err); }
try { initReagentEngine(); } catch (err) { console.error("Reagent Engine Init Error:", err); }
try { initBatchSeedingGrid(auditLogger); } catch (err) { console.error("Batch Seeding Init Error:", err); }
try { initBatchReagentGrid(auditLogger); } catch (err) { console.error("Batch Reagent Init Error:", err); }
try { initConversionEngine(auditLogger); } catch (err) { console.error("Conversion Engine Init Error:", err); }

// Module View Elements
const moduleViews = {
  culture: document.getElementById('culture-module'),
  reagents: document.getElementById('reagents-module'),
  conversions: document.getElementById('conversions-module')
};

const tabButtons = document.querySelectorAll('.tab-btn');

// Tab Navigation Router
tabButtons.forEach(button => {
  button.addEventListener('click', () => {
    const tabKey = button.dataset.tab;
    if (!tabKey || !moduleViews[tabKey]) return;

    // Update Tab Styles
    tabButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    // Switch Display
    Object.keys(moduleViews).forEach(key => {
      if (moduleViews[key]) {
        moduleViews[key].style.display = key === tabKey ? 'block' : 'none';
      }
    });

    if (auditLogger) {
      auditLogger.logEvent("Navigation", "TabSwitched", { activeTab: tabKey });
    }
  });
});

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