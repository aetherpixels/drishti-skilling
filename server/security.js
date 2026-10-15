/**
 * Drishti-Skilling: Core Security Suite
 * Provides Cryptographic Hashing, JWT Auth, Input Sanitization, Rate Limiting,
 * Security Headers, and CORS Isolation.
 */

require('dotenv').config();
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'drishti_default_secure_key_2026';
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000')
  .split(',')
  .map(o => o.trim());

// -------------------------------------------------------------
// 1. PASSWORD HASHING & VERIFICATION (scrypt with Salt)
// -------------------------------------------------------------
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt, key] = storedHash.split(':');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return crypto.timingSafeEqual(Buffer.from(key, 'hex'), derivedKey);
}

// -------------------------------------------------------------
// 2. CRYPTOGRAPHIC JWT TOKENS (Native HMAC-SHA256)
// -------------------------------------------------------------
function base64UrlEncode(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return Buffer.from(str, 'base64').toString('utf8');
}

function generateJWT(payload, expiresInSeconds = 86400) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const body = { ...payload, exp, iat: Math.floor(Date.now() / 1000) };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedBody = base64UrlEncode(JSON.stringify(body));
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedBody}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${encodedHeader}.${encodedBody}.${signature}`;
}

function verifyJWT(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedBody, signature] = parts;
  const expectedSig = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedBody}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  if (signature !== expectedSig) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(encodedBody));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }
    return payload;
  } catch (e) {
    return null;
  }
}

// -------------------------------------------------------------
// 3. INPUT SANITIZATION & XSS MITIGATION
// -------------------------------------------------------------
function sanitizeString(str, maxLength = 255) {
  if (typeof str !== 'string') return '';
  return str
    .trim()
    .slice(0, maxLength)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

function sanitizeNumber(val, min = 0, max = 1000000, fallback = 0) {
  const num = Number(val);
  if (isNaN(num) || num < min || num > max) return fallback;
  return num;
}

// -------------------------------------------------------------
// 4. RATE LIMITER (In-Memory Sliding Window)
// -------------------------------------------------------------
function createRateLimiter({ windowMs = 60000, max = 120, message = 'Too many requests. Please try again later.' }) {
  const hits = new Map();

  // Periodic garbage collection every 2 minutes
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [ip, timestamps] of hits.entries()) {
      const valid = timestamps.filter(t => now - t < windowMs);
      if (valid.length === 0) {
        hits.delete(ip);
      } else {
        hits.set(ip, valid);
      }
    }
  }, 120000);
  if (timer.unref) timer.unref();

  return (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const timestamps = hits.get(ip) || [];
    const recent = timestamps.filter(t => now - t < windowMs);

    if (recent.length >= max) {
      res.setHeader('Retry-After', Math.ceil(windowMs / 1000));
      return res.status(429).json({
        error: 'RATE_LIMIT_EXCEEDED',
        message: message
      });
    }

    recent.push(now);
    hits.set(ip, recent);
    next();
  };
}

// -------------------------------------------------------------
// 5. SECURITY HEADERS MIDDLEWARE (Helmet Equivalent)
// -------------------------------------------------------------
function securityHeadersMiddleware(req, res, next) {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Prevent Clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  // XSS Protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  // Strict Transport Security (HSTS)
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Permissions Policy
  res.setHeader('Permissions-Policy', 'camera=(self), microphone=(), geolocation=()');

  // Content Security Policy (Allows local assets, Tailwind, Leaflet, TensorFlow CDNs & Model Weights)
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.tailwindcss.com https://unpkg.com https://cdn.jsdelivr.net https://storage.googleapis.com https://tfhub.dev",
    "style-src 'self' 'unsafe-inline' https://unpkg.com https://cdn.jsdelivr.net",
    "img-src 'self' data: blob: https://*.tile.openstreetmap.org https://unpkg.com https://storage.googleapis.com",
    "connect-src 'self' ws: wss: https://cdn.jsdelivr.net https://*.tile.openstreetmap.org https://storage.googleapis.com https://tfhub.dev https://*.googleapis.com https://*.tfhub.dev https://*.kaggle.com",
    "font-src 'self' https://unpkg.com https://cdn.jsdelivr.net data:",
    "media-src 'self' blob: data:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ');

  res.setHeader('Content-Security-Policy', csp);
  next();
}

// -------------------------------------------------------------
// 6. CORS ORIGIN ISOLATION
// -------------------------------------------------------------
function corsMiddleware(req, res, next) {
  const origin = req.headers.origin;

  if (origin) {
    const isAllowed = ALLOWED_ORIGINS.some(allowed => 
      allowed === origin || 
      (allowed.includes('*') && origin.endsWith(allowed.replace('*', '')))
    );

    if (isAllowed || process.env.NODE_ENV !== 'production') {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-edge-api-key, x-api-key');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
  }

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
}

module.exports = {
  hashPassword,
  verifyPassword,
  generateJWT,
  verifyJWT,
  sanitizeString,
  sanitizeNumber,
  createRateLimiter,
  securityHeadersMiddleware,
  corsMiddleware
};
