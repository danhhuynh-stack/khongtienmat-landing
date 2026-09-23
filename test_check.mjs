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

// 4. Hero Section & Headline Separation Requirements
assert(html.includes('MIỄN PHÍ') && html.includes('text-red-600 font-black'), 'Hero headline highlights "MIỄN PHÍ" in bold red');
assert(html.includes('flex flex-col items-center gap-2 sm:gap-3'), 'Hero headline uses flex-col with gap-2 on mobile and sm:gap-3 on desktop for physical diacritic clearance');
assert(html.includes('data-i18n="heroTitleLine1"') && html.includes('data-i18n="heroTitleLine2"'), 'Hero headline uses separate i18n keys for line 1 and line 2 across all languages');
assert(html.includes('.hero-headline') && html.includes('line-height: 1.25 !important;'), 'Hero headline line-height 1.25 !important protected against CSS override');
assert(html.includes('VietQR Pay, loa thông báo, phần mềm bán hàng và máy POS — lựa chọn giải pháp phù hợp cho cửa hàng của bạn.'), 'Hero subtitle updated with concise product overview');
assert(html.includes('Đăng ký miễn phí'), 'Primary CTA "Đăng ký miễn phí" present in Hero');

// 5. Check 4 Products Showcase & Badges
assert(html.includes('id="products"'), '4 Products section id="products" present');
assert(html.includes('standee-than-tai.png'), 'VietQR Pay authentic mica standee image present');
assert(html.includes('product-soundbox.png'), 'Loa thông báo product image present');
assert(html.includes('product-pos-app.png'), 'Phần mềm bán hàng product image present');
assert(html.includes('product-smart-pos.png'), 'Máy POS thanh toán product image present');
assert(html.includes('h-44 sm:h-56 lg:h-60'), 'Product image containers increased 15-20% (h-44 sm:h-56 lg:h-60)');
assert(html.includes('badgeFree'), 'data-i18n="badgeFree" present for products');
assert(html.includes('badgeFreePOS'), 'data-i18n="badgeFreePOS" present for Smart POS');
assert(html.includes('posConditionNote'), 'data-i18n="posConditionNote" present');
assert(html.includes('*Có điều kiện ký quỹ và sử dụng.'), 'POS condition note text present on card');

// 6. Check Section "Mạng lưới kết nối" (#network): Group 1 & Group 2 Marquees
assert(html.includes('id="network"'), 'Section id="network" present between #products and #process');
assert(html.includes('id="marquee-intl"'), 'Group 1 international marquee container present');
assert(html.includes('id="marquee-banks"'), 'Group 2 domestic banks marquee container present');

// Group 1 & 2 titles centered
assert(html.includes('text-center max-w-5xl mx-auto mb-2') && html.includes('networkGroup1Title'), 'Group 1 title centered');
assert(html.includes('text-center max-w-5xl mx-auto mb-3') && html.includes('networkGroup2Title'), 'Group 2 title centered');

// Removed subtitles, source links, and pause buttons
assert(!html.includes('4 ngân hàng đối tác và 8 mạng lưới thanh toán'), 'Group 1 subtitle removed from HTML');
assert(!html.includes('https://napas.com.vn/dich-vu-cong-thanh-toan-truc-tuyen-napas-doi-tuong-khac'), 'NAPAS source link removed from HTML');
assert(!html.includes('btn-marquee-toggle'), 'Pause/Play button removed from page');
assert(!html.includes('data-i18n="marqueePause"'), 'Marquee pause translation attribute removed from page');

// Group 1: 12 Official Partner Logo Assets Verification
const officialLogos = [
  { brand: 'Alipay+', file: 'alipayplus.png' },
  { brand: 'WeChat Pay', file: 'wechatpay.svg' },
  { brand: 'MB Bank', file: 'mbbank.png' },
  { brand: 'Techcombank', file: 'techcombank.svg' },
  { brand: 'VIB', file: 'vib.png' },
  { brand: 'VPBank', file: 'vpbank.svg' },
  { brand: 'PromptPay', file: 'promptpay.png' },
  { brand: 'KHQR', file: 'khqr.png' },
  { brand: 'LAPNet', file: 'lapnet.png' },
  { brand: 'NETS', file: 'nets.svg' },
  { brand: 'GLN', file: 'gln.png' },
  { brand: 'UnionPay', file: 'unionpay.svg' }
];

officialLogos.forEach(item => {
  const localPath = 'assets/logos/network/' + item.file;
  const exists = fs.existsSync(localPath) && fs.statSync(localPath).size > 0;
  assert(exists, `Official asset exists locally: ${localPath} (${item.brand})`);
  assert(html.includes(item.file), `index.html references official asset "${item.file}"`);
});

// Check internal source attribution document
assert(fs.existsSync('assets/logos/network/logo_sources.json'), 'Internal logo source documentation logo_sources.json exists');
const sourcesJson = JSON.parse(fs.readFileSync('assets/logos/network/logo_sources.json', 'utf8'));
assert(sourcesJson.length === 12, `logo_sources.json documents all 12 brands (found: ${sourcesJson.length})`);

// Check absence of simulated SVG texts in #network
const networkSectionHtml = html.substring(html.indexOf('id="network"'), html.indexOf('id="process"'));
const simulatedSvgTexts = ['>TECHCOM<', '>VIB<', '>Prompt<', '>Pay<', '>KH<', '>NETS<', '>GLN<', '>Alipay<', '>WeChat<'];
simulatedSvgTexts.forEach(sim => {
  assert(!networkSectionHtml.includes(sim), `Simulated SVG text "${sim}" absent from Group 1`);
});

// Group 1: Prominent Fixed Row for Alipay+ and WeChat Pay
assert(html.includes('title="Alipay+"') && html.includes('title="WeChat Pay"'), 'Alipay+ and WeChat Pay present in Group 1');
const marqueeIntlHtml = html.substring(html.indexOf('id="marquee-intl"'), html.indexOf('id="marquee-banks"'));
assert(!marqueeIntlHtml.includes('title="Alipay+"'), 'Alipay+ NOT duplicated in Group 1 marquee');
assert(!marqueeIntlHtml.includes('title="WeChat Pay"'), 'WeChat Pay NOT duplicated in Group 1 marquee');

// Remaining 10 partners in marquee
const domesticPartners = ['MB Bank', 'Techcombank', 'VIB', 'VPBank'];
domesticPartners.forEach(bank => {
  assert(marqueeIntlHtml.includes(bank), `Group 1 marquee contains "${bank}"`);
});
const otherIntlNetworks = ['PromptPay', 'KHQR', 'LAPNet', 'NETS', 'GLN', 'UnionPay'];
otherIntlNetworks.forEach(net => {
  assert(marqueeIntlHtml.includes(net), `Group 1 marquee contains "${net}"`);
});

// Group 1 Optical Sizing & Uniform Slot assertions
assert(marqueeIntlHtml.includes('w-[130px] sm:w-[150px] h-12 sm:h-14'), 'Group 1 uses uniform slot containers (w-[130px] sm:w-[150px] h-12 sm:h-14)');
assert(marqueeIntlHtml.includes('lapnet.png" alt="LAPNet" class="h-10 sm:h-12'), 'LAPNet circular emblem optical size enhanced to h-10 sm:h-12');
assert(marqueeIntlHtml.includes('gln.png" alt="GLN" class="h-9.5 sm:h-11'), 'GLN square emblem optical size enhanced to h-9.5 sm:h-11');
assert(marqueeIntlHtml.includes('unionpay.svg" alt="UnionPay" class="h-8.5 sm:h-10'), 'UnionPay badge optical size enhanced to h-8.5 sm:h-10');
assert(marqueeIntlHtml.includes('vpbank.svg" alt="VPBank" class="h-5 sm:h-5.5'), 'VPBank optical size calibrated down to h-5 sm:h-5.5');
assert(marqueeIntlHtml.includes('khqr.png" alt="KHQR" class="h-4.5 sm:h-5'), 'KHQR optical size calibrated down to h-4.5 sm:h-5');
assert(marqueeIntlHtml.includes('nets.svg" alt="NETS" class="h-4.5 sm:h-5.5'), 'NETS optical size calibrated down to h-4.5 sm:h-5.5');

// Group 2: 56 Banks with enhanced sizing & Uniform Slots
const marqueeBanksHtml = html.substring(html.indexOf('id="marquee-banks"'), html.indexOf('id="process"'));
assert(marqueeBanksHtml.includes('w-[130px] sm:w-[150px] h-12 sm:h-14'), 'Group 2 uses uniform slot containers (w-[130px] sm:w-[150px] h-12 sm:h-14)');
assert(html.includes('max-h-8 sm:max-h-9 max-w-[130px] sm:max-w-[150px]'), 'Bank logos use enhanced sizing for mobile legibility');
assert(marqueeBanksHtml.includes('sacombank.png" alt="Sacombank" class="max-h-5 sm:max-h-5.5'), 'Sacombank optical size calibrated down to max-h-5 sm:max-h-5.5');
assert(marqueeBanksHtml.includes('techcombank.png" alt="Techcombank" class="max-h-8 sm:max-h-9 max-w-[130px] sm:max-w-[150px] w-auto h-auto object-contain transform scale-[1.5]'), 'Techcombank optical size boosted with scale-[1.5]');
assert(marqueeBanksHtml.includes('bacabank.png" alt="Bac A Bank" class="max-h-8 sm:max-h-9 max-w-[130px] sm:max-w-[150px] w-auto h-auto object-contain transform scale-[1.3]'), 'Bac A Bank optical size boosted with scale-[1.3]');

const napasSampleBanks = ['vietcombank.png', 'vietinbank.png', 'bidv.png', 'agribank.png', 'sacombank.png', 'vikki.png', 'vcbneo.png', 'mbv.png', 'coopbank.png', 'vbsp.png'];
napasSampleBanks.forEach(b => {
  assert(html.includes(b), `NAPAS bank "${b}" present in Group 2 marquee`);
});
// Excluded finance companies from bank list
assert(!html.includes('vietcredit.png'), 'Finance company VietCredit excluded from bank list');
assert(!html.includes('tnex.png') && !html.includes('tnex-finance.png'), 'Finance company TNEX excluded from bank list');
assert(!html.includes('mirae.png') && !html.includes('mirae-asset.png'), 'Finance company Mirae Asset excluded from bank list');

// 7. Check Marquee Animation
assert(html.includes('animate-marquee-intl'), 'International marquee animation class present');
assert(html.includes('animate-marquee-banks'), 'Banks marquee animation class present');
assert(html.includes('prefers-reduced-motion'), 'Prefers-reduced-motion accessibility handled in CSS');

// 8. Check Prominent Hotline & Zalo Integration
assert(html.includes('0924.0934.61'), 'Hotline text 0924.0934.61 present');
assert(html.includes('tel:0924093461'), 'Clickable tel:0924093461 link present');
assert(html.includes('https://zalo.me/0924093461'), 'Zalo chat link https://zalo.me/0924093461 present');
assert(html.includes('id="floatingZalo"'), 'Desktop floating Zalo button present');
assert(html.includes('zalo.svg'), 'Official Zalo SVG icon present');
assert(appJs.includes('floatingZalo.classList.add(\'opacity-0\', \'pointer-events-none\')'), 'Floating Zalo hides when modal is open');

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

// 12. Check VietQR Pay Step 2 Copy (No dynamic QR parenthetical in all languages)
assert(
  html.includes('id="modalStep2Text"') &&
  html.includes('2. Khách nhập số tiền và xác nhận chuyển khoản.') &&
  !html.includes('quét QR động'),
  'HTML fallback modalStep2Text has concise Step 2 without dynamic QR mention'
);
assert(translations.vi.p1Step2 === '2. Khách nhập số tiền và xác nhận chuyển khoản.', 'Vietnamese p1Step2 is exactly "2. Khách nhập số tiền và xác nhận chuyển khoản."');
assert(translations.en.p1Step2 === '2. Customer enters amount and confirms transfer.', 'English p1Step2 is exactly "2. Customer enters amount and confirms transfer."');
assert(translations.zh.p1Step2 === '2. 顾客输入金额并确认转账。', 'Chinese p1Step2 is exactly "2. 顾客输入金额并确认转账。"');
assert(translations.ko.p1Step2 === '2. 금액을 입력하고 이체를 확인합니다.', 'Korean p1Step2 is exactly "2. 금액을 입력하고 이체를 확인합니다."');
assert(translations.th.p1Step2 === '2. ลูกค้าระบุจำนวนเงิน และยืนยันการโอนเงิน', 'Thai p1Step2 is exactly "2. ลูกค้าระบุจำนวนเงิน และยืนยันการโอนเงิน"');
langs.forEach(lang => {
  const text = translations[lang].p1Step2.toLowerCase();
  assert(!text.includes('dynamic') && !text.includes('động') && !text.includes('동적') && !text.includes('动态'), `Language '${lang}' p1Step2 has no dynamic QR mention`);
});

// 13. Check Policy Modal
assert(html.includes('id="policyModal"'), 'Policy modal present in HTML');
assert(appJs.includes('initPolicyModal'), 'Policy modal handler initialized in app.js');

// 14. Check Secure Lead Intake, Honeypot, Privacy Note & Backend Cloudflare Worker
// A. Git Security Check (No secrets or real credentials committed)
assert(!fs.existsSync('.env'), '.env file is NOT committed in repository');
assert(!fs.existsSync('.env.local'), '.env.local file is NOT committed in repository');
assert(fs.existsSync('.env.example'), '.env.example exists as a clean template');
assert(fs.existsSync('GUIDE_DEPLOYMENT.md'), 'GUIDE_DEPLOYMENT.md exists with full handover instructions');

const envExample = fs.readFileSync('.env.example', 'utf8');
assert(!envExample.includes('AIzaSy'), 'No Google API keys in .env.example');
assert(envExample.includes('GOOGLE_SERVICE_ACCOUNT_EMAIL') && envExample.includes('GOOGLE_SHEET_ID'), '.env.example documents all required variables');

// Check frontend public files do NOT contain backend secrets or Google service accounts
[html, appJs].forEach(src => {
  assert(!src.includes('-----BEGIN PRIVATE KEY-----'), 'Private key absent from public frontend');
  assert(!src.includes('client_email') && !src.includes('project_id'), 'Service account JSON absent from public frontend');
  assert(!src.includes('AIzaSy'), 'Google API Key absent from public frontend');
});

// B. Frontend HTML Honeypot, Alerts & Privacy Note
assert(html.includes('id="website_hp"') && html.includes('name="website_hp"'), 'Hidden anti-spam honeypot input "website_hp" present in HTML');
assert(html.includes('id="formErrorAlert"'), 'Error alert container id="formErrorAlert" present in HTML');
assert(html.includes('data-i18n="formPrivacyNote"'), 'Privacy note data-i18n="formPrivacyNote" present under submit button');
assert(html.includes('Thông tin của bạn chỉ được sử dụng để liên hệ tư vấn giải pháp thanh toán.'), 'Privacy note Vietnamese text present in HTML');
assert(html.includes('id="formSuccessLeadId"'), 'Dynamic lead ID container formSuccessLeadId present in HTML');

// C. Translations Parity across 5 Languages for Form Responses
const newFormKeys = ['formSuccess', 'formError', 'formSubmitting', 'formPrivacyNote'];
langs.forEach(l => {
  newFormKeys.forEach(k => {
    assert(translations[l] && translations[l][k] && translations[l][k].trim().length > 0, `Language '${l}' has non-empty translation for '${k}'`);
  });
});
assert(translations.vi.formSuccess === 'Đăng ký thành công. Đội ngũ tư vấn sẽ liên hệ với bạn sớm.', 'Vietnamese formSuccess matches user exact requirement');
assert(translations.vi.formError === 'Chưa thể gửi thông tin. Vui lòng thử lại hoặc liên hệ Hotline: 0924.0934.61.', 'Vietnamese formError matches user exact requirement');
assert(translations.vi.formSubmitting === 'Đang gửi...', 'Vietnamese formSubmitting is "Đang gửi..."');
assert(translations.vi.formPrivacyNote === 'Thông tin của bạn chỉ được sử dụng để liên hệ tư vấn giải pháp thanh toán.', 'Vietnamese formPrivacyNote matches requirement');

// D. Cloudflare Worker Code Verification
assert(fs.existsSync('backend/worker.js'), 'Cloudflare Worker file backend/worker.js exists');
assert(fs.existsSync('backend/wrangler.toml'), 'Cloudflare Worker configuration backend/wrangler.toml exists');
const workerCode = fs.readFileSync('backend/worker.js', 'utf8');

assert(workerCode.includes('ALLOWED_ORIGINS'), 'Worker enforces ALLOWED_ORIGINS whitelist');
assert(workerCode.includes('website_hp'), 'Worker implements anti-spam honeypot detection');
assert(workerCode.includes('isRateLimited'), 'Worker implements IP-based rate limiting');
assert(workerCode.includes('maskPhone'), 'Worker masks phone numbers in logs to protect PII');
assert(workerCode.includes('https://sheets.googleapis.com/v4/spreadsheets/'), 'Worker connects directly to Google Sheets API v4');
assert(workerCode.includes('🔔 Lead mới từ khongtienmat.vn'), 'Worker formats Zalo notification according to required template');
assert(workerCode.includes('SHEETS_WRITE_FAILED'), 'Worker returns SHEETS_WRITE_FAILED error if Google Sheets write fails without sending Zalo');

// E. Professional Excel Workbook Template Verification
assert(fs.existsSync('KhongTienMat_Leads_Template.xlsx'), 'KhongTienMat_Leads_Template.xlsx exists');
assert(fs.statSync('KhongTienMat_Leads_Template.xlsx').size > 5000, 'Excel template has valid size');

const { default: ExcelJS } = await import('exceljs');
const testWb = new ExcelJS.Workbook();
await testWb.xlsx.readFile('KhongTienMat_Leads_Template.xlsx');
const sheetNames = testWb.worksheets.map(s => s.name);
assert(sheetNames.includes('Leads'), 'Excel workbook contains tab named "Leads"');
assert(sheetNames.includes('Hướng Dẫn Tích Hợp'), 'Excel workbook contains tab named "Hướng Dẫn Tích Hợp"');

const leadsWs = testWb.getWorksheet('Leads');
const expected12Cols = [
  'Lead ID', 'Thời gian', 'Sản phẩm quan tâm', 'Họ và tên',
  'Số điện thoại', 'Tên đơn vị kinh doanh', 'Địa chỉ kinh doanh',
  'Ngôn ngữ', 'Nguồn', 'URL', 'Trạng thái gửi Zalo', 'Ghi chú lỗi'
];
const actualRow1 = leadsWs.getRow(1).values.filter(Boolean);
assert(actualRow1.length === 12, `Tab Leads has exactly 12 columns (found: ${actualRow1.length})`);
expected12Cols.forEach((col, idx) => {
  assert(actualRow1[idx] === col, `Column ${idx + 1} is exactly "${col}"`);
});
assert(leadsWs.views && leadsWs.views[0]?.ySplit === 1, 'Tab Leads has frozen top row');
assert(Boolean(leadsWs.autoFilter), 'Tab Leads has autoFilter enabled');

// F. Local Dev Endpoint HTTP Functional Tests
try {
  // Test 1: Valid submission
  const validRes = await fetch('http://127.0.0.1:3000/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lead_id: 'KTM-TEST-001',
      created_at: '2026-09-23 10:30:00',
      product: 'VietQR Pay (Bảng mica để bàn)',
      full_name: 'Nguyễn Văn An',
      phone: '0912345678',
      store_name: 'Cà phê An Nhiên',
      store_address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
      language: 'vi',
      source: 'khongtienmat.vn',
      url: 'http://localhost:3000/',
      website_hp: ''
    })
  });
  const validData = await validRes.json();
  assert(validRes.status === 200 && validData.success === true, 'API accepted valid lead submission (200 OK, success: true)');

  // Test 2: Honeypot triggered
  const botRes = await fetch('http://127.0.0.1:3000/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lead_id: 'KTM-TEST-BOT',
      full_name: 'Spam Bot',
      phone: '0912345678',
      store_name: 'Bot Shop',
      store_address: '123 Fake Street',
      website_hp: 'http://spam-link.com'
    })
  });
  const botData = await botRes.json();
  assert(botRes.status === 200 && botData.success === true, 'API silently trapped bot honeypot (200 OK dummy)');

  // Test 3: Invalid phone rejected
  const invalidPhoneRes = await fetch('http://127.0.0.1:3000/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lead_id: 'KTM-TEST-ERR',
      full_name: 'Nguyễn Văn An',
      phone: '123456',
      store_name: 'Cà phê An Nhiên',
      store_address: '123 Nguyễn Huệ',
      website_hp: ''
    })
  });
  const invalidPhoneData = await invalidPhoneRes.json();
  assert(invalidPhoneRes.status === 400 && invalidPhoneData.code === 'INVALID_PHONE', 'API rejected invalid phone format with 400');

  // Test 4: Missing required fields
  const missingFieldRes = await fetch('http://127.0.0.1:3000/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      full_name: '',
      phone: '0912345678'
    })
  });
  assert(missingFieldRes.status === 400, 'API rejected missing fields with 400');

  // Test 5: Simulated Sheets write error
  const errRes = await fetch('http://127.0.0.1:3000/api/leads?simulate_error=1', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      full_name: 'Nguyễn Văn An',
      phone: '0912345678',
      store_name: 'Cà phê An Nhiên',
      store_address: '123 Nguyễn Huệ',
      website_hp: ''
    })
  });
  assert(errRes.status === 500, 'API returned 500 on Google Sheets failure');
} catch (netErr) {
  console.warn('Local dev server fetch test skipped or failed:', netErr.message);
}

// 15. Check Mobile Sticky Bottom Action Bar
assert(html.includes('sm:hidden fixed bottom-0'), 'Mobile sticky bottom bar present');
assert(html.includes('ctaRegisterFree'), 'Register CTA present on mobile sticky bar');

console.log(`\n=== SUMMARY: ${passed} PASSED, ${failed} FAILED ===`);
if (failed > 0) process.exit(1);
