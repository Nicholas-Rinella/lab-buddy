export function initTableBuilder() {
  let stagedCalculations = [];

  const tableBody = document.getElementById("tb-table-body");
  const clearBtn = document.getElementById("tb-clear-btn");
  const exportOneNoteBtn = document.getElementById("tb-export-onenote");
  const exportExcelBtn = document.getElementById("tb-export-excel");
  const exportCsvBtn = document.getElementById("tb-export-csv");
  const exportPrintBtn = document.getElementById("tb-export-print");

  function renderTable() {
    if (!tableBody) return;

    if (stagedCalculations.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">
            No calculations staged yet. Use the "+ Add to Calculation Table" buttons in Culture or Reagents above.
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = "";
    stagedCalculations.forEach((item, index) => {
      const tr = document.createElement("tr");

      const badgeClass = item.module === "Culture" ? "badge-culture" : "badge-reagent";

      tr.innerHTML = `
        <td style="font-weight:700; color:var(--text-muted);">${index + 1}</td>
        <td>
          <input type="text" class="editable-sample" value="${item.sampleId}" data-index="${index}" />
        </td>
        <td><span class="badge-tag ${badgeClass}">${item.module}</span></td>
        <td>${item.inputs}</td>
        <td style="font-weight:600; color:#fff;">${item.action}</td>
        <td style="font-family:monospace; font-size:0.75rem; color:var(--accent);">${item.equation}</td>
        <td style="text-align:center;">
          <button class="btn-danger-sm tb-delete-row" data-index="${index}">✕</button>
        </td>
      `;

      tableBody.appendChild(tr);
    });

    // Wire sample name edits
    tableBody.querySelectorAll(".editable-sample").forEach(input => {
      input.addEventListener("input", (e) => {
        const idx = parseInt(e.target.dataset.index, 10);
        stagedCalculations[idx].sampleId = e.target.value;
      });
    });

    // Wire row deletes
    tableBody.querySelectorAll(".tb-delete-row").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const idx = parseInt(e.target.dataset.index, 10);
        stagedCalculations.splice(idx, 1);
        renderTable();
      });
    });
  }

  // Public method to add an entry
  function addCalculation(entry) {
    stagedCalculations.push({
      sampleId: entry.sampleId || `Sample_${stagedCalculations.length + 1}`,
      module: entry.module,
      inputs: entry.inputs,
      action: entry.action,
      equation: entry.equation
    });
    renderTable();
  }

  // 1. Export TSV for Excel / Google Sheets
  function exportTSV() {
    if (stagedCalculations.length === 0) return alert("Table is empty.");
    let tsv = "Row\tSample ID\tModule\tInputs\tAction / Recipe\tGoverning Equation\n";
    stagedCalculations.forEach((row, i) => {
      tsv += `${i + 1}\t${row.sampleId}\t${row.module}\t${row.inputs}\t${row.action}\t${row.equation}\n`;
    });

    navigator.clipboard.writeText(tsv).then(() => {
      alert("Table copied as TSV! Paste directly into Excel or Google Sheets (Ctrl + V).");
    });
  }

  // 2. Export Clean Text / Unicode for OneNote
  function exportOneNote() {
    if (stagedCalculations.length === 0) return alert("Table is empty.");
    let out = "LAB-BUDDY RUN SPECIFICATIONS\n";
    out += "=========================================================\n\n";

    stagedCalculations.forEach((row, i) => {
      out += `RUN #${i + 1}: ${row.sampleId} [${row.module}]\n`;
      out += `• Parameters: ${row.inputs}\n`;
      out += `• Protocol:   ${row.action}\n`;
      out += `• Derivation: ${row.equation}\n`;
      out += "---------------------------------------------------------\n";
    });

    navigator.clipboard.writeText(out).then(() => {
      alert("OneNote protocol text copied to clipboard! Paste directly into your notebook.");
    });
  }

  // 3. Export CSV File Download
  function exportCSV() {
    if (stagedCalculations.length === 0) return alert("Table is empty.");
    let csv = "Row,Sample ID,Module,Inputs,Action,Equation\n";
    stagedCalculations.forEach((row, i) => {
      const cleanInputs = `"${row.inputs.replace(/"/g, '""')}"`;
      const cleanAction = `"${row.action.replace(/"/g, '""')}"`;
      const cleanEq = `"${row.equation.replace(/"/g, '""')}"`;
      csv += `${i + 1},"${row.sampleId}","${row.module}",${cleanInputs},${cleanAction},${cleanEq}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `lab_buddy_run_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // 4. Print GxP Sheet
  function printSheet() {
    if (stagedCalculations.length === 0) return alert("Table is empty.");
    window.print();
  }

  // Attach Export Listeners
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (confirm("Clear all staged calculations?")) {
        stagedCalculations = [];
        renderTable();
      }
    });
  }
  if (exportExcelBtn) exportExcelBtn.addEventListener("click", exportTSV);
  if (exportOneNoteBtn) exportOneNoteBtn.addEventListener("click", exportOneNote);
  if (exportCsvBtn) exportCsvBtn.addEventListener("click", exportCSV);
  if (exportPrintBtn) exportPrintBtn.addEventListener("click", printSheet);

  return {
    addCalculation
  };
}