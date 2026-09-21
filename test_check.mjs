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
  '40+ ngân hàng',
  '6+ quốc gia',
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

// 3. Check presence of merchant-centric headline & buttons
assert(html.includes('Nhận thanh toán QR thuận tiện cho cửa hàng'), 'Merchant-centric hero title present in HTML');
assert(html.includes('Đăng ký tư vấn'), 'Primary button "Đăng ký tư vấn" present in HTML');
assert(html.includes('Xem cách hoạt động'), 'Secondary button "Xem cách hoạt động" present in HTML');
assert(html.includes('Mô phỏng — không dùng để thanh toán'), 'QR standee simulation disclaimer present');
assert(html.includes('Tỷ giá minh họa'), 'FX illustrative rate disclaimer present');

// 4. Check form fields & validation markup
assert(html.includes('name="fullName"'), 'Form contains fullName field');
assert(html.includes('name="phone"'), 'Form contains phone field');
assert(html.includes('name="storeName"'), 'Form contains storeName field');
assert(html.includes('name="city"'), 'Form contains city field');
assert(html.includes('id="err-fullName"'), 'Form contains inline error element for fullName');
assert(html.includes('id="err-phone"'), 'Form contains inline error element for phone');
assert(html.includes('id="err-storeName"'), 'Form contains inline error element for storeName');
assert(html.includes('id="err-city"'), 'Form contains inline error element for city');

// 5. Check Navigation & Accessibility
assert(html.includes('id="mainNavbar"'), 'Navbar has id="mainNavbar"');
assert(html.includes('#mainNavbar.scrolled'), 'Navbar high-contrast scrolled CSS present in style');
assert(html.includes('aria-expanded'), 'Mobile menu button has aria-expanded');
assert(html.includes('aria-label'), 'Mobile menu has aria-label');
assert(html.includes('scroll-mt-24'), 'Sections have scroll-mt-24 for sticky navbar offset');
assert(html.includes('scroll-padding-top'), 'HTML has scroll-padding-top for in-page anchors');

// 6. Check Policy Modal
assert(html.includes('id="policyModal"'), 'Policy modal dialog present in HTML');
assert(appJs.includes('initPolicyModal'), 'Policy modal handler initialized in app.js');

console.log(`\n=== SUMMARY: ${passed} PASSED, ${failed} FAILED ===`);
if (failed > 0) process.exit(1);
