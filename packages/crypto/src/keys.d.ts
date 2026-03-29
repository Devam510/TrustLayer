/**
 * Key management for AES-256-GCM encryption.
 * Keys are loaded from environment variables injected by Doppler.
 * Format: ENCRYPTION_KEY_V{version}=<64-hex-chars>
 */
/**
 * Load encryption key for the given version from env.
 * Caches in memory to avoid repeated hex decoding.
 */
export declare function loadKey(version: number): Buffer;
/**
 * Returns the current active key version from env.
 * Used when encrypting new data.
 */
export declare function getCurrentVersion(): number;
//# sourceMappingURL=keys.d.ts.map