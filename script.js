// Language Toggle Functionality
const langButtons = document.querySelectorAll('.lang-btn');
const elementsWithLang = document.querySelectorAll('[data-lang]');
const headerLogo = document.getElementById('header-logo');

// Set initial language to Spanish
let currentLang = 'es';

// Function to switch language
function switchLanguage(lang) {
  currentLang = lang;
  
  // Update active button
  langButtons.forEach(btn => {
    if (btn.getAttribute('data-lang-btn') === lang) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  // Show/hide elements based on language
  elementsWithLang.forEach(el => {
    if (el.getAttribute('data-lang') === lang) {
      el.style.display = '';
    } else {
      el.style.display = 'none';
    }
  });
  
  // Update logo based on language
  if (lang === 'es') {
    headerLogo.src = 'img/logo-spanish.png';
    headerLogo.alt = 'Mejor Vida Insurance LLC Logo';
  } else {
    headerLogo.src = 'img/logo-english.png';
    headerLogo.alt = 'Mejor Vida Insurance LLC Logo';
  }
  
  // Update form select options
  updateFormOptions(lang);
}

// Function to update form select options
function updateFormOptions(lang) {
  const selectElement = document.getElementById('coverage');
  const options = selectElement.querySelectorAll('option[data-lang]');
  
  options.forEach(option => {
    if (option.getAttribute('data-lang') === lang) {
      option.style.display = '';
    } else {
      option.style.display = 'none';
    }
  });
}

// Add click event listeners to language buttons
langButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const lang = btn.getAttribute('data-lang-btn');
    switchLanguage(lang);
  });
});

// Initialize with Spanish
switchLanguage('es');

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});
