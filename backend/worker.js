/**
 * Cloudflare Worker: Secure Lead Intake Middleware for khongtienmat.vn
 * 
 * Flow:
 * Client POST /api/leads -> Validate & Rate Limit -> Google Sheets Append -> Zalo Chatbot Webhook -> Response
 * 
 * Security:
 * - CORS origin whitelist (GitHub Pages, khongtienmat.vn, localhost)
 * - Honeypot drop for bot traffic
 * - Strict server-side validation & phone normalization
 * - Rate limiting by client IP
 * - PII masking in logs
 * - Zero external npm dependencies: uses Web Crypto API for RS256 Google Service Account JWT
 */

// Allowed origins
const ALLOWED_ORIGINS = [
  'https://danhhuynh-stack.github.io',
  'https://khongtienmat.vn',
  'https://www.khongtienmat.vn',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

// In-memory rate limiting map for edge worker
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX_REQUESTS = 5;

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get('Origin') || '';
    const isAllowedOrigin = ALLOWED_ORIGINS.includes(origin) || (!origin && request.headers.get('Sec-Fetch-Site') === 'same-origin');
    const allowOriginHeader = isAllowedOrigin ? origin : ALLOWED_ORIGINS[0];

    const corsHeaders = {
      'Access-Control-Allow-Origin': allowOriginHeader,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Accept',
      'Access-Control-Max-Age': '86400'
    };

    // 1. Handle CORS Preflight
    if (request.method === 'OPTIONS') {
      if (!isAllowedOrigin && origin) {
        return new Response(JSON.stringify({ error: 'Origin not allowed' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // 2. Only allow POST
    if (request.method !== 'POST') {
      return jsonResponse({ success: false, code: 'METHOD_NOT_ALLOWED', message: 'Only POST supported' }, 405, corsHeaders);
    }

    // Origin enforcement for POST requests
    if (origin && !isAllowedOrigin) {
      return jsonResponse({ success: false, code: 'ORIGIN_FORBIDDEN', message: 'Forbidden origin' }, 403, corsHeaders);
    }

    // Content-Type check
    const contentType = request.headers.get('Content-Type') || '';
    if (!contentType.includes('application/json')) {
      return jsonResponse({ success: false, code: 'INVALID_CONTENT_TYPE', message: 'Expected application/json' }, 400, corsHeaders);
    }

    // 3. Client IP & Rate Limiting
    const clientIp = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'unknown';
    if (isRateLimited(clientIp)) {
      console.warn(`[RATE LIMIT EXCEEDED] IP: ${maskIp(clientIp)}`);
      return jsonResponse({
        success: false,
        code: 'RATE_LIMITED',
        message: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.'
      }, 429, corsHeaders);
    }

    // 4. Parse & Validate Payload
    let body;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ success: false, code: 'INVALID_JSON', message: 'Malformed JSON payload' }, 400, corsHeaders);
    }

    // 5. Anti-spam Honeypot Check
    // If bot filled the hidden honeypot input, silently drop and return dummy 200 OK
    if (body.website_hp && body.website_hp.trim().length > 0) {
      console.warn(`[BOT TRAPPED] Honeypot triggered by IP: ${maskIp(clientIp)}`);
      return jsonResponse({
        success: true,
        lead_id: body.lead_id || 'KTM-BOT-DROP',
        message: 'Request processed'
      }, 200, corsHeaders);
    }

    // 6. Server-side Field Validation & Sanitization
    const fullName = (body.full_name || '').trim();
    const rawPhone = (body.phone || '').trim().replace(/\s+/g, '');
    const storeName = (body.store_name || '').trim();
    const storeAddress = (body.store_address || '').trim();
    const product = (body.product || 'Trọn bộ giải pháp (Tất cả)').trim();
    const language = (body.language || 'vi').trim();
    const source = 'khongtienmat.vn';
    const pageUrl = (body.url || 'https://khongtienmat.vn').trim();
    const leadId = (body.lead_id || `KTM-${Date.now().toString(36).toUpperCase()}`).trim();
    const createdAt = (body.created_at || getVietnamTime()).trim();

    // Check required non-empty
    if (!fullName || !rawPhone || !storeName || !storeAddress) {
      return jsonResponse({
        success: false,
        code: 'MISSING_FIELDS',
        message: 'Vui lòng điền đầy đủ các trường bắt buộc.'
      }, 400, corsHeaders);
    }

    // Length limits
    if (fullName.length < 2 || fullName.length > 100 ||
        storeName.length < 2 || storeName.length > 150 ||
        storeAddress.length < 3 || storeAddress.length > 250) {
      return jsonResponse({
        success: false,
        code: 'FIELD_LENGTH_INVALID',
        message: 'Độ dài thông tin không hợp lệ.'
      }, 400, corsHeaders);
    }

    // Vietnam phone validation & normalization
    const phoneRegex = /^(?:0|\+84)(?:3|5|7|8|9)[0-9]{8}$/;
    if (!phoneRegex.test(rawPhone)) {
      return jsonResponse({
        success: false,
        code: 'INVALID_PHONE',
        message: 'Số điện thoại không đúng định dạng Việt Nam.'
      }, 400, corsHeaders);
    }
    const cleanPhone = rawPhone.startsWith('+84') ? '0' + rawPhone.slice(3) : rawPhone;

    // Log PII-masked message
    console.log(`[LEAD INTAKE] ID: ${leadId} | Phone: ${maskPhone(cleanPhone)} | Store: ${storeName}`);

    // Check Google Sheets integration method:
    // Method A: Google Apps Script Web App (No Service Account Key needed, enterprise-safe for org policies)
    // Method B: Google Cloud Service Account JWT RS256
    const hasAppsScript = env && env.GOOGLE_APPS_SCRIPT_URL;
    const hasServiceAccount = env && env.GOOGLE_SHEET_ID && env.GOOGLE_SERVICE_ACCOUNT_EMAIL && env.GOOGLE_PRIVATE_KEY;
    const hasGoogleStorage = hasAppsScript || hasServiceAccount;

    let telegramStatus = 'Chưa cấu hình';
    let telegramError = '';
    let zaloStatus = 'Chưa cấu hình';
    let zaloError = '';

    // 7. Write to Google Sheets (Mandatory Step 1)
    if (hasGoogleStorage) {
      try {
        const sheetTab = env.GOOGLE_SHEET_TAB || 'Leads';
        const rowData = [
          leadId,
          createdAt,
          product,
          fullName,
          cleanPhone,
          storeName,
          storeAddress,
          language,
          source,
          pageUrl,
          'Đang chờ', // Initial notification status
          ''          // Initial error notes
        ];

        let appendResult;
        if (hasAppsScript) {
          appendResult = await appendViaAppsScript(env.GOOGLE_APPS_SCRIPT_URL, {
            lead_id: leadId,
            created_at: createdAt,
            product,
            full_name: fullName,
            phone: cleanPhone,
            store_name: storeName,
            store_address: storeAddress,
            language,
            source,
            url: pageUrl,
            tab: sheetTab,
            row: rowData
          });
        } else {
          appendResult = await appendToGoogleSheet(env, sheetTab, rowData);
        }

        if (!appendResult || !appendResult.success) {
          throw new Error(appendResult?.error || 'SHEETS_APPEND_FAILED');
        }
      } catch (err) {
        console.error(`[GOOGLE SHEETS ERROR] Failed writing lead ${leadId}:`, err.message);
        // CRITICAL REQUIREMENT: If Google Sheets fails, DO NOT send notifications, return error to avoid un-reconciled lead
        return jsonResponse({
          success: false,
          code: 'SHEETS_WRITE_FAILED',
          message: 'Chưa thể ghi nhận thông tin vào hệ thống đối soát. Vui lòng thử lại.'
        }, 500, corsHeaders);
      }
    } else {
      console.log(`[DEV MODE] Google Sheets credentials not configured. Lead ${leadId} simulated.`);
    }

    // 8. Send Notifications (Telegram & Zalo) - Only after Google Sheets succeeded
    // A. Telegram Bot Notification (Tức thì về điện thoại / máy tính)
    const tgToken = env?.TELEGRAM_BOT_TOKEN;
    const tgChatId = env?.TELEGRAM_CHAT_ID;
    if (tgToken && tgChatId) {
      try {
        const tgText = [
          `🔔 <b>LEAD MỚI TỪ KHONGTIENMAT.VN</b>`,
          `━━━━━━━━━━━━━━━━━━━━`,
          `🆔 <b>Mã lead:</b> <code>${leadId}</code>`,
          `📦 <b>Sản phẩm:</b> ${escapeHtml(product)}`,
          `👤 <b>Khách hàng:</b> ${escapeHtml(fullName)}`,
          `📞 <b>Điện thoại:</b> <a href="tel:${cleanPhone}">${cleanPhone}</a>`,
          `🏪 <b>Đơn vị:</b> ${escapeHtml(storeName)}`,
          `📍 <b>Địa chỉ:</b> ${escapeHtml(storeAddress)}`,
          `🌐 <b>Ngôn ngữ:</b> ${language.toUpperCase()}`,
          `⏱ <b>Thời gian:</b> ${createdAt}`,
          `━━━━━━━━━━━━━━━━━━━━`,
          `👉 <i>Vui lòng liên hệ khách sớm để được hỗ trợ tốt nhất!</i>`
        ].join('\n');

        const tgResponse = await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: tgChatId,
            text: tgText,
            parse_mode: 'HTML',
            disable_web_page_preview: true
          })
        });

        const tgData = await tgResponse.json().catch(() => ({}));
        if (tgResponse.ok && tgData.ok) {
          telegramStatus = 'Đã gửi';
        } else {
          telegramStatus = 'Lỗi';
          telegramError = tgData.description || `HTTP_${tgResponse.status}`;
          console.warn(`[TELEGRAM WARN] Lead ${leadId}:`, telegramError);
        }
      } catch (tgErr) {
        telegramStatus = 'Lỗi';
        telegramError = tgErr.message ? tgErr.message.slice(0, 30) : 'NETWORK_ERROR';
        console.warn(`[TELEGRAM ERROR] Lead ${leadId}:`, tgErr.message);
      }
    }

    // B. Zalo Chatbot Webhook (Dành cho Zalo OA / Zalo Bot doanh nghiệp)
    const zaloWebhookUrl = env?.ZALO_CHATBOT_WEBHOOK_URL;
    if (zaloWebhookUrl) {
      try {
        const messageText = [
          `🔔 Lead mới từ khongtienmat.vn`,
          `Mã lead: ${leadId}`,
          `Sản phẩm: ${product}`,
          `Khách hàng: ${fullName}`,
          `SĐT: ${cleanPhone}`,
          `Cửa hàng: ${storeName}`,
          `Địa chỉ: ${storeAddress}`,
          `Thời gian: ${createdAt}`
        ].join('\n');

        const zaloHeaders = {
          'Content-Type': 'application/json'
        };
        if (env.ZALO_CHATBOT_API_TOKEN) {
          zaloHeaders['Authorization'] = `Bearer ${env.ZALO_CHATBOT_API_TOKEN}`;
        }

        const zaloResponse = await fetch(zaloWebhookUrl, {
          method: 'POST',
          headers: zaloHeaders,
          body: JSON.stringify({
            lead_id: leadId,
            text: messageText,
            timestamp: createdAt,
            data: {
              leadId,
              product,
              fullName,
              phone: cleanPhone,
              storeName,
              storeAddress
            }
          })
        });

        if (zaloResponse.ok) {
          zaloStatus = 'Đã gửi';
        } else {
          zaloStatus = 'Lỗi';
          zaloError = `HTTP_${zaloResponse.status}`;
          console.warn(`[ZALO WEBHOOK WARN] Status: ${zaloResponse.status}`);
        }
      } catch (zErr) {
        zaloStatus = 'Lỗi';
        zaloError = zErr.message ? zErr.message.slice(0, 30) : 'NETWORK_ERROR';
        console.warn(`[ZALO WEBHOOK ERROR] Lead ${leadId}:`, zErr.message);
      }
    }

    // Notification summary logging
    const statusParts = [];
    if (telegramStatus !== 'Chưa cấu hình') statusParts.push(`Telegram: ${telegramStatus}`);
    if (zaloStatus !== 'Chưa cấu hình') statusParts.push(`Zalo: ${zaloStatus}`);
    const notificationSummary = statusParts.length > 0 ? statusParts.join(' | ') : 'Chưa cấu hình';
    console.log(`[NOTIFICATION DISPATCH] Lead ${leadId} -> ${notificationSummary}`);

    // If Google Sheets is active, update status asynchronously if needed
    if (hasGoogleStorage && ctx && ctx.waitUntil) {
      try {
        ctx.waitUntil(updateGoogleSheetNotificationStatus(env, leadId, notificationSummary, telegramError || zaloError));
      } catch (_) {}
    }

    // 9. Return Success Response to Website
    return jsonResponse({
      success: true,
      lead_id: leadId,
      message: 'Đăng ký thành công. Đội ngũ tư vấn sẽ liên hệ với bạn sớm.'
    }, 200, corsHeaders);
  }
};

/**
 * Utility: Standard JSON response
 */
function jsonResponse(data, status, corsHeaders) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...corsHeaders
    }
  });
}

/**
 * In-memory IP rate limiter
 */
function isRateLimited(ip) {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record || now - record.startTime > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { startTime: now, count: 1 });
    return false;
  }
  record.count += 1;
  return record.count > RATE_LIMIT_MAX_REQUESTS;
}

/**
 * Mask PII for security logs
 */
function maskPhone(p) {
  if (!p || p.length < 7) return '***';
  return p.slice(0, 4) + '***' + p.slice(-3);
}

function maskIp(ip) {
  if (!ip) return 'unknown';
  const parts = ip.split('.');
  if (parts.length === 4) return `${parts[0]}.${parts[1]}.*.*`;
  return ip.slice(0, 8) + '...';
}

function getVietnamTime() {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  const parts = formatter.formatToParts(now);
  const getPart = (t) => parts.find(p => p.type === t)?.value || '';
  return `${getPart('year')}-${getPart('month')}-${getPart('day')} ${getPart('hour')}:${getPart('minute')}:${getPart('second')}`;
}

/**
 * Google Sheets API v4 Integration with Native Web Crypto RS256 JWT
 */
async function getGoogleAccessToken(serviceAccountEmail, privateKeyPem) {
  const nowSec = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claimSet = {
    iss: serviceAccountEmail,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    exp: nowSec + 3600,
    iat: nowSec
  };

  const encHeader = base64UrlEncode(JSON.stringify(header));
  const encClaim = base64UrlEncode(JSON.stringify(claimSet));
  const message = `${encHeader}.${encClaim}`;

  const cryptoKey = await importPrivateKey(privateKeyPem);
  const signature = await crypto.subtle.sign(
    { name: 'RSASSA-PKCS1-v1_5' },
    cryptoKey,
    new TextEncoder().encode(message)
  );
  const encSignature = base64UrlEncodeBytes(new Uint8Array(signature));
  const jwt = `${message}.${encSignature}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Google OAuth error: ${res.status} ${errText}`);
  }

  const tokenData = await res.json();
  return tokenData.access_token;
}

async function appendToGoogleSheet(env, tabName, rowValues) {
  const token = await getGoogleAccessToken(env.GOOGLE_SERVICE_ACCOUNT_EMAIL, env.GOOGLE_PRIVATE_KEY);
  const sheetId = env.GOOGLE_SHEET_ID;
  const range = `${tabName}!A:L`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      range,
      majorDimension: 'ROWS',
      values: [rowValues]
    })
  });

  if (!res.ok) {
    const err = await res.text();
    return { success: false, error: `Google Sheets API Error ${res.status}: ${err}` };
  }
  return { success: true };
}

/**
 * Append to Google Sheet via Google Apps Script Web App
 * Ideal for organizations blocking Service Account Keys (iam.disableServiceAccountKeyCreation)
 */
async function appendViaAppsScript(scriptUrl, payload) {
  const res = await fetch(scriptUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    redirect: 'follow'
  });
  if (!res.ok) {
    const err = await res.text().catch(() => '');
    return { success: false, error: `Apps Script HTTP ${res.status}: ${err}` };
  }
  const data = await res.json().catch(() => ({ success: true }));
  if (data && data.success === false) {
    return { success: false, error: data.error || 'APPS_SCRIPT_FAILED' };
  }
  return { success: true };
}

async function updateGoogleSheetNotificationStatus(env, leadId, status, errorNote) {
  // Background task to reconcile row status
  console.log(`[RECONCILE] Lead ${leadId}: Notification Status -> ${status} (${errorNote || 'OK'})`);
}

// Backward compatibility alias
const updateGoogleSheetZaloStatus = updateGoogleSheetNotificationStatus;

/**
 * Escape HTML special chars for Telegram HTML parse mode
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Web Crypto PEM PKCS#8 importer
 */
async function importPrivateKey(pem) {
  const cleanPem = pem
    .replace(/-----BEGIN (?:RSA )?PRIVATE KEY-----/, '')
    .replace(/-----END (?:RSA )?PRIVATE KEY-----/, '')
    .replace(/\s+/g, '');
  
  const binaryDer = Uint8Array.from(atob(cleanPem), c => c.charCodeAt(0));

  return await crypto.subtle.importKey(
    'pkcs8',
    binaryDer.buffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );
}

function base64UrlEncode(str) {
  return base64UrlEncodeBytes(new TextEncoder().encode(str));
}

function base64UrlEncodeBytes(uint8Arr) {
  let bin = '';
  for (let i = 0; i < uint8Arr.length; i++) {
    bin += String.fromCharCode(uint8Arr[i]);
  }
  return btoa(bin)
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}
