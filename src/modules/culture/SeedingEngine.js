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
    seedingPane.style.display = 'none';
    hemoPane.style.display = 'none';
    growthPane.style.display = 'none';
    btnSeeding.style.background = '#1e293b';
    btnHemo.style.background = '#1e293b';
    btnGrowth.style.background = '#1e293b';

    if (pane === 'seeding') {
      seedingPane.style.display = 'grid';
      btnSeeding.style.background = '#0284c7';
    } else if (pane === 'hemo') {
      hemoPane.style.display = 'block';
      btnHemo.style.background = '#0284c7';
    } else if (pane === 'growth') {
      growthPane.style.display = 'block';
      btnGrowth.style.background = '#0284c7';
    }
  }

  btnSeeding.addEventListener('click', () => showPane('seeding'));
  btnHemo.addEventListener('click', () => showPane('hemo'));
  btnGrowth.addEventListener('click', () => showPane('growth'));

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
    const stockBase = parseFloat(document.getElementById('stockBase').value) || 0;
    const stockExp = parseFloat(document.getElementById('stockExp').value) || 0;
    const stockVolTotal = parseFloat(document.getElementById('stockVolTotal').value) || 50.0;
    const targetBase = parseFloat(document.getElementById('targetBase').value) || 0;
    const targetExp = parseFloat(document.getElementById('targetExp').value) || 0;
    const finalVol = parseFloat(document.getElementById('finalVol').value) || 0;
    const viability = Math.max(1, Math.min(100, parseFloat(document.getElementById('viabilityPct').value) || 100)) / 100;

    const suspDisplay = document.getElementById('suspVolDisplay');
    const mediaDisplay = document.getElementById('mediaVolDisplay');
    const stockRemainingDisplay = document.getElementById('stockRemainingDisplay');
    const statusBox = document.getElementById('statusBox');
    const recipeBox = document.getElementById('recipeBox');
    const fractionBadge = document.getElementById('fractionBadge');

    statusBox.style.display = 'none';

    const rawStockConc = stockBase * Math.pow(10, stockExp);
    const liveStockConc = rawStockConc * viability;
    const targetCells = targetBase * Math.pow(10, targetExp);

    if (liveStockConc <= 0 || targetCells <= 0 || finalVol <= 0) {
      suspDisplay.innerText = "--";
      mediaDisplay.innerText = "--";
      stockRemainingDisplay.innerText = "--";
      recipeBox.innerText = "Please specify valid parameters.";
      return;
    }

    const vSusp = targetCells / liveStockConc;
    const vMedia = finalVol - vSusp;
    const remainingStockVol = Math.max(0, stockVolTotal - vSusp);
    const transferFraction = (vSusp / stockVolTotal) * 100;

    const formatVol = (val) => val < 1.0 ? (val * 1000).toFixed(1) + " µL" : val.toFixed(2) + " mL";

    suspDisplay.innerText = formatVol(vSusp);
    mediaDisplay.innerText = vMedia >= 0 ? formatVol(vMedia) : "0.00 mL";
    stockRemainingDisplay.innerText = formatVol(remainingStockVol) + " (" + ((remainingStockVol / stockVolTotal) * 100).toFixed(1) + "% left)";
    fractionBadge.innerText = "Aspirating: " + transferFraction.toFixed(1) + "% of Stock";

    const maxTubeLiquidHeight = 140;
    const tubeBottomY = 185;
    const initialHeight = Math.min(maxTubeLiquidHeight, Math.max(15, (stockVolTotal / 50.0) * maxTubeLiquidHeight));
    const initialTopY = tubeBottomY - initialHeight;
    const removedHeight = Math.min(initialHeight, Math.max(0, (vSusp / 50.0) * maxTubeLiquidHeight));
    const remainingHeight = Math.max(0, initialHeight - removedHeight);
    const remainingTopY = initialTopY + removedHeight;

    document.getElementById('stockRemoved').setAttribute('y', initialTopY);
    document.getElementById('stockRemoved').setAttribute('height', removedHeight);
    document.getElementById('stockRemaining').setAttribute('y', remainingTopY);
    document.getElementById('stockRemaining').setAttribute('height', remainingHeight);
    document.getElementById('initialMeniscusLine').setAttribute('y1', initialTopY);
    document.getElementById('initialMeniscusLine').setAttribute('y2', initialTopY);

    const flaskBottomY = 175;
    const maxFlaskLiquidHeight = 85;
    const suspHeight = Math.min(maxFlaskLiquidHeight, (vSusp / finalVol) * maxFlaskLiquidHeight);
    const mediaHeight = Math.max(0, maxFlaskLiquidHeight - suspHeight);

    document.getElementById('flaskMedia').setAttribute('y', flaskBottomY - mediaHeight);
    document.getElementById('flaskMedia').setAttribute('height', mediaHeight);
    document.getElementById('flaskSusp').setAttribute('y', flaskBottomY - mediaHeight - suspHeight);
    document.getElementById('flaskSusp').setAttribute('height', suspHeight);

    const exponentVal = Math.log10(rawStockConc);
    const normalizedDensity = Math.max(4, Math.round(Math.pow(Math.max(1, exponentVal - 3.5), 2.2) * 10));
    renderParticles('stockCellParticles', normalizedDensity, 22, 58, remainingTopY, tubeBottomY - 5);

    const targetConc = targetCells / finalVol;
    const targetExpVal = Math.log10(targetConc);
    const destDensity = Math.max(3, Math.round(Math.pow(Math.max(1, targetExpVal - 3.5), 2.2) * 8));
    renderParticles('targetCellParticles', destDensity, 28, 97, flaskBottomY - mediaHeight - suspHeight, flaskBottomY - 5);

    document.getElementById('stockTubeCaption').innerText = "Stock: " + formatVol(remainingStockVol) + " left";
    document.getElementById('destFlaskCaption').innerText = currentPresetVessel + " (" + finalVol.toFixed(1) + " mL)";

    if (vSusp > finalVol) {
      statusBox.style.display = 'block';
      statusBox.style.background = 'rgba(239, 68, 68, 0.15)';
      statusBox.style.color = '#ef4444';
      statusBox.innerText = "Insufficient volume: Required suspension (" + formatVol(vSusp) + ") exceeds working volume (" + finalVol + " mL).";
    } else if (vSusp > stockVolTotal) {
      statusBox.style.display = 'block';
      statusBox.style.background = 'rgba(239, 68, 68, 0.15)';
      statusBox.style.color = '#ef4444';
      statusBox.innerText = "Insufficient stock: Transfer volume (" + formatVol(vSusp) + ") exceeds available stock.";
    } else {
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
    document.getElementById('targetBase').value = base.toFixed(1);
    document.getElementById('targetExp').value = exp;
    document.getElementById('finalVol').value = vol.toFixed(1);
    calculate();
  }

  document.getElementById('preset-6well').addEventListener('click', () => applyPreset('6-Well', 1e5, 2.0));
  document.getElementById('preset-t25').addEventListener('click', () => applyPreset('T-25', 7e5, 5.0));
  document.getElementById('preset-t75').addEventListener('click', () => applyPreset('T-75', 2e6, 12.0));
  document.getElementById('preset-t175').addEventListener('click', () => applyPreset('T-175', 5e6, 30.0));

  document.querySelectorAll('#culture-seeding-pane input').forEach(input => {
    input.addEventListener('input', calculate);
  });

  function calcHemo() {
    const s1 = parseFloat(document.getElementById('sq1').value) || 0;
    const s2 = parseFloat(document.getElementById('sq2').value) || 0;
    const s3 = parseFloat(document.getElementById('sq3').value) || 0;
    const s4 = parseFloat(document.getElementById('sq4').value) || 0;
    const dilution = parseFloat(document.getElementById('hemoDilution').value) || 1.0;
    const dead = parseFloat(document.getElementById('deadCells').value) || 0;

    const totalLive = s1 + s2 + s3 + s4;
    const avgLive = totalLive / 4;
    const liveConc = avgLive * dilution * 1e4;
    lastHemoConc = liveConc;

    const totalCells = totalLive + dead;
    const viability = totalCells > 0 ? (totalLive / totalCells) * 100 : 100;

    const exp = Math.floor(Math.log10(liveConc));
    const base = liveConc / Math.pow(10, exp);

    document.getElementById('hemoConcDisplay').innerText = base.toFixed(2) + " × 10^" + exp + " cells/mL";
    document.getElementById('hemoViabilityDisplay').innerText = viability.toFixed(1) + "%";
  }

  document.querySelectorAll('#culture-hemo-pane input').forEach(input => {
    input.addEventListener('input', calcHemo);
  });

  document.getElementById('syncHemoBtn').addEventListener('click', () => {
    if (lastHemoConc <= 0) return;
    const exp = Math.floor(Math.log10(lastHemoConc));
    const base = (lastHemoConc / Math.pow(10, exp)).toFixed(2);
    document.getElementById('stockBase').value = base;
    document.getElementById('stockExp').value = exp;
    showPane('seeding');
    calculate();
  });

  function calcGrowth() {
    const N0 = parseFloat(document.getElementById('growN0').value) || 1e6;
    const Td = parseFloat(document.getElementById('growTd').value) || 24.0;
    const Nt = parseFloat(document.getElementById('growNt').value) || 8e6;

    if (N0 <= 0 || Nt <= N0 || Td <= 0) return;
    const doublings = Math.log2(Nt / N0);
    const totalHours = doublings * Td;
    const days = totalHours / 24;

    document.getElementById('growDoublingsDisplay').innerText = doublings.toFixed(2) + " doublings";
    document.getElementById('growTimeDisplay').innerText = totalHours.toFixed(1) + " hrs (" + days.toFixed(1) + " days)";
  }

  document.querySelectorAll('#culture-growth-pane input').forEach(input => {
    input.addEventListener('input', calcGrowth);
  });

  calculate();
  calcHemo();
  calcGrowth();
}