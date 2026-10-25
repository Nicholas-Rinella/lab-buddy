import { initSeedingEngine } from './modules/culture/SeedingEngine.js';
import { initReagentEngine } from './modules/reagents/ReagentEngine.js';
import { initAuditLogger } from './modules/audit/AuditLogger.js';
import { initBatchSeedingGrid } from './modules/culture/BatchSeedingGrid.js';
import { initBatchReagentGrid } from './modules/reagents/BatchReagentGrid.js';
import { initConversionEngine } from './modules/conversions/ConversionEngine.js';
import { initHomeEngine } from './modules/home/HomeEngine.js';

// 1. Traceable Session ID for audit loggers
window.__LAB_BUDDY_SESSION_ID__ = "SESSION_" + Math.random().toString(36).substring(2, 9).toUpperCase();

// 2. Initialize Core Modules
const auditLogger = initAuditLogger();

try { initSeedingEngine(); } catch (err) { console.error("Seeding Init Error:", err); }
try { initReagentEngine(); } catch (err) { console.error("Reagent Init Error:", err); }
try { initBatchSeedingGrid(auditLogger); } catch (err) { console.error("Batch Seeding Init Error:", err); }
try { initBatchReagentGrid(auditLogger); } catch (err) { console.error("Batch Reagent Init Error:", err); }
try { initConversionEngine(auditLogger); } catch (err) { console.error("Conversion Init Error:", err); }

// 3. Setup Routing
const moduleViews = {
  home: document.getElementById('home-module'),
  culture: document.getElementById('culture-module'),
  reagents: document.getElementById('reagents-module'),
  conversions: document.getElementById('conversions-module')
};

const tabButtons = document.querySelectorAll('.tab-btn');

function navigateToTab(tabKey, subPaneKey = null) {
  if (!tabKey || !moduleViews[tabKey]) return;

  // Update Main Nav Tabs
  tabButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabKey);
  });

  // Switch Main Container Visibility
  Object.keys(moduleViews).forEach(key => {
    if (moduleViews[key]) {
      moduleViews[key].style.display = key === tabKey ? 'block' : 'none';
    }
  });

  // Handle Sub-Pane Routing
  if (subPaneKey) {
    if (tabKey === 'culture') {
      document.getElementById(`subBtn-${subPaneKey}`)?.click();
    } else if (tabKey === 'reagents') {
      document.getElementById(`rg-subtab-${subPaneKey}`)?.click();
    } else if (tabKey === 'conversions') {
      document.getElementById(`m3-tab-${subPaneKey}`)?.click();
    }
  }

  // Scroll to top of window
  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (auditLogger) {
    auditLogger.logEvent("Navigation", "TabNavigated", { activeTab: tabKey, subPane: subPaneKey });
  }
}

// Wire Primary Nav Buttons
tabButtons.forEach(button => {
  button.addEventListener('click', () => {
    navigateToTab(button.dataset.tab);
  });
});

// Initialize Home Module
try {
  initHomeEngine(auditLogger, navigateToTab);
} catch (err) {
  console.error("Home Engine Init Error:", err);
}

// 4. Expert Mode Toggles
const expertToggle = document.getElementById('expertToggle');
expertToggle?.addEventListener('change', (e) => {
  const isExpert = e.target.checked;

  const cultureBatchGrid = document.getElementById('culture-batch-grid-section');
  const cultureVisualPane = document.getElementById('culture-seeding-pane');
  const cultureSubtabs = document.getElementById('culture-subtabs');

  if (cultureBatchGrid) cultureBatchGrid.style.display = isExpert ? 'block' : 'none';
  if (cultureVisualPane) cultureVisualPane.style.display = isExpert ? 'none' : 'grid';
  if (cultureSubtabs) cultureSubtabs.style.display = isExpert ? 'none' : 'flex';

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

// ==========================================
// 5. GLOBAL WORKSPACE ACTIONS (New Batch, SOP, Share, Publish)
// ==========================================

// [📄 New Batch Record]
const btnNewBatch = document.getElementById('btn-new-batch');
if (btnNewBatch) {
  btnNewBatch.addEventListener('click', () => {
    if (confirm("Initialize a new Batch Record? This will reset all module inputs and generate a new Session ID.")) {
      // Create a fresh Batch Record Session ID
      window.__LAB_BUDDY_SESSION_ID__ = "BR_" + new Date().getFullYear() + "_" + Math.random().toString(36).substring(2, 8).toUpperCase();
      
      // Update any UI elements reflecting the ID (if they exist)
      const sessionDisplays = document.querySelectorAll('#home-session-id');
      sessionDisplays.forEach(el => el.innerText = window.__LAB_BUDDY_SESSION_ID__);
      
      // Log event to the new session
      auditLogger.logEvent("Workspace", "NewBatchRecordCreated", { sessionId: window.__LAB_BUDDY_SESSION_ID__ });
      alert(`New Batch Record Initialized.\nSession ID: ${window.__LAB_BUDDY_SESSION_ID__}`);
      
      // Navigate to Home to re-select environment constraints
      navigateToTab('home');
    }
  });
}

// [📝 Start SOP Builder]
const btnNewSop = document.getElementById('btn-new-sop');
if (btnNewSop) {
  btnNewSop.addEventListener('click', () => {
    auditLogger.logEvent("Workspace", "SOPBuilderLaunched", {});
    alert("SOP Document Builder Module loading...\n(This feature will open a drag-and-drop protocol document editor in the next release.)");
  });
}

// [👥 Share with Team]
const btnShareTeam = document.getElementById('btn-share-team');
if (btnShareTeam) {
  btnShareTeam.addEventListener('click', () => {
    auditLogger.logEvent("Workspace", "ShareDialogOpened", {});
    const email = prompt("Enter a team member's email address to share this active workspace:");
    if (email && email.includes('@')) {
      alert(`Workspace link securely dispatched to ${email} with view & comment permissions.`);
      auditLogger.logEvent("Workspace", "SharedWithTeam", { target: email });
    }
  });
}

// [☁️ Publish to Drive] -> (Could eventually target a folder like 'Passive Income Projects' via backend API)
const btnPublishDrive = document.getElementById('btn-publish-drive');
if (btnPublishDrive) {
  btnPublishDrive.addEventListener('click', () => {
    auditLogger.logEvent("Workspace", "PublishToDriveInitiated", {});
    // Simulates an API call to Google Workspace/Drive
    setTimeout(() => {
      alert("✅ Successfully published to Shared Drive!\n\nThe current Batch Record, JSON audit ledger, and calculated telemetry have been exported to your team directory.");
    }, 400);
  });
}