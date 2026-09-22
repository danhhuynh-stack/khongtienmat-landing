import { translations } from './translations.js';

// Global state
let currentLang = localStorage.getItem('khongtienmat_lang') || 'vi';
let activeProductModalKey = 'vietqr-pay';

// Product metadata for the 4 products
const productsData = {
  'vietqr-pay': {
    badge: 'Mã QR quầy thu ngân',
    badgeFreeKey: 'badgeFree',
    titleKey: 'product1Title',
    benefitKey: 'product1Benefit',
    image: './assets/images/standee-than-tai.png',
    forWhoKey: 'p1ForWho',
    methodsKey: 'p1Methods',
    step1Key: 'p1Step1',
    step2Key: 'p1Step2',
    step3Key: 'p1Step3',
    roleKey: 'p1Role',
    formValue: 'vietqr-pay'
  },
  'soundbox': {
    badge: 'Thiết bị phát âm thanh',
    badgeFreeKey: 'badgeFree',
    titleKey: 'product2Title',
    benefitKey: 'product2Benefit',
    image: './assets/images/product-soundbox.png',
    forWhoKey: 'p2ForWho',
    methodsKey: 'p2Methods',
    step1Key: 'p2Step1',
    step2Key: 'p2Step2',
    step3Key: 'p2Step3',
    roleKey: 'p2Role',
    formValue: 'soundbox'
  },
  'pos-software': {
    badge: 'Phần mềm quản lý bán hàng',
    badgeFreeKey: 'badgeFree',
    titleKey: 'product3Title',
    benefitKey: 'product3Benefit',
    image: './assets/images/product-pos-app.png',
    forWhoKey: 'p3ForWho',
    methodsKey: 'p3Methods',
    step1Key: 'p3Step1',
    step2Key: 'p3Step2',
    step3Key: 'p3Step3',
    roleKey: 'p3Role',
    formValue: 'pos-software'
  },
  'smart-pos': {
    badge: 'Thiết bị POS thanh toán',
    badgeFreeKey: 'badgeFreePOS',
    hasCondition: true,
    titleKey: 'product4Title',
    benefitKey: 'product4Benefit',
    image: './assets/images/product-smart-pos.png',
    forWhoKey: 'p4ForWho',
    methodsKey: 'p4Methods',
    step1Key: 'p4Step1',
    step2Key: 'p4Step2',
    step3Key: 'p4Step3',
    roleKey: 'p4Role',
    formValue: 'smart-pos'
  }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initLanguage();
  initProductDetailModal();
  initLeadForm();
  initScrollEffects();
  initPolicyModal();

  // Support direct modal preview or section scroll via URL query
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('open_modal')) {
    const pKey = urlParams.get('open_modal') || 'vietqr-pay';
    setTimeout(() => openProductModal(pKey), 100);
  }
  if (urlParams.has('isolate')) {
    const isolateId = urlParams.get('isolate');
    ['products', 'process', 'register', 'network'].forEach(id => {
      const el = document.getElementById(id);
      if (el && id !== isolateId) {
        el.style.display = 'none';
      }
    });
    const header = document.querySelector('header');
    if (header && isolateId !== 'hero') header.style.display = 'none';
    const target = document.getElementById(isolateId);
    if (target) target.style.paddingTop = '6rem';
  } else if (urlParams.has('scroll_to')) {
    const target = document.getElementById(urlParams.get('scroll_to'));
    if (target) {
      target.scrollIntoView({ behavior: 'instant', block: 'start' });
    }
  }
});

/**
 * 1. Multi-language Handler
 */
function initLanguage() {
  const langSelect = document.getElementById('langSelect');
  if (langSelect) {
    langSelect.value = currentLang;
    langSelect.addEventListener('change', (e) => setLanguage(e.target.value));
  }
  applyLanguage(currentLang);
}

function setLanguage(lang) {
  if (!translations[lang]) return;
  currentLang = lang;
  localStorage.setItem('khongtienmat_lang', lang);
  document.documentElement.lang = lang;
  applyLanguage(lang);

  // Update modal content if open
  const modal = document.getElementById('productDetailModal');
  if (modal && !modal.classList.contains('hidden')) {
    populateProductModal(activeProductModalKey);
  }
}

function applyLanguage(lang) {
  const dict = translations[lang] || translations.vi;
  
  // Elements with data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      if (dict[key].includes('<') && dict[key].includes('>')) {
        el.innerHTML = dict[key];
      } else {
        el.textContent = dict[key];
      }
    }
  });

  // Re-render Lucide icons if updated
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

/**
 * 2. Product Detail Modal Controller
 */
function initProductDetailModal() {
  const modal = document.getElementById('productDetailModal');
  const closeBtn = document.getElementById('productDetailCloseBtn');
  const registerThisBtn = document.getElementById('btnModalRegisterThis');

  // Open modal buttons
  document.querySelectorAll('.btn-product-detail').forEach(btn => {
    btn.addEventListener('click', () => {
      const productKey = btn.getAttribute('data-product');
      openProductModal(productKey);
    });
  });

  // Close modal button
  if (closeBtn) {
    closeBtn.addEventListener('click', closeProductModal);
  }

  // Close on backdrop click
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeProductModal();
      }
    });
  }

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
      closeProductModal();
    }
  });

  // "Register this product" action button in modal
  if (registerThisBtn) {
    registerThisBtn.addEventListener('click', () => {
      const productData = productsData[activeProductModalKey];
      const productSelect = document.getElementById('productInterest');
      
      // Auto-select the product in registration form
      if (productSelect && productData) {
        productSelect.value = productData.formValue;
      }

      // Close modal
      closeProductModal();

      // Smooth scroll to #register form
      const regSection = document.getElementById('register');
      if (regSection) {
        regSection.scrollIntoView({ behavior: 'smooth' });
        // Focus on phone input after scroll
        setTimeout(() => {
          const phoneInput = document.getElementById('phone');
          if (phoneInput) phoneInput.focus();
        }, 500);
      }
    });
  }
}

function openProductModal(productKey) {
  const modal = document.getElementById('productDetailModal');
  if (!modal || !productsData[productKey]) return;

  activeProductModalKey = productKey;
  populateProductModal(productKey);

  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function closeProductModal() {
  const modal = document.getElementById('productDetailModal');
  if (!modal) return;

  modal.classList.add('hidden');
  document.body.style.overflow = '';
}

function populateProductModal(productKey) {
  const data = productsData[productKey];
  const dict = translations[currentLang] || translations.vi;
  if (!data) return;

  const modalImg = document.getElementById('modalProductImg');
  const modalBadge = document.getElementById('modalProductBadge');
  const modalFreeBadge = document.getElementById('modalFreeBadge');
  const modalTitle = document.getElementById('modalProductTitle');
  const modalBenefit = document.getElementById('modalProductBenefit');
  const forWhoText = document.getElementById('modalForWhoText');
  const methodsText = document.getElementById('modalMethodsText');
  const step1Text = document.getElementById('modalStep1Text');
  const step2Text = document.getElementById('modalStep2Text');
  const step3Text = document.getElementById('modalStep3Text');
  const roleText = document.getElementById('modalRoleText');
  const modalPosCondition = document.getElementById('modalPosCondition');

  if (modalImg) {
    modalImg.src = data.image;
    modalImg.alt = dict[data.titleKey] || data.titleKey;
  }
  if (modalBadge) modalBadge.textContent = data.badge;
  if (modalFreeBadge) {
    modalFreeBadge.textContent = dict[data.badgeFreeKey] || (data.hasCondition ? dict.badgeFreePOS : dict.badgeFree);
  }
  if (modalTitle) modalTitle.textContent = dict[data.titleKey] || '';
  if (modalBenefit) modalBenefit.textContent = dict[data.benefitKey] || '';
  if (forWhoText) forWhoText.textContent = dict[data.forWhoKey] || '';
  if (methodsText) methodsText.textContent = dict[data.methodsKey] || '';
  if (step1Text) step1Text.textContent = dict[data.step1Key] || '';
  if (step2Text) step2Text.textContent = dict[data.step2Key] || '';
  if (step3Text) step3Text.textContent = dict[data.step3Key] || '';
  if (roleText) roleText.textContent = dict[data.roleKey] || '';

  if (modalPosCondition) {
    if (data.hasCondition) {
      modalPosCondition.classList.remove('hidden');
    } else {
      modalPosCondition.classList.add('hidden');
    }
  }
}

/**
 * 3. Minimalist Lead Form Handler (2 fields: phone & storeAddress)
 */
function initLeadForm() {
  const form = document.getElementById('leadForm');
  if (!form) return;

  const phoneInput = document.getElementById('phone');
  const addressInput = document.getElementById('storeAddress');
  const submitBtn = document.getElementById('submitBtn');
  const successAlert = document.getElementById('formSuccessAlert');

  // Clear errors on input
  [phoneInput, addressInput].forEach(input => {
    if (!input) return;
    input.addEventListener('input', () => {
      const errEl = document.getElementById(`err-${input.id}`);
      if (errEl) errEl.classList.add('hidden');
      input.classList.remove('border-red-500', 'focus:border-red-500', 'focus:ring-red-200');
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let hasError = false;

    // Validate Phone (VN phone standard: 10 digits starting with 0)
    const phoneVal = phoneInput.value.trim().replace(/\s+/g, '');
    const phoneRegex = /^0[3|5|7|8|9][0-9]{8}$/;
    if (!phoneVal || !phoneRegex.test(phoneVal)) {
      showError('phone');
      hasError = true;
    }

    // Validate Store Address
    const addressVal = addressInput.value.trim();
    if (!addressVal || addressVal.length < 3) {
      showError('storeAddress');
      hasError = true;
    }

    if (hasError) return;

    // Collect data
    const leadData = {
      phone: phoneVal,
      storeAddress: addressVal,
      productInterest: document.getElementById('productInterest') ? document.getElementById('productInterest').value : 'all',
      submittedAt: new Date().toISOString(),
      lang: currentLang
    };

    // Show submitting state
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
      </svg>
      <span>Đang gửi thông tin...</span>
    `;

    // Process & store locally in localStorage (guaranteed real receipt)
    setTimeout(() => {
      try {
        const existingLeads = JSON.parse(localStorage.getItem('khongtienmat_leads') || '[]');
        existingLeads.push(leadData);
        localStorage.setItem('khongtienmat_leads', JSON.stringify(existingLeads));
      } catch (err) {
        console.error('Local storage save error:', err);
      }

      // Display success message
      if (successAlert) {
        successAlert.classList.remove('hidden');
        successAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      // Reset form
      form.reset();
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;

      if (window.lucide) {
        window.lucide.createIcons();
      }
    }, 600);
  });
}

function showError(fieldId) {
  const input = document.getElementById(fieldId);
  const errEl = document.getElementById(`err-${fieldId}`);
  if (input) {
    input.classList.add('border-red-500', 'focus:border-red-500', 'focus:ring-red-200');
    input.focus();
  }
  if (errEl) {
    errEl.classList.remove('hidden');
  }
}

/**
 * 4. Scrolled Navbar High Contrast
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
 * 5. Policy Modal Handler
 */
function initPolicyModal() {
  const modal = document.getElementById('policyModal');
  const closeBtn = document.getElementById('policyModalCloseBtn');
  const okBtn = document.getElementById('policyModalOkBtn');
  const bodyEl = document.getElementById('policyModalBody');
  const titleEl = document.getElementById('policyModalTitle');

  if (!modal) return;

  const openPolicy = (type) => {
    if (type === 'terms') {
      titleEl.textContent = 'Điều khoản dịch vụ khongtienmat.vn';
      bodyEl.innerHTML = `
        <p>1. <strong>Mục đích</strong>: khongtienmat.vn cung cấp thông tin và giải pháp nhận thanh toán không dùng tiền mặt (VietQR Pay, Loa thông báo, Phần mềm bán hàng, Máy POS) cho các cửa hàng và điểm bán lẻ tại Việt Nam.</p>
        <p>2. <strong>Tư vấn miễn phí</strong>: Đăng ký tư vấn trên website hoàn toàn miễn phí. Đội ngũ kinh doanh của Nexus Digital sẽ liên hệ trực tiếp để khảo sát và đề xuất gói trang bị phù hợp.</p>
        <p>3. <strong>Văn bản chính thức</strong>: Hợp đồng hợp tác và biểu phí cụ thể sẽ được ký kết chính thức bằng văn bản hoặc hợp đồng điện tử theo quy định của pháp luật trước khi bàn giao thiết bị.</p>
      `;
    } else {
      titleEl.textContent = 'Chính sách bảo mật thông tin';
      bodyEl.innerHTML = `
        <p>1. <strong>Thu thập thông tin</strong>: Hệ thống chỉ thu thập Số điện thoại và Địa chỉ cửa hàng do người dùng tự nguyện cung cấp phục vụ mục đích liên hệ tư vấn.</p>
        <p>2. <strong>Cam kết bảo mật</strong>: Nexus Digital tuân thủ Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân, cam kết không chia sẻ hoặc bán lại thông tin của bạn cho bên thứ ba vì mục đích quảng cáo.</p>
        <p>3. <strong>Yêu cầu chỉnh sửa/xóa</strong>: Quý khách có quyền yêu cầu tra soát hoặc xóa thông tin liên hệ bất cứ lúc nào qua email: operation@nexusdigital.vn.</p>
      `;
    }
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  };

  const closePolicy = () => {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  };

  document.querySelectorAll('.policy-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const type = link.getAttribute('data-type');
      openPolicy(type);
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closePolicy);
  if (okBtn) okBtn.addEventListener('click', closePolicy);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closePolicy();
  });
}
