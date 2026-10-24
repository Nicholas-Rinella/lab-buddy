export function initAuditLogger() {
  const auditEntries = [];
  const countEl = document.getElementById('audit-log-count');
  const exportBtn = document.getElementById('btn-export-audit');

  function logEvent(module, action, details) {
    const entry = {
      timestamp: new Date().toISOString(),
      module,
      action,
      details,
      sessionId: window.__LAB_BUDDY_SESSION_ID__ || "SESSION_001"
    };

    auditEntries.push(entry);

    if (countEl) {
      countEl.innerText = `Audit: ${auditEntries.length} Events`;
    }
  }

  function exportAuditManifest() {
    if (auditEntries.length === 0) {
      return alert("Audit trail is currently empty.");
    }

    const payload = {
      application: "Lab-Buddy Bioprocess Suite",
      version: "1.2 Dual-Mode",
      exportTime: new Date().toISOString(),
      totalEvents: auditEntries.length,
      auditLog: auditEntries
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lab_buddy_audit_trail_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  if (exportBtn) {
    exportBtn.addEventListener('click', exportAuditManifest);
  }

  return {
    logEvent
  };
}