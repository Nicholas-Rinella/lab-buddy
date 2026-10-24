export function initReagentEngine() {
  let selectedState = "solid"; // 'solid' | 'liquid' | 'acid'

  // Presets Dictionary
  const presets = {
    tris_base: { name: "Tris Base", mw: 121.14 },
    nacl: { name: "Sodium Chloride (NaCl)", mw: 58.44 },
    edta: { name: "EDTA Disodium Dihydrate", mw: 372.24 },
    hepes: { name: "HEPES Free Acid", mw: 238.30 },
    mgso4_anh: { name: "Magnesium Sulfate Anhydrous", mw: 120.37 },
    mgso4_hep: { name: "Magnesium Sulfate Heptahydrate", mw: 246.47 }
  };

  const acidPresets = {
    hcl: { name: "Hydrochloric Acid (HCl)", assay: 37, density: 1.19, mw: 36.46 },
    acetic: { name: "Glacial Acetic Acid", assay: 99.8, density: 1.05, mw: 60.05 },
    naoh: { name: "Sodium Hydroxide (NaOH)", assay: 50, density: 1.51, mw: 40.00 }
  };

  // Stepper Elements
  const panes = [
    document.getElementById("rg-step-1"),
    document.getElementById("rg-step-2"),
    document.getElementById("rg-step-3"),
    document.getElementById("rg-step-4")
  ];
  const nodes = [
    document.getElementById("rg-node-1"),
    document.getElementById("rg-node-2"),
    document.getElementById("rg-node-3"),
    document.getElementById("rg-node-4")
  ];

  function setStep(stepIndex) {
    panes.forEach((p, idx) => {
      p.style.display = idx === stepIndex ? "block" : "none";
    });
    nodes.forEach((n, idx) => {
      n.classList.remove("active", "completed");
      if (idx < stepIndex) n.classList.add("completed");
      if (idx === stepIndex) n.classList.add("active");
    });
    if (stepIndex === 3) {
      calculateSOP();
    }
  }

  // Step 1: Tiles
  const tileSolid = document.getElementById("tile-solid");
  const tileLiquid = document.getElementById("tile-liquid");
  const tileAcid = document.getElementById("tile-acid");

  function selectState(state) {
    selectedState = state;
    [tileSolid, tileLiquid, tileAcid].forEach(t => t.classList.remove("selected"));

    const solidBox = document.getElementById("rg-input-solid-box");
    const liquidBox = document.getElementById("rg-input-liquid-box");
    const acidBox = document.getElementById("rg-input-acid-box");
    const physicsSection = document.getElementById("rg-physics-section");

    if (state === "solid") {
      tileSolid.classList.add("selected");
      solidBox.style.display = "block";
      liquidBox.style.display = "none";
      acidBox.style.display = "none";
      physicsSection.style.display = "block";
    } else if (state === "liquid") {
      tileLiquid.classList.add("selected");
      solidBox.style.display = "none";
      liquidBox.style.display = "block";
      acidBox.style.display = "none";
      physicsSection.style.display = "none";
    } else if (state === "acid") {
      tileAcid.classList.add("selected");
      solidBox.style.display = "none";
      liquidBox.style.display = "none";
      acidBox.style.display = "block";
      physicsSection.style.display = "none";
    }
  }

  tileSolid.addEventListener("click", () => selectState("solid"));
  tileLiquid.addEventListener("click", () => selectState("liquid"));
  tileAcid.addEventListener("click", () => selectState("acid"));

  // Wizard Navigation
  document.getElementById("rg-next-1").addEventListener("click", () => setStep(1));
  document.getElementById("rg-back-2").addEventListener("click", () => setStep(0));
  document.getElementById("rg-next-2").addEventListener("click", () => setStep(2));
  document.getElementById("rg-back-3").addEventListener("click", () => setStep(1));
  document.getElementById("rg-next-3").addEventListener("click", () => setStep(3));
  document.getElementById("rg-back-4").addEventListener("click", () => setStep(2));
  document.getElementById("rg-recalc-btn").addEventListener("click", calculateSOP);

  // Preset Handlers
  document.getElementById("rg-preset-dropdown").addEventListener("change", (e) => {
    const val = e.target.value;
    if (presets[val]) {
      document.getElementById("rg-mw").value = presets[val].mw;
      calculateSOP();
    }
  });

  document.getElementById("rg-acid-preset").addEventListener("change", (e) => {
    const val = e.target.value;
    const customRow = document.getElementById("rg-acid-custom-row");
    if (acidPresets[val]) {
      customRow.style.display = "grid";
      document.getElementById("rg-acid-assay").value = acidPresets[val].assay;
      document.getElementById("rg-acid-density").value = acidPresets[val].density;
      document.getElementById("rg-acid-mw").value = acidPresets[val].mw;
    } else {
      customRow.style.display = "grid";
    }
    calculateSOP();
  });

  // Main Calculation & SOP Generation
  function calculateSOP() {
    const sopBox = document.getElementById("rg-sop-content");
    const expertFormula = document.getElementById("rg-expert-formula");
    const expertDrawer = document.getElementById("rg-expert-container");

    const targetConc = parseFloat(document.getElementById("rg-target-conc").value) || 0;
    const targetConcUnit = document.getElementById("rg-target-conc-unit").value;
    const targetVol = parseFloat(document.getElementById("rg-target-vol").value) || 0;
    const targetVolUnit = document.getElementById("rg-target-vol-unit").value;

    // Convert Target Volume to Liters
    let targetVolLiters = targetVol;
    if (targetVolUnit === "mL") targetVolLiters = targetVol / 1000;
    if (targetVolUnit === "uL") targetVolLiters = targetVol / 1e6;

    const formatVol = (val_mL) => {
      if (val_mL < 1.0) return (val_mL * 1000).toFixed(1) + " µL";
      if (val_mL >= 1000) return (val_mL / 1000).toFixed(2) + " L";
      return val_mL.toFixed(2) + " mL";
    };

    // --- CASE 1: SOLID SOLUTES ---
    if (selectedState === "solid") {
      const vialMassInput = document.getElementById("rg-solid-mass").value.trim();
      const mw = parseFloat(document.getElementById("rg-mw").value) || 1;
      const purityPct = parseFloat(document.getElementById("rg-purity").value) || 100;
      const purityFraction = Math.max(0.01, purityPct / 100);

      // Scenario 1A: Fixed vial mass provided -> Solve for Reconstitution Volume
      if (vialMassInput !== "") {
        const rawMass = parseFloat(vialMassInput) || 0;
        const massUnit = document.getElementById("rg-solid-mass-unit").value;
        let massInGrams = rawMass;
        if (massUnit === "mg") massInGrams = rawMass / 1000;
        if (massUnit === "ug") massInGrams = rawMass / 1e6;

        let volLiters = 0;
        let derivation = "";

        if (targetConcUnit === "mM" || targetConcUnit === "M" || targetConcUnit === "uM") {
          let molarity = targetConc;
          if (targetConcUnit === "mM") molarity = targetConc / 1000;
          if (targetConcUnit === "uM") molarity = targetConc / 1e6;

          // Vol (L) = (Mass * Purity) / (M * MW)
          volLiters = (massInGrams * purityFraction) / (molarity * mw);
          derivation = `V (L) = [${massInGrams} g × ${purityFraction}] / [${molarity} M × ${mw} g/mol] = ${volLiters.toFixed(6)} L`;
        } else if (targetConcUnit === "mg_ml") {
          const massMg = massInGrams * 1000 * purityFraction;
          volLiters = (massMg / targetConc) / 1000;
          derivation = `V (mL) = [${massMg.toFixed(2)} mg] / [${targetConc} mg/mL] = ${(volLiters * 1000).toFixed(2)} mL`;
        } else if (targetConcUnit === "pct_wv") {
          // 1% w/v = 0.01 g/mL
          const effectiveGrams = massInGrams * purityFraction;
          volLiters = (effectiveGrams / (targetConc / 100)) / 1000;
          derivation = `V (mL) = [${effectiveGrams.toFixed(4)} g] / [${(targetConc / 100)} g/mL] = ${(volLiters * 1000).toFixed(2)} mL`;
        }

        const vol_mL = volLiters * 1000;
        sopBox.innerHTML = `
          <strong>Reconstitution Protocol (Fixed Aliquot):</strong><br/>
          1. Retrieve vial containing <strong>${rawMass} ${massUnit}</strong> solute (Purity: ${purityPct}%).<br/>
          2. Pipette exactly <strong>${formatVol(vol_mL)}</strong> sterile diluent directly into vial.<br/>
          3. Gently invert or vortex until completely dissolved.<br/>
          4. Yield: Stock solution at <strong>${targetConc} ${targetConcUnit}</strong>.
        `;
        expertFormula.innerText = derivation;
        return;
      }

      // Scenario 1B: Solve for Mass to Weigh out
      let molarity = targetConc;
      if (targetConcUnit === "mM") molarity = targetConc / 1000;
      if (targetConcUnit === "uM") molarity = targetConc / 1e6;

      let massRequiredGrams = 0;
      let derivation = "";

      if (targetConcUnit === "mM" || targetConcUnit === "M" || targetConcUnit === "uM") {
        // Mass = M * V * MW * (1 / Purity)
        massRequiredGrams = molarity * targetVolLiters * mw * (1 / purityFraction);
        derivation = `Mass (g) = ${molarity} M × ${targetVolLiters} L × ${mw} g/mol × (1 / ${purityFraction}) = ${massRequiredGrams.toFixed(4)} g`;
      } else if (targetConcUnit === "pct_wv") {
        // Mass = (% * Vol_mL / 100) / Purity
        const targetVol_mL = targetVolLiters * 1000;
        massRequiredGrams = ((targetConc * targetVol_mL) / 100) * (1 / purityFraction);
        derivation = `Mass (g) = [(${targetConc}% × ${targetVol_mL} mL) / 100] × (1 / ${purityFraction}) = ${massRequiredGrams.toFixed(4)} g`;
      } else if (targetConcUnit === "mg_ml") {
        const targetVol_mL = targetVolLiters * 1000;
        massRequiredGrams = ((targetConc * targetVol_mL) / 1000) * (1 / purityFraction);
        derivation = `Mass (g) = [(${targetConc} mg/mL × ${targetVol_mL} mL) / 1000] × (1 / ${purityFraction}) = ${massRequiredGrams.toFixed(4)} g`;
      }

      const formatMass = (g) => g < 1.0 ? (g * 1000).toFixed(2) + " mg" : g.toFixed(4) + " g";
      const initialVolEstimate = formatVol(targetVolLiters * 800);

      sopBox.innerHTML = `
        <strong>Bench Preparation Protocol (Solid Weighing):</strong><br/>
        1. Accurately weigh out <strong>${formatMass(massRequiredGrams)}</strong> on an analytical balance.<br/>
        2. Transfer to beaker; dissolve in ~<strong>${initialVolEstimate}</strong> sterile dH₂O or buffer.<br/>
        3. Check and calibrate pH to target specification.<br/>
        4. Transfer to graduated cylinder or volumetric flask; <strong>Q.S. (bring to volume) with dH₂O to exactly ${formatVol(targetVolLiters * 1000)}</strong>.
      `;
      expertFormula.innerText = derivation;
      return;
    }

    // --- CASE 2: LIQUID DILUTIONS (C1V1 = C2V2) ---
    if (selectedState === "liquid") {
      const c1 = parseFloat(document.getElementById("rg-liquid-c1").value) || 1;
      const c2 = targetConc;
      const v2_mL = targetVolLiters * 1000;

      // V1 = (C2 * V2) / C1
      const v1_mL = (c2 * v2_mL) / c1;
      const vDiluent_mL = v2_mL - v1_mL;

      if (v1_mL > v2_mL) {
        sopBox.innerHTML = `<span style="color:#ef4444;">Error: Target concentration (${c2}) exceeds stock concentration (${c1}). Cannot concentrate liquid stock by standard dilution.</span>`;
        expertFormula.innerText = `Invalid: V1 (${v1_mL.toFixed(2)} mL) > V2 (${v2_mL.toFixed(2)} mL)`;
        return;
      }

      sopBox.innerHTML = `
        <strong>Liquid Stock Dilution (C₁V₁ = C₂V₂):</strong><br/>
        1. Pipette <strong>${formatVol(vDiluent_mL)}</strong> of diluent into container.<br/>
        2. Aspirate and add <strong>${formatVol(v1_mL)}</strong> of stock solution (${c1}${document.getElementById("rg-liquid-c1-unit").value}).<br/>
        3. Invert or mix thoroughly. Total final volume: <strong>${formatVol(v2_mL)}</strong>.
      `;
      expertFormula.innerText = `V₁ = (${c2} × ${v2_mL} mL) / ${c1} = ${v1_mL.toFixed(3)} mL. Diluent = ${vDiluent_mL.toFixed(3)} mL.`;
      return;
    }

    // --- CASE 3: CONCENTRATED ACIDS & BASES ---
    if (selectedState === "acid") {
      const assay = parseFloat(document.getElementById("rg-acid-assay").value) || 37;
      const density = parseFloat(document.getElementById("rg-acid-density").value) || 1.19;
      const mw = parseFloat(document.getElementById("rg-acid-mw").value) || 36.46;

      // M_stock = (10 * density * assay) / mw
      const mStock = (10 * density * assay) / mw;

      let targetMolarity = targetConc;
      if (targetConcUnit === "mM") targetMolarity = targetConc / 1000;
      if (targetConcUnit === "uM") targetMolarity = targetConc / 1e6;

      const v2_mL = targetVolLiters * 1000;
      const vAcid_mL = (targetMolarity * v2_mL) / mStock;
      const vWater_mL = v2_mL - vAcid_mL;

      sopBox.innerHTML = `
        <strong>Acid / Base Preparation Protocol:</strong><br/>
        <span style="color:#f59e0b; font-weight:700;">⚠️ SAFETY RULE: ALWAYS ADD ACID TO WATER. NEVER ADD WATER TO ACID.</span><br/>
        1. Calculated Stock Molarity from bottle specs: <strong>${mStock.toFixed(2)} M</strong>.<br/>
        2. Dispense ~<strong>${formatVol(vWater_mL * 0.8)}</strong> dH₂O into a certified fume hood vessel.<br/>
        3. In the chemical fume hood, slowly pipette <strong>${formatVol(vAcid_mL)}</strong> concentrated acid into the water while stirring.<br/>
        4. Allow exothermic heat to dissipate; Q.S. with dH₂O to the <strong>${formatVol(v2_mL)}</strong> graduation line.
      `;
      expertFormula.innerText = `M_stock = (10 × ${density} g/mL × ${assay}%) / ${mw} = ${mStock.toFixed(3)} M\nV_acid = (${targetMolarity} M × ${v2_mL} mL) / ${mStock.toFixed(3)} M = ${vAcid_mL.toFixed(3)} mL`;
    }
  }

  // Copy SOP
  document.getElementById("rg-copy-sop-btn").addEventListener("click", () => {
    const text = document.getElementById("rg-sop-content").innerText;
    navigator.clipboard.writeText(text).then(() => {
      alert("Bench SOP copied to clipboard!");
    });
  });

  // Dynamic Listeners for Live Updates
  const listenInputs = [
    "rg-solid-mass", "rg-target-conc", "rg-target-conc-unit",
    "rg-target-vol", "rg-target-vol-unit", "rg-mw", "rg-purity",
    "rg-liquid-c1", "rg-acid-assay", "rg-acid-density", "rg-acid-mw"
  ];
  listenInputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", calculateSOP);
    if (el) el.addEventListener("change", calculateSOP);
  });

  // Initial Calculation
  calculateSOP();
}