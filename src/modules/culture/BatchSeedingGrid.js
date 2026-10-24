export function initBatchSeedingGrid(auditLogger) {
  const gridBody = document.getElementById("batch-grid-body");
  const addRowBtn = document.getElementById("btn-add-grid-row");
  const exportExcelBtn = document.getElementById("btn-export-grid-excel");

  let rows = [
    { id: "Flask_01", format: "T-75", targetBase: 2.0, targetExp: 6, vol: 12.0, stockBase: 2.0, stockExp: 5, viab: 95 },
    { id: "Flask_02", format: "T-75", targetBase: 2.0, targetExp: 6, vol: 12.0, stockBase: 2.0, stockExp: 5, viab: 95 },
    { id: "Flask_03", format: "T-175", targetBase: 5.0, targetExp: 6, vol: 30.0, stockBase: 2.0, stockExp: 5, viab: 95 }
  ];

  function renderGrid() {
    if (!gridBody) return;
    gridBody.innerHTML = "";

    rows.forEach((row, idx) => {
      // Dynamic computation
      const rawStock = row.stockBase * Math.pow(10, row.stockExp);
      const liveStock = rawStock * (row.viab / 100);
      const targetCells = row.targetBase * Math.pow(10, row.targetExp);
      const vSusp = liveStock > 0 ? (targetCells / liveStock) : 0;
      const vMedia = Math.max(0, row.vol - vSusp);

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><input type="text" class="grid-input" value="${row.id}" data-idx="${idx}" data-field="id" style="min-width:80px;" /></td>
        <td>
          <select class="grid-input" data-idx="${idx}" data-field="format" style="min-width:75px;">
            <option value="6-Well" ${row.format === "6-Well" ? "selected" : ""}>6-Well</option>
            <option value="T-25" ${row.format === "T-25" ? "selected" : ""}>T-25</option>
            <option value="T-75" ${row.format === "T-75" ? "selected" : ""}>T-75</option>
            <option value="T-175" ${row.format === "T-175" ? "selected" : ""}>T-175</option>
          </select>
        </td>
        <td>
          <div style="display:flex; align-items:center; gap:0.2rem;">
            <input type="number" step="0.1" class="grid-input" value="${row.targetBase}" data-idx="${idx}" data-field="targetBase" style="max-width:55px;" />
            <span style="color:var(--text-muted); font-size:0.75rem;">e</span>
            <input type="number" step="1" class="grid-input" value="${row.targetExp}" data-idx="${idx}" data-field="targetExp" style="max-width:45px;" />
          </div>
        </td>
        <td><input type="number" step="0.5" class="grid-input" value="${row.vol}" data-idx="${idx}" data-field="vol" style="max-width:60px;" /></td>
        <td><input type="number" step="0.1" class="grid-input" value="${row.stockBase}" data-idx="${idx}" data-field="stockBase" style="max-width:55px;" /></td>
        <td><input type="number" step="1" class="grid-input" value="${row.stockExp}" data-idx="${idx}" data-field="stockExp" style="max-width:45px;" /></td>
        <td><input type="number" step="1" class="grid-input" value="${row.viab}" data-idx="${idx}" data-field="viab" style="max-width:55px;" /></td>
        <td class="calc-cell">${vSusp.toFixed(2)}</td>
        <td class="calc-cell" style="color:var(--text);">${vMedia.toFixed(2)}</td>
        <td style="text-align:center;">
          <button class="btn-danger-sm" data-idx="${idx}">✕</button>
        </td>
      `;

      gridBody.appendChild(tr);
    });

    // Wire input changes
    gridBody.querySelectorAll("input, select").forEach(el => {
      el.addEventListener("change", (e) => {
        const idx = parseInt(e.target.dataset.idx, 10);
        const field = e.target.dataset.field;
        let val = e.target.value;
        if (field !== "id" && field !== "format") {
          val = parseFloat(val) || 0;
        }
        rows[idx][field] = val;
        auditLogger.logEvent("CultureGrid", "RowUpdated", { rowIdx: idx, field, newValue: val });
        renderGrid();
      });
    });

    // Wire row deletes
    gridBody.querySelectorAll(".btn-danger-sm").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const idx = parseInt(e.target.dataset.idx, 10);
        rows.splice(idx, 1);
        auditLogger.logEvent("CultureGrid", "RowDeleted", { rowIdx: idx });
        renderGrid();
      });
    });
  }

  if (addRowBtn) {
    addRowBtn.addEventListener("click", () => {
      const nextNum = rows.length + 1;
      rows.push({
        id: `Flask_0${nextNum}`,
        format: "T-75",
        targetBase: 2.0,
        targetExp: 6,
        vol: 12.0,
        stockBase: 2.0,
        stockExp: 5,
        viab: 95
      });
      auditLogger.logEvent("CultureGrid", "RowAdded", { id: `Flask_0${nextNum}` });
      renderGrid();
    });
  }

  // Generate Excel CSV with LIVE FORMULAS
  if (exportExcelBtn) {
    exportExcelBtn.addEventListener("click", () => {
      if (rows.length === 0) return alert("Batch grid has no rows.");

      let csv = "Vessel ID,Vessel Format,Target Base,Target Exp,Target Live Cells (Total),Working Vol (mL),Stock Base,Stock Exp,Stock Conc/mL,Viability %,Suspension Required (mL) [Formula],Fresh Media to Dispense (mL) [Formula]\n";

      rows.forEach((r, idx) => {
        const excelRow = idx + 2; // Excel 1-based index (Row 1 is headers)

        // Column mapping:
        // C = Target Base, D = Target Exp, E = Total Target Cells Formula
        // F = Working Vol
        // G = Stock Base, H = Stock Exp, I = Total Stock Conc Formula
        // J = Viability %
        // K = Suspension Vol Formula = E / (I * (J / 100))
        // L = Fresh Media Formula = F - K

        const formulaTargetTotal = `=(C${excelRow}*10^D${excelRow})`;
        const formulaStockTotal = `=(G${excelRow}*10^H${excelRow})`;
        const formulaSuspVol = `=(E${excelRow}/(I${excelRow}*(J${excelRow}/100)))`;
        const formulaMediaVol = `=(F${excelRow}-K${excelRow})`;

        csv += `"${r.id}","${r.format}",${r.targetBase},${r.targetExp},"${formulaTargetTotal}",${r.vol},${r.stockBase},${r.stockExp},"${formulaStockTotal}",${r.viab},"${formulaSuspVol}","${formulaMediaVol}"\n`;
      });

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `lab_buddy_culture_batch_formulas_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      auditLogger.logEvent("ComplianceExport", "SpreadsheetGenerated", { rowCount: rows.length, formulaPreserved: true });
    });
  }

  renderGrid();
}