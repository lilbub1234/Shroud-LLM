/**
 * Shroud LLM Privacy Features
 *
 * Central module for all privacy-enhancing features:
 * - Timer-Based Deletion: Auto-expire sensitive data
 * - BYOK: Bring Your Own Keys for zero-knowledge encryption
 * - Smart Redaction: Automatic PII detection and removal
 */

const TimerBasedDeletion = require('./TimerBasedDeletion');
const BYOK = require('./BYOK');
const SmartRedaction = require('./SmartRedaction');

class PrivacyManager {
  constructor() {
    this.timerDeletion = TimerBasedDeletion;
    this.byok = BYOK;
    this.redaction = SmartRedaction;
    this.initialized = false;
  }

  /**
   * Initialize all privacy features
   */
  async initialize() {
    if (this.initialized) {
      console.log('[Privacy] Already initialized');
      return;
    }

    console.log('[Privacy] Initializing Shroud LLM privacy features...');

    try {
      // Initialize each module
      await this.timerDeletion.initialize();
      await this.byok.initialize();
      await this.redaction.initialize();

      this.initialized = true;
      console.log('[Privacy] All privacy features initialized successfully');
    } catch (error) {
      console.error('[Privacy] Error initializing privacy features:', error);
      throw error;
    }
  }

  /**
   * Get status of all privacy features
   * @returns {Object} Status information
   */
  getStatus() {
    return {
      initialized: this.initialized,
      timerDeletion: {
        enabled: this.timerDeletion.enabled,
        defaultRetentionHours: this.timerDeletion.defaultRetentionHours,
        scheduledDeletions: this.timerDeletion.getScheduledDeletions().length
      },
      byok: {
        enabled: this.byok.enabled,
        algorithm: this.byok.algorithm,
        keyLength: this.byok.keyLength
      },
      redaction: {
        enabled: this.redaction.enabled,
        patterns: this.redaction.getAvailablePatterns().length
      }
    };
  }

  /**
   * Shutdown all privacy features gracefully
   */
  async shutdown() {
    console.log('[Privacy] Shutting down privacy features...');

    try {
      this.timerDeletion.shutdown();
      this.byok.shutdown();

      this.initialized = false;
      console.log('[Privacy] Privacy features shut down successfully');
    } catch (error) {
      console.error('[Privacy] Error during shutdown:', error);
    }
  }
}

// Export singleton instance
const privacyManager = new PrivacyManager();

module.exports = {
  PrivacyManager: privacyManager,
  TimerBasedDeletion,
  BYOK,
  SmartRedaction
};
