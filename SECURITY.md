# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 2.0.x   | :white_check_mark: |
| < 2.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability in 念念 Eterna, please report it responsibly.

**Do NOT open a public GitHub issue for security vulnerabilities.**

### How to Report

1. **Email**: Send details to security@mokangmedical.com
2. **Subject**: `[SECURITY] 念念 Eterna - <brief description>`
3. **Include**:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### What to Expect

- **Acknowledgment**: Within 48 hours of your report
- **Initial Assessment**: Within 5 business days
- **Resolution Timeline**: We aim to release a fix within 30 days of confirmation
- **Credit**: We will credit reporters in the release notes (unless you prefer anonymity)

## Security Best Practices for Operators

- Never commit `.env.local` or any file containing API keys
- Use strong, unique secrets for `STRIPE_WEBHOOK_SECRET`
- Restrict `ALLOWED_ORIGINS` to your production domain only
- Run the server behind a reverse proxy (nginx/caddy) with TLS
- Regularly rotate API keys and tokens
- Keep dependencies updated: `pip install --upgrade -r requirements.txt`

## Scope

This policy covers the 念念 Eterna application codebase. Third-party
dependencies are governed by their own security policies.
