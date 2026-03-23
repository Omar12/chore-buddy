# Docker Security Best Practices

This document outlines the security measures implemented in the Chore Buddy Docker setup and recommendations for maintaining security.

## Implemented Security Measures

### 1. Updated Base Images

**What we did:**
- Using Node.js 20.18.1 LTS (latest stable version)
- Specific Alpine Linux version (3.20)
- Not using `latest` tags to ensure reproducible builds

**Why it matters:**
- Newer versions have the latest security patches
- Specific versions prevent unexpected changes
- Alpine Linux has a smaller attack surface

### 2. Security Updates

```dockerfile
RUN apk upgrade --no-cache
```

**What we did:**
- Install all available security updates in each stage
- Use `--no-cache` to avoid storing package index

**Why it matters:**
- Patches known vulnerabilities in system packages
- Reduces image size by not caching package lists

### 3. Non-Root User

```dockerfile
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs --shell /sbin/nologin nextjs
USER nextjs
```

**What we did:**
- Created a system user with no login shell
- Run the application as non-root
- Set specific UID/GID for consistency

**Why it matters:**
- Limits damage if container is compromised
- Follows principle of least privilege
- Prevents privilege escalation attacks

### 4. Proper File Permissions

```dockerfile
RUN chmod -R 755 /app && \
    chown -R nextjs:nodejs /app
```

**What we did:**
- Set read/execute permissions for all, write only for owner
- Ensure nextjs user owns all application files

**Why it matters:**
- Prevents unauthorized file modifications
- Limits what an attacker can do if they gain access

### 5. Multi-Stage Build

**What we did:**
- Separate stages for dependencies, building, and runtime
- Only copy necessary files to final stage
- Build tools not included in production image

**Why it matters:**
- Smaller attack surface (fewer packages)
- Reduced image size (~150MB vs ~1GB)
- Build dependencies can't be exploited in production

### 6. Health Checks

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', ...)"
```

**What we did:**
- Regular health checks every 30 seconds
- Automatic container restart on failure

**Why it matters:**
- Detects and recovers from application crashes
- Helps identify security incidents
- Ensures high availability

### 7. Minimal Base Image

**What we did:**
- Using Alpine Linux (5-10MB) instead of Debian/Ubuntu (100MB+)
- Only essential packages installed

**Why it matters:**
- Fewer packages = fewer vulnerabilities
- Smaller image = faster deployment
- Reduced attack surface

## Recommended Security Practices

### 1. Regular Image Updates

Update base images monthly or when security advisories are published:

```bash
# Pull latest secure base image
docker pull node:20.18.1-alpine3.20

# Rebuild with no cache to ensure fresh packages
docker build --no-cache -t chore-buddy:latest .
```

### 2. Vulnerability Scanning

#### Using Docker Scout (Built into Docker Desktop)

```bash
# Enable Docker Scout
docker scout quickview

# Scan your image
docker scout cves chore-buddy:latest

# Get recommendations
docker scout recommendations chore-buddy:latest
```

#### Using Trivy (Open Source)

```bash
# Install Trivy
brew install trivy  # macOS
# or
curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin

# Scan image
trivy image chore-buddy:latest

# Scan for high and critical only
trivy image --severity HIGH,CRITICAL chore-buddy:latest

# Output to JSON
trivy image -f json -o results.json chore-buddy:latest
```

#### Using Snyk

```bash
# Install Snyk CLI
npm install -g snyk

# Authenticate
snyk auth

# Scan Docker image
snyk container test chore-buddy:latest

# Monitor for new vulnerabilities
snyk container monitor chore-buddy:latest
```

### 3. Secrets Management

**Never hardcode secrets in Dockerfile or code!**

❌ **Bad:**
```dockerfile
ENV DATABASE_PASSWORD=mysecretpassword
```

✅ **Good:**
```bash
# Use environment variables at runtime
docker run -e DATABASE_PASSWORD=mysecretpassword chore-buddy

# Or use Docker secrets (Swarm mode)
echo "mysecretpassword" | docker secret create db_password -
docker service create --secret db_password chore-buddy
```

**For Kubernetes:**
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: chore-buddy-secrets
type: Opaque
data:
  AUTH_SECRET: <base64-encoded-secret>
```

**For AWS ECS:**
Use AWS Secrets Manager or Systems Manager Parameter Store

**For Cloud platforms:**
Use their built-in secrets management:
- Google Cloud: Secret Manager
- Azure: Key Vault
- DigitalOcean: App Platform environment variables

### 4. Network Security

#### Use Internal Networks

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    networks:
      - internal
    # Don't expose database ports publicly

  db:
    networks:
      - internal
    # No ports exposed to host

networks:
  internal:
    driver: bridge
```

#### Implement Rate Limiting

Use a reverse proxy like Nginx or Traefik:

```nginx
# nginx.conf
limit_req_zone $binary_remote_addr zone=mylimit:10m rate=10r/s;

server {
    location / {
        limit_req zone=mylimit burst=20;
        proxy_pass http://chore-buddy:3000;
    }
}
```

### 5. Read-Only Root Filesystem

Make the container filesystem read-only:

```yaml
# docker-compose.yml
services:
  app:
    read_only: true
    tmpfs:
      - /tmp
      - /app/.next/cache
```

### 6. Drop Unnecessary Capabilities

```yaml
# docker-compose.yml
services:
  app:
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
```

### 7. Resource Limits

Prevent DoS attacks by limiting resources:

```yaml
# docker-compose.yml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

### 8. Security Headers

Add security headers to Next.js:

```typescript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
          },
        ],
      },
    ];
  },
};
```

## Security Checklist

Use this checklist for production deployments:

- [ ] Base image is up to date
- [ ] Vulnerability scan shows no HIGH or CRITICAL issues
- [ ] Application runs as non-root user
- [ ] Secrets are not hardcoded
- [ ] Environment variables are properly set
- [ ] HTTPS is enabled (use reverse proxy)
- [ ] Rate limiting is configured
- [ ] Resource limits are set
- [ ] Health checks are working
- [ ] Logs are being collected and monitored
- [ ] Security headers are configured
- [ ] Database credentials are rotated regularly
- [ ] Automated security scanning is set up
- [ ] Incident response plan is documented

## Automated Security Scanning

### GitHub Actions

Create `.github/workflows/security-scan.yml`:

```yaml
name: Security Scan

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 0 * * 1' # Weekly on Monday

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build Docker image
        run: docker build -t chore-buddy:${{ github.sha }} .

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: chore-buddy:${{ github.sha }}
          format: 'sarif'
          output: 'trivy-results.sarif'
          severity: 'HIGH,CRITICAL'

      - name: Upload Trivy results to GitHub Security
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'
```

### GitLab CI

Create `.gitlab-ci.yml`:

```yaml
security:
  stage: test
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .
    - docker run --rm -v /var/run/docker.sock:/var/run/docker.sock
      aquasec/trivy image --severity HIGH,CRITICAL
      $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
  only:
    - main
    - merge_requests
```

## Monitoring and Logging

### Container Logging

```bash
# View logs with timestamps
docker logs --timestamps chore-buddy

# Follow logs in real-time
docker logs -f chore-buddy

# Export logs to file
docker logs chore-buddy > app.log 2>&1
```

### Centralized Logging

Use a log aggregation service:

**ELK Stack:**
```yaml
# docker-compose.yml
services:
  app:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

**CloudWatch (AWS):**
```yaml
services:
  app:
    logging:
      driver: awslogs
      options:
        awslogs-region: us-east-1
        awslogs-group: chore-buddy
        awslogs-stream: app
```

## Incident Response

If a security vulnerability is discovered:

1. **Assess Impact**
   - Is the vulnerability being actively exploited?
   - What data might be at risk?

2. **Immediate Actions**
   - Stop affected containers
   - Rotate all secrets and credentials
   - Review access logs

3. **Remediation**
   - Update base images
   - Rebuild and scan images
   - Deploy patched version

4. **Post-Incident**
   - Document what happened
   - Update security procedures
   - Notify affected users if required

## Security Resources

- [Docker Security Best Practices](https://docs.docker.com/develop/security-best-practices/)
- [CIS Docker Benchmark](https://www.cisecurity.org/benchmark/docker)
- [OWASP Container Security](https://owasp.org/www-project-docker-top-10/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)

## Support

For security concerns or to report vulnerabilities:
- Review this document first
- Check for similar issues in documentation
- For critical security issues, contact the repository owner directly (do not create public issues)

---

**Remember: Security is an ongoing process, not a one-time setup!**
