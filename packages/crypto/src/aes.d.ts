/**
 * Encrypted payload layout (binary):
 * [1 byte keyVersion][12 bytes IV][N bytes ciphertext][16 bytes authTag]
 */
/**
 * Encrypt arbitrary data using AES-256-GCM with the current key version.
 * Returns a Buffer suitable for storage in BYTEA columns.
 */
export declare function encrypt(data: string | Buffer, keyVersion?: number): Buffer;
/**
 * Decrypt a Buffer previously produced by encrypt().
 * Automatically reads the key version from the payload header.
 * Returns the plaintext as a UTF-8 string.
 */
export declare function decrypt(ciphertext: Buffer): string;
/**
 * Returns the key version embedded in an encrypted buffer.
 * Used to detect stale key versions for lazy re-encryption.
 */
export declare function getEncryptedVersion(ciphertext: Buffer): number;
/**
 * Lazy re-encryption: if ciphertext uses an old key version, re-encrypt with
 * the current version. Returns { data, needsUpdate } so callers can persist
 * the new ciphertext if needsUpdate is true.
 */
export declare function maybeReencrypt(ciphertext: Buffer): {
    data: Buffer;
    needsUpdate: boolean;
};
//# sourceMappingURL=aes.d.ts.map