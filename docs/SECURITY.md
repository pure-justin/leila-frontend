# Security Documentation - Leila Home Services

## Overview
This document outlines the security measures implemented in the Leila Home Services platform to protect user data, prevent unauthorized access, and ensure secure transactions.

## 🔐 API Security

### 1. Secure Configuration System
All sensitive API keys and secrets are managed through a centralized secure configuration system:

```typescript
// ❌ NEVER DO THIS
const apiKey = "sk_live_abc123...";

// ✅ ALWAYS USE SECURE CONFIG
import { serverConfig } from '@/lib/config/secure-config';
const apiKey = serverConfig.stripe.secretKey;
```

### 2. API Route Protection
All API routes use the `secureApiHandler` wrapper that provides:
- Request authentication (JWT or API key)
- Rate limiting
- CORS protection
- Input validation
- Consistent error handling

```typescript
export const POST = secureApiHandler(async (request) => {
  // Your API logic here
}, {
  requireAuth: true,      // Require JWT authentication
  requireApiKey: false,   // Or require API key
  allowedMethods: ['POST'],
  rateLimit: 60          // Requests per minute
});
```

### 3. Authentication System

#### JWT Tokens
- Access tokens expire in 7 days
- Refresh tokens expire in 30 days
- Tokens include user ID, email, and role
- All tokens are signed with a secure secret

#### API Keys
- Generated with secure random bytes
- Prefixed with `lhs_` for identification
- Hashed before storage (SHA-256)
- Support expiration dates
- Usage tracking and rate limiting

## 🛡️ Middleware Security

The middleware provides several security layers:

### Security Headers
```
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Content-Security-Policy: [strict policy]
Strict-Transport-Security: max-age=31536000
```

### Rate Limiting
- API endpoints: 60 requests/minute
- Auth endpoints: 5 requests/minute
- Public routes: 100 requests/minute

### CORS Protection
- Whitelisted origins only
- Proper preflight handling
- Credentials support for authenticated requests

## 🔑 Environment Variables

### Server-Side Only (Never expose to client)
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `GEMINI_API_KEY`
- `JWT_SECRET`
- `ENCRYPTION_KEY`
- `FIREBASE_SERVICE_ACCOUNT_KEY`
- `SENDGRID_API_KEY`
- `TWILIO_AUTH_TOKEN`
- `HUGGINGFACE_API_KEY`
- `ELEVENLABS_API_KEY`
- `OPENAI_API_KEY`

### Client-Side (Safe to expose)
- `NEXT_PUBLIC_FIREBASE_*`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`

## 🚨 Security Best Practices

### 1. Never Commit Secrets
- Use `.env.local` for local development
- Never commit `.env` files
- Use environment variables in production

### 2. Input Validation
```typescript
// Always validate and sanitize input
const email = validators.isEmail(input.email) ? input.email : null;
const phone = validators.isPhoneNumber(input.phone) ? input.phone : null;
const safeText = validators.sanitizeInput(input.text);
```

### 3. Error Handling
- Never expose internal errors to users
- Log detailed errors server-side only
- Return generic error messages in production

### 4. Authentication Flow
1. User logs in with Firebase Auth
2. Server verifies Firebase ID token
3. Server generates JWT access token
4. Client includes JWT in Authorization header
5. Server validates JWT on each request

### 5. API Key Usage
```bash
# Include API key in request header
curl -H "X-API-Key: lhs_your_api_key_here" \
     https://heyleila.com/api/endpoint
```

## 🔍 Security Auditing

Run the security audit script regularly:
```bash
npm run audit:security
```

This checks for:
- Hardcoded API keys
- Exposed environment variables
- Missing security headers
- Unprotected API endpoints
- Insecure dependencies

## 🚀 Deployment Security

### Vercel Environment Variables
1. Go to Vercel Dashboard > Settings > Environment Variables
2. Add all required environment variables
3. Use different values for Preview and Production
4. Enable encryption for sensitive values

### Firebase Security Rules
Ensure Firebase security rules are properly configured:
- Firestore: Restrict read/write access
- Storage: Validate file types and sizes
- Authentication: Enable appropriate providers

## 📊 Monitoring

### Security Logs
The system logs security events to Firestore:
- Authentication attempts
- API key usage
- Failed requests
- Suspicious activity

### Alerts
Set up monitoring for:
- Multiple failed login attempts
- Unusual API usage patterns
- Expired certificates
- Security header violations

## 🆘 Incident Response

If a security issue is discovered:
1. Immediately rotate affected credentials
2. Review security logs for unauthorized access
3. Notify affected users if required
4. Update security measures to prevent recurrence
5. Document the incident and response

## 📝 Regular Security Tasks

### Weekly
- Review security logs
- Check for unusual API usage
- Monitor rate limit violations

### Monthly
- Rotate API keys
- Update dependencies
- Run security audit
- Review user permissions

### Quarterly
- Full security assessment
- Penetration testing
- Update security documentation
- Security training for team

## 🔗 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/authentication)
- [Firebase Security](https://firebase.google.com/docs/rules)
- [Stripe Security](https://stripe.com/docs/security)

---

For security concerns or to report vulnerabilities, please contact: security@heyleila.com