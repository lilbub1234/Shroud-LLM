# Security Policy

## Our Commitment to Security

Shroud LLM is built with privacy and security as core principles. We take security vulnerabilities seriously and appreciate the security research community's efforts to help keep our users safe.

## Supported Versions

We provide security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

If you discover a security vulnerability, please report it responsibly:

### Preferred Method: GitHub Security Advisories
Report privately via [GitHub Security Advisories](https://github.com/lilbub1234/Shroud-LLM/security/advisories/new)

### Alternative Method: Email
Email us at: **security@shroudnetwork.dev**

### What to Include

Please include the following information in your report:
- Type of vulnerability
- Full description of the vulnerability
- Steps to reproduce the issue
- Potential impact
- Suggested fix (if you have one)
- Your name and affiliation (if you'd like to be credited)

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 5 business days
- **Fix Timeline**: Varies based on severity (critical issues within 7 days)

## Security Best Practices

### For Users

1. **Keep Updated**: Always run the latest version
2. **Secure Configuration**: Use strong JWT secrets and signature keys
3. **HTTPS Only**: Always use HTTPS in production
4. **Firewall Rules**: Restrict access to necessary ports only
5. **Regular Backups**: Backup your data regularly
6. **Monitor Logs**: Watch for suspicious activity

### For Developers

1. **Code Review**: All code changes undergo security review
2. **Dependency Scanning**: Regular audits of dependencies
3. **Input Validation**: All user inputs are validated
4. **Secure Defaults**: Privacy-first, secure-by-default configuration
5. **Encryption**: All sensitive data encrypted at rest and in transit
6. **No Secrets in Code**: Never commit API keys, passwords, or secrets

## Privacy Features

Shroud LLM includes privacy-enhancing features:

- **Zero Telemetry by Default**: No tracking unless explicitly enabled
- **Local-First**: All data stays on your infrastructure
- **BYOK Support**: Bring your own encryption keys
- **Timer-Based Deletion**: Auto-expire sensitive data
- **Smart Redaction**: Automatically detect and redact PII
- **Audit Logging**: Track all system access (opt-in)

## Security Measures

### Infrastructure
- End-to-end encryption for data in transit
- Encryption at rest for all sensitive data
- Secure key management and rotation
- Regular security audits
- Minimal dependency footprint

### Code Security
- Input sanitization and validation
- Protection against injection attacks (SQL, XSS, etc.)
- CSRF protection
- Rate limiting
- Secure session management
- Regular dependency updates

### Authentication & Authorization
- Bcrypt password hashing
- JWT-based authentication
- Role-based access control (RBAC)
- Multi-user permission system
- Session timeout controls

## Known Security Considerations

1. **Self-Hosting**: When self-hosting, you are responsible for securing your infrastructure
2. **API Keys**: Store LLM provider API keys securely in environment variables
3. **Database**: The SQLite database should not be publicly accessible
4. **Uploads**: Uploaded documents are processed locally; ensure proper file type validation

## Security Hall of Fame

We recognize and thank security researchers who responsibly disclose vulnerabilities:

_No disclosures yet. Be the first to help make Shroud LLM more secure!_

## Questions?

For non-security questions, please use:
- GitHub Issues: [https://github.com/lilbub1234/Shroud-LLM/issues](https://github.com/lilbub1234/Shroud-LLM/issues)
- Discussions: [https://github.com/lilbub1234/Shroud-LLM/discussions](https://github.com/lilbub1234/Shroud-LLM/discussions)

For security concerns, always use the private reporting methods above.

---

**Thank you for helping keep Shroud LLM and our users safe!**
