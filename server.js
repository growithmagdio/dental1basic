const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf'
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  // Normalize route to index.html if root
  if (pathname === '/') {
    pathname = '/index.html';
  }

  // Prevent directory traversal
  const safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  let filePath = path.join(ROOT_DIR, safePath);

  // If file doesn't exist and doesn't have an extension, try appending .html
  if (!fs.existsSync(filePath) && !path.extname(filePath)) {
    if (fs.existsSync(filePath + '.html')) {
      filePath = filePath + '.html';
    }
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<!DOCTYPE html>
<html>
<head><title>404 Not Found | Lumora Dental Studio</title><link rel="stylesheet" href="/css/styles.css"></head>
<body style="display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center;background:var(--color-warm-ivory);">
  <div>
    <h1 style="font-family:var(--font-serif);font-size:3rem;color:var(--color-deep-navy);">404 — Page Not Found</h1>
    <p style="color:var(--color-muted-text);margin:1rem 0 2rem 0;">The requested sanctuary page does not exist.</p>
    <a href="/" class="btn btn-primary">Return to Lumora Home</a>
  </div>
</body>
</html>`);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff'
    });

    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
  });
});

const HOST = '0.0.0.0';

function startServer(port) {
  server.listen(port, HOST, () => {
    console.log(`\n✨ LUMORA DENTAL STUDIO is running!`);
    console.log(`➜ Local:   http://localhost:${port}`);
    console.log(`➜ Network: http://127.0.0.1:${port}\n`);
  });
}

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    const nextPort = Number(server.address()?.port || PORT) + 1;
    console.warn(`⚠️ Port in use, trying next available port: ${nextPort}...`);
    setTimeout(() => {
      server.close();
      startServer(nextPort);
    }, 400);
  } else {
    console.error('Server error:', err);
  }
});

startServer(PORT);
