// script.js - centralized JavaScript for Mejor Vida Insurance site

// Language toggle
const langButtons = document.querySelectorAll('.lang-btn');
let currentLanguage = 'es';

function setLanguage(lang) {
  currentLanguage = lang;

  document.querySelectorAll('[data-lang="es"]').forEach(el => {
    el.style.display = lang === 'es' ? '' : 'none';
  });
  document.querySelectorAll('[data-lang="en"]').forEach(el => {
    el.style.display = lang === 'en' ? '' : 'none';
  });

  langButtons.forEach(btn => {
    if (btn.dataset.langBtn === lang) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

langButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    setLanguage(btn.dataset.langBtn);
  });
});

// Set default language on load
setLanguage('es');

// Set current year in footer
const yearSpan = document.getElementById('year');
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

// Form toggling logic for quote.html
const toggleCoverage = document.getElementById('toggle-coverage');
const toggleBudget = document.getElementById('toggle-budget');
const coverageGroup = document.getElementById('coverage-group');
const budgetGroup = document.getElementById('budget-group');
const preferenceType = document.getElementById('preference-type');

if (toggleCoverage && toggleBudget && coverageGroup && budgetGroup && preferenceType) {
  toggleCoverage.addEventListener('click', function() {
    toggleCoverage.classList.add('active');
    toggleBudget.classList.remove('active');
    coverageGroup.style.display = 'flex';
    budgetGroup.style.display = 'none';
    preferenceType.value = 'coverage';
  });

  toggleBudget.addEventListener('click', function() {
    toggleBudget.classList.add('active');
    toggleCoverage.classList.remove('active');
    budgetGroup.style.display = 'flex';
    coverageGroup.style.display = 'none';
    preferenceType.value = 'budget';
  });

  // Show/hide "Other" input for coverage
  const coverageAmount = document.getElementById('coverageAmount');
  const coverageOther = document.getElementById('coverageOther');
  const coverageOtherEn = document.getElementById('coverageOtherEn');

  coverageAmount.addEventListener('change', function() {
    if (this.value === 'other') {
      coverageOther.style.display = 'block';
      coverageOtherEn.style.display = 'block';
      coverageOther.required = true;
    } else {
      coverageOther.style.display = 'none';
      coverageOtherEn.style.display = 'none';
      coverageOther.required = false;
      coverageOther.value = '';
      coverageOtherEn.value = '';
    }
  });

  // Show/hide "Other" input for budget
  const budgetAmount = document.getElementById('budgetAmount');
  const budgetOther = document.getElementById('budgetOther');
  const budgetOtherEn = document.getElementById('budgetOtherEn');

  budgetAmount.addEventListener('change', function() {
    if (this.value === 'other') {
      budgetOther.style.display = 'block';
      budgetOtherEn.style.display = 'block';
      budgetOther.required = true;
    } else {
      budgetOther.style.display = 'none';
      budgetOtherEn.style.display = 'none';
      budgetOther.required = false;
      budgetOther.value = '';
      budgetOtherEn.value = '';
    }
  });
}
