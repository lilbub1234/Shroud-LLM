# Shroud LLM Privacy Features

This directory contains the core privacy-enhancing features of Shroud LLM.

## Overview

Shroud LLM is built on privacy-first principles. The modules in this directory implement:

1. **Timer-Based Deletion** - Automatic expiration of sensitive data
2. **BYOK (Bring Your Own Keys)** - Zero-knowledge encryption
3. **Smart Redaction** - Automatic PII detection and removal

## Features

### 1. Timer-Based Deletion

Automatically deletes workspaces, conversations, and documents after a specified retention period.

#### Configuration

```bash
# .env
ENABLE_TIMER_DELETION=true
DEFAULT_RETENTION_HOURS=720  # 30 days
```

#### Usage

```javascript
const { TimerBasedDeletion } = require('./privacy');

// Schedule workspace deletion after 24 hours
TimerBasedDeletion.scheduleWorkspaceDeletion('workspace-123', 24);

// Schedule thread deletion with default retention
TimerBasedDeletion.scheduleThreadDeletion('thread-456');

// Cancel scheduled deletion
TimerBasedDeletion.cancelScheduledDeletion('workspace-123');

// Get all scheduled deletions
const scheduled = TimerBasedDeletion.getScheduledDeletions();
```

#### Features

- Automatic deletion at specified times
- Periodic cleanup of expired data
- Cancellable scheduled deletions
- Graceful shutdown with cleanup

### 2. BYOK (Bring Your Own Keys)

Allows users to provide their own encryption keys for zero-knowledge architecture.

#### Configuration

```bash
# .env
ENABLE_BYOK=true
```

#### Usage

```javascript
const { BYOK } = require('./privacy');

// Generate a new key
const newKey = BYOK.generateKey();

// Register user's key (ephemeral, session-only)
BYOK.registerUserKey('user-123', keyMaterial);

// Encrypt data
const encrypted = BYOK.encrypt('user-123', 'sensitive data');
// Returns: { encrypted: base64, iv: base64, tag: base64 }

// Decrypt data
const decrypted = BYOK.decrypt('user-123', encrypted);

// Encrypt file
await BYOK.encryptFile('user-123', '/path/to/file', '/path/to/encrypted');

// Decrypt file
await BYOK.decryptFile('user-123', '/path/to/encrypted', '/path/to/output');

// Rotate key
BYOK.rotateUserKey('user-123', newKeyMaterial);

// Remove key from memory
BYOK.removeUserKey('user-123');
```

#### Features

- AES-256-GCM encryption
- Ephemeral key storage (never persisted)
- Password-derived keys (PBKDF2)
- File encryption/decryption
- Secure key rotation
- Automatic cleanup on shutdown

#### Security Notes

- Keys are stored in memory only
- Keys are wiped with zeros on removal
- No keys are ever written to disk
- Authentication tags prevent tampering
- PBKDF2 with 100,000 iterations for password-derived keys

### 3. Smart Redaction

Automatically detects and redacts PII (Personally Identifiable Information).

#### Configuration

```bash
# .env
ENABLE_AUTO_REDACTION=true
```

#### Usage

```javascript
const { SmartRedaction } = require('./privacy');

// Redact text
const result = SmartRedaction.redact('Email me at user@example.com');
// Returns: {
//   redacted: 'Email me at [EMAIL_REDACTED]',
//   matches: [{ type: 'email', count: 1, description: 'Email addresses' }],
//   hasRedactions: true
// }

// Scan without redacting
const detections = SmartRedaction.scan(text);

// Redact specific patterns only
const result = SmartRedaction.redact(text, ['email', 'phone']);

// Preserve structure (e.g., show last 4 digits of credit card)
const result = SmartRedaction.redact(text, null, true);

// Redact a chat message
const redactedMsg = SmartRedaction.redactMessage(message);

// Redact a document
const redactedDoc = SmartRedaction.redactDocument(documentContent);

// Add custom pattern
SmartRedaction.addCustomPattern(
  'customId',
  /ID-\d{6}/g,
  '[CUSTOM_ID_REDACTED]',
  'Custom ID numbers'
);

// Get available patterns
const patterns = SmartRedaction.getAvailablePatterns();
```

#### Built-in Patterns

- **Email addresses**: user@example.com
- **Social Security Numbers**: XXX-XX-XXXX
- **Credit cards**: XXXX-XXXX-XXXX-XXXX
- **Phone numbers**: (XXX) XXX-XXXX
- **IPv4 addresses**: XXX.XXX.XXX.XXX
- **API keys**: api_key, access_token, etc.
- **AWS keys**: AKIA...
- **Passwords**: password=...
- **JWT tokens**: eyJ...
- **Private keys**: -----BEGIN PRIVATE KEY-----
- **Bitcoin addresses**: 1A1zP1...
- **Ethereum addresses**: 0x...

#### Custom Patterns

Add your own regex patterns for domain-specific PII:

```javascript
SmartRedaction.addCustomPattern(
  'employeeId',
  /EMP\d{6}/g,
  '[EMPLOYEE_ID_REDACTED]',
  'Employee ID numbers'
);
```

## Integration

### Initialize on Server Start

```javascript
// server/index.js
const { PrivacyManager } = require('./privacy');

async function startServer() {
  // Initialize privacy features
  await PrivacyManager.initialize();

  // ... rest of server setup

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    await PrivacyManager.shutdown();
    process.exit(0);
  });
}
```

### Check Status

```javascript
const status = PrivacyManager.getStatus();
console.log(status);
// {
//   initialized: true,
//   timerDeletion: { enabled: true, ... },
//   byok: { enabled: true, ... },
//   redaction: { enabled: true, ... }
// }
```

## Environment Variables

```bash
# Timer-Based Deletion
ENABLE_TIMER_DELETION=true
DEFAULT_RETENTION_HOURS=720  # Default: 30 days

# BYOK (Bring Your Own Keys)
ENABLE_BYOK=true

# Smart Redaction
ENABLE_AUTO_REDACTION=true
```

## Best Practices

### Timer-Based Deletion

1. Set appropriate retention periods for different data types
2. Notify users before deletion
3. Allow users to extend retention periods
4. Provide export functionality before deletion

### BYOK

1. Never store encryption keys in the database
2. Keys should be provided per-session
3. Require key re-entry after session timeout
4. Provide key rotation mechanisms
5. Warn users about key loss (unrecoverable data)

### Smart Redaction

1. Run redaction before storing chat messages
2. Scan documents on upload
3. Allow users to review redactions before applying
4. Provide redaction reports for compliance
5. Keep custom patterns up to date

## Testing

```bash
# Run privacy feature tests
cd server
npm test -- privacy/

# Test timer deletion
npm test -- privacy/TimerBasedDeletion.test.js

# Test BYOK
npm test -- privacy/BYOK.test.js

# Test redaction
npm test -- privacy/SmartRedaction.test.js
```

## Security Considerations

1. **Memory Security**: Keys are wiped before removal
2. **No Persistence**: BYOK keys never touch disk
3. **Authentication**: All encrypted data includes auth tags
4. **Audit Logging**: Track all privacy operations (optional)
5. **Compliance**: Helps meet GDPR, CCPA, HIPAA requirements

## Future Enhancements

- [ ] Hardware Security Module (HSM) integration
- [ ] Key escrow for enterprise recovery
- [ ] Advanced PII detection using ML models
- [ ] Differential privacy for analytics
- [ ] Homomorphic encryption for search
- [ ] Secure multi-party computation

## License

MIT License - See LICENSE file

## Contributing

See CONTRIBUTING.md for guidelines on adding privacy features.
