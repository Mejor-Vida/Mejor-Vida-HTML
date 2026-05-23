// script.js - Mejor Vida Insurance
// Language toggle, carousel, and UI functionality

document.addEventListener('DOMContentLoaded', function() {

  // ========================================
  // LANGUAGE TOGGLE
  // ========================================
  const langButtons = document.querySelectorAll('.lang-btn');
  const isEnglishSite = /(?:^|\/)en(?:\/|$)/.test(window.location.pathname.replace(/\\/g, '/'));
  let currentLanguage = isEnglishSite ? 'en' : 'es';
  let currentSlide = 0;

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
    // Nested pages (blog + carriers) need ../img.
    const path = window.location.pathname.replace(/\\/g, '/');
    const isNestedPage = path.includes('/blog/') || path.includes('/carriers/');
    let logoBasePath = 'img/';
    if (isEnglishSite || isNestedPage) logoBasePath = '../img/';
    else if (window.location.protocol !== 'file:') logoBasePath = '/img/';
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

    window.dispatchEvent(
      new CustomEvent('mvi-site-language', { detail: { code: lang } }),
    );

    document.querySelectorAll('.hero-quote-bubble-link').forEach(function (lnk) {
      lnk.title = lang === 'es' ? 'Ver cotización personalizada' : 'See your personalized quote';
    });

    if (typeof updateHeroQuoteBubble === 'function' && typeof currentSlide === 'number') {
      updateHeroQuoteBubble(currentSlide);
    }
  }

  // Persist language across page navigation, but reset to site default on reload.
  const navEntry = performance.getEntriesByType('navigation')[0];
  const isReload = navEntry && navEntry.type === 'reload';
  if (isReload) sessionStorage.removeItem('sessionLang');
  const defaultLang = isEnglishSite ? 'en' : 'es';
  setLanguage(sessionStorage.getItem('sessionLang') || defaultLang);

  // Add click listeners to language buttons
  langButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      setLanguage(btn.dataset.langBtn);
    });
  });

  window.addEventListener('mvi-assistant-language', function (e) {
    const code = e.detail && e.detail.code;
    if (code !== 'en' && code !== 'es') return;
    setLanguage(code);
  });

  // ========================================
  // IMAGE CAROUSEL
  // ========================================
  const slides = document.querySelectorAll('.carousel-slide');
  const dots = document.querySelectorAll('.carousel-dot');
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

    updateHeroQuoteBubble(currentSlide);
  }

  function heroFormatPolicyLine(coverage, lang) {
    const policyWord = lang === 'es' ? 'póliza' : 'policy';
    const raw = String(coverage || '').replace(/[$,\s]/g, '');
    const n = parseInt(raw, 10);
    if (!isNaN(n) && n > 0) {
      if (n >= 1000 && n % 1000 === 0) {
        return '$' + n / 1000 + 'k ' + policyWord;
      }
      return '$' + n.toLocaleString('en-US') + ' ' + policyWord;
    }
    const c = (coverage || '').trim();
    return c ? c + ' ' + policyWord : policyWord;
  }

  function heroFormatRateMo(rateStr, lang) {
    const r = String(rateStr || '').trim().replace(/^\$/, '');
    if (!r || !/^[\d.]+$/.test(r)) return '';
    const n = parseFloat(r);
    if (isNaN(n)) return '';
    const suffix = lang === 'es' ? ' /mes' : ' /mo';
    return '$' + n.toFixed(2) + suffix;
  }

  function applyHeroBubblePosition(wrapEl, pos) {
    if (!wrapEl || !pos) return;
    wrapEl.style.bottom = pos.bottom != null ? pos.bottom : '18%';
    wrapEl.style.top = pos.top != null ? pos.top : 'auto';
    if (pos.left && pos.left !== 'auto') {
      wrapEl.style.left = pos.left;
      wrapEl.style.right = 'auto';
    } else if (pos.right && pos.right !== 'auto') {
      wrapEl.style.right = pos.right;
      wrapEl.style.left = 'auto';
    } else {
      wrapEl.style.left = '5%';
      wrapEl.style.right = 'auto';
    }
  }

  /** Root-absolute paths so /en/ pages do not resolve img/ under /en/img/. */
  function resolveSiteAssetPath(path) {
    if (!path) return '';
    if (/^https?:\/\//i.test(path)) return path;
    if (path.charAt(0) === '/') return path;
    return '/' + String(path).replace(/^\.\//, '');
  }

  function applyHeroBubbleContent(wrapRoot, q) {
    if (!wrapRoot || !q) return;
    const lang = currentLanguage || 'es';
    const carrierEl = wrapRoot.querySelector('.js-hq-carrier');
    const policyLineEl = wrapRoot.querySelector('.js-hq-policy');
    const rateBlock = wrapRoot.querySelector('.js-hq-rate-block');
    const rateEl = wrapRoot.querySelector('.js-hq-rate');
    const img = wrapRoot.querySelector('.js-hq-logo');
    const fb = wrapRoot.querySelector('.js-hq-fb');
    const logoWrap = wrapRoot.querySelector('.js-hq-logo-wrap');

    if (logoWrap) {
      if (q.carrierKey) logoWrap.setAttribute('data-carrier', q.carrierKey);
      else logoWrap.removeAttribute('data-carrier');
    }

    const label = q.logoAlt || '';
    if (carrierEl) carrierEl.textContent = label;
    if (policyLineEl) policyLineEl.textContent = heroFormatPolicyLine(q.coverage, lang);

    const rateDisplay = heroFormatRateMo(q.rate, lang);
    if (rateEl && rateBlock) {
      if (rateDisplay) {
        rateEl.textContent = rateDisplay;
        rateBlock.classList.remove('is-empty');
      } else {
        rateEl.textContent = '';
        rateBlock.classList.add('is-empty');
      }
    }

    if (img && fb) {
      fb.textContent = label ? label.charAt(0).toUpperCase() : '?';
      img.alt = label || 'Carrier';
      const src = q.logo || '';
      img.onload = function () {
        img.classList.remove('is-hidden');
      };
      img.onerror = function () {
        img.classList.add('is-hidden');
      };
      img.src = resolveSiteAssetPath(src);
    }
  }

  /** One bubble or two (couple slide) — data: js/hero-quotes-data.js */
  function updateHeroQuoteBubble(index) {
    const quotes = window.HERO_CAROUSEL_QUOTES;
    const wrapA = document.getElementById('hero-quote-bubble-wrap-a');
    const wrapB = document.getElementById('hero-quote-bubble-wrap-b');
    const carousel = document.querySelector('.carousel-container');
    if (!wrapA) return;
    if (!quotes || !quotes.length) {
      wrapA.setAttribute('hidden', '');
      wrapA.setAttribute('aria-hidden', 'true');
      if (wrapB) {
        wrapB.setAttribute('hidden', '');
        wrapB.setAttribute('aria-hidden', 'true');
      }
      return;
    }

    wrapA.removeAttribute('hidden');
    wrapA.setAttribute('aria-hidden', 'false');

    const q = quotes[index];
    if (!q) return;

    [wrapA, wrapB].forEach(function (w) {
      if (w) w.classList.add('is-switching');
    });
    window.setTimeout(function () {
      [wrapA, wrapB].forEach(function (w) {
        if (w) w.classList.remove('is-switching');
      });
    }, 220);

    const dual = q.bubbles && q.bubbles.length >= 2;
    if (carousel) carousel.classList.toggle('hero-carousel--dual-bubbles', dual);

    if (dual && wrapB) {
      wrapB.removeAttribute('hidden');
      wrapB.setAttribute('aria-hidden', 'false');
      applyHeroBubbleContent(wrapA, q.bubbles[0]);
      applyHeroBubblePosition(wrapA, q.bubbles[0].position);
      applyHeroBubbleContent(wrapB, q.bubbles[1]);
      applyHeroBubblePosition(wrapB, q.bubbles[1].position);
    } else {
      if (wrapB) {
        wrapB.setAttribute('hidden', '');
        wrapB.setAttribute('aria-hidden', 'true');
      }
      applyHeroBubbleContent(wrapA, q);
      applyHeroBubblePosition(wrapA, q.position);
    }
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

    updateHeroQuoteBubble(currentSlide);
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
