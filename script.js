// Language Toggle Functionality
const btnEs = document.getElementById('btn-es');
const btnEn = document.getElementById('btn-en');

function setLanguage(lang) {
  const elements = document.querySelectorAll('[data-lang]');
  elements.forEach(el => {
    if (el.getAttribute('data-lang') === lang) {
      el.style.display = '';
    } else {
      el.style.display = 'none';
    }
  });

  if (lang === 'es') {
    btnEs.classList.add('active');
    btnEn.classList.remove('active');
    document.documentElement.lang = 'es';
  } else {
    btnEn.classList.add('active');
    btnEs.classList.remove('active');
    document.documentElement.lang = 'en';
  }
}

btnEs.addEventListener('click', () => setLanguage('es'));
btnEn.addEventListener('click', () => setLanguage('en'));

// Set current year in footer
document.getElementById('year').textContent = new Date().getFullYear();
