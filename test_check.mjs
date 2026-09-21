import { translations } from './translations.js';
import fs from 'fs';

console.log('=== RUNNING KHONGTIENMAT TEST SUITE ===');

const html = fs.readFileSync('index.html', 'utf8');
const appJs = fs.readFileSync('app.js', 'utf8');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passed++;
  } else {
    console.error(`[FAIL] ${message}`);
    failed++;
  }
}

// 1. Check i18n key parity
const re = /data-i18n="([^"]+)"/g;
let m;
const foundKeys = new Set();
while ((m = re.exec(html)) !== null) {
  foundKeys.add(m[1]);
}

const langs = ['vi', 'en', 'zh', 'ko', 'th'];
for (const l of langs) {
  const missing = [];
  for (const k of foundKeys) {
    if (!translations[l] || typeof translations[l][k] === 'undefined') {
      missing.push(k);
    }
  }
  assert(missing.length === 0, `Language '${l}' has 100% key parity (${foundKeys.size} keys, missing: ${missing.length})`);
}

// 2. Check absence of unsubstantiated/fake claims
const bannedTerms = [
  'Sáng kiến Quốc gia',
  'Sáng kiến Chuyển đổi số & Thanh toán Quốc gia',
  'Phát triển bởi NAPAS',
  '50.000+',
  'tiền về 0 giây',
  'bảo hành trọn đời',
  '1900 xxxx',
  'trong vòng 15 phút',
  'trong vòng 24 giờ'
];

bannedTerms.forEach(term => {
  const lowerHtml = html.toLowerCase();
  const lowerApp = appJs.toLowerCase();
  const lowerTerm = term.toLowerCase();
  const inHtml = lowerHtml.includes(lowerTerm);
  const inApp = lowerApp.includes(lowerTerm);
  assert(!inHtml && !inApp, `Unsubstantiated claim absent: "${term}"`);
});

// 3. Check Logo Semantic Grouping: "khong" + "tienmat" (NOT "khongtien" + "mat")
assert(html.includes('khong</span><span class="nav-brand-suffix text-blue-600">tienmat</span>'), 'Logo semantic grouping "khong" + "tienmat" present');
assert(!html.includes('khongtien<span class="text-blue-600">mat</span>'), 'Old erroneous logo split "khongtien" + "mat" absent');

// 4. Check 4 Products Showcase
assert(html.includes('id="products"'), '4 Products section id="products" present');
assert(html.includes('standee-than-tai.png'), 'VietQR Pay authentic mica standee image present');
assert(html.includes('product-soundbox.jpg'), 'Loa thông báo product image present');
assert(html.includes('product-pos-app.jpg'), 'Phần mềm bán hàng product image present');
assert(html.includes('product-smart-pos.jpg'), 'Máy POS thanh toán product image present');
assert(html.includes('data-product="vietqr-pay"'), 'VietQR Pay detail button present');
assert(html.includes('data-product="soundbox"'), 'Soundbox detail button present');
assert(html.includes('data-product="pos-software"'), 'POS software detail button present');
assert(html.includes('data-product="smart-pos"'), 'Smart POS detail button present');

// 5. Check Product Detail Modal & Interactivity
assert(html.includes('id="productDetailModal"'), 'Product detail modal present in HTML');
assert(html.includes('id="btnModalRegisterThis"'), '"Đăng ký miễn phí sản phẩm này" button present in modal');
assert(appJs.includes('openProductModal'), 'openProductModal handler defined in app.js');
assert(appJs.includes('initProductDetailModal'), 'initProductDetailModal initialized in app.js');

// 6. Check Minimalist 2-Field Form
assert(html.includes('id="phone"'), 'Form contains phone field');
assert(html.includes('id="storeAddress"'), 'Form contains storeAddress field');
assert(html.includes('id="productInterest"'), 'Form contains productInterest selector');
assert(!html.includes('name="fullName"'), 'Old unnecessary fullName field absent');
assert(!html.includes('name="email"'), 'Old unnecessary email field absent');
assert(!html.includes('name="bank"'), 'Old unnecessary bank selector field absent');
assert(html.includes('Để lại số điện thoại và địa chỉ cửa hàng, đội ngũ kinh doanh sẽ liên hệ tư vấn.'), 'Form standard explanation line present');

// 7. Check 3-Step Process
assert(html.includes('id="process"'), 'Process section id="process" present');
assert(html.includes('Quy trình đăng ký 3 bước'), '3-Step process title present in HTML');

// 8. Check CTA "Đăng ký miễn phí"
assert(html.includes('Đăng ký miễn phí'), 'Primary CTA "Đăng ký miễn phí" present in HTML');

// 9. Check Policy Modal
assert(html.includes('id="policyModal"'), 'Policy modal present in HTML');
assert(appJs.includes('initPolicyModal'), 'Policy modal handler initialized in app.js');

console.log(`\n=== SUMMARY: ${passed} PASSED, ${failed} FAILED ===`);
if (failed > 0) process.exit(1);
