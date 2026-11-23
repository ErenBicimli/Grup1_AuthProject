const http = require('http');
const fs = require('fs');
const path = require('path');

const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');
const ROUTES_DIR = path.join(__dirname, 'routes');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
};

function loadRoutes() {
  const handlers = [];
  if (!fs.existsSync(ROUTES_DIR)) return handlers;
  for (const file of fs.readdirSync(ROUTES_DIR).sort()) {
    if (file.endsWith('.js')) {
      const routeModule = require(path.join(ROUTES_DIR, file));
      if (typeof routeModule === 'function') {
        handlers.push(routeModule);
      }
    }
  }
  return handlers;
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 1e6) reject(new Error('Payload too large'));
    });
    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function createServer() {
  const routeHandlers = loadRoutes();

  return http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');

    if (url.pathname.startsWith('/api/')) {
      let body = {};
      if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
        try {
          body = await parseJsonBody(req);
        } catch (err) {
          return sendJson(res, 400, { error: err.message });
        }
      }

      for (const handle of routeHandlers) {
        const handled = await handle(req, res, { pathname: url.pathname, body, sendJson });
        if (handled) return;
      }

      return sendJson(res, 404, { error: 'Endpoint bulunamadı' });
    }

    const relativePath = url.pathname === '/' ? 'index.html' : url.pathname.replace(/^\/+/, '');
    const filePath = path.join(FRONTEND_DIR, relativePath);
    if (!filePath.startsWith(FRONTEND_DIR) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Sayfa bulunamadı');
    }

    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  });
}

if (require.main === module) {
  const port = process.env.PORT || 3000;
  createServer().listen(port, () => {
    console.log(`Auth server running at http://localhost:${port}`);
  });
}

module.exports = { createServer };
