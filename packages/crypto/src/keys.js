"use strict";
/**
 * Key management for AES-256-GCM encryption.
 * Keys are loaded from environment variables injected by Doppler.
 * Format: ENCRYPTION_KEY_V{version}=<64-hex-chars>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadKey = loadKey;
exports.getCurrentVersion = getCurrentVersion;
const KEY_CACHE = new Map();
/**
 * Load encryption key for the given version from env.
 * Caches in memory to avoid repeated hex decoding.
 */
function loadKey(version) {
    if (KEY_CACHE.has(version)) {
        return KEY_CACHE.get(version);
    }
    const envVar = `ENCRYPTION_KEY_V${version}`;
    const hexKey = process.env[envVar];
    if (!hexKey) {
        throw new Error(`[crypto] Missing encryption key: ${envVar}`);
    }
    if (hexKey.length !== 64) {
        throw new Error(`[crypto] ${envVar} must be 64 hex chars (32 bytes for AES-256). Got ${hexKey.length}.`);
    }
    const key = Buffer.from(hexKey, 'hex');
    KEY_CACHE.set(version, key);
    return key;
}
/**
 * Returns the current active key version from env.
 * Used when encrypting new data.
 */
function getCurrentVersion() {
    const raw = process.env.CURRENT_ENCRYPTION_KEY_VERSION;
    if (!raw) {
        throw new Error('[crypto] CURRENT_ENCRYPTION_KEY_VERSION env var not set');
    }
    const version = parseInt(raw, 10);
    if (isNaN(version) || version < 1) {
        throw new Error(`[crypto] Invalid CURRENT_ENCRYPTION_KEY_VERSION: ${raw}`);
    }
    return version;
}
//# sourceMappingURL=keys.js.map