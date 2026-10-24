export function initSeedingEngine() {
  let currentPresetVessel = "T-75";
  let lastHemoConc = 0;

  const seedingPane = document.getElementById('culture-seeding-pane');
  const hemoPane = document.getElementById('culture-hemo-pane');
  const growthPane = document.getElementById('culture-growth-pane');

  const btnSeeding = document.getElementById('subBtn-seeding');
  const btnHemo = document.getElementById('subBtn-hemo');
  const btnGrowth = document.getElementById('subBtn-growth');

  function showPane(pane) {
    if (seedingPane) seedingPane.style.display = 'none';
    if (hemoPane) hemoPane.style.display = 'none';
    if (growthPane) growthPane.style.display = 'none';
    if (btnSeeding) btnSeeding.style.background = '#1e293b';
    if (btnHemo) btnHemo.style.background = '#1e293b';
    if (btnGrowth) btnGrowth.style.background = '#1e293b';

    if (pane === 'seeding' && seedingPane && btnSeeding) {
      seedingPane.style.display = 'grid';
      btnSeeding.style.background = '#0284c7';
    } else if (pane === 'hemo' && hemoPane && btnHemo) {
      hemoPane.style.display = 'block';
      btnHemo.style.background = '#0284c7';
    } else if (pane === 'growth' && growthPane && btnGrowth) {
      growthPane.style.display = 'block';
      btnGrowth.style.background = '#0284c7';
    }
  }

  if (btnSeeding) btnSeeding.addEventListener('click', () => showPane('seeding'));
  if (btnHemo) btnHemo.addEventListener('click', () => showPane('hemo'));
  if (btnGrowth) btnGrowth.addEventListener('click', () => showPane('growth'));

  function renderParticles(containerId, count, minX, maxX, minY, maxY) {
    const pContainer = document.getElementById(containerId);
    if (!pContainer) return;
    pContainer.innerHTML = "";
    if (count <= 0 || maxY <= minY) return;

    const safeCount = Math.min(count, 120);
    for (let i = 0; i < safeCount; i++) {
      const cx = minX + Math.random() * (maxX - minX);
      const cy = minY + Math.random() * (maxY - minY);
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", cx.toFixed(1));
      circle.setAttribute("cy", cy.toFixed(1));
      circle.setAttribute("r", (Math.random() * 0.8 + 0.8).toFixed(1));
      circle.setAttribute("fill", "#ffffff");
      circle.setAttribute("opacity", (Math.random() * 0.5 + 0.35).toFixed(2));
      pContainer.appendChild(circle);
    }
  }

  function calculate() {
    const stockBaseEl = document.getElementById('stockBase');
    if (!stockBaseEl) return;

    const stockBase = parseFloat(stockBaseEl.value) || 0;
    const stockExp = parseFloat(document.getElementById('stockExp')?.value) || 0;
    const stockVolTotal = parseFloat(document.getElementById('stockVolTotal')?.value) || 50.0;
    const targetBase = parseFloat(document.getElementById('targetBase')?.value) || 0;
    const targetExp = parseFloat(document.getElementById('targetExp')?.value) || 0;
    const finalVol = parseFloat(document.getElementById('finalVol')?.value) || 0;
    const viability = Math.max(1, Math.min(100, parseFloat(document.getElementById('viabilityPct')?.value) || 100)) / 100;

    const suspDisplay = document.getElementById('suspVolDisplay');
    const mediaDisplay = document.getElementById('mediaVolDisplay');
    const stockRemainingDisplay = document.getElementById('stockRemainingDisplay');
    const statusBox = document.getElementById('statusBox');
    const recipeBox = document.getElementById('recipeBox');
    const fractionBadge = document.getElementById('fractionBadge');

    if (statusBox) statusBox.style.display = 'none';

    const rawStockConc = stockBase * Math.pow(10, stockExp);
    const liveStockConc = rawStockConc * viability;
    const targetCells = targetBase * Math.pow(10, targetExp);

    if (liveStockConc <= 0 || targetCells <= 0 || finalVol <= 0) {
      if (suspDisplay) suspDisplay.innerText = "--";
      if (mediaDisplay) mediaDisplay.innerText = "--";
      if (stockRemainingDisplay) stockRemainingDisplay.innerText = "--";
      if (recipeBox) recipeBox.innerText = "Please specify valid parameters.";
      return;
    }

    const vSusp = targetCells / liveStockConc;
    const vMedia = finalVol - vSusp;
    const remainingStockVol = Math.max(0, stockVolTotal - vSusp);
    const transferFraction = (vSusp / stockVolTotal) * 100;

    const formatVol = (val) => val < 1.0 ? (val * 1000).toFixed(1) + " µL" : val.toFixed(2) + " mL";

    if (suspDisplay) suspDisplay.innerText = formatVol(vSusp);
    if (mediaDisplay) mediaDisplay.innerText = vMedia >= 0 ? formatVol(vMedia) : "0.00 mL";
    if (stockRemainingDisplay) stockRemainingDisplay.innerText = formatVol(remainingStockVol) + " (" + ((remainingStockVol / stockVolTotal) * 100).toFixed(1) + "% left)";
    if (fractionBadge) fractionBadge.innerText = "Aspirating: " + transferFraction.toFixed(1) + "% of Stock";

    const maxTubeLiquidHeight = 140;
    const tubeBottomY = 185;
    const initialHeight = Math.min(maxTubeLiquidHeight, Math.max(15, (stockVolTotal / 50.0) * maxTubeLiquidHeight));
    const initialTopY = tubeBottomY - initialHeight;
    const removedHeight = Math.min(initialHeight, Math.max(0, (vSusp / 50.0) * maxTubeLiquidHeight));
    const remainingHeight = Math.max(0, initialHeight - removedHeight);
    const remainingTopY = initialTopY + removedHeight;

    const stockRemoved = document.getElementById('stockRemoved');
    const stockRemaining = document.getElementById('stockRemaining');
    const meniscusLine = document.getElementById('initialMeniscusLine');

    if (stockRemoved) { stockRemoved.setAttribute('y', initialTopY); stockRemoved.setAttribute('height', removedHeight); }
    if (stockRemaining) { stockRemaining.setAttribute('y', remainingTopY); stockRemaining.setAttribute('height', remainingHeight); }
    if (meniscusLine) { meniscusLine.setAttribute('y1', initialTopY); meniscusLine.setAttribute('y2', initialTopY); }

    const flaskBottomY = 175;
    const maxFlaskLiquidHeight = 85;
    const suspHeight = Math.min(maxFlaskLiquidHeight, (vSusp / finalVol) * maxFlaskLiquidHeight);
    const mediaHeight = Math.max(0, maxFlaskLiquidHeight - suspHeight);

    const flaskMedia = document.getElementById('flaskMedia');
    const flaskSusp = document.getElementById('flaskSusp');
    if (flaskMedia) { flaskMedia.setAttribute('y', flaskBottomY - mediaHeight); flaskMedia.setAttribute('height', mediaHeight); }
    if (flaskSusp) { flaskSusp.setAttribute('y', flaskBottomY - mediaHeight - suspHeight); flaskSusp.setAttribute('height', suspHeight); }

    const exponentVal = Math.log10(rawStockConc);
    const normalizedDensity = Math.max(4, Math.round(Math.pow(Math.max(1, exponentVal - 3.5), 2.2) * 10));
    renderParticles('stockCellParticles', normalizedDensity, 22, 58, remainingTopY, tubeBottomY - 5);

    const targetConc = targetCells / finalVol;
    const targetExpVal = Math.log10(targetConc);
    const destDensity = Math.max(3, Math.round(Math.pow(Math.max(1, targetExpVal - 3.5), 2.2) * 8));
    renderParticles('targetCellParticles', destDensity, 28, 97, flaskBottomY - mediaHeight - suspHeight, flaskBottomY - 5);

    const stockTubeCaption = document.getElementById('stockTubeCaption');
    const destFlaskCaption = document.getElementById('destFlaskCaption');
    if (stockTubeCaption) stockTubeCaption.innerText = "Stock: " + formatVol(remainingStockVol) + " left";
    if (destFlaskCaption) destFlaskCaption.innerText = currentPresetVessel + " (" + finalVol.toFixed(1) + " mL)";

    if (vSusp > finalVol && statusBox) {
      statusBox.style.display = 'block';
      statusBox.style.background = 'rgba(239, 68, 68, 0.15)';
      statusBox.style.color = '#ef4444';
      statusBox.innerText = "Insufficient volume: Required suspension (" + formatVol(vSusp) + ") exceeds working volume (" + finalVol + " mL).";
    } else if (vSusp > stockVolTotal && statusBox) {
      statusBox.style.display = 'block';
      statusBox.style.background = 'rgba(239, 68, 68, 0.15)';
      statusBox.style.color = '#ef4444';
      statusBox.innerText = "Insufficient stock: Transfer volume (" + formatVol(vSusp) + ") exceeds available stock.";
    } else if (recipeBox) {
      recipeBox.innerHTML = "<strong>Benchtop Pipetting Protocol (" + currentPresetVessel + "):</strong><br/>" +
        "1. Pipette <strong>" + formatVol(vMedia) + "</strong> fresh medium into vessel.<br/>" +
        "2. Resuspend stock; aspirate <strong>" + formatVol(vSusp) + "</strong> from Falcon tube.<br/>" +
        "3. Inoculate into vessel. Live cell yield: <strong>" + targetBase + " × 10<sup>" + targetExp + "</sup></strong> cells.";
    }
  }

  function applyPreset(vesselName, cells, vol) {
    currentPresetVessel = vesselName;
    const exp = Math.floor(Math.log10(cells));
    const base = cells / Math.pow(10, exp);
    const targetBase = document.getElementById('targetBase');
    const targetExp = document.getElementById('targetExp');
    const finalVol = document.getElementById('finalVol');
    if (targetBase) targetBase.value = base.toFixed(1);
    if (targetExp) targetExp.value = exp;
    if (finalVol) finalVol.value = vol.toFixed(1);
    calculate();
  }

  const p6 = document.getElementById('preset-6well');
  const p25 = document.getElementById('preset-t25');
  const p75 = document.getElementById('preset-t75');
  const p175 = document.getElementById('preset-t175');
  if (p6) p6.addEventListener('click', () => applyPreset('6-Well', 1e5, 2.0));
  if (p25) p25.addEventListener('click', () => applyPreset('T-25', 7e5, 5.0));
  if (p75) p75.addEventListener('click', () => applyPreset('T-75', 2e6, 12.0));
  if (p175) p175.addEventListener('click', () => applyPreset('T-175', 5e6, 30.0));

  document.querySelectorAll('#culture-seeding-pane input').forEach(input => {
    input.addEventListener('input', calculate);
  });

  function calcHemo() {
    const s1 = parseFloat(document.getElementById('sq1')?.value) || 0;
    const s2 = parseFloat(document.getElementById('sq2')?.value) || 0;
    const s3 = parseFloat(document.getElementById('sq3')?.value) || 0;
    const s4 = parseFloat(document.getElementById('sq4')?.value) || 0;
    const dilution = parseFloat(document.getElementById('hemoDilution')?.value) || 1.0;
    const dead = parseFloat(document.getElementById('deadCells')?.value) || 0;

    const totalLive = s1 + s2 + s3 + s4;
    const avgLive = totalLive / 4;
    const liveConc = avgLive * dilution * 1e4;
    lastHemoConc = liveConc;

    const totalCells = totalLive + dead;
    const viability = totalCells > 0 ? (totalLive / totalCells) * 100 : 100;

    const exp = Math.floor(Math.log10(liveConc));
    const base = liveConc / Math.pow(10, exp);

    const hemoConc = document.getElementById('hemoConcDisplay');
    const hemoViab = document.getElementById('hemoViabilityDisplay');
    if (hemoConc) hemoConc.innerText = base.toFixed(2) + " × 10^" + exp + " cells/mL";
    if (hemoViab) hemoViab.innerText = viability.toFixed(1) + "%";
  }

  document.querySelectorAll('#culture-hemo-pane input').forEach(input => {
    input.addEventListener('input', calcHemo);
  });

  const syncBtn = document.getElementById('syncHemoBtn');
  if (syncBtn) {
    syncBtn.addEventListener('click', () => {
      if (lastHemoConc <= 0) return;
      const exp = Math.floor(Math.log10(lastHemoConc));
      const base = (lastHemoConc / Math.pow(10, exp)).toFixed(2);
      const stockBase = document.getElementById('stockBase');
      const stockExp = document.getElementById('stockExp');
      if (stockBase) stockBase.value = base;
      if (stockExp) stockExp.value = exp;
      showPane('seeding');
      calculate();
    });
  }

  function calcGrowth() {
    const N0 = parseFloat(document.getElementById('growN0')?.value) || 1e6;
    const Td = parseFloat(document.getElementById('growTd')?.value) || 24.0;
    const Nt = parseFloat(document.getElementById('growNt')?.value) || 8e6;

    if (N0 <= 0 || Nt <= N0 || Td <= 0) return;
    const doublings = Math.log2(Nt / N0);
    const totalHours = doublings * Td;
    const days = totalHours / 24;

    const growDoub = document.getElementById('growDoublingsDisplay');
    const growTime = document.getElementById('growTimeDisplay');
    if (growDoub) growDoub.innerText = doublings.toFixed(2) + " doublings";
    if (growTime) growTime.innerText = totalHours.toFixed(1) + " hrs (" + days.toFixed(1) + " days)";
  }

  document.querySelectorAll('#culture-growth-pane input').forEach(input => {
    input.addEventListener('input', calcGrowth);
  });

  calculate();
  calcHemo();
  calcGrowth();
}