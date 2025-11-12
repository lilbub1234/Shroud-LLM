/**
 * Smart Redaction Module
 *
 * Automatically detects and redacts sensitive information (PII) from text.
 * Patterns include: emails, SSNs, credit cards, phone numbers, API keys, etc.
 */

class SmartRedaction {
  constructor() {
    this.enabled = process.env.ENABLE_AUTO_REDACTION === 'true';

    // Regex patterns for common PII
    this.patterns = {
      email: {
        regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
        replacement: '[EMAIL_REDACTED]',
        description: 'Email addresses'
      },
      ssn: {
        regex: /\b\d{3}-\d{2}-\d{4}\b/g,
        replacement: '[SSN_REDACTED]',
        description: 'Social Security Numbers (XXX-XX-XXXX)'
      },
      creditCard: {
        regex: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,
        replacement: '[CREDIT_CARD_REDACTED]',
        description: 'Credit card numbers'
      },
      phone: {
        regex: /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
        replacement: '[PHONE_REDACTED]',
        description: 'Phone numbers'
      },
      ipv4: {
        regex: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
        replacement: '[IP_REDACTED]',
        description: 'IPv4 addresses'
      },
      apiKey: {
        regex: /\b(?:api[_-]?key|apikey|access[_-]?token|secret[_-]?key)[\s:=]+['"]?([a-zA-Z0-9_\-]{20,})['"]?/gi,
        replacement: '[API_KEY_REDACTED]',
        description: 'API keys and tokens'
      },
      awsKey: {
        regex: /\b(AKIA[0-9A-Z]{16})\b/g,
        replacement: '[AWS_KEY_REDACTED]',
        description: 'AWS access keys'
      },
      password: {
        regex: /\b(?:password|passwd|pwd)[\s:=]+['"]?([^\s'"]{8,})['"]?/gi,
        replacement: '[PASSWORD_REDACTED]',
        description: 'Passwords'
      },
      jwt: {
        regex: /\beyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*\b/g,
        replacement: '[JWT_REDACTED]',
        description: 'JWT tokens'
      },
      privateKey: {
        regex: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g,
        replacement: '[PRIVATE_KEY_REDACTED]',
        description: 'Private keys (RSA, EC, OpenSSH)'
      },
      bitcoinAddress: {
        regex: /\b[13][a-km-zA-HJ-NP-Z1-9]{25,34}\b/g,
        replacement: '[BITCOIN_ADDRESS_REDACTED]',
        description: 'Bitcoin addresses'
      },
      ethereumAddress: {
        regex: /\b0x[a-fA-F0-9]{40}\b/g,
        replacement: '[ETH_ADDRESS_REDACTED]',
        description: 'Ethereum addresses'
      }
    };

    // Custom patterns can be added by users
    this.customPatterns = new Map();
  }

  /**
   * Initialize the redaction service
   */
  async initialize() {
    if (!this.enabled) {
      console.log('[Privacy] Smart redaction is disabled');
      return;
    }

    console.log('[Privacy] Smart redaction enabled');
    console.log(`[Privacy] Monitoring for ${Object.keys(this.patterns).length} PII patterns`);
  }

  /**
   * Add a custom redaction pattern
   * @param {string} name - Pattern name
   * @param {RegExp} regex - Regular expression
   * @param {string} replacement - Replacement text
   * @param {string} description - Pattern description
   */
  addCustomPattern(name, regex, replacement, description) {
    this.customPatterns.set(name, {
      regex,
      replacement,
      description
    });
    console.log(`[Privacy] Added custom redaction pattern: ${name}`);
  }

  /**
   * Remove a custom redaction pattern
   * @param {string} name - Pattern name
   */
  removeCustomPattern(name) {
    if (this.customPatterns.delete(name)) {
      console.log(`[Privacy] Removed custom redaction pattern: ${name}`);
      return true;
    }
    return false;
  }

  /**
   * Redact sensitive information from text
   * @param {string} text - Text to redact
   * @param {Array<string>} enabledPatterns - Pattern names to use (defaults to all)
   * @param {boolean} preserveStructure - Keep partial data visible (e.g., last 4 digits of credit card)
   * @returns {Object} { redacted: string, matches: Array }
   */
  redact(text, enabledPatterns = null, preserveStructure = false) {
    if (!text) return { redacted: '', matches: [] };

    let redactedText = text;
    const matches = [];

    // Determine which patterns to use
    const patternsToUse = enabledPatterns
      ? Object.entries(this.patterns).filter(([name]) => enabledPatterns.includes(name))
      : Object.entries(this.patterns);

    // Apply built-in patterns
    for (const [name, pattern] of patternsToUse) {
      const found = text.match(pattern.regex);
      if (found) {
        matches.push({
          type: name,
          count: found.length,
          description: pattern.description
        });

        if (preserveStructure && name === 'creditCard') {
          // Show last 4 digits for credit cards
          redactedText = redactedText.replace(pattern.regex, (match) => {
            const last4 = match.slice(-4);
            return `[CREDIT_CARD_****${last4}]`;
          });
        } else {
          redactedText = redactedText.replace(pattern.regex, pattern.replacement);
        }
      }
    }

    // Apply custom patterns
    for (const [name, pattern] of this.customPatterns.entries()) {
      const found = text.match(pattern.regex);
      if (found) {
        matches.push({
          type: `custom:${name}`,
          count: found.length,
          description: pattern.description
        });
        redactedText = redactedText.replace(pattern.regex, pattern.replacement);
      }
    }

    return {
      redacted: redactedText,
      matches,
      hasRedactions: matches.length > 0
    };
  }

  /**
   * Scan text for PII without redacting
   * @param {string} text - Text to scan
   * @param {Array<string>} enabledPatterns - Pattern names to check
   * @returns {Array} List of detected PII
   */
  scan(text, enabledPatterns = null) {
    if (!text) return [];

    const detections = [];

    const patternsToUse = enabledPatterns
      ? Object.entries(this.patterns).filter(([name]) => enabledPatterns.includes(name))
      : Object.entries(this.patterns);

    for (const [name, pattern] of patternsToUse) {
      const matches = text.match(pattern.regex);
      if (matches) {
        detections.push({
          type: name,
          description: pattern.description,
          count: matches.length,
          samples: matches.slice(0, 3).map(m => this.maskSample(m))
        });
      }
    }

    for (const [name, pattern] of this.customPatterns.entries()) {
      const matches = text.match(pattern.regex);
      if (matches) {
        detections.push({
          type: `custom:${name}`,
          description: pattern.description,
          count: matches.length,
          samples: matches.slice(0, 3).map(m => this.maskSample(m))
        });
      }
    }

    return detections;
  }

  /**
   * Mask a sample for display (show first and last 2 chars)
   * @param {string} sample - Original sample
   * @returns {string} Masked sample
   */
  maskSample(sample) {
    if (sample.length <= 4) return '****';
    return `${sample.slice(0, 2)}...${sample.slice(-2)}`;
  }

  /**
   * Redact PII from a workspace chat message
   * @param {Object} message - Chat message object
   * @param {Array<string>} patterns - Patterns to apply
   * @returns {Object} Redacted message
   */
  redactMessage(message, patterns = null) {
    if (!message || !message.content) return message;

    const result = this.redact(message.content, patterns);

    return {
      ...message,
      content: result.redacted,
      redactions: result.matches,
      wasRedacted: result.hasRedactions
    };
  }

  /**
   * Redact PII from a document
   * @param {string} documentContent - Document text content
   * @param {Array<string>} patterns - Patterns to apply
   * @returns {Object} Redacted document info
   */
  redactDocument(documentContent, patterns = null) {
    const result = this.redact(documentContent, patterns);

    return {
      content: result.redacted,
      redactions: result.matches,
      wasRedacted: result.hasRedactions,
      redactionSummary: this.summarizeRedactions(result.matches)
    };
  }

  /**
   * Create a summary of redactions
   * @param {Array} matches - Redaction matches
   * @returns {string} Human-readable summary
   */
  summarizeRedactions(matches) {
    if (!matches || matches.length === 0) {
      return 'No sensitive information detected';
    }

    const summary = matches.map(m => `${m.count} ${m.description}`).join(', ');
    return `Redacted: ${summary}`;
  }

  /**
   * Get available pattern info
   * @returns {Array} Pattern information
   */
  getAvailablePatterns() {
    const patterns = Object.entries(this.patterns).map(([name, pattern]) => ({
      name,
      description: pattern.description,
      type: 'built-in'
    }));

    const custom = Array.from(this.customPatterns.entries()).map(([name, pattern]) => ({
      name,
      description: pattern.description,
      type: 'custom'
    }));

    return [...patterns, ...custom];
  }

  /**
   * Enable or disable specific patterns
   * @param {Array<string>} patternNames - Pattern names to toggle
   * @param {boolean} enabled - Enable or disable
   */
  togglePatterns(patternNames, enabled) {
    // This would typically update a database setting
    console.log(`[Privacy] ${enabled ? 'Enabled' : 'Disabled'} patterns: ${patternNames.join(', ')}`);
  }

  /**
   * Get redaction statistics
   * @returns {Object} Statistics
   */
  getStats() {
    return {
      enabled: this.enabled,
      builtInPatterns: Object.keys(this.patterns).length,
      customPatterns: this.customPatterns.size,
      totalPatterns: Object.keys(this.patterns).length + this.customPatterns.size
    };
  }
}

module.exports = new SmartRedaction();
