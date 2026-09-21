import { translations } from './translations.js';

// Global state
let currentLang = localStorage.getItem('khongtienmat_lang') || 'vi';

// Country exchange & network data for interactive showcase
const countryData = {
  th: {
    flag: '🇹🇭',
    name: 'Thái Lan (Thailand)',
    network: 'PromptPay • ITMX',
    appExample: 'K PLUS, SCB EASY, Krungthai NEXT, Bangkok Bank',
    fxRate: '1 THB ≈ 715 VND',
    sampleForeign: '210 THB',
    sampleVND: '150.000 VNĐ'
  },
  ko: {
    flag: '🇰🇷',
    name: 'Hàn Quốc (Korea)',
    network: 'GLN • Hana Bank',
    appExample: 'Hana 1Q, Toss, KB Kookmin, Shinhan SOL',
    fxRate: '1.000 KRW ≈ 18.500 VND',
    sampleForeign: '8.100 KRW',
    sampleVND: '150.000 VNĐ'
  },
  cn: {
    flag: '🇨🇳',
    name: 'Trung Quốc (China)',
    network: 'Alipay+ • WeChat Pay • UnionPay',
    appExample: 'Alipay, WeChat, Cloud Pay (UnionPay)',
    fxRate: '1 CNY ≈ 3.520 VND',
    sampleForeign: '42.6 CNY',
    sampleVND: '150.000 VNĐ'
  },
  sg: {
    flag: '🇸🇬',
    name: 'Singapore',
    network: 'NETS • Liquid Group',
    appExample: 'DBS PayLah!, OCBC Pay Anyone, UOB TMRW',
    fxRate: '1 SGD ≈ 19.100 VND',
    sampleForeign: '7.85 SGD',
    sampleVND: '150.000 VNĐ'
  },
  kh: {
    flag: '🇰🇭',
    name: 'Campuchia (Cambodia)',
    network: 'KHQR • Bakong • ACLEDA',
    appExample: 'Bakong App, ACLEDA mobile, ABA Mobile',
    fxRate: '100 KHR ≈ 620 VND',
    sampleForeign: '24.200 KHR',
    sampleVND: '150.000 VNĐ'
  },
  la: {
    flag: '🇱🇦',
    name: 'Lào (Laos)',
    network: 'LAPNet • LaoQR',
    appExample: 'BCEL One, LDB Trust, Maruhan Japan Bank',
    fxRate: '1.000 LAK ≈ 1.150 VND',
    sampleForeign: '130.000 LAK',
    sampleVND: '150.000 VNĐ'
  }
};

let activeCountry = 'th';

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initLanguage();
  initCountrySelector();
  initDemoSimulator();
  initLeadForm();
  initFaqAccordion();
  initMobileMenu();
  initScrollEffects();
});

/**
 * Multi-language Handler
 */
function initLanguage() {
  const langSelect = document.getElementById('langSelect');
  const langSelectMobile = document.getElementById('langSelectMobile');

  if (langSelect) {
    langSelect.value = currentLang;
    langSelect.addEventListener('change', (e) => setLanguage(e.target.value));
  }

  if (langSelectMobile) {
    langSelectMobile.value = currentLang;
    langSelectMobile.addEventListener('change', (e) => setLanguage(e.target.value));
  }

  applyLanguage(currentLang);
}

function setLanguage(lang) {
  if (!translations[lang]) return;
  currentLang = lang;
  localStorage.setItem('khongtienmat_lang', lang);

  const langSelect = document.getElementById('langSelect');
  const langSelectMobile = document.getElementById('langSelectMobile');
  if (langSelect) langSelect.value = lang;
  if (langSelectMobile) langSelectMobile.value = lang;

  applyLanguage(lang);
}

function applyLanguage(lang) {
  const dict = translations[lang] || translations.vi;

  // Text elements
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      el.textContent = dict[key];
    }
  });

  // Placeholder elements
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (dict[key]) {
      el.setAttribute('placeholder', dict[key]);
    }
  });

  // Update HTML lang attribute
  document.documentElement.lang = lang;
}

/**
 * Interactive Country Showcase
 */
function initCountrySelector() {
  const buttons = document.querySelectorAll('.country-tab-btn');
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const countryCode = btn.getAttribute('data-country');
      if (countryCode && countryData[countryCode]) {
        activeCountry = countryCode;
        buttons.forEach((b) => {
          b.classList.remove('active', 'border-cyan-500', 'bg-cyan-500/10', 'text-cyan-400');
          b.classList.add('border-slate-800', 'bg-slate-900/60', 'text-slate-400');
        });
        btn.classList.add('active', 'border-cyan-500', 'bg-cyan-500/10', 'text-cyan-400');
        btn.classList.remove('border-slate-800', 'bg-slate-900/60', 'text-slate-400');
        updateCountryDisplay();
      }
    });
  });

  updateCountryDisplay();
}

function updateCountryDisplay() {
  const c = countryData[activeCountry];
  if (!c) return;

  const flagEl = document.getElementById('countryDisplayFlag');
  const nameEl = document.getElementById('countryDisplayName');
  const netEl = document.getElementById('countryDisplayNetwork');
  const appEl = document.getElementById('countryDisplayApps');
  const fxEl = document.getElementById('countryDisplayFx');
  const foreignEl = document.getElementById('countryDisplayForeign');
  const vndEl = document.getElementById('countryDisplayVnd');

  if (flagEl) flagEl.textContent = c.flag;
  if (nameEl) nameEl.textContent = c.name;
  if (netEl) netEl.textContent = c.network;
  if (appEl) appEl.textContent = c.appExample;
  if (fxEl) fxEl.textContent = c.fxRate;
  if (foreignEl) foreignEl.textContent = c.sampleForeign;
  if (vndEl) vndEl.textContent = c.sampleVND;
}

/**
 * Interactive Demo Simulator
 */
function initDemoSimulator() {
  const tabDomestic = document.getElementById('tabDomestic');
  const tabGlobal = document.getElementById('tabGlobal');
  const simulateBtn = document.getElementById('simulatePaymentBtn');
  const successModal = document.getElementById('paymentSuccessCard');
  const promptText = document.getElementById('demoPromptText');

  let mode = 'domestic';

  if (tabDomestic && tabGlobal) {
    tabDomestic.addEventListener('click', () => {
      mode = 'domestic';
      tabDomestic.classList.add('bg-blue-600', 'text-white');
      tabDomestic.classList.remove('bg-slate-800/80', 'text-slate-400');
      tabGlobal.classList.add('bg-slate-800/80', 'text-slate-400');
      tabGlobal.classList.remove('bg-blue-600', 'text-white');

      if (promptText) {
        promptText.textContent =
          currentLang === 'vi'
            ? 'Khách Việt dùng App ngân hàng quét thanh toán • Tiền về MB, Techcom, VIB tức thì!'
            : 'Vietnamese customers pay via domestic bank app • Real-time settlement!';
      }
    });

    tabGlobal.addEventListener('click', () => {
      mode = 'global';
      tabGlobal.classList.add('bg-blue-600', 'text-white');
      tabGlobal.classList.remove('bg-slate-800/80', 'text-slate-400');
      tabDomestic.classList.add('bg-slate-800/80', 'text-slate-400');
      tabDomestic.classList.remove('bg-blue-600', 'text-white');

      if (promptText) {
        promptText.textContent =
          currentLang === 'vi'
            ? 'Du khách dùng PromptPay, GLN, Alipay+, WeChat quét mã • Chủ quán nhận ngay VNĐ!'
            : 'Tourists scan with PromptPay, GLN, Alipay+, WeChat • Merchant gets 100% VND!';
      }
    });
  }

  if (simulateBtn && successModal) {
    simulateBtn.addEventListener('click', () => {
      simulateBtn.disabled = true;
      simulateBtn.innerHTML = `
        <svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
        ${currentLang === 'vi' ? 'Đang xác thực thanh toán...' : 'Authorizing payment...'}
      `;

      setTimeout(() => {
        // Play notification audio tone using Web Audio API
        playPaymentChime();

        simulateBtn.disabled = false;
        simulateBtn.textContent =
          translations[currentLang]?.demoSimulateBtn || translations.vi.demoSimulateBtn;

        successModal.classList.remove('hidden');
        successModal.classList.add('animate-bounce-short');

        setTimeout(() => {
          successModal.classList.add('hidden');
          successModal.classList.remove('animate-bounce-short');
        }, 5000);
      }, 1200);
    });
  }
}

/**
 * High-tech Sound Effect using Web Audio API (no external asset needed)
 */
function playPaymentChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(880.0, now + 0.15); // A5

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1174.66, now + 0.15); // D6
    osc2.frequency.exponentialRampToValueAtTime(1760.0, now + 0.35); // A6

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.2);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.6);
  } catch (e) {
    // AudioContext blocked or not supported
  }
}

/**
 * Lead Generation Form Handler
 */
function initLeadForm() {
  const form = document.getElementById('merchantLeadForm');
  const alertSuccess = document.getElementById('formSuccessAlert');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent =
        translations[currentLang]?.formSubmitting || translations.vi.formSubmitting;
    }

    const formData = {
      fullName: form.fullName.value.trim(),
      phone: form.phone.value.trim(),
      email: form.email.value.trim(),
      storeName: form.storeName.value.trim(),
      city: form.city.value.trim(),
      businessType: form.businessType.value,
      solution: form.solution.value,
      bank: form.bank.value,
      timestamp: new Date().toISOString()
    };

    // Save lead to localStorage
    try {
      const existingLeads = JSON.parse(localStorage.getItem('khongtienmat_leads') || '[]');
      existingLeads.push(formData);
      localStorage.setItem('khongtienmat_leads', JSON.stringify(existingLeads));
    } catch (err) {
      console.warn('Could not save to localStorage', err);
    }

    setTimeout(() => {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent =
          translations[currentLang]?.formSubmit || translations.vi.formSubmit;
      }

      form.reset();
      if (alertSuccess) {
        alertSuccess.classList.remove('hidden');
        alertSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });

        setTimeout(() => {
          alertSuccess.classList.add('hidden');
        }, 10000);
      }
    }, 1000);
  });
}

/**
 * FAQ Accordion
 */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach((item) => {
    const btn = item.querySelector('.faq-btn');
    const content = item.querySelector('.faq-content');
    const icon = item.querySelector('.faq-icon');

    if (btn && content) {
      btn.addEventListener('click', () => {
        const isOpen = !content.classList.contains('hidden');

        // Close all
        document.querySelectorAll('.faq-content').forEach((c) => c.classList.add('hidden'));
        document.querySelectorAll('.faq-icon').forEach((i) => i.classList.remove('rotate-180'));

        if (!isOpen) {
          content.classList.remove('hidden');
          if (icon) icon.classList.add('rotate-180');
        }
      });
    }
  });
}

/**
 * Mobile Navigation Menu
 */
function initMobileMenu() {
  const menuBtn = document.getElementById('mobileMenuBtn');
  const mobileNav = document.getElementById('mobileNavDrawer');
  const closeLinks = document.querySelectorAll('.mobile-nav-link');

  if (menuBtn && mobileNav) {
    menuBtn.addEventListener('click', () => {
      mobileNav.classList.toggle('hidden');
    });

    closeLinks.forEach((link) => {
      link.addEventListener('click', () => {
        mobileNav.classList.add('hidden');
      });
    });
  }
}

/**
 * Scroll & Navbar Effects
 */
function initScrollEffects() {
  const navbar = document.getElementById('mainNavbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      navbar?.classList.add('bg-slate-950/85', 'backdrop-blur-md', 'shadow-lg', 'border-b', 'border-slate-800/80');
      navbar?.classList.remove('bg-transparent');
    } else {
      navbar?.classList.remove('bg-slate-950/85', 'backdrop-blur-md', 'shadow-lg', 'border-b', 'border-slate-800/80');
      navbar?.classList.add('bg-transparent');
    }
  });
}
