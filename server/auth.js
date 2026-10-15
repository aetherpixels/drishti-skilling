/**
 * Drishti-Skilling: Authentication & Role-Based Access Control (RBAC)
 * Implements scrypt hashed user credentials, JWT session validation,
 * API key verification, and role-based route guard middleware.
 */

const {
  hashPassword,
  verifyPassword,
  generateJWT,
  verifyJWT,
  sanitizeString
} = require('./security');

const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'drishti_super_admin_key_2026_msde_gov_in';
const EDGE_API_KEY = process.env.EDGE_API_KEY || 'drishti_edge_node_token_secure_lan_iot';

// -------------------------------------------------------------
// USER STORE (Cryptographically Hashed Passwords using scrypt)
// -------------------------------------------------------------
const USERS = [
  {
    id: 'USR-MSDE-001',
    email: 'auditor@msde.gov.in',
    name: 'Dr. S. K. Verma',
    designation: 'National Quality & Compliance Auditor',
    role: 'AUDITOR',
    // 'Auditor@MSDE2026!'
    passwordHash: hashPassword('Auditor@MSDE2026!')
  },
  {
    id: 'USR-MSDE-002',
    email: 'admin@msde.gov.in',
    name: 'Rajesh Sharma, IAS',
    designation: 'Director General, Monitoring & Vigilance',
    role: 'ADMIN',
    // 'Admin@MSDE2026!'
    passwordHash: hashPassword('Admin@MSDE2026!')
  },
  {
    id: 'USR-MSDE-003',
    email: 'inspector@msde.gov.in',
    name: 'Pooja Nair',
    designation: 'Field Flying Squad Lead',
    role: 'INSPECTOR',
    // 'Inspector@MSDE2026!'
    passwordHash: hashPassword('Inspector@MSDE2026!')
  }
];

/**
 * Authenticate credentials against scrypt salt/hash
 */
function authenticateUser(email, password) {
  if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
    return null;
  }
  const cleanEmail = email.trim().toLowerCase();
  const user = USERS.find(u => u.email.toLowerCase() === cleanEmail);
  if (!user) return null;

  const isValid = verifyPassword(password, user.passwordHash);
  if (!isValid) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    designation: user.designation,
    role: user.role
  };
}

/**
 * Generate authenticated session token
 */
function issueUserToken(user) {
  return generateJWT({
    sub: user.id,
    email: user.email,
    role: user.role,
    name: user.name
  }, 86400); // 24-hour expiration
}

/**
 * Role-Based Access Control (RBAC) Route Guard Middleware
 */
function authMiddleware(allowedRoles = []) {
  return (req, res, next) => {
    // 1. Check Master API Key Header
    const apiKey = req.headers['x-api-key'];
    if (apiKey) {
      if (apiKey === ADMIN_API_KEY) {
        req.user = {
          id: 'SYS-API-ADMIN',
          email: 'api-service@msde.gov.in',
          name: 'MSDE Master API Key',
          role: 'ADMIN'
        };
        return next();
      } else {
        return res.status(401).json({
          error: 'INVALID_API_KEY',
          message: 'The provided x-api-key is invalid or revoked.'
        });
      }
    }

    // 2. Check Bearer Token Header
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'AUTH_REQUIRED',
        message: 'Authentication required. Please log in with your MSDE Officer credentials.'
      });
    }

    const token = authHeader.slice(7).trim();
    const payload = verifyJWT(token);

    if (!payload) {
      return res.status(401).json({
        error: 'INVALID_TOKEN',
        message: 'Your authentication session has expired or is invalid. Please sign in again.'
      });
    }

    // 3. Verify Role Authorization
    if (allowedRoles.length > 0 && !allowedRoles.includes(payload.role)) {
      return res.status(403).json({
        error: 'FORBIDDEN_ROLE',
        message: `Officer role '${payload.role}' lacks sufficient privileges for this compliance action. Required: ${allowedRoles.join(' or ')}.`
      });
    }

    req.user = payload;
    next();
  };
}

/**
 * Edge Hardware Node Telemetry Auth Middleware
 * Verifies edge device credentials before accepting telemetry ingestion
 */
function edgeAuthMiddleware(req, res, next) {
  const edgeKey = req.headers['x-edge-api-key'];
  const authHeader = req.headers['authorization'];

  if (edgeKey) {
    if (edgeKey === EDGE_API_KEY || edgeKey === ADMIN_API_KEY) {
      req.edgeDevice = { id: 'EDGE-GATEWAY-AUTH', verified: true };
      return next();
    }
  }

  // Fallback: If officer is logged in via Bearer token, permit manual telemetry sync
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const payload = verifyJWT(authHeader.slice(7).trim());
    if (payload) {
      req.edgeDevice = { id: `USER-${payload.sub}`, verified: true };
      return next();
    }
  }

  return res.status(401).json({
    error: 'EDGE_AUTH_REQUIRED',
    message: 'Unauthorized telemetry transmission. Valid x-edge-api-key or officer token required.'
  });
}

module.exports = {
  USERS,
  authenticateUser,
  issueUserToken,
  authMiddleware,
  edgeAuthMiddleware
};
