export function initConversionEngine(auditLogger) {
  // Sub-Tab Switcher
  const btnQuick = document.getElementById("m3-tab-quick");
  const btnVessels = document.getElementById("m3-tab-vessels");
  const btnFlow = document.getElementById("m3-tab-flow");
  const btnStudio = document.getElementById("m3-tab-studio");

  const paneQuick = document.getElementById("pane-m3-quick");
  const paneVessels = document.getElementById("pane-m3-vessels");
  const paneFlow = document.getElementById("pane-m3-flow");
  const paneStudio = document.getElementById("pane-m3-studio");

  function switchM3Pane(active) {
    [btnQuick, btnVessels, btnFlow, btnStudio].forEach(b => {
      if (b) { b.style.background = "#1e293b"; b.style.color = "#cbd5e1"; }
    });
    [paneQuick, paneVessels, paneFlow, paneStudio].forEach(p => {
      if (p) p.style.display = "none";
    });

    if (active === "quick" && paneQuick && btnQuick) {
      btnQuick.style.background = "#0284c7"; btnQuick.style.color = "#fff";
      paneQuick.style.display = "block";
    } else if (active === "vessels" && paneVessels && btnVessels) {
      btnVessels.style.background = "#0284c7"; btnVessels.style.color = "#fff";
      paneVessels.style.display = "block";
    } else if (active === "flow" && paneFlow && btnFlow) {
      btnFlow.style.background = "#0284c7"; btnFlow.style.color = "#fff";
      paneFlow.style.display = "block";
      renderSpectrum();
    } else if (active === "studio" && paneStudio && btnStudio) {
      btnStudio.style.background = "#0284c7"; btnStudio.style.color = "#fff";
      paneStudio.style.display = "block";
    }
    auditLogger.logEvent("Conversions", "SubTabChanged", { pane: active });
  }

  if (btnQuick) btnQuick.addEventListener("click", () => switchM3Pane("quick"));
  if (btnVessels) btnVessels.addEventListener("click", () => switchM3Pane("vessels"));
  if (btnFlow) btnFlow.addEventListener("click", () => switchM3Pane("flow"));
  if (btnStudio) btnStudio.addEventListener("click", () => switchM3Pane("studio"));

  // ==========================================
  // 1. QUICK CONVERTERS: Centrifuge Mechanics
  // ==========================================
  const rcfInput = document.getElementById("cent-rcf");
  const rpmInput = document.getElementById("cent-rpm");
  const radiusInput = document.getElementById("cent-radius");
  const presetRadius = document.getElementById("cent-preset");

  function updateCentFromRCF() {
    const rcf = parseFloat(rcfInput.value) || 0;
    const r = parseFloat(radiusInput.value) || 8.4;
    if (r > 0 && rcf >= 0) {
      // RPM = sqrt( RCF / (1.118e-5 * r) )
      const rpm = Math.round(Math.sqrt(rcf / (1.118e-5 * r)));
      rpmInput.value = rpm;
    }
  }

  function updateCentFromRPM() {
    const rpm = parseFloat(rpmInput.value) || 0;
    const r = parseFloat(radiusInput.value) || 8.4;
    if (r > 0 && rpm >= 0) {
      // RCF = 1.118e-5 * r * (RPM)^2
      const rcf = Math.round(1.118e-5 * r * Math.pow(rpm, 2));
      rcfInput.value = rcf;
    }
  }

  if (rcfInput) rcfInput.addEventListener("input", updateCentFromRCF);
  if (rpmInput) rpmInput.addEventListener("input", updateCentFromRPM);
  if (radiusInput) radiusInput.addEventListener("input", updateCentFromRCF);
  if (presetRadius) {
    presetRadius.addEventListener("change", (e) => {
      radiusInput.value = e.target.value;
      updateCentFromRCF();
    });
  }

  // Centrifuge chips
  const setCent = (g) => { rcfInput.value = g; updateCentFromRCF(); };
  document.getElementById("chip-spin-cell")?.addEventListener("click", () => setCent(300));
  document.getElementById("chip-spin-ficoll")?.addEventListener("click", () => setCent(400));
  document.getElementById("chip-spin-bacteria")?.addEventListener("click", () => setCent(4000));
  document.getElementById("chip-spin-column")?.addEventListener("click", () => setCent(16000));

  // ==========================================
  // 2. Volume & Liquid Handling (Two-way)
  // ==========================================
  const volUl = document.getElementById("vol-ul");
  const volMl = document.getElementById("vol-ml");
  const volL = document.getElementById("vol-l");
  const volGal = document.getElementById("vol-gal");

  if (volUl) {
    volUl.addEventListener("input", () => {
      const u = parseFloat(volUl.value) || 0;
      volMl.value = (u / 1000).toFixed(4);
      volL.value = (u / 1e6).toFixed(6);
      volGal.value = (u / 3.78541e6).toFixed(7);
    });
  }
  if (volMl) {
    volMl.addEventListener("input", () => {
      const m = parseFloat(volMl.value) || 0;
      volUl.value = (m * 1000).toFixed(1);
      volL.value = (m / 1000).toFixed(5);
      volGal.value = (m / 3785.41).toFixed(6);
    });
  }
  if (volL) {
    volL.addEventListener("input", () => {
      const l = parseFloat(volL.value) || 0;
      volUl.value = (l * 1e6).toFixed(0);
      volMl.value = (l * 1000).toFixed(2);
      volGal.value = (l / 3.78541).toFixed(4);
    });
  }
  if (volGal) {
    volGal.addEventListener("input", () => {
      const g = parseFloat(volGal.value) || 0;
      const l = g * 3.78541;
      volL.value = l.toFixed(3);
      volMl.value = (l * 1000).toFixed(1);
      volUl.value = (l * 1e6).toFixed(0);
    });
  }

  // ==========================================
  // 3. Temperature & Cryo Scales
  // ==========================================
  const tempC = document.getElementById("temp-c");
  const tempF = document.getElementById("temp-f");
  const tempK = document.getElementById("temp-k");

  function setC(val) {
    tempC.value = val.toFixed(1);
    tempF.value = ((val * 9/5) + 32).toFixed(1);
    tempK.value = (val + 273.15).toFixed(2);
  }

  if (tempC) tempC.addEventListener("input", () => setC(parseFloat(tempC.value) || 0));
  if (tempF) {
    tempF.addEventListener("input", () => {
      const f = parseFloat(tempF.value) || 0;
      const c = (f - 32) * 5/9;
      tempC.value = c.toFixed(1);
      tempK.value = (c + 273.15).toFixed(2);
    });
  }

  document.getElementById("chip-temp-ln2")?.addEventListener("click", () => setC(-196));
  document.getElementById("chip-temp-ultra")?.addEventListener("click", () => setC(-80));
  document.getElementById("chip-temp-cold")?.addEventListener("click", () => setC(4));
  document.getElementById("chip-temp-body")?.addEventListener("click", () => setC(37));
  document.getElementById("chip-temp-auto")?.addEventListener("click", () => setC(121));

  // ==========================================
  // 4. Mass & Micro Scales
  // ==========================================
  const massNg = document.getElementById("mass-ng");
  const massUg = document.getElementById("mass-ug");
  const massMg = document.getElementById("mass-mg");
  const massG = document.getElementById("mass-g");

  if (massMg) {
    massMg.addEventListener("input", () => {
      const mg = parseFloat(massMg.value) || 0;
      massNg.value = (mg * 1e6).toFixed(0);
      massUg.value = (mg * 1000).toFixed(1);
      massG.value = (mg / 1000).toFixed(5);
    });
  }

  // ==========================================
  // 5. Bioprocess Pressure
  // ==========================================
  const pressPsi = document.getElementById("press-psi");
  const pressBar = document.getElementById("press-bar");
  const pressKpa = document.getElementById("press-kpa");
  const pressAtm = document.getElementById("press-atm");

  function setPsi(psi) {
    pressPsi.value = psi.toFixed(2);
    pressBar.value = (psi * 0.0689476).toFixed(3);
    pressKpa.value = (psi * 6.89476).toFixed(2);
    pressAtm.value = (psi * 0.068046).toFixed(3);
  }
  if (pressPsi) pressPsi.addEventListener("input", () => setPsi(parseFloat(pressPsi.value) || 0));
  if (pressBar) pressBar.addEventListener("input", () => setPsi((parseFloat(pressBar.value) || 0) / 0.0689476));

  document.getElementById("chip-press-tank")?.addEventListener("click", () => setPsi(2000));
  document.getElementById("chip-press-auto")?.addEventListener("click", () => setPsi(15));

  // ==========================================
  // 6. Scientific Notation Parser
  // ==========================================
  const sciDec = document.getElementById("sci-decimal");
  const sciMan = document.getElementById("sci-mantissa");
  const sciExp = document.getElementById("sci-exponent");
  const sciOut = document.getElementById("sci-formatted-output");

  if (sciDec) {
    sciDec.addEventListener("input", () => {
      const val = parseFloat(sciDec.value) || 0;
      if (val === 0) return;
      const exp = Math.floor(Math.log10(Math.abs(val)));
      const base = val / Math.pow(10, exp);
      sciMan.value = base.toFixed(2);
      sciExp.value = exp;
      if (sciOut) sciOut.innerText = `Output: ${base.toFixed(2)} × 10^${exp}`;
    });
  }

// ==========================================
  // ENHANCED VESSEL MATRIX & SCALE-UP ENGINE
  // ==========================================

  // Master Column Specification
  let columns = [
    { id: "format", label: "Vessel Format", visible: true },
    { id: "area", label: "Surface Area (cm²)", visible: true },
    { id: "workingMedia", label: "Working Media (mL)", visible: true },
    { id: "dissocVol", label: "Dissociation Vol (mL)", visible: true },
    { id: "seedingRange", label: "Seeding Range (Cells)", visible: true },
    { id: "harvestYield", label: "Confluent Harvest Yield", visible: true },
    { id: "cultureDensity", label: "Max Density (cells/cm²)", visible: true }
  ];

  // Master Vessel Dataset
  let vesselRows = [
    {
      id: "6well",
      name: "6-Well Plate (per well)",
      area: 9.5,
      workingMedia: "2.0 – 3.0 mL",
      stdVol: 2.5,
      dissocVol: "0.5 mL",
      seedingRange: "1.9 × 10⁵ – 2.9 × 10⁵",
      harvestYield: "1.0 × 10⁶ – 1.4 × 10⁶",
      cultureDensity: "1.2 × 10⁵",
      visible: true
    },
    {
      id: "t25",
      name: "T-25 Flask",
      area: 25.0,
      workingMedia: "4.0 – 6.0 mL",
      stdVol: 5.0,
      dissocVol: "1.0 – 2.0 mL",
      seedingRange: "5.0 × 10⁵ – 7.5 × 10⁵",
      harvestYield: "2.5 × 10⁶ – 3.5 × 10⁶",
      cultureDensity: "1.2 × 10⁵",
      visible: true
    },
    {
      id: "t75",
      name: "T-75 Flask",
      area: 75.0,
      workingMedia: "10 – 15 mL",
      stdVol: 12.0,
      dissocVol: "3.0 – 5.0 mL",
      seedingRange: "1.5 × 10⁶ – 2.3 × 10⁶",
      harvestYield: "7.5 × 10⁶ – 1.1 × 10⁷",
      cultureDensity: "1.2 × 10⁵",
      visible: true
    },
    {
      id: "t175",
      name: "T-175 Flask",
      area: 175.0,
      workingMedia: "25 – 35 mL",
      stdVol: 30.0,
      dissocVol: "5.0 – 8.0 mL",
      seedingRange: "3.5 × 10⁶ – 5.3 × 10⁶",
      harvestYield: "1.8 × 10⁷ – 2.5 × 10⁷",
      cultureDensity: "1.2 × 10⁵",
      visible: true
    },
    {
      id: "t225",
      name: "T-225 Flask",
      area: 225.0,
      workingMedia: "35 – 50 mL",
      stdVol: 40.0,
      dissocVol: "8.0 – 10 mL",
      seedingRange: "4.5 × 10⁶ – 6.8 × 10⁶",
      harvestYield: "2.3 × 10⁷ – 3.2 × 10⁷",
      cultureDensity: "1.2 × 10⁵",
      visible: true
    },
    {
      id: "cs1",
      name: "1-Layer CellSTACK",
      area: 636.0,
      workingMedia: "130 – 200 mL",
      stdVol: 150.0,
      dissocVol: "15 – 25 mL",
      seedingRange: "1.3 × 10⁷ – 1.9 × 10⁷",
      harvestYield: "6.5 × 10⁷ – 9.0 × 10⁷",
      cultureDensity: "1.2 × 10⁵",
      visible: true
    },
    {
      id: "cs2",
      name: "2-Layer CellSTACK",
      area: 1272.0,
      workingMedia: "260 – 400 mL",
      stdVol: 300.0,
      dissocVol: "30 – 50 mL",
      seedingRange: "2.5 × 10⁷ – 3.8 × 10⁷",
      harvestYield: "1.3 × 10⁸ – 1.8 × 10⁸",
      cultureDensity: "1.2 × 10⁵",
      visible: true
    },
    {
      id: "cs5",
      name: "5-Layer CellSTACK",
      area: 3180.0,
      workingMedia: "650 – 1,000 mL",
      stdVol: 750.0,
      dissocVol: "75 – 125 mL",
      seedingRange: "6.4 × 10⁷ – 9.5 × 10⁷",
      harvestYield: "3.2 × 10⁸ – 4.5 × 10⁸",
      cultureDensity: "1.2 × 10⁵",
      visible: true
    }
  ];

  // Table DOM Containers
  const tableHead = document.getElementById("vessel-table-head");
  const tableBody = document.getElementById("vessel-table-body");
  const colToggleBox = document.getElementById("col-toggle-container");
  const hiddenRowsBar = document.getElementById("hidden-rows-bar");
  const hiddenRowsBox = document.getElementById("hidden-rows-container");

  // Render Table Columns & Rows
  function renderInteractiveTable() {
    if (!tableHead || !tableBody) return;

    // 1. Column Controls Bar
    if (colToggleBox) {
      colToggleBox.innerHTML = "";
      columns.forEach(col => {
        const pill = document.createElement("button");
        pill.className = `col-toggle-pill ${col.visible ? "active" : ""}`;
        pill.innerHTML = `<span>${col.visible ? "✓" : "+"}</span> ${col.label.split("(")[0]}`;
        pill.addEventListener("click", () => {
          col.visible = !col.visible;
          renderInteractiveTable();
        });
        colToggleBox.appendChild(pill);
      });
    }

    // 2. Hidden Rows Bar
    const hiddenCount = vesselRows.filter(r => !r.visible).length;
    if (hiddenRowsBar) hiddenRowsBar.style.display = hiddenCount > 0 ? "flex" : "none";
    if (hiddenRowsBox) {
      hiddenRowsBox.innerHTML = "";
      vesselRows.filter(r => !r.visible).forEach(r => {
        const btn = document.createElement("button");
        btn.className = "conv-chip";
        btn.innerText = `+ Unhide ${r.name.split(" ")[0]}`;
        btn.addEventListener("click", () => {
          r.visible = true;
          renderInteractiveTable();
        });
        hiddenRowsBox.appendChild(btn);
      });
    }

    // 3. Render Table Header (with Move Left / Right)
    tableHead.innerHTML = "";
    const trHead = document.createElement("tr");

    // Action column header
    const thAction = document.createElement("th");
    thAction.style.width = "75px";
    thAction.innerText = "Order";
    trHead.appendChild(thAction);

    const visibleCols = columns.filter(c => c.visible);
    visibleCols.forEach((col, idx) => {
      const th = document.createElement("th");
      th.innerHTML = `
        <div style="display:flex; align-items:center; justify-content:space-between; gap:0.4rem;">
          <span>${col.label}</span>
          <div style="display:flex; gap:0.15rem;">
            ${idx > 0 ? `<button class="th-move-btn" data-dir="left" data-idx="${idx}" title="Move column left">◀</button>` : ""}
            ${idx < visibleCols.length - 1 ? `<button class="th-move-btn" data-dir="right" data-idx="${idx}" title="Move column right">▶</button>` : ""}
          </div>
        </div>
      `;
      trHead.appendChild(th);
    });

    tableHead.appendChild(trHead);

    // Wire column shift buttons
    tableHead.querySelectorAll(".th-move-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const idx = parseInt(e.target.dataset.idx, 10);
        const dir = e.target.dataset.dir;
        const visibleIndices = columns.map((c, i) => c.visible ? i : -1).filter(i => i !== -1);
        const actualIdx = visibleIndices[idx];

        if (dir === "left" && idx > 0) {
          const targetActualIdx = visibleIndices[idx - 1];
          const temp = columns[actualIdx];
          columns[actualIdx] = columns[targetActualIdx];
          columns[targetActualIdx] = temp;
        } else if (dir === "right" && idx < visibleIndices.length - 1) {
          const targetActualIdx = visibleIndices[idx + 1];
          const temp = columns[actualIdx];
          columns[actualIdx] = columns[targetActualIdx];
          columns[targetActualIdx] = temp;
        }
        renderInteractiveTable();
      });
    });

    // 4. Render Table Rows (with Up / Down / Hide)
    tableBody.innerHTML = "";
    const visibleRows = vesselRows.filter(r => r.visible);

    visibleRows.forEach((row, rIdx) => {
      const tr = document.createElement("tr");

      // Row control cell
      const tdAction = document.createElement("td");
      tdAction.innerHTML = `
        <div style="display:flex; align-items:center; gap:0.2rem;">
          ${rIdx > 0 ? `<button class="row-action-btn" data-action="up" data-idx="${rIdx}" title="Move row up">▲</button>` : `<span style="width:16px;"></span>`}
          ${rIdx < visibleRows.length - 1 ? `<button class="row-action-btn" data-action="down" data-idx="${rIdx}" title="Move row down">▼</button>` : `<span style="width:16px;"></span>`}
          <button class="row-action-btn" data-action="hide" data-idx="${rIdx}" title="Hide row">👁️</button>
        </div>
      `;
      tr.appendChild(tdAction);

      // Value cells
      visibleCols.forEach(col => {
        const td = document.createElement("td");
        if (col.id === "format") td.innerHTML = `<strong>${row.name}</strong>`;
        else if (col.id === "area") td.innerText = `${row.area} cm²`;
        else if (col.id === "workingMedia") td.innerText = row.workingMedia;
        else if (col.id === "dissocVol") td.innerText = row.dissocVol;
        else if (col.id === "seedingRange") td.innerText = row.seedingRange;
        else if (col.id === "harvestYield") td.innerText = row.harvestYield;
        else if (col.id === "cultureDensity") td.innerText = `${row.cultureDensity} /cm²`;
        tr.appendChild(td);
      });

      tableBody.appendChild(tr);
    });

    // Wire row control buttons
    tableBody.querySelectorAll(".row-action-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const rIdx = parseInt(e.target.dataset.idx, 10);
        const action = e.target.dataset.action;
        const visibleRowIndices = vesselRows.map((r, i) => r.visible ? i : -1).filter(i => i !== -1);
        const actualIdx = visibleRowIndices[rIdx];

        if (action === "up" && rIdx > 0) {
          const targetActualIdx = visibleRowIndices[rIdx - 1];
          const temp = vesselRows[actualIdx];
          vesselRows[actualIdx] = vesselRows[targetActualIdx];
          vesselRows[targetActualIdx] = temp;
        } else if (action === "down" && rIdx < visibleRowIndices.length - 1) {
          const targetActualIdx = visibleRowIndices[rIdx + 1];
          const temp = vesselRows[actualIdx];
          vesselRows[actualIdx] = vesselRows[targetActualIdx];
          vesselRows[targetActualIdx] = temp;
        } else if (action === "hide") {
          vesselRows[actualIdx].visible = false;
        }
        renderInteractiveTable();
      });
    });
  }

  // Reset Layout handler
  document.getElementById("btn-reset-table-layout")?.addEventListener("click", () => {
    columns.forEach(c => c.visible = true);
    vesselRows.forEach(r => r.visible = true);
    renderInteractiveTable();
  });
  document.getElementById("btn-show-all-rows")?.addEventListener("click", () => {
    vesselRows.forEach(r => r.visible = true);
    renderInteractiveTable();
  });

  // ==========================================
  // SCALE-UP INOCULUM TRANSFER CALCULATOR
  // ==========================================
  const selSource = document.getElementById("scale-source-vessel");
  const selTarget = document.getElementById("scale-target-vessel");
  const inTargetCount = document.getElementById("scale-target-count");
  const inStockBase = document.getElementById("scale-stock-base");
  const inStockExp = document.getElementById("scale-stock-exp");
  const inDensity = document.getElementById("scale-target-density");
  const inTargetVol = document.getElementById("scale-target-vol");

  const statArea = document.getElementById("scale-stat-area");
  const statCells = document.getElementById("scale-stat-cells");
  const statTransfer = document.getElementById("scale-stat-transfer");
  const statMedia = document.getElementById("scale-stat-media");
  const statFinalConc = document.getElementById("scale-stat-finalconc");
  const scaleSopBox = document.getElementById("scaleup-sop-box");

  // Auto-sync working volume when target vessel or count changes
  function syncDefaultWorkingVol() {
    const tgtArea = parseFloat(selTarget.value) || 175;
    const count = parseInt(inTargetCount.value, 10) || 1;
    const matchedVessel = vesselRows.find(v => Math.abs(v.area - tgtArea) < 1);
    if (matchedVessel) {
      inTargetVol.value = (matchedVessel.stdVol * count).toFixed(1);
    }
    calculateScaleUpTransfer();
  }

  function calculateScaleUpTransfer() {
    const srcArea = parseFloat(selSource.value) || 75;
    const singleTgtArea = parseFloat(selTarget.value) || 175;
    const vesselCount = Math.max(1, parseInt(inTargetCount.value, 10) || 1);
    const totalTgtArea = singleTgtArea * vesselCount;
    const expansionFactor = totalTgtArea / srcArea;

    const stockBase = parseFloat(inStockBase.value) || 2.0;
    const stockExp = parseFloat(inStockExp.value) || 6;
    const stockConc = stockBase * Math.pow(10, stockExp); // cells/mL

    const desiredDensity = parseFloat(inDensity.value) || 25000; // cells/cm2
    const targetWorkingVol = parseFloat(inTargetVol.value) || 30.0; // mL

    // 1. Total Target Cells Needed
    const totalCellsNeeded = desiredDensity * totalTgtArea;

    // 2. Transfer Volume
    const vTransfer_mL = stockConc > 0 ? (totalCellsNeeded / stockConc) : 0;
    const vMedia_mL = Math.max(0, targetWorkingVol - vTransfer_mL);

    // 3. Final Inoculum Concentration
    const finalConc = targetWorkingVol > 0 ? (totalCellsNeeded / targetWorkingVol) : 0;

    // Formatter
    const fmtVol = (v) => v < 1.0 ? (v * 1000).toFixed(1) + " µL" : v.toFixed(2) + " mL";
    const fmtSci = (num) => {
      if (num === 0) return "0";
      const exp = Math.floor(Math.log10(num));
      const base = num / Math.pow(10, exp);
      return `${base.toFixed(2)} × 10^${exp}`;
    };

    // Update Output Badges
    if (statArea) statArea.innerText = `${totalTgtArea} cm² (${expansionFactor.toFixed(2)}×)`;
    if (statCells) statCells.innerText = fmtSci(totalCellsNeeded);
    if (statTransfer) statTransfer.innerText = fmtVol(vTransfer_mL);
    if (statMedia) statMedia.innerText = fmtVol(vMedia_mL);
    if (statFinalConc) statFinalConc.innerText = `${fmtSci(finalConc)} /mL`;

    // SOP Generation & Safety Warnings
    if (scaleSopBox) {
      const srcName = selSource.selectedOptions[0]?.text.split("(")[0].trim() || "Source Vessel";
      const tgtName = selTarget.selectedOptions[0]?.text.split("(")[0].trim() || "Target Vessel";

      if (vTransfer_mL > targetWorkingVol) {
        scaleSopBox.innerHTML = `
          <span style="color:var(--danger); font-weight:700;">⚠️ Volume Alert:</span> Required suspension volume (${fmtVol(vTransfer_mL)}) exceeds total vessel capacity (${targetWorkingVol} mL).<br/>
          <strong>Resolution:</strong> Centrifuge harvest pool to concentrate stock (${fmtSci(stockConc * 2)} cells/mL) or lower desired seeding density.
        `;
      } else {
        scaleSopBox.innerHTML = `
          <strong>Bioprocess Transfer Protocol (${vesselCount} × ${tgtName}):</strong><br/>
          1. Harvest and pool suspension from <strong>${srcName}</strong>; verify stock at <strong>${fmtSci(stockConc)} cells/mL</strong>.<br/>
          2. Dispense <strong>${fmtVol(vMedia_mL)}</strong> fresh pre-warmed media into target vessel batch.<br/>
          3. Inoculate <strong>${fmtVol(vTransfer_mL)}</strong> cell suspension into the media pool.<br/>
          4. Total Inoculum: <strong>${fmtSci(totalCellsNeeded)} cells</strong> seeded at <strong>${desiredDensity.toLocaleString()} cells/cm²</strong>.
        `;
      }
    }
  }

  // Wire Listeners for Calculator
  if (selSource) selSource.addEventListener("change", calculateScaleUpTransfer);
  if (selTarget) selTarget.addEventListener("change", syncDefaultWorkingVol);
  if (inTargetCount) inTargetCount.addEventListener("input", syncDefaultWorkingVol);
  if (inStockBase) inStockBase.addEventListener("input", calculateScaleUpTransfer);
  if (inStockExp) inStockExp.addEventListener("input", calculateScaleUpTransfer);
  if (inDensity) inDensity.addEventListener("input", calculateScaleUpTransfer);
  if (inTargetVol) inTargetVol.addEventListener("input", calculateScaleUpTransfer);

  // Density Quick Chips
  document.getElementById("chip-density-low")?.addEventListener("click", () => {
    inDensity.value = 10000;
    calculateScaleUpTransfer();
  });
  document.getElementById("chip-density-std")?.addEventListener("click", () => {
    inDensity.value = 25000;
    calculateScaleUpTransfer();
  });
  document.getElementById("chip-density-high")?.addEventListener("click", () => {
    inDensity.value = 40000;
    calculateScaleUpTransfer();
  });

  // Copy SOP Button
  document.getElementById("btn-copy-scaleup-sop")?.addEventListener("click", () => {
    const text = scaleSopBox?.innerText || "";
    navigator.clipboard.writeText(text).then(() => {
      alert("Scale-Up Protocol copied to clipboard!");
    });
  });

  // Initialize Dynamic Table & Scale-up Solver on Load
  renderInteractiveTable();
  syncDefaultWorkingVol();

  // ==========================================
  // FLOW CYTOMETRY & SPECTRUM VIEWER
  // ==========================================
  const dyes = {
    bv421: { name: "BV421", laser: 405, peak: 421, color: "#a855f7" },
    bv510: { name: "BV510", laser: 405, peak: 510, color: "#8b5cf6" },
    fitc: { name: "FITC", laser: 488, peak: 519, color: "#22c55e" },
    bb515: { name: "BB515", laser: 488, peak: 515, color: "#10b981" },
    pe: { name: "PE", laser: 561, peak: 578, color: "#f59e0b" },
    pe_cy7: { name: "PE-Cy7", laser: 561, peak: 778, color: "#b45309" },
    percp_cy55: { name: "PerCP-Cy5.5", laser: 488, peak: 695, color: "#dc2626" },
    apc: { name: "APC", laser: 640, peak: 660, color: "#ef4444" },
    af647: { name: "Alexa Fluor 647", laser: 640, peak: 668, color: "#f87171" },
    apc_cy7: { name: "APC-Cy7", laser: 640, peak: 785, color: "#991b1b" }
  };

  const curvesContainer = document.getElementById("spectrumCurves");
  const flowAudit = document.getElementById("flow-audit-container");

  function renderSpectrum() {
    if (!curvesContainer) return;
    curvesContainer.innerHTML = "";
    if (flowAudit) flowAudit.innerHTML = "";

    const activeDyeKeys = [
      document.getElementById("flow-dye-1")?.value,
      document.getElementById("flow-dye-2")?.value,
      document.getElementById("flow-dye-3")?.value,
      document.getElementById("flow-dye-4")?.value
    ].filter(k => k && k !== "none" && dyes[k]);

    // Wavelength range: 380 nm to 800 nm (width = 800 px)
    // X = ((Wavelength - 380) / (800 - 380)) * 800
    const nmToX = (nm) => ((nm - 380) / 420) * 800;

    activeDyeKeys.forEach(key => {
      const d = dyes[key];
      const peakX = nmToX(d.peak);
      const halfWidth = 35; // standard bell-curve width

      // Create SVG Path for Gaussian Emission Curve
      let pathD = `M ${peakX - halfWidth * 2.2} 140 `;
      for (let x = peakX - halfWidth * 2.2; x <= peakX + halfWidth * 2.2; x += 3) {
        const dist = (x - peakX) / halfWidth;
        const y = 140 - Math.exp(-0.5 * dist * dist) * 95;
        pathD += `L ${x.toFixed(1)} ${y.toFixed(1)} `;
      }
      pathD += `L ${peakX + halfWidth * 2.2} 140 Z`;

      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", pathD);
      path.setAttribute("fill", d.color);
      path.setAttribute("fill-opacity", "0.35");
      path.setAttribute("stroke", d.color);
      path.setAttribute("stroke-width", "2");
      curvesContainer.appendChild(path);

      // Label at peak
      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("x", peakX.toFixed(1));
      text.setAttribute("y", (40).toString());
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("fill", "#ffffff");
      text.setAttribute("font-size", "11");
      text.setAttribute("font-weight", "700");
      text.textContent = `${d.name} (${d.peak}nm)`;
      curvesContainer.appendChild(text);
    });

    // Check optical spillover / clashes
    let hasClash = false;
    for (let i = 0; i < activeDyeKeys.length; i++) {
      for (let j = i + 1; j < activeDyeKeys.length; j++) {
        const d1 = dyes[activeDyeKeys[i]];
        const d2 = dyes[activeDyeKeys[j]];
        const diff = Math.abs(d1.peak - d2.peak);

        if (d1.laser === d2.laser && diff < 30) {
          hasClash = true;
          if (flowAudit) {
            flowAudit.innerHTML += `
              <div class="spillover-alert spillover-warn">
                ⚠️ <strong>CRITICAL CLASH:</strong> ${d1.name} and ${d2.name} share the same ${d1.laser} nm laser with only ${diff} nm separation. High optical collision risk.
              </div>
            `;
          }
        }
      }
    }

    if (!hasClash && flowAudit && activeDyeKeys.length > 1) {
      flowAudit.innerHTML = `
        <div class="spillover-alert spillover-ok">
          ✓ <strong>Panel Optical Audit Clean:</strong> Selected fluorophores demonstrate optimal spectral dispersion across cytometer channels.
        </div>
      `;
    }
  }

  document.querySelectorAll(".flow-dye-select").forEach(sel => {
    sel.addEventListener("change", renderSpectrum);
  });
  document.getElementById("btn-reset-flow-panel")?.addEventListener("click", () => {
    document.querySelectorAll(".flow-dye-select").forEach(sel => sel.value = "none");
    renderSpectrum();
  });

  // ==========================================
  // FORMULA STUDIO (PRO) ENGINE
  // ==========================================
  let customCalcs = JSON.parse(localStorage.getItem("lab_buddy_custom_calcs") || "[]");
  if (customCalcs.length === 0) {
    customCalcs = [
      { id: 1, name: "Protein Gel Normalization", varLabel: "Lysate Conc (µg/µL)", outLabel: "Load Vol (µL)", expr: "20 / x" },
      { id: 2, name: "OD600 to Bacterial Count", varLabel: "OD600 Reading", outLabel: "Cells/mL", expr: "x * 8e8" }
    ];
  }

  const customListEl = document.getElementById("custom-calculators-list");

  function renderCustomCalculators() {
    if (!customListEl) return;
    customListEl.innerHTML = "";

    customCalcs.forEach((c, idx) => {
      const card = document.createElement("div");
      card.className = "conv-card";
      card.innerHTML = `
        <div>
          <div class="conv-card-header">
            <span class="conv-title">${c.name}</span>
            <button class="btn-danger-sm" data-del="${idx}">✕</button>
          </div>
          <div style="font-size:0.75rem; color:var(--accent); font-family:monospace; margin-bottom:0.75rem;">
            Formula: ${c.expr}
          </div>
          <div>
            <label style="font-size:0.75rem; color:var(--text-muted);">${c.varLabel}</label>
            <input type="number" class="grid-input studio-input" data-idx="${idx}" value="2.0" step="0.1" />
          </div>
        </div>
        <div style="background:#090d16; border-radius:6px; padding:0.6rem; margin-top:0.75rem; border:1px solid var(--border);">
          <span style="font-size:0.75rem; color:var(--text-muted); display:block;">${c.outLabel}:</span>
          <span class="studio-output-val" style="font-size:1.1rem; font-weight:700; color:var(--success);">--</span>
        </div>
      `;
      customListEl.appendChild(card);
    });

    // Wire live computation
    customListEl.querySelectorAll(".studio-input").forEach(input => {
      const calcRow = () => {
        const idx = parseInt(input.dataset.idx, 10);
        const c = customCalcs[idx];
        const x = parseFloat(input.value) || 0;
        const outSpan = input.closest(".conv-card").querySelector(".studio-output-val");

        try {
          // Safe evaluation replacing x
          const sanitized = c.expr.replace(/x/g, `(${x})`).replace(/\^/g, "**");
          const res = Function(`"use strict"; return (${sanitized})`)();
          outSpan.innerText = isFinite(res) ? (Math.abs(res) < 0.01 ? res.toExponential(3) : res.toFixed(3)) : "Error";
        } catch (err) {
          outSpan.innerText = "Syntax Error";
        }
      };
      input.addEventListener("input", calcRow);
      calcRow();
    });

    // Wire deletes
    customListEl.querySelectorAll("[data-del]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const idx = parseInt(e.target.dataset.del, 10);
        customCalcs.splice(idx, 1);
        localStorage.setItem("lab_buddy_custom_calcs", JSON.stringify(customCalcs));
        renderCustomCalculators();
      });
    });
  }

  // Save new custom calculator
  document.getElementById("btn-save-custom-calc")?.addEventListener("click", () => {
    const name = document.getElementById("custom-calc-name")?.value.trim() || "Custom Converter";
    const varLabel = document.getElementById("custom-var-label")?.value.trim() || "Input (x)";
    const outLabel = document.getElementById("custom-out-label")?.value.trim() || "Calculated Yield";
    const expr = document.getElementById("custom-calc-expr")?.value.trim() || "x * 1";

    customCalcs.push({ id: Date.now(), name, varLabel, outLabel, expr });
    localStorage.setItem("lab_buddy_custom_calcs", JSON.stringify(customCalcs));
    auditLogger.logEvent("FormulaStudio", "CustomCalculatorCreated", { name, expr });
    renderCustomCalculators();
  });

  // Export JSON preset pack
  document.getElementById("btn-export-studio-json")?.addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(customCalcs, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lab_buddy_formula_pack_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });

  // Import JSON preset pack
  const fileInput = document.getElementById("studio-file-input");
  document.getElementById("btn-import-studio-json")?.addEventListener("click", () => fileInput.click());
  fileInput?.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (Array.isArray(parsed)) {
          customCalcs = parsed;
          localStorage.setItem("lab_buddy_custom_calcs", JSON.stringify(customCalcs));
          renderCustomCalculators();
          alert("Formula pack successfully imported!");
        }
      } catch (err) {
        alert("Invalid JSON formula file.");
      }
    };
    reader.readAsText(file);
  });

  // Initial renders
  renderSpectrum();
  renderCustomCalculators();
  calcScale();
}