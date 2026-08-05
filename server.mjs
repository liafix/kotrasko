import './server/env.mjs';
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleApi } from './server/router.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(root, 'public');
const port = Number(process.env.PORT || 3000);

const mime = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json'
};

const server = http.createServer(async (req, res) => {
  try {
    if (req.url.startsWith('/api/')) return handleApi(req, res);
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    let requested = decodeURIComponent(url.pathname);
    if (requested === '/') requested = '/index.html';
    if (requested === '/admin') requested = '/admin.html';
    const safe = path.normalize(requested).replace(/^([.][.][/\\])+/, '');
    const file = path.join(publicDir, safe);
    if (!file.startsWith(publicDir)) { res.statusCode = 403; return res.end('Forbidden'); }
    let data;
    try { data = await fs.readFile(file); }
    catch {
      if (!path.extname(requested)) data = await fs.readFile(path.join(publicDir, 'index.html'));
      else { res.statusCode = 404; return res.end('Not found'); }
    }
    res.statusCode = 200;
    res.setHeader('Content-Type', mime[path.extname(file).toLowerCase()] || 'application/octet-stream');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    res.end(data);
  } catch (error) {
    console.error(error);
    res.statusCode = 500;
    res.end('Internal server error');
  }
});

server.listen(port, () => console.log(`KOTRASKO running at http://localhost:${port}`));
