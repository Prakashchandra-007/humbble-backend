# Environment Configuration for CORS Security

## Development Environment (.env.development)

```bash
NODE_ENV=development
# Development allows localhost origins automatically
# Additional origins can be specified if needed:
# ALLOWED_ORIGINS=http://localhost:4200,http://192.168.1.100:3000
```

## Production Environment (.env.production)

```bash
NODE_ENV=production
# REQUIRED: Specify allowed origins for production
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com,https://app.yourdomain.com

# Additional production-specific origins:
# ALLOWED_ORIGINS=https://api.yourdomain.com,https://admin.yourdomain.com
```

## Testing Environment (.env.test)

```bash
NODE_ENV=test
# Testing allows localhost origins automatically
# Additional origins for testing environments:
# ALLOWED_ORIGINS=https://staging.yourdomain.com,https://test.yourdomain.com
```

## CORS Configuration Behavior

### Development Mode (NODE_ENV=development)

- ✅ Allows localhost:3000, localhost:3001, localhost:8080
- ✅ Allows 127.0.0.1 variants
- ✅ Allows any additional origins from ALLOWED_ORIGINS
- ✅ Includes OPTIONS method for preflight requests
- ⚠️ More permissive for development convenience

### Production Mode (NODE_ENV=production)

- 🔒 Only allows explicitly whitelisted origins
- 🔒 Requires ALLOWED_ORIGINS environment variable
- 🔒 Blocks requests from non-whitelisted origins
- 🔒 Logs blocked requests for security monitoring
- 🔒 Excludes OPTIONS method to be more restrictive

### Security Features

- 🛡️ Environment-based origin control
- 🛡️ Dynamic origin validation in production
- 🛡️ Request blocking with detailed logging
- 🛡️ Support for multiple frontend applications
- 🛡️ Mobile app compatibility (no-origin requests allowed)

## Setup Instructions

1. **Update production origins** in `src/main.ts`:

   ```typescript
   const productionOrigins = [
     'https://yourdomain.com', // Replace with your domain
     'https://www.yourdomain.com', // Replace with your www domain
     'https://app.yourdomain.com', // Replace with your app domain
   ];
   ```

2. **Set ALLOWED_ORIGINS environment variable** for production:

   ```bash
   export ALLOWED_ORIGINS="https://yourdomain.com,https://app.yourdomain.com"
   ```

3. **Verify CORS configuration** by checking server logs during startup:
   ```
   CORS configured for production environment
   ```

## Security Benefits

- Prevents unauthorized cross-origin requests
- Reduces risk of CSRF attacks
- Provides environment-specific security policies
- Enables secure credential sharing with trusted origins
- Maintains detailed access logs for security auditing
