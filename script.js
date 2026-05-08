// script.js - Mejor Vida Insurance
// Language toggle, carousel, and UI functionality

document.addEventListener('DOMContentLoaded', function() {
  const WHATSAPP_URL = 'https://wa.me/14024405438?text=Hola%2C%20me%20interesa%20obtener%20informaci%C3%B3n%20sobre%20el%20seguro%20de%20gastos%20finales.';

  // ========================================
  // LANGUAGE TOGGLE
  // ========================================
  const langButtons = document.querySelectorAll('.lang-btn');
  let currentLanguage = 'es';
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
    const isNestedPage = window.location.pathname.includes('/blog/') || window.location.pathname.includes('/carriers/');
    const logoBasePath = isNestedPage ? '../img/' : 'img/';
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

    // Keep floating WhatsApp label language-aware.
    updateFloatingWhatsAppLabel(lang);

    document.querySelectorAll('.hero-quote-bubble-link').forEach(function (lnk) {
      lnk.title = lang === 'es' ? 'Ver cotización personalizada' : 'See your personalized quote';
    });

    if (typeof updateHeroQuoteBubble === 'function' && typeof currentSlide === 'number') {
      updateHeroQuoteBubble(currentSlide);
    }
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
      img.src = src;
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

  // ========================================
  // FLOATING WHATSAPP BUTTON (ALL PAGES)
  // ========================================
  function ensureFloatingWhatsAppButton() {
    if (document.getElementById('floating-whatsapp-btn')) return;

    const styleTag = document.createElement('style');
    styleTag.textContent = `
      /* Sit above #mvi-assistant-root (bottom ~5.75–6.25rem + 3.5rem FAB) so the pill is not covered */
      #floating-whatsapp-btn {
        position: fixed;
        right: 16px;
        left: auto;
        bottom: calc(max(5.75rem, env(safe-area-inset-bottom, 0px) + 4.75rem) + 3.5rem + 2.75rem);
        z-index: 1049;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 11px 14px;
        border-radius: 999px;
        background: #25D366;
        color: #ffffff;
        font-weight: 700;
        font-size: 15px;
        line-height: 1.25;
        text-decoration: none;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.18);
        max-width: min(86vw, 320px);
        visibility: visible;
        opacity: 1;
        pointer-events: auto;
      }
      #floating-whatsapp-btn:hover {
        filter: brightness(0.96);
      }
      #floating-whatsapp-btn .wa-icon {
        font-size: 20px;
        line-height: 1;
      }
      @media (max-width: 576px) {
        #floating-whatsapp-btn {
          right: 12px;
          bottom: calc(max(6.25rem, env(safe-area-inset-bottom, 0px) + 5.25rem) + 3.5rem + 2.5rem);
          padding: 10px 13px;
          font-size: 14px;
        }
      }
    `;
    document.head.appendChild(styleTag);

    const button = document.createElement('a');
    button.id = 'floating-whatsapp-btn';
    button.href = WHATSAPP_URL;
    button.target = '_blank';
    button.rel = 'noopener';
    button.setAttribute('aria-label', 'Message us on WhatsApp');
    button.innerHTML = '<span class="wa-icon" aria-hidden="true">💬</span><span class="wa-label"></span>';
    document.body.appendChild(button);
  }

  function updateFloatingWhatsAppLabel(lang) {
    const button = document.getElementById('floating-whatsapp-btn');
    if (!button) return;
    const label = button.querySelector('.wa-label');
    if (!label) return;

    if (lang === 'en') {
      label.textContent = 'Message us on WhatsApp';
      button.setAttribute('aria-label', 'Message us on WhatsApp');
    } else {
      label.textContent = 'Envíanos un mensaje por WhatsApp';
      button.setAttribute('aria-label', 'Envíanos un mensaje por WhatsApp');
    }
  }

  ensureFloatingWhatsAppButton();
  updateFloatingWhatsAppLabel(currentLanguage);
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
