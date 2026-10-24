export function initBatchReagentGrid(auditLogger) {
  // Preset dictionaries
  const solidPresets = {
    custom: { name: "Custom Solute", mw: 100.0 },
    tris_base: { name: "Tris Base", mw: 121.14 },
    nacl: { name: "Sodium Chloride (NaCl)", mw: 58.44 },
    edta: { name: "EDTA Disodium Dihydrate", mw: 372.24 },
    hepes: { name: "HEPES Free Acid", mw: 238.30 },
    mgso4_anh: { name: "MgSO4 Anhydrous", mw: 120.37 },
    mgso4_hep: { name: "MgSO4 Heptahydrate", mw: 246.47 }
  };

  const acidPresets = {
    hcl: { name: "Hydrochloric Acid (HCl)", assay: 37, density: 1.19, mw: 36.46 },
    acetic: { name: "Glacial Acetic Acid", assay: 99.8, density: 1.05, mw: 60.05 },
    naoh: { name: "Sodium Hydroxide (NaOH)", assay: 50, density: 1.51, mw: 40.00 },
    custom: { name: "Custom Acid / Base", assay: 35, density: 1.15, mw: 50.00 }
  };

  // State: Datasets for all 3 calculators
  let solidRows = [
    { name: "Tris-HCl Buffer", preset: "tris_base", mw: 121.14, purity: 100, conc: 50, unit: "mM", vol: 500 },
    { name: "Saline Stock", preset: "nacl", mw: 58.44, purity: 100, conc: 150, unit: "mM", vol: 1000 },
    { name: "Chelator Aliquot", preset: "edta", mw: 372.24, purity: 99, conc: 10, unit: "mM", vol: 250 }
  ];

  let liquidRows = [
    { name: "1X PBS Buffer", c1: 10, c2: 1, unit: "X", v2: 1000 },
    { name: "10% Glycerol", c1: 100, c2: 10, unit: "%", v2: 500 },
    { name: "0.1% Triton X-100", c1: 20, c2: 0.1, unit: "%", v2: 200 }
  ];

  let acidRows = [
    { name: "1 M HCl Working Acid", preset: "hcl", assay: 37, density: 1.19, mw: 36.46, targetM: 1.0, vol: 500 },
    { name: "0.5 M NaOH Neutralizer", preset: "naoh", assay: 50, density: 1.51, mw: 40.00, targetM: 0.5, vol: 250 }
  ];

  // Sub-Tab Switcher
  const btnSolid = document.getElementById("rg-subtab-solid");
  const btnLiquid = document.getElementById("rg-subtab-liquid");
  const btnAcid = document.getElementById("rg-subtab-acid");

  const paneSolid = document.getElementById("grid-pane-solid");
  const paneLiquid = document.getElementById("grid-pane-liquid");
  const paneAcid = document.getElementById("grid-pane-acid");

  function switchGridPane(active) {
    [btnSolid, btnLiquid, btnAcid].forEach(b => {
      b.style.background = "#1e293b";
      b.style.color = "#cbd5e1";
    });
    [paneSolid, paneLiquid, paneAcid].forEach(p => p.style.display = "none");

    if (active === "solid") {
      btnSolid.style.background = "#0284c7";
      btnSolid.style.color = "#fff";
      paneSolid.style.display = "block";
    } else if (active === "liquid") {
      btnLiquid.style.background = "#0284c7";
      btnLiquid.style.color = "#fff";
      paneLiquid.style.display = "block";
    } else if (active === "acid") {
      btnAcid.style.background = "#0284c7";
      btnAcid.style.color = "#fff";
      paneAcid.style.display = "block";
    }
  }

  btnSolid.addEventListener("click", () => switchGridPane("solid"));
  btnLiquid.addEventListener("click", () => switchGridPane("liquid"));
  btnAcid.addEventListener("click", () => switchGridPane("acid"));

  // ==========================================
  // CALCULATOR 1: SOLID SOLUTES GRID
  // ==========================================
  const bodySolid = document.getElementById("body-grid-solid");

  function renderSolidGrid() {
    if (!bodySolid) return;
    bodySolid.innerHTML = "";

    solidRows.forEach((r, idx) => {
      const volLiters = r.vol / 1000;
      const purityFrac = Math.max(0.01, r.purity / 100);
      let molarity = r.conc;
      if (r.unit === "mM") molarity = r.conc / 1000;
      if (r.unit === "uM") molarity = r.conc / 1e6;

      let massRequired = 0;
      if (r.unit === "M" || r.unit === "mM" || r.unit === "uM") {
        massRequired = molarity * volLiters * r.mw * (1 / purityFrac);
      } else if (r.unit === "% w/v") {
        massRequired = ((r.conc * r.vol) / 100) * (1 / purityFrac);
      } else if (r.unit === "mg/mL") {
        massRequired = ((r.conc * r.vol) / 1000) * (1 / purityFrac);
      }

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><input type="text" class="grid-input" value="${r.name}" data-idx="${idx}" data-field="name" style="min-width:110px;" /></td>
        <td>
          <select class="grid-input" data-idx="${idx}" data-field="preset" style="min-width:105px;">
            <option value="custom" ${r.preset === "custom" ? "selected" : ""}>Custom</option>
            <option value="tris_base" ${r.preset === "tris_base" ? "selected" : ""}>Tris Base</option>
            <option value="nacl" ${r.preset === "nacl" ? "selected" : ""}>NaCl</option>
            <option value="edta" ${r.preset === "edta" ? "selected" : ""}>EDTA·2Na</option>
            <option value="hepes" ${r.preset === "hepes" ? "selected" : ""}>HEPES</option>
            <option value="mgso4_anh" ${r.preset === "mgso4_anh" ? "selected" : ""}>MgSO4 (Anh)</option>
            <option value="mgso4_hep" ${r.preset === "mgso4_hep" ? "selected" : ""}>MgSO4 (Hep)</option>
          </select>
        </td>
        <td><input type="number" step="0.01" class="grid-input" value="${r.mw}" data-idx="${idx}" data-field="mw" style="max-width:70px;" /></td>
        <td><input type="number" step="1" class="grid-input" value="${r.purity}" data-idx="${idx}" data-field="purity" style="max-width:55px;" /></td>
        <td><input type="number" step="0.1" class="grid-input" value="${r.conc}" data-idx="${idx}" data-field="conc" style="max-width:65px;" /></td>
        <td>
          <select class="grid-input" data-idx="${idx}" data-field="unit" style="min-width:75px;">
            <option value="mM" ${r.unit === "mM" ? "selected" : ""}>mM</option>
            <option value="M" ${r.unit === "M" ? "selected" : ""}>M</option>
            <option value="uM" ${r.unit === "uM" ? "selected" : ""}>µM</option>
            <option value="% w/v" ${r.unit === "% w/v" ? "selected" : ""}>% w/v</option>
            <option value="mg/mL" ${r.unit === "mg/mL" ? "selected" : ""}>mg/mL</option>
          </select>
        </td>
        <td><input type="number" step="10" class="grid-input" value="${r.vol}" data-idx="${idx}" data-field="vol" style="max-width:65px;" /></td>
        <td class="calc-cell">${massRequired < 1.0 ? (massRequired * 1000).toFixed(2) + " mg" : massRequired.toFixed(4) + " g"}</td>
        <td style="text-align:center;">
          <button class="btn-danger-sm" data-action="del-solid" data-idx="${idx}">✕</button>
        </td>
      `;
      bodySolid.appendChild(tr);
    });

    bodySolid.querySelectorAll("input, select").forEach(el => {
      el.addEventListener("change", (e) => {
        const idx = parseInt(e.target.dataset.idx, 10);
        const field = e.target.dataset.field;
        let val = e.target.value;

        if (field === "preset" && solidPresets[val]) {
          solidRows[idx].preset = val;
          solidRows[idx].mw = solidPresets[val].mw;
          if (val !== "custom") solidRows[idx].name = solidPresets[val].name;
        } else if (field !== "name" && field !== "preset" && field !== "unit") {
          val = parseFloat(val) || 0;
          solidRows[idx][field] = val;
        } else {
          solidRows[idx][field] = val;
        }

        auditLogger.logEvent("ReagentSolidGrid", "RowUpdated", { rowIdx: idx, field, newValue: val });
        renderSolidGrid();
      });
    });

    bodySolid.querySelectorAll("[data-action='del-solid']").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const idx = parseInt(e.target.dataset.idx, 10);
        solidRows.splice(idx, 1);
        auditLogger.logEvent("ReagentSolidGrid", "RowDeleted", { rowIdx: idx });
        renderSolidGrid();
      });
    });
  }

  document.getElementById("btn-add-solid-row").addEventListener("click", () => {
    solidRows.push({ name: `Solute_${solidRows.length + 1}`, preset: "tris_base", mw: 121.14, purity: 100, conc: 50, unit: "mM", vol: 500 });
    auditLogger.logEvent("ReagentSolidGrid", "RowAdded", {});
    renderSolidGrid();
  });

  // Export Solid Spreadsheet with LIVE FORMULAS
  document.getElementById("btn-export-solid-excel").addEventListener("click", () => {
    if (solidRows.length === 0) return alert("Solid grid is empty.");

    let csv = "Solute Name,MW (g/mol),Purity %,Target Conc,Unit,Target Vol (mL),Target Vol (L) [Formula],Calculated Mass Required (g) [Formula]\n";

    solidRows.forEach((r, idx) => {
      const rowNum = idx + 2;
      // B = MW, C = Purity, D = Conc, E = Unit, F = Vol (mL)
      // G = Vol (L) -> =(F2/1000)
      // H = Mass (g) -> Molar: =IF(E2="mM",(D2/1000)*G2*B2*(1/(C2/100)),IF(E2="M",D2*G2*B2*(1/(C2/100)),((D2*F2)/100)*(1/(C2/100))))
      const volLitersFormula = `=(F${rowNum}/1000)`;
      const massFormula = `=IF(E${rowNum}="mM",(D${rowNum}/1000)*G${rowNum}*B${rowNum}*(1/(C${rowNum}/100)),IF(E${rowNum}="M",D${rowNum}*G${rowNum}*B${rowNum}*(1/(C${rowNum}/100)),((D${rowNum}*F${rowNum})/100)*(1/(C${rowNum}/100))))`;

      csv += `"${r.name}",${r.mw},${r.purity},${r.conc},"${r.unit}",${r.vol},"${volLitersFormula}","${massFormula}"\n`;
    });

    downloadCSV(csv, "lab_buddy_solid_solutes_formulas");
    auditLogger.logEvent("ComplianceExport", "SolidGridSpreadsheetExported", { count: solidRows.length });
  });

  // ==========================================
  // CALCULATOR 2: LIQUID DILUTIONS (C1V1 = C2V2)
  // ==========================================
  const bodyLiquid = document.getElementById("body-grid-liquid");

  function renderLiquidGrid() {
    if (!bodyLiquid) return;
    bodyLiquid.innerHTML = "";

    liquidRows.forEach((r, idx) => {
      // V1 = (C2 * V2) / C1
      const v1 = r.c1 > 0 ? (r.c2 * r.v2) / r.c1 : 0;
      const vDiluent = Math.max(0, r.v2 - v1);

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><input type="text" class="grid-input" value="${r.name}" data-idx="${idx}" data-field="name" style="min-width:110px;" /></td>
        <td><input type="number" step="0.5" class="grid-input" value="${r.c1}" data-idx="${idx}" data-field="c1" style="max-width:65px;" /></td>
        <td><input type="number" step="0.1" class="grid-input" value="${r.c2}" data-idx="${idx}" data-field="c2" style="max-width:65px;" /></td>
        <td>
          <select class="grid-input" data-idx="${idx}" data-field="unit" style="min-width:65px;">
            <option value="X" ${r.unit === "X" ? "selected" : ""}>X</option>
            <option value="%" ${r.unit === "%" ? "selected" : ""}>%</option>
            <option value="M" ${r.unit === "M" ? "selected" : ""}>M</option>
            <option value="mM" ${r.unit === "mM" ? "selected" : ""}>mM</option>
          </select>
        </td>
        <td><input type="number" step="10" class="grid-input" value="${r.v2}" data-idx="${idx}" data-field="v2" style="max-width:70px;" /></td>
        <td class="calc-cell">${v1.toFixed(2)} mL</td>
        <td class="calc-cell" style="color:var(--text);">${vDiluent.toFixed(2)} mL</td>
        <td style="text-align:center;">
          <button class="btn-danger-sm" data-action="del-liquid" data-idx="${idx}">✕</button>
        </td>
      `;
      bodyLiquid.appendChild(tr);
    });

    bodyLiquid.querySelectorAll("input, select").forEach(el => {
      el.addEventListener("change", (e) => {
        const idx = parseInt(e.target.dataset.idx, 10);
        const field = e.target.dataset.field;
        let val = e.target.value;
        if (field !== "name" && field !== "unit") val = parseFloat(val) || 0;
        liquidRows[idx][field] = val;
        auditLogger.logEvent("ReagentLiquidGrid", "RowUpdated", { rowIdx: idx, field, newValue: val });
        renderLiquidGrid();
      });
    });

    bodyLiquid.querySelectorAll("[data-action='del-liquid']").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const idx = parseInt(e.target.dataset.idx, 10);
        liquidRows.splice(idx, 1);
        auditLogger.logEvent("ReagentLiquidGrid", "RowDeleted", { rowIdx: idx });
        renderLiquidGrid();
      });
    });
  }

  document.getElementById("btn-add-liquid-row").addEventListener("click", () => {
    liquidRows.push({ name: `Stock_Solution_${liquidRows.length + 1}`, c1: 10, c2: 1, unit: "X", v2: 500 });
    auditLogger.logEvent("ReagentLiquidGrid", "RowAdded", {});
    renderLiquidGrid();
  });

  // Export Liquid Spreadsheet with LIVE FORMULAS
  document.getElementById("btn-export-liquid-excel").addEventListener("click", () => {
    if (liquidRows.length === 0) return alert("Liquid grid is empty.");

    let csv = "Component Name,Stock Conc C1,Target Conc C2,Unit,Target Vol V2 (mL),Stock Vol Required V1 (mL) [Formula],Diluent to Add (mL) [Formula]\n";

    liquidRows.forEach((r, idx) => {
      const rowNum = idx + 2;
      // B = C1, C = C2, D = Unit, E = V2
      // F = V1 -> =((C2*E2)/B2)
      // G = Diluent -> =(E2-F2)
      const v1Formula = `=((C${rowNum}*E${rowNum})/B${rowNum})`;
      const diluentFormula = `=(E${rowNum}-F${rowNum})`;

      csv += `"${r.name}",${r.c1},${r.c2},"${r.unit}",${r.v2},"${v1Formula}","${diluentFormula}"\n`;
    });

    downloadCSV(csv, "lab_buddy_liquid_dilutions_formulas");
    auditLogger.logEvent("ComplianceExport", "LiquidGridSpreadsheetExported", { count: liquidRows.length });
  });

  // ==========================================
  // CALCULATOR 3: CONCENTRATED ACIDS & BASES
  // ==========================================
  const bodyAcid = document.getElementById("body-grid-acid");

  function renderAcidGrid() {
    if (!bodyAcid) return;
    bodyAcid.innerHTML = "";

    acidRows.forEach((r, idx) => {
      // M_stock = (10 * density * assay) / mw
      const mStock = (10 * r.density * r.assay) / r.mw;
      // V_acid = (M_target * V_total) / M_stock
      const vAcid = mStock > 0 ? (r.targetM * r.vol) / mStock : 0;
      const vWater = Math.max(0, r.vol - vAcid);

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><input type="text" class="grid-input" value="${r.name}" data-idx="${idx}" data-field="name" style="min-width:110px;" /></td>
        <td>
          <select class="grid-input" data-idx="${idx}" data-field="preset" style="min-width:90px;">
            <option value="hcl" ${r.preset === "hcl" ? "selected" : ""}>37% HCl</option>
            <option value="acetic" ${r.preset === "acetic" ? "selected" : ""}>Glacial Acetic</option>
            <option value="naoh" ${r.preset === "naoh" ? "selected" : ""}>50% NaOH</option>
            <option value="custom" ${r.preset === "custom" ? "selected" : ""}>Custom</option>
          </select>
        </td>
        <td><input type="number" step="0.5" class="grid-input" value="${r.assay}" data-idx="${idx}" data-field="assay" style="max-width:55px;" /></td>
        <td><input type="number" step="0.01" class="grid-input" value="${r.density}" data-idx="${idx}" data-field="density" style="max-width:55px;" /></td>
        <td><input type="number" step="0.01" class="grid-input" value="${r.mw}" data-idx="${idx}" data-field="mw" style="max-width:60px;" /></td>
        <td class="calc-cell" style="color:#f59e0b;">${mStock.toFixed(2)} M</td>
        <td><input type="number" step="0.1" class="grid-input" value="${r.targetM}" data-idx="${idx}" data-field="targetM" style="max-width:55px;" /></td>
        <td><input type="number" step="25" class="grid-input" value="${r.vol}" data-idx="${idx}" data-field="vol" style="max-width:65px;" /></td>
        <td class="calc-cell">${vAcid.toFixed(2)} mL</td>
        <td class="calc-cell" style="color:var(--text);">${vWater.toFixed(2)} mL</td>
        <td style="text-align:center;">
          <button class="btn-danger-sm" data-action="del-acid" data-idx="${idx}">✕</button>
        </td>
      `;
      bodyAcid.appendChild(tr);
    });

    bodyAcid.querySelectorAll("input, select").forEach(el => {
      el.addEventListener("change", (e) => {
        const idx = parseInt(e.target.dataset.idx, 10);
        const field = e.target.dataset.field;
        let val = e.target.value;

        if (field === "preset" && acidPresets[val]) {
          acidRows[idx].preset = val;
          acidRows[idx].assay = acidPresets[val].assay;
          acidRows[idx].density = acidPresets[val].density;
          acidRows[idx].mw = acidPresets[val].mw;
          if (val !== "custom") acidRows[idx].name = acidPresets[val].name;
        } else if (field !== "name" && field !== "preset") {
          val = parseFloat(val) || 0;
          acidRows[idx][field] = val;
        } else {
          acidRows[idx][field] = val;
        }

        auditLogger.logEvent("ReagentAcidGrid", "RowUpdated", { rowIdx: idx, field, newValue: val });
        renderAcidGrid();
      });
    });

    bodyAcid.querySelectorAll("[data-action='del-acid']").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const idx = parseInt(e.target.dataset.idx, 10);
        acidRows.splice(idx, 1);
        auditLogger.logEvent("ReagentAcidGrid", "RowDeleted", { rowIdx: idx });
        renderAcidGrid();
      });
    });
  }

  document.getElementById("btn-add-acid-row").addEventListener("click", () => {
    acidRows.push({ name: `Acid_Solution_${acidRows.length + 1}`, preset: "hcl", assay: 37, density: 1.19, mw: 36.46, targetM: 1.0, vol: 500 });
    auditLogger.logEvent("ReagentAcidGrid", "RowAdded", {});
    renderAcidGrid();
  });

  // Export Acid Spreadsheet with LIVE FORMULAS
  document.getElementById("btn-export-acid-excel").addEventListener("click", () => {
    if (acidRows.length === 0) return alert("Acid grid is empty.");

    let csv = "Reagent Name,Assay %,Density (g/mL),MW (g/mol),Calculated Stock Molarity (M) [Formula],Target M (M),Final Vol (mL),Acid Vol to Pipette (mL) [Formula],Water Vol to Add First (mL) [Formula]\n";

    acidRows.forEach((r, idx) => {
      const rowNum = idx + 2;
      // B = Assay %, C = Density, D = MW
      // E = Stock Molarity -> =((10*C2*B2)/D2)
      // F = Target M, G = Final Vol
      // H = Acid Vol -> =((F2*G2)/E2)
      // I = Water Vol -> =(G2-H2)
      const stockMFormula = `=((10*C${rowNum}*B${rowNum})/D${rowNum})`;
      const acidVolFormula = `=((F${rowNum}*G${rowNum})/E${rowNum})`;
      const waterVolFormula = `=(G${rowNum}-H${rowNum})`;

      csv += `"${r.name}",${r.assay},${r.density},${r.mw},"${stockMFormula}",${r.targetM},${r.vol},"${acidVolFormula}","${waterVolFormula}"\n`;
    });

    downloadCSV(csv, "lab_buddy_concentrated_acids_formulas");
    auditLogger.logEvent("ComplianceExport", "AcidGridSpreadsheetExported", { count: acidRows.length });
  });

  // Shared CSV Downloader helper
  function downloadCSV(csvContent, filenamePrefix) {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filenamePrefix}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Initial render of all 3 grids
  renderSolidGrid();
  renderLiquidGrid();
  renderAcidGrid();
}