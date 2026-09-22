import { translations } from './translations.js';
import fs from 'fs';

console.log('=== RUNNING KHONGTIENMAT GO-LIVE TEST SUITE ===');

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

// 4. Hero Section Go-Live Requirements
assert(html.includes('MIỄN PHÍ') && html.includes('text-red-600 font-black'), 'Hero headline highlights "MIỄN PHÍ" in bold red');
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

// 6. Check Section "Mạng lưới kết nối" (#network) with 12 Brands
assert(html.includes('id="network"'), 'Section id="network" present between #products and #process');
const domesticBanks = ['MB Bank', 'Techcombank', 'VIB', 'VPBank'];
domesticBanks.forEach(bank => {
  assert(html.includes(bank), `Domestic bank "${bank}" present in #network`);
});
const intlNetworks = ['PromptPay', 'KHQR', 'LAPNet', 'NETS', 'GLN', 'Alipay+', 'UnionPay', 'WeChat Pay'];
intlNetworks.forEach(net => {
  assert(html.includes(net), `International payment network "${net}" present in #network`);
});
// Check Alipay+ specifically (must include + symbol)
assert(html.includes('Alipay<tspan fill="#1677FF" font-weight="900">+</tspan>') || html.includes('Alipay+'), 'Alipay+ logo explicitly contains "+" symbol');
// Check WeChat Pay
assert(html.includes('WeChat') && html.includes('Pay'), 'WeChat Pay logo present');

// 7. Check Prominent Hotline: 0924.0934.61 (Navbar, Register, Footer, no duplicate in Hero)
assert(html.includes('0924.0934.61'), 'Hotline text 0924.0934.61 present');
assert(html.includes('tel:0924093461'), 'Clickable tel:0924093461 link present');
assert(html.includes('nav-hotline'), 'Hotline present in Navbar');
assert(html.includes('id="register"') && html.includes('0924.0934.61'), 'Hotline present in Register form section');
assert(html.includes('<footer') && html.includes('0924.0934.61'), 'Hotline present in Footer');
assert(!html.includes('quickConsult'), 'Redundant Hero hotline under CTA button removed');

// 8. Check Streamlined Layout Requirements
assert(html.includes('grid-cols-2 lg:grid-cols-4'), 'Products grid is 2x2 on mobile and 4 cols on desktop');
assert(!html.includes('productsHeading'), 'Redundant section heading in #products removed');
assert(!html.includes('heroSecondary'), 'Redundant secondary button in Hero removed');
assert(html.includes('product-clickable'), 'Product card image and title are keyboard & click accessible');
assert(appJs.includes('.product-clickable'), 'app.js binds clicks & keys to .product-clickable');
assert(html.includes('Nhận thanh toán qua mã QR.'), 'VietQR Pay 1-sentence benefit present');
assert(html.includes('Nghe thông báo khi tiền về.'), 'Loa thông báo 1-sentence benefit present');
assert(html.includes('Quản lý đơn hàng, hàng hóa và doanh thu.'), 'Phần mềm bán hàng 1-sentence benefit present');
assert(html.includes('Nhận thanh toán bằng thẻ và chạm.'), 'Máy POS 1-sentence benefit present');

// 9. Check Clean Logo Strip (#network) without Box Frames or Active Borders
assert(!html.includes('border-2 border-blue-400'), 'Alipay+ has no active-state blue border');
assert(!html.includes('border-2 border-emerald-400'), 'WeChat Pay has no active-state emerald border');
assert(!html.includes('min-h-[96px]'), 'Individual boxed card frames removed from logo section');

// 10. Check Short 3-Step Process
assert(html.includes('id="process"'), 'Process section id="process" present');
assert(html.includes('Quy trình đăng ký 3 bước'), '3-Step process title present in HTML');
assert(html.includes('1. Để lại thông tin'), 'Step 1 title present');
assert(html.includes('2. Nhận tư vấn'), 'Step 2 title present');
assert(html.includes('3. Nhận trang bị'), 'Step 3 title present');

// 11. Check Product Detail Modal & POS condition toggle
assert(html.includes('id="productDetailModal"'), 'Product detail modal present in HTML');
assert(html.includes('id="modalFreeBadge"'), 'Dynamic modalFreeBadge element present in modal');
assert(html.includes('id="modalPosCondition"'), 'Dynamic modalPosCondition container present in modal');
assert(html.includes('id="btnModalRegisterThis"'), '"Đăng ký miễn phí sản phẩm này" button present in modal');
assert(appJs.includes('modalPosCondition'), 'app.js toggles modalPosCondition based on product');
assert(appJs.includes('modalFreeBadge'), 'app.js updates modalFreeBadge based on product');

// 12. Check Minimalist 2-Field Form
assert(html.includes('id="phone"'), 'Form contains phone field');
assert(html.includes('id="storeAddress"'), 'Form contains storeAddress field');
assert(html.includes('id="productInterest"'), 'Form contains productInterest selector');
assert(!html.includes('name="fullName"'), 'Old unnecessary fullName field absent');
assert(!html.includes('name="email"'), 'Old unnecessary email field absent');
assert(!html.includes('name="bank"'), 'Old unnecessary bank selector field absent');

// 13. Check Policy Modal
assert(html.includes('id="policyModal"'), 'Policy modal present in HTML');
assert(appJs.includes('initPolicyModal'), 'Policy modal handler initialized in app.js');

console.log(`\n=== SUMMARY: ${passed} PASSED, ${failed} FAILED ===`);
if (failed > 0) process.exit(1);
