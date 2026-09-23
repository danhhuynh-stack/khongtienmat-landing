import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = 3000;

const mimeTypes = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'text/javascript; charset=UTF-8',
  '.mjs': 'text/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || '127.0.0.1:3000'}`);
  const reqPath = parsedUrl.pathname;

  // CORS headers
  const origin = req.headers['origin'] || '*';
  const corsHeaders = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400'
  };

  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders);
    res.end();
    return;
  }

  // Local /api/leads mock endpoint for offline testing & dev verification
  if (reqPath === '/api/leads' && req.method === 'POST') {
    let bodyData = '';
    req.on('data', chunk => { bodyData += chunk; });
    req.on('end', () => {
      try {
        const body = JSON.parse(bodyData || '{}');

        // Check simulated error parameter for test verification
        if (parsedUrl.searchParams.has('simulate_error')) {
          res.writeHead(500, { 'Content-Type': 'application/json', ...corsHeaders });
          res.end(JSON.stringify({ success: false, code: 'SHEETS_WRITE_FAILED', message: 'Simulated server error' }));
          return;
        }

        // Honeypot trap: if filled by bot, return silent dummy success
        if (body.website_hp && body.website_hp.trim().length > 0) {
          res.writeHead(200, { 'Content-Type': 'application/json', ...corsHeaders });
          res.end(JSON.stringify({ success: true, lead_id: body.lead_id || 'BOT-DROP', message: 'OK' }));
          return;
        }

        // Validation
        const phoneRegex = /^(?:0|\+84)(?:3|5|7|8|9)[0-9]{8}$/;
        if (!body.full_name || !body.phone || !body.store_name || !body.store_address) {
          res.writeHead(400, { 'Content-Type': 'application/json', ...corsHeaders });
          res.end(JSON.stringify({ success: false, code: 'MISSING_FIELDS', message: 'Missing required fields' }));
          return;
        }

        if (!phoneRegex.test(body.phone.trim().replace(/\s+/g, ''))) {
          res.writeHead(400, { 'Content-Type': 'application/json', ...corsHeaders });
          res.end(JSON.stringify({ success: false, code: 'INVALID_PHONE', message: 'Invalid phone format' }));
          return;
        }

        // Return clean success
        res.writeHead(200, { 'Content-Type': 'application/json', ...corsHeaders });
        res.end(JSON.stringify({
          success: true,
          lead_id: body.lead_id || `KTM-${Date.now()}`,
          message: 'Đăng ký thành công. Đội ngũ tư vấn sẽ liên hệ với bạn sớm.'
        }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json', ...corsHeaders });
        res.end(JSON.stringify({ success: false, code: 'INVALID_JSON', message: err.message }));
      }
    });
    return;
  }

  // Static file serving
  let targetPath = reqPath;
  if (targetPath === '/') targetPath = '/index.html';

  const filePath = path.join(__dirname, targetPath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=UTF-8' });
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType, ...corsHeaders });
      res.end(content);
    }
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Preview server running at: http://127.0.0.1:${PORT}/`);
});
