import { initSeedingEngine } from './modules/culture/SeedingEngine.js';

const tabButtons = document.querySelectorAll('.tab-btn');
const cultureModule = document.getElementById('culture-module');
const otherModules = document.getElementById('other-modules');
const otherModuleTitle = document.getElementById('other-module-title');

tabButtons.forEach(button => {
  button.addEventListener('click', () => {
    tabButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    const tabKey = button.dataset.tab;
    if (tabKey === 'culture') {
      cultureModule.style.display = 'block';
      otherModules.style.display = 'none';
    } else {
      cultureModule.style.display = 'none';
      otherModules.style.display = 'block';
      otherModuleTitle.innerText = 'Module: ' + tabKey.toUpperCase();
    }
  });
});

// Initialize culture module listeners and math
initSeedingEngine();