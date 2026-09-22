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

// 1. Check i18n key parity across 5 languages
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

// 4. Hero Section & Headline Line-Height Requirements
assert(html.includes('MIỄN PHÍ') && html.includes('text-red-600 font-black'), 'Hero headline highlights "MIỄN PHÍ" in bold red');
assert(html.includes('leading-[1.28]'), 'Headline line-height is 1.28-1.3 to prevent Vietnamese tone marks touching');
assert(html.includes('VietQR Pay, loa thông báo, phần mềm bán hàng và máy POS — lựa chọn giải pháp phù hợp cho cửa hàng của bạn.'), 'Hero subtitle updated with concise product overview');
assert(html.includes('Đăng ký miễn phí'), 'Primary CTA "Đăng ký miễn phí" present in Hero');

// 5. Check 4 Products Showcase & Badges
assert(html.includes('id="products"'), '4 Products section id="products" present');
assert(html.includes('standee-than-tai.png'), 'VietQR Pay authentic mica standee image present');
assert(html.includes('product-soundbox.png'), 'Loa thông báo product image present');
assert(html.includes('product-pos-app.png'), 'Phần mềm bán hàng product image present');
assert(html.includes('product-smart-pos.png'), 'Máy POS thanh toán product image present');
assert(html.includes('badgeFree'), 'data-i18n="badgeFree" present for products');
assert(html.includes('badgeFreePOS'), 'data-i18n="badgeFreePOS" present for Smart POS');
assert(html.includes('posConditionNote'), 'data-i18n="posConditionNote" present');
assert(html.includes('*Có điều kiện ký quỹ và sử dụng.'), 'POS condition note text present on card');

// 6. Check Section "Mạng lưới kết nối" (#network): Group 1 & Group 2 Marquees
assert(html.includes('id="network"'), 'Section id="network" present between #products and #process');
assert(html.includes('id="marquee-intl"'), 'Group 1 international marquee container present');
assert(html.includes('id="marquee-banks"'), 'Group 2 domestic banks marquee container present');

// Group 1: 12 Brands
const domesticPartners = ['MB Bank', 'Techcombank', 'VIB', 'VPBank'];
domesticPartners.forEach(bank => {
  assert(html.includes(bank), `Group 1 partner bank "${bank}" present`);
});
const intlNetworks = ['PromptPay', 'KHQR', 'LAPNet', 'NETS', 'GLN', 'Alipay+', 'UnionPay', 'WeChat Pay'];
intlNetworks.forEach(net => {
  assert(html.includes(net), `Group 1 international network "${net}" present`);
});
// Check Alipay+ and WeChat Pay prominence (1.5-1.8x larger visual size, h-10 to h-12 in h-14 to h-16 container)
assert(html.includes('h-14 sm:h-16 px-4 sm:px-6 transition-opacity hover:opacity-85" title="Alipay+"'), 'Alipay+ is prominent with large container in Group 1');
assert(html.includes('h-14 sm:h-16 px-4 sm:px-6 transition-opacity hover:opacity-85" title="WeChat Pay"'), 'WeChat Pay is prominent with large container in Group 1');

// Group 2: NAPAS Source Link & 56 Banks
assert(html.includes('https://napas.com.vn/dich-vu-cong-thanh-toan-truc-tuyen-napas-doi-tuong-khac'), 'NAPAS official source link present');
assert(html.includes('data-i18n="networkGroup2Source"'), 'NAPAS source translation attribute present');
const napasSampleBanks = ['vietcombank.png', 'vietinbank.png', 'bidv.png', 'agribank.png', 'sacombank.png', 'vikki.png', 'vcbneo.png', 'mbv.png', 'coopbank.png', 'vbsp.png'];
napasSampleBanks.forEach(b => {
  assert(html.includes(b), `NAPAS bank "${b}" present in Group 2 marquee`);
});
// Excluded finance companies from bank list
assert(!html.includes('vietcredit.png'), 'Finance company VietCredit excluded from bank list');
assert(!html.includes('tnex.png') && !html.includes('tnex-finance.png'), 'Finance company TNEX excluded from bank list');
assert(!html.includes('mirae.png') && !html.includes('mirae-asset.png'), 'Finance company Mirae Asset excluded from bank list');

// 7. Check Marquee Animation & Controls
assert(html.includes('animate-marquee-intl'), 'International marquee animation class present');
assert(html.includes('animate-marquee-banks'), 'Banks marquee animation class present');
assert(html.includes('btn-marquee-toggle'), 'Pause/Play toggle button present');
assert(appJs.includes('initMarqueeControls'), 'app.js initializes marquee controls');
assert(html.includes('prefers-reduced-motion'), 'Prefers-reduced-motion accessibility handled in CSS');

// 8. Check Prominent Hotline & Zalo Integration
assert(html.includes('0924.0934.61'), 'Hotline text 0924.0934.61 present');
assert(html.includes('tel:0924093461'), 'Clickable tel:0924093461 link present');
assert(html.includes('https://zalo.me/0924093461'), 'Zalo chat link https://zalo.me/0924093461 present');
assert(html.includes('id="floatingZalo"'), 'Desktop floating Zalo button present');
assert(html.includes('zalo.svg'), 'Official Zalo SVG icon present');

// 9. Check Short 3-Step Process (No repeated numbers)
assert(html.includes('id="process"'), 'Process section id="process" present');
assert(html.includes('Quy trình đăng ký 3 bước'), '3-Step process title present in HTML');
assert(html.includes('data-i18n="step1Title">Để lại thông tin</span>'), 'Step 1 title has NO "1." prefix in HTML');
assert(html.includes('data-i18n="step2Title">Nhận tư vấn</span>'), 'Step 2 title has NO "2." prefix in HTML');
assert(html.includes('data-i18n="step3Title">Nhận trang bị</span>'), 'Step 3 title has NO "3." prefix in HTML');
langs.forEach(lang => {
  assert(!translations[lang].step1Title.startsWith('1.'), `Language '${lang}' step 1 has no '1.' prefix`);
  assert(!translations[lang].step2Title.startsWith('2.'), `Language '${lang}' step 2 has no '2.' prefix`);
  assert(!translations[lang].step3Title.startsWith('3.'), `Language '${lang}' step 3 has no '3.' prefix`);
});

// 10. Check Enhanced 5-Field Registration Form
assert(html.includes('id="productInterest"'), 'Form contains productInterest selector (Field 1)');
assert(html.includes('id="fullName"'), 'Form contains fullName field (Field 2)');
assert(html.includes('id="phone"'), 'Form contains phone field (Field 3)');
assert(html.includes('id="storeName"'), 'Form contains storeName field (Field 4)');
assert(html.includes('id="storeAddress"'), 'Form contains storeAddress field (Field 5)');
assert(html.includes('grid grid-cols-1 sm:grid-cols-2 gap-4'), 'Desktop 2-column grid layout for short fields present');
assert(appJs.includes('fullNameVal') && appJs.includes('storeNameVal'), 'app.js validates and collects all 5 fields');
assert(html.includes('Để lại thông tin liên hệ và cửa hàng, đội ngũ kinh doanh sẽ tư vấn giải pháp phù hợp.'), 'Form introduction text updated');

// 11. Check Product Detail Modal & POS condition toggle
assert(html.includes('id="productDetailModal"'), 'Product detail modal present in HTML');
assert(html.includes('id="modalFreeBadge"'), 'Dynamic modalFreeBadge element present in modal');
assert(html.includes('id="modalPosCondition"'), 'Dynamic modalPosCondition container present in modal');
assert(html.includes('id="btnModalRegisterThis"'), '"Đăng ký miễn phí sản phẩm này" button present in modal');
assert(appJs.includes('modalPosCondition'), 'app.js toggles modalPosCondition based on product');
assert(appJs.includes('modalFreeBadge'), 'app.js updates modalFreeBadge based on product');

// 12. Check Policy Modal
assert(html.includes('id="policyModal"'), 'Policy modal present in HTML');
assert(appJs.includes('initPolicyModal'), 'Policy modal handler initialized in app.js');

// 13. Check Mobile Sticky Bottom Action Bar
assert(html.includes('sm:hidden fixed bottom-0'), 'Mobile sticky bottom bar present');
assert(html.includes('ctaRegisterFree'), 'Register CTA present on mobile sticky bar');

console.log(`\n=== SUMMARY: ${passed} PASSED, ${failed} FAILED ===`);
if (failed > 0) process.exit(1);
