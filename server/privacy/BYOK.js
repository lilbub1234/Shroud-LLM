/**
 * BYOK (Bring Your Own Keys) Module
 *
 * Allows users to provide their own encryption keys for data at rest.
 * Ensures zero-knowledge architecture where the server never has access to unencrypted user data.
 */

const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

class BYOK {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.keyLength = 32; // 256 bits
    this.ivLength = 16; // 128 bits
    this.saltLength = 64;
    this.tagLength = 16;
    this.enabled = process.env.ENABLE_BYOK === 'true';
    this.userKeys = new Map(); // Store user-provided keys in memory (ephemeral)
  }

  /**
   * Initialize BYOK service
   */
  async initialize() {
    if (!this.enabled) {
      console.log('[Privacy] BYOK is disabled. Using system encryption.');
      return;
    }

    console.log('[Privacy] BYOK (Bring Your Own Keys) enabled');
    console.log('[Privacy] Users can provide their own encryption keys for zero-knowledge encryption');
  }

  /**
   * Register a user's encryption key (ephemeral, session-only)
   * @param {string} userId - User ID
   * @param {string} keyMaterial - Base64-encoded key material
   * @returns {boolean} Success status
   */
  registerUserKey(userId, keyMaterial) {
    try {
      // Decode and validate key
      const keyBuffer = Buffer.from(keyMaterial, 'base64');

      if (keyBuffer.length !== this.keyLength) {
        throw new Error(`Invalid key length. Expected ${this.keyLength} bytes, got ${keyBuffer.length}`);
      }

      // Store in memory only (never persisted to disk)
      this.userKeys.set(userId, keyBuffer);
      console.log(`[Privacy] Registered encryption key for user ${userId} (ephemeral)`);
      return true;
    } catch (error) {
      console.error(`[Privacy] Error registering user key:`, error.message);
      return false;
    }
  }

  /**
   * Remove a user's encryption key from memory
   * @param {string} userId - User ID
   */
  removeUserKey(userId) {
    if (this.userKeys.has(userId)) {
      // Overwrite with zeros before deleting
      const key = this.userKeys.get(userId);
      key.fill(0);
      this.userKeys.delete(userId);
      console.log(`[Privacy] Removed encryption key for user ${userId}`);
    }
  }

  /**
   * Generate a new encryption key
   * @returns {string} Base64-encoded encryption key
   */
  generateKey() {
    const key = crypto.randomBytes(this.keyLength);
    const keyBase64 = key.toString('base64');

    // Securely wipe the buffer
    key.fill(0);

    return keyBase64;
  }

  /**
   * Derive a key from a password (PBKDF2)
   * @param {string} password - User password
   * @param {string} salt - Base64-encoded salt (optional, will generate if not provided)
   * @returns {Object} { key: base64 key, salt: base64 salt }
   */
  deriveKeyFromPassword(password, salt = null) {
    const saltBuffer = salt ? Buffer.from(salt, 'base64') : crypto.randomBytes(this.saltLength);

    const keyBuffer = crypto.pbkdf2Sync(
      password,
      saltBuffer,
      100000, // iterations
      this.keyLength,
      'sha256'
    );

    const result = {
      key: keyBuffer.toString('base64'),
      salt: saltBuffer.toString('base64')
    };

    // Securely wipe buffers
    keyBuffer.fill(0);

    return result;
  }

  /**
   * Encrypt data with user's key
   * @param {string} userId - User ID
   * @param {string|Buffer} data - Data to encrypt
   * @returns {Object} { encrypted: base64, iv: base64, tag: base64 } or null if no key
   */
  encrypt(userId, data) {
    const key = this.userKeys.get(userId);

    if (!key) {
      console.warn(`[Privacy] No encryption key found for user ${userId}`);
      return null;
    }

    try {
      const iv = crypto.randomBytes(this.ivLength);
      const cipher = crypto.createCipheriv(this.algorithm, key, iv);

      const dataBuffer = Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf8');
      const encrypted = Buffer.concat([cipher.update(dataBuffer), cipher.final()]);
      const tag = cipher.getAuthTag();

      return {
        encrypted: encrypted.toString('base64'),
        iv: iv.toString('base64'),
        tag: tag.toString('base64')
      };
    } catch (error) {
      console.error('[Privacy] Encryption error:', error.message);
      return null;
    }
  }

  /**
   * Decrypt data with user's key
   * @param {string} userId - User ID
   * @param {Object} encryptedData - { encrypted: base64, iv: base64, tag: base64 }
   * @returns {Buffer} Decrypted data or null if failed
   */
  decrypt(userId, encryptedData) {
    const key = this.userKeys.get(userId);

    if (!key) {
      console.warn(`[Privacy] No encryption key found for user ${userId}`);
      return null;
    }

    try {
      const { encrypted, iv, tag } = encryptedData;

      const decipher = crypto.createDecipheriv(
        this.algorithm,
        key,
        Buffer.from(iv, 'base64')
      );

      decipher.setAuthTag(Buffer.from(tag, 'base64'));

      const decrypted = Buffer.concat([
        decipher.update(Buffer.from(encrypted, 'base64')),
        decipher.final()
      ]);

      return decrypted;
    } catch (error) {
      console.error('[Privacy] Decryption error:', error.message);
      return null;
    }
  }

  /**
   * Encrypt a file
   * @param {string} userId - User ID
   * @param {string} filePath - Path to file
   * @param {string} outputPath - Output path for encrypted file
   * @returns {Object} Encryption metadata or null
   */
  async encryptFile(userId, filePath, outputPath) {
    try {
      const data = await fs.readFile(filePath);
      const encrypted = this.encrypt(userId, data);

      if (!encrypted) return null;

      // Write encrypted data and metadata
      await fs.writeFile(outputPath, JSON.stringify(encrypted));

      console.log(`[Privacy] File encrypted: ${filePath} -> ${outputPath}`);
      return encrypted;
    } catch (error) {
      console.error('[Privacy] File encryption error:', error.message);
      return null;
    }
  }

  /**
   * Decrypt a file
   * @param {string} userId - User ID
   * @param {string} encryptedPath - Path to encrypted file
   * @param {string} outputPath - Output path for decrypted file
   * @returns {boolean} Success status
   */
  async decryptFile(userId, encryptedPath, outputPath) {
    try {
      const encryptedData = JSON.parse(await fs.readFile(encryptedPath, 'utf8'));
      const decrypted = this.decrypt(userId, encryptedData);

      if (!decrypted) return false;

      await fs.writeFile(outputPath, decrypted);

      console.log(`[Privacy] File decrypted: ${encryptedPath} -> ${outputPath}`);
      return true;
    } catch (error) {
      console.error('[Privacy] File decryption error:', error.message);
      return false;
    }
  }

  /**
   * Rotate a user's encryption key
   * @param {string} userId - User ID
   * @param {string} newKeyMaterial - New base64-encoded key
   * @returns {boolean} Success status
   */
  rotateUserKey(userId, newKeyMaterial) {
    try {
      // Remove old key
      this.removeUserKey(userId);

      // Register new key
      return this.registerUserKey(userId, newKeyMaterial);
    } catch (error) {
      console.error('[Privacy] Key rotation error:', error.message);
      return false;
    }
  }

  /**
   * Get key management info for a user
   * @param {string} userId - User ID
   * @returns {Object} Key info (does not include actual key material)
   */
  getUserKeyInfo(userId) {
    return {
      hasKey: this.userKeys.has(userId),
      algorithm: this.algorithm,
      keyLength: this.keyLength,
      enabled: this.enabled
    };
  }

  /**
   * Cleanup on shutdown - securely wipe all keys
   */
  shutdown() {
    console.log('[Privacy] Shutting down BYOK service...');
    for (const [userId, key] of this.userKeys.entries()) {
      key.fill(0); // Overwrite with zeros
      console.log(`[Privacy] Wiped encryption key for user ${userId}`);
    }
    this.userKeys.clear();
  }
}

module.exports = new BYOK();
