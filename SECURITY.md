# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |
| < Latest| :x:                |

We only support the latest version of Chore Buddy. Please ensure you're running the most recent release.

## Security Features

Chore Buddy implements multiple layers of security:

### Application Security

- **Authentication**: NextAuth.js with email/password credentials and bcrypt password hashing
- **Authorization**: Application-level checks in every server action (family membership verification)
- **Session Management**: JWT-based sessions via NextAuth.js with secure cookies
- **Data Isolation**: Each family's data is completely isolated via server-side authorization
- **Input Validation**: TypeScript type checking and Zod validation
- **CSRF Protection**: Built into Next.js App Router

### Docker Security

See [docs/DOCKER-SECURITY.md](docs/DOCKER-SECURITY.md) for comprehensive Docker security documentation.

**Key features:**
- Latest Node.js 20 LTS with security patches
- Alpine Linux 3.20 base image
- Non-root user execution
- Multi-stage builds (minimal attack surface)
- Security updates installed (`apk upgrade`)
- Health checks for availability
- Read-only root filesystem support
- Resource limits configurable

### Database Security

- **SQLite via Prisma**: Type-safe queries prevent SQL injection
- **Local database file**: No network exposure by default
- **Prisma parameterized queries**: All user input is parameterized automatically
- **Password hashing**: bcrypt with salt rounds for all user passwords

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

If you discover a security vulnerability:

1. **Email**: Send details to the repository owner (check package.json for contact)
2. **Include**:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)
3. **Response Time**: We aim to respond within 48 hours
4. **Disclosure**: Please allow us time to fix before public disclosure

## Security Scanning

### Automated Scanning

This repository includes GitHub Actions workflows for:
- Docker image vulnerability scanning (Trivy)
- Dependency vulnerability scanning (npm audit)
- Dockerfile best practices (Hadolint)

Scans run:
- On every push to main
- On every pull request
- Weekly on Mondays
- Manually via workflow_dispatch

### Manual Scanning

Before deploying to production:

```bash
# Scan Docker image
trivy image --severity HIGH,CRITICAL chore-buddy:latest

# Audit npm dependencies
npm audit --audit-level=moderate

# Check for outdated packages
npm outdated
```

## Security Best Practices for Deployment

### 1. Environment Variables

Never commit secrets:
```bash
# BAD
git add .env

# GOOD
# Use .env.example as template
# Set environment variables in deployment platform
```

### 2. HTTPS Only

Always use HTTPS in production:
```bash
# Configure in reverse proxy (Nginx, Traefik, etc.)
# Or use platform-provided HTTPS (Vercel, Cloud Run, etc.)
```

### 3. Update Regularly

```bash
# Update dependencies monthly
npm update
npm audit fix

# Update Docker image monthly
docker pull node:20-alpine
docker build --no-cache -t chore-buddy:latest .
```

### 4. AUTH_SECRET

- Generate a strong random secret for `AUTH_SECRET` in production
- Use `openssl rand -base64 32` to generate one
- Never reuse secrets across environments

### 5. Monitor Access

- Set up logging and monitoring
- Review access logs regularly
- Set up alerts for suspicious activity

## Security Checklist for Production

Use this checklist before deploying:

- [ ] All dependencies are up to date
- [ ] `npm audit` shows no HIGH or CRITICAL issues
- [ ] Docker image scan shows acceptable vulnerabilities
- [ ] Environment variables are set (not hardcoded)
- [ ] HTTPS is enabled
- [ ] AUTH_SECRET is a strong random value
- [ ] Database file is not publicly accessible
- [ ] Backup strategy is in place
- [ ] Monitoring and logging are configured
- [ ] Rate limiting is configured (if needed)

## Known Limitations

### Docker Base Image Vulnerabilities

Some vulnerabilities may appear in scans of the Node.js Alpine base image. These are typically:

1. **System library vulnerabilities**: In packages like `openssl`, `zlib`, etc.
   - **Impact**: Usually low in containerized environments
   - **Mitigation**: We use `apk upgrade` to get latest patches
   - **Resolution**: Wait for Alpine/Node.js upstream fixes

2. **Node.js core vulnerabilities**: In Node.js runtime itself
   - **Impact**: Depends on the specific CVE
   - **Mitigation**: We use latest LTS version (20.18.1)
   - **Resolution**: Update to newer Node.js version when available

3. **Low-severity issues**: Theoretical vulnerabilities
   - **Impact**: Minimal to none in our use case
   - **Mitigation**: Accept the risk or switch to different base image
   - **Resolution**: Not always necessary to fix

**Our approach:**
- Use latest stable versions (Node.js 20 LTS, Alpine 3.20)
- Apply all available security updates (`apk upgrade`)
- Scan regularly and update when HIGH/CRITICAL issues appear
- Accept LOW/MEDIUM vulnerabilities after risk assessment

## Security Updates

We follow this process for security updates:

1. **Critical vulnerabilities**: Patched within 24 hours
2. **High vulnerabilities**: Patched within 1 week
3. **Medium vulnerabilities**: Patched in next release
4. **Low vulnerabilities**: Evaluated case-by-case

## Responsible Disclosure Timeline

1. **Day 0**: Vulnerability reported
2. **Day 1-2**: Acknowledgment sent
3. **Day 3-7**: Investigation and fix development
4. **Day 7-14**: Testing and deployment
5. **Day 14+**: Public disclosure (if applicable)

## Security Resources

- [Docker Security Best Practices](docs/DOCKER-SECURITY.md)
- [Database Schema Documentation](docs/database-schema.md)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

## Questions?

For security-related questions:
- Review this document first
- Check [docs/DOCKER-SECURITY.md](docs/DOCKER-SECURITY.md)
- Contact the repository owner

---

**Last Updated**: March 2026
