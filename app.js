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
    fxRate: '1 THB ≈ 715 VND (Tỷ giá minh họa)',
    sampleForeign: '210 THB',
    sampleVND: '150.000 VNĐ'
  },
  ko: {
    flag: '🇰🇷',
    name: 'Hàn Quốc (Korea)',
    network: 'GLN • Hana Bank',
    appExample: 'Hana 1Q, Toss, KB Kookmin, Shinhan SOL',
    fxRate: '1.000 KRW ≈ 18.500 VND (Tỷ giá minh họa)',
    sampleForeign: '8.100 KRW',
    sampleVND: '150.000 VNĐ'
  },
  cn: {
    flag: '🇨🇳',
    name: 'Trung Quốc (China)',
    network: 'Alipay+ • WeChat Pay • UnionPay',
    appExample: 'Alipay, WeChat, Cloud Pay (UnionPay)',
    fxRate: '1 CNY ≈ 3.520 VND (Tỷ giá minh họa)',
    sampleForeign: '42.6 CNY',
    sampleVND: '150.000 VNĐ'
  },
  sg: {
    flag: '🇸🇬',
    name: 'Singapore',
    network: 'NETS • Liquid Group',
    appExample: 'DBS PayLah!, OCBC Pay Anyone, UOB TMRW',
    fxRate: '1 SGD ≈ 19.100 VND (Tỷ giá minh họa)',
    sampleForeign: '7.85 SGD',
    sampleVND: '150.000 VNĐ'
  },
  kh: {
    flag: '🇰🇭',
    name: 'Campuchia (Cambodia)',
    network: 'KHQR • Bakong • ACLEDA',
    appExample: 'Bakong App, ACLEDA mobile, ABA Mobile',
    fxRate: '100 KHR ≈ 620 VND (Tỷ giá minh họa)',
    sampleForeign: '24.200 KHR',
    sampleVND: '150.000 VNĐ'
  },
  la: {
    flag: '🇱🇦',
    name: 'Lào (Laos)',
    network: 'LAPNet • LaoQR',
    appExample: 'BCEL One, LDB Trust, Maruhan Japan Bank',
    fxRate: '1.000 LAK ≈ 1.150 VND (Tỷ giá minh họa)',
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
  initPolicyModal();
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
          b.classList.remove('active', 'border-blue-600', 'bg-blue-50', 'text-blue-700');
          b.classList.add('border-slate-300', 'bg-white', 'text-slate-700');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active', 'border-blue-600', 'bg-blue-50', 'text-blue-700');
        btn.classList.remove('border-slate-300', 'bg-white', 'text-slate-700');
        btn.setAttribute('aria-selected', 'true');
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
      tabDomestic.classList.remove('bg-transparent', 'text-slate-600');
      tabGlobal.classList.add('bg-transparent', 'text-slate-600');
      tabGlobal.classList.remove('bg-blue-600', 'text-white');
      tabDomestic.setAttribute('aria-selected', 'true');
      tabGlobal.setAttribute('aria-selected', 'false');

      if (promptText) {
        promptText.textContent =
          currentLang === 'vi'
            ? 'Khách Việt mở ứng dụng ngân hàng quét mã QR để chuyển khoản trực tiếp.'
            : 'Domestic customers open their bank app to scan QR and transfer directly.';
      }

      const mockupBrandLogo = document.getElementById('mockupBrandLogo');
      if (mockupBrandLogo) {
        mockupBrandLogo.src = './assets/images/vietqr-pay.png';
        mockupBrandLogo.alt = 'VietQR Pay';
      }
    });

    tabGlobal.addEventListener('click', () => {
      mode = 'global';
      tabGlobal.classList.add('bg-blue-600', 'text-white');
      tabGlobal.classList.remove('bg-transparent', 'text-slate-600');
      tabDomestic.classList.add('bg-transparent', 'text-slate-600');
      tabDomestic.classList.remove('bg-blue-600', 'text-white');
      tabGlobal.setAttribute('aria-selected', 'true');
      tabDomestic.setAttribute('aria-selected', 'false');

      if (promptText) {
        promptText.textContent =
          currentLang === 'vi'
            ? 'Du khách dùng ứng dụng đối tác (PromptPay, GLN, Alipay+, WeChat Pay, NETS) để quét mã thanh toán.'
            : 'Tourists use partner apps (PromptPay, GLN, Alipay+, WeChat Pay, NETS) to scan and pay.';
      }

      const mockupBrandLogo = document.getElementById('mockupBrandLogo');
      if (mockupBrandLogo) {
        mockupBrandLogo.src = './assets/images/vietqr-global.png';
        mockupBrandLogo.alt = 'VietQR Global';
      }
    });
  }

  if (simulateBtn && successModal) {
    simulateBtn.addEventListener('click', () => {
      simulateBtn.disabled = true;
      const runningText = translations[currentLang]?.demoSimulateRunning || 'Đang mô phỏng quét mã...';
      simulateBtn.innerHTML = `
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
        ${runningText}
      `;

      setTimeout(() => {
        playPaymentChime();

        simulateBtn.disabled = false;
        simulateBtn.textContent =
          translations[currentLang]?.demoSimulateBtn || 'Xem thử quy trình quét mã';

        successModal.classList.remove('hidden');

        setTimeout(() => {
          successModal.classList.add('hidden');
        }, 5000);
      }, 1000);
    });
  }
}

/**
 * Clean Web Audio API Chime
 */
function playPaymentChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(880.0, now + 0.18); // A5

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc1.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.4);
  } catch (e) {
    // AudioContext blocked or not supported
  }
}

/**
 * Lead Generation Form Handler with Inline Error Messaging
 */
function initLeadForm() {
  const form = document.getElementById('merchantLeadForm');
  const alertSuccess = document.getElementById('formSuccessAlert');

  if (!form) return;

  const fields = {
    fullName: form.querySelector('[name="fullName"]'),
    phone: form.querySelector('[name="phone"]'),
    storeName: form.querySelector('[name="storeName"]'),
    city: form.querySelector('[name="city"]'),
    email: form.querySelector('[name="email"]')
  };

  // Clear errors on input
  Object.values(fields).forEach((input) => {
    if (!input) return;
    input.addEventListener('input', () => {
      clearFieldError(input);
    });
  });

  let isSubmitting = false;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    // Validate fields
    let isValid = true;

    // 1. Full name (min 2 chars)
    const fullNameVal = fields.fullName?.value.trim() || '';
    if (fullNameVal.length < 2) {
      setFieldError(fields.fullName, 'Vui lòng nhập họ và tên người đại diện (tối thiểu 2 ký tự).');
      isValid = false;
    } else {
      clearFieldError(fields.fullName);
    }

    // 2. Phone (Vietnamese 10-digit standard)
    const phoneVal = fields.phone?.value.trim() || '';
    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(phoneVal.replace(/\s+/g, ''))) {
      setFieldError(fields.phone, 'Vui lòng nhập số điện thoại hợp lệ gồm 10 chữ số (bắt đầu bằng số 0).');
      isValid = false;
    } else {
      clearFieldError(fields.phone);
    }

    // 3. Store name (min 2 chars)
    const storeNameVal = fields.storeName?.value.trim() || '';
    if (storeNameVal.length < 2) {
      setFieldError(fields.storeName, 'Vui lòng nhập tên cửa hàng hoặc thương hiệu của bạn.');
      isValid = false;
    } else {
      clearFieldError(fields.storeName);
    }

    // 4. City (min 2 chars)
    const cityVal = fields.city?.value.trim() || '';
    if (cityVal.length < 2) {
      setFieldError(fields.city, 'Vui lòng nhập tỉnh hoặc thành phố nơi cửa hàng hoạt động.');
      isValid = false;
    } else {
      clearFieldError(fields.city);
    }

    // 5. Email (optional, but validate format if provided)
    const emailVal = fields.email?.value.trim() || '';
    if (emailVal.length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailVal)) {
        setFieldError(fields.email, 'Email không đúng định dạng (ví dụ: cuahang@gmail.com).');
        isValid = false;
      } else {
        clearFieldError(fields.email);
      }
    } else {
      clearFieldError(fields.email);
    }

    if (!isValid) {
      // Focus first error field
      const firstError = form.querySelector('.border-rose-500');
      firstError?.focus();
      return;
    }

    // Anti-duplicate submission state
    isSubmitting = true;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn?.textContent || 'Gửi yêu cầu tư vấn';

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
        ${translations[currentLang]?.formSubmitting || 'Đang gửi yêu cầu...'}
      `;
    }

    const formData = {
      fullName: fullNameVal,
      phone: phoneVal,
      storeName: storeNameVal,
      city: cityVal,
      email: emailVal,
      businessType: form.businessType?.value || '',
      solution: form.solution?.value || '',
      bank: form.bank?.value || '',
      timestamp: new Date().toISOString()
    };

    // Store in localStorage for prototype evaluation
    try {
      const existingLeads = JSON.parse(localStorage.getItem('khongtienmat_leads') || '[]');
      existingLeads.push(formData);
      localStorage.setItem('khongtienmat_leads', JSON.stringify(existingLeads));
    } catch (err) {
      console.warn('LocalStorage unavailable', err);
    }

    setTimeout(() => {
      isSubmitting = false;
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
      }

      form.reset();

      if (alertSuccess) {
        alertSuccess.classList.remove('hidden');
        alertSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });

        setTimeout(() => {
          alertSuccess.classList.add('hidden');
        }, 12000);
      }
    }, 800);
  });
}

function setFieldError(inputEl, msg) {
  if (!inputEl) return;
  inputEl.classList.add('border-rose-500', 'bg-rose-50/30');
  inputEl.classList.remove('border-slate-300');
  const errorEl = document.getElementById(`err-${inputEl.name}`);
  if (errorEl) {
    errorEl.textContent = msg;
    errorEl.classList.remove('hidden');
  }
}

function clearFieldError(inputEl) {
  if (!inputEl) return;
  inputEl.classList.remove('border-rose-500', 'bg-rose-50/30');
  inputEl.classList.add('border-slate-300');
  const errorEl = document.getElementById(`err-${inputEl.name}`);
  if (errorEl) {
    errorEl.textContent = '';
    errorEl.classList.add('hidden');
  }
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

        // Close all other items
        document.querySelectorAll('.faq-content').forEach((c) => c.classList.add('hidden'));
        document.querySelectorAll('.faq-icon').forEach((i) => i.classList.remove('rotate-180'));
        document.querySelectorAll('.faq-btn').forEach((b) => b.setAttribute('aria-expanded', 'false'));

        if (!isOpen) {
          content.classList.remove('hidden');
          btn.setAttribute('aria-expanded', 'true');
          if (icon) icon.classList.add('rotate-180');
        }
      });
    }
  });
}

/**
 * Mobile Navigation Menu with Keyboard Trap and ARIA
 */
function initMobileMenu() {
  const menuBtn = document.getElementById('mobileMenuBtn');
  const mobileNav = document.getElementById('mobileNavDrawer');
  const closeBtn = document.getElementById('mobileNavCloseBtn');
  const closeLinks = document.querySelectorAll('.mobile-nav-link');

  if (menuBtn && mobileNav) {
    const openMenu = () => {
      mobileNav.classList.remove('hidden');
      menuBtn.setAttribute('aria-expanded', 'true');
      const firstFocusable = mobileNav.querySelector('a, button, select');
      firstFocusable?.focus();
    };

    const closeMenu = () => {
      mobileNav.classList.add('hidden');
      menuBtn.setAttribute('aria-expanded', 'false');
      menuBtn.focus();
    };

    menuBtn.addEventListener('click', () => {
      const isOpen = !mobileNav.classList.contains('hidden');
      if (isOpen) closeMenu();
      else openMenu();
    });

    closeBtn?.addEventListener('click', closeMenu);

    closeLinks.forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    // Close menu on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !mobileNav.classList.contains('hidden')) {
        closeMenu();
      }
    });
  }
}

/**
 * Scroll & Navbar Effects
 */
function initScrollEffects() {
  const navbar = document.getElementById('mainNavbar');
  if (!navbar) return;

  const handleScroll = () => {
    if (window.scrollY > 25) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/**
 * Policy & Terms Modal
 */
function initPolicyModal() {
  const modal = document.getElementById('policyModal');
  const closeBtn = document.getElementById('policyModalCloseBtn');
  const triggerLinks = document.querySelectorAll('.policy-modal-trigger');

  if (!modal) return;

  const openModal = (e) => {
    if (e) e.preventDefault();
    modal.classList.remove('hidden');
    closeBtn?.focus();
  };

  const closeModal = () => {
    modal.classList.add('hidden');
  };

  triggerLinks.forEach((link) => {
    link.addEventListener('click', openModal);
  });

  closeBtn?.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      closeModal();
    }
  });
}
