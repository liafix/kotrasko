import crypto from 'node:crypto';
import { parseCookies, safeEqual } from './utils.mjs';

const COOKIE = 'kotrasko_admin';

function secret() {
  return process.env.ADMIN_SESSION_SECRET || 'development-only-change-me-kotrasko';
}

function sign(payload) {
  return crypto.createHmac('sha256', secret()).update(payload).digest('base64url');
}

export function createAdminSession() {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + 12 * 60 * 60 * 1000 })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function isAdmin(req) {
  const value = parseCookies(req)[COOKIE];
  if (!value) return false;
  const [payload, signature] = value.split('.');
  if (!payload || !signature || !safeEqual(signature, sign(payload))) return false;
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return Number(parsed.exp) > Date.now();
  } catch { return false; }
}

export function adminCookie(value) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${COOKIE}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=43200${secure}`;
}

export function clearAdminCookie() {
  return `${COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`;
}

export function verifyAdminPassword(value) {
  return safeEqual(value || '', process.env.ADMIN_PASSWORD || 'kotrasko-demo');
}
