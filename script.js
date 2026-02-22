// script.js - Mejor Vida Insurance
// Language toggle, carousel, and UI functionality

document.addEventListener('DOMContentLoaded', function() {
  // ========================================
  // LANGUAGE TOGGLE
  // ========================================
  const langButtons = document.querySelectorAll('.lang-btn');
  let currentLanguage = 'es';

  function setLanguage(lang) {
    currentLanguage = lang;

    // Toggle language via class on <html>; CSS handles visibility with !important over Bootstrap
    document.documentElement.className = 'lang-' + lang;

    // Update button states
    langButtons.forEach(btn => {
      const isActive = btn.dataset.langBtn === lang;
      btn.classList.toggle('active', isActive);
      
      // Update styling for active/inactive states (Bootstrap)
      if (isActive) {
        btn.classList.add('bg-primary', 'text-white', 'border-primary');
        btn.classList.remove('bg-light', 'text-body', 'border-secondary');
      } else {
        btn.classList.remove('bg-primary', 'text-white', 'border-primary');
        btn.classList.add('bg-light', 'text-body', 'border-secondary');
      }
      
      // Update aria-pressed for accessibility
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    // Spanish: logo-spanish2.png; English: logo-english2.png
    // Blog post pages live under /blog/, so logos need ../img there.
    const isBlogPostPage = window.location.pathname.includes('/blog/');
    const logoBasePath = isBlogPostPage ? '../img/' : 'img/';
    const headerLogo = document.getElementById('header-logo');
    if (headerLogo) {
      headerLogo.src = lang === 'es'
        ? logoBasePath + 'logo-spanish2.png'
        : logoBasePath + 'logo-english2.png';
    }
    const footerLogo = document.getElementById('footer-logo');
    if (footerLogo) {
      footerLogo.src = lang === 'es'
        ? logoBasePath + 'logo-spanish2.png'
        : logoBasePath + 'logo-english2.png';
    }

    // Save preference for same-tab navigation (resets on reload logic below)
    sessionStorage.setItem('sessionLang', lang);
  }

  // Persist language across page navigation, but reset to Spanish on reload.
  const navEntry = performance.getEntriesByType('navigation')[0];
  const isReload = navEntry && navEntry.type === 'reload';
  if (isReload) sessionStorage.removeItem('sessionLang');
  setLanguage(sessionStorage.getItem('sessionLang') || 'es');

  // Add click listeners to language buttons
  langButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      setLanguage(btn.dataset.langBtn);
    });
  });

  // ========================================
  // IMAGE CAROUSEL
  // ========================================
  const slides = document.querySelectorAll('.carousel-slide');
  const dots = document.querySelectorAll('.carousel-dot');
  let currentSlide = 0;
  let carouselInterval;

  function showSlide(index) {
    // Ensure index is within bounds
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;
    currentSlide = index;

    // Update slides
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === currentSlide);
    });

    // Update dots
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentSlide);
    });
  }

  function nextSlide() {
    showSlide(currentSlide + 1);
  }

  function startCarousel() {
    if (slides.length > 1) {
      carouselInterval = setInterval(nextSlide, 5000); // Change slide every 5 seconds
    }
  }

  function stopCarousel() {
    clearInterval(carouselInterval);
  }

  // Initialize carousel if slides exist
  if (slides.length > 0) {
    // Add click listeners to dots
    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        stopCarousel();
        showSlide(i);
        startCarousel();
      });
    });

    // Pause on hover
    const carouselContainer = document.querySelector('.carousel-container');
    if (carouselContainer) {
      carouselContainer.addEventListener('mouseenter', stopCarousel);
      carouselContainer.addEventListener('mouseleave', startCarousel);
    }

    // Start auto-play
    startCarousel();
  }

  // ========================================
  // SET CURRENT YEAR IN FOOTER
  // ========================================
  const yearSpan = document.getElementById('year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // ========================================
  // SMOOTH SCROLL FOR ANCHOR LINKS
  // ========================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const headerHeight = 81; // Header height 81px
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // ========================================
  // MOBILE MENU TOGGLE (if needed in future)
  // ========================================
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }
});

// ========================================
// FORM TOGGLING LOGIC (for quote page if needed)
// ========================================
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
}
