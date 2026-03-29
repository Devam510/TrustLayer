"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encrypt = encrypt;
exports.decrypt = decrypt;
exports.getEncryptedVersion = getEncryptedVersion;
exports.maybeReencrypt = maybeReencrypt;
const crypto_1 = require("crypto");
const keys_1 = require("./keys");
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96-bit IV recommended for GCM
const TAG_LENGTH = 16; // 128-bit auth tag
/**
 * Encrypted payload layout (binary):
 * [1 byte keyVersion][12 bytes IV][N bytes ciphertext][16 bytes authTag]
 */
/**
 * Encrypt arbitrary data using AES-256-GCM with the current key version.
 * Returns a Buffer suitable for storage in BYTEA columns.
 */
function encrypt(data, keyVersion) {
    const version = keyVersion ?? (0, keys_1.getCurrentVersion)();
    const key = (0, keys_1.loadKey)(version);
    const iv = (0, crypto_1.randomBytes)(IV_LENGTH);
    const cipher = (0, crypto_1.createCipheriv)(ALGORITHM, key, iv, {
        authTagLength: TAG_LENGTH,
    });
    const plaintext = Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf8');
    const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
    const authTag = cipher.getAuthTag();
    // Layout: version(1) | iv(12) | ciphertext(N) | authTag(16)
    return Buffer.concat([
        Buffer.from([version]),
        iv,
        encrypted,
        authTag,
    ]);
}
/**
 * Decrypt a Buffer previously produced by encrypt().
 * Automatically reads the key version from the payload header.
 * Returns the plaintext as a UTF-8 string.
 */
function decrypt(ciphertext) {
    // Parse layout
    const version = ciphertext.readUInt8(0);
    const iv = ciphertext.slice(1, 1 + IV_LENGTH);
    const authTag = ciphertext.slice(ciphertext.length - TAG_LENGTH);
    const encrypted = ciphertext.slice(1 + IV_LENGTH, ciphertext.length - TAG_LENGTH);
    const key = (0, keys_1.loadKey)(version);
    const decipher = (0, crypto_1.createDecipheriv)(ALGORITHM, key, iv, {
        authTagLength: TAG_LENGTH,
    });
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString('utf8');
}
/**
 * Returns the key version embedded in an encrypted buffer.
 * Used to detect stale key versions for lazy re-encryption.
 */
function getEncryptedVersion(ciphertext) {
    return ciphertext.readUInt8(0);
}
/**
 * Lazy re-encryption: if ciphertext uses an old key version, re-encrypt with
 * the current version. Returns { data, needsUpdate } so callers can persist
 * the new ciphertext if needsUpdate is true.
 */
function maybeReencrypt(ciphertext) {
    const version = getEncryptedVersion(ciphertext);
    const current = (0, keys_1.getCurrentVersion)();
    if (version === current) {
        return { data: ciphertext, needsUpdate: false };
    }
    const plaintext = decrypt(ciphertext);
    const reencrypted = encrypt(plaintext, current);
    return { data: reencrypted, needsUpdate: true };
}
//# sourceMappingURL=aes.js.map