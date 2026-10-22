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

function requestHandler(req, res) {
  const parsedUrl = url.parse(req.url);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  // Normalize route to index.html if root
  if (pathname === '/') {
    pathname = '/index.html';
  }

  // Prevent directory traversal
  const safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  const cleanSubPath = safePath.replace(/^(\\|\/)+/, '');
  const strippedPublic = cleanSubPath.replace(/^public[\/\\]/, '');

  // Try candidate file paths in priority order
  const candidates = [
    path.join(ROOT_DIR, cleanSubPath),
    path.join(ROOT_DIR, strippedPublic),
    path.join(ROOT_DIR, 'public', cleanSubPath),
    path.join(ROOT_DIR, 'public', strippedPublic),
    path.join(ROOT_DIR, cleanSubPath + '.html'),
    path.join(ROOT_DIR, strippedPublic + '.html')
  ];

  let resolvedFile = null;
  for (const candidate of candidates) {
    try {
      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
        resolvedFile = candidate;
        break;
      }
    } catch (_) {}
  }

  if (!resolvedFile) {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<!DOCTYPE html>
<html>
<head><title>404 Not Found | Lumora Dental Studio</title><link rel="stylesheet" href="/css/styles.css"></head>
<body style="display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center;background:var(--color-warm-ivory);font-family:sans-serif;padding:2rem;">
  <div>
    <h1 style="font-size:2.5rem;color:#172B42;margin-bottom:1rem;">404 — Page Not Found</h1>
    <p style="color:#69737D;margin-bottom:2rem;">The requested sanctuary page does not exist.</p>
    <a href="/" style="display:inline-block;padding:0.75rem 1.5rem;background:#172B42;color:#FFF;text-decoration:none;border-radius:9999px;">Return to Lumora Home</a>
  </div>
</body>
</html>`);
    return;
  }

  const ext = path.extname(resolvedFile).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  res.writeHead(200, {
    'Content-Type': contentType,
    'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
    'X-Content-Type-Options': 'nosniff'
  });

  const readStream = fs.createReadStream(resolvedFile);
  readStream.pipe(res);
}

const server = http.createServer(requestHandler);

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

// Start server if directly executed
if (require.main === module) {
  startServer(PORT);
}

// Export for serverless environments (e.g. Vercel)
module.exports = server;
