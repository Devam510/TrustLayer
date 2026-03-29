import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'
import { loadKey, getCurrentVersion } from './keys'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12   // 96-bit IV recommended for GCM
const TAG_LENGTH = 16  // 128-bit auth tag

/**
 * Encrypted payload layout (binary):
 * [1 byte keyVersion][12 bytes IV][N bytes ciphertext][16 bytes authTag]
 */

/**
 * Encrypt arbitrary data using AES-256-GCM with the current key version.
 * Returns a Buffer suitable for storage in BYTEA columns.
 */
export function encrypt(data: string | Buffer, keyVersion?: number): Buffer {
  const version = keyVersion ?? getCurrentVersion()
  const key = loadKey(version)
  const iv = randomBytes(IV_LENGTH)

  const cipher = createCipheriv(ALGORITHM, key, iv, {
    authTagLength: TAG_LENGTH,
  })

  const plaintext = Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf8')
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()])
  const authTag = cipher.getAuthTag()

  // Layout: version(1) | iv(12) | ciphertext(N) | authTag(16)
  return Buffer.concat([
    Buffer.from([version]),
    iv,
    encrypted,
    authTag,
  ])
}

/**
 * Decrypt a Buffer previously produced by encrypt().
 * Automatically reads the key version from the payload header.
 * Returns the plaintext as a UTF-8 string.
 */
export function decrypt(ciphertext: Buffer): string {
  // Parse layout
  const version = ciphertext.readUInt8(0)
  const iv = ciphertext.slice(1, 1 + IV_LENGTH)
  const authTag = ciphertext.slice(ciphertext.length - TAG_LENGTH)
  const encrypted = ciphertext.slice(1 + IV_LENGTH, ciphertext.length - TAG_LENGTH)

  const key = loadKey(version)
  const decipher = createDecipheriv(ALGORITHM, key, iv, {
    authTagLength: TAG_LENGTH,
  })
  decipher.setAuthTag(authTag)

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])
  return decrypted.toString('utf8')
}

/**
 * Returns the key version embedded in an encrypted buffer.
 * Used to detect stale key versions for lazy re-encryption.
 */
export function getEncryptedVersion(ciphertext: Buffer): number {
  return ciphertext.readUInt8(0)
}

/**
 * Lazy re-encryption: if ciphertext uses an old key version, re-encrypt with
 * the current version. Returns { data, needsUpdate } so callers can persist
 * the new ciphertext if needsUpdate is true.
 */
export function maybeReencrypt(ciphertext: Buffer): {
  data: Buffer
  needsUpdate: boolean
} {
  const version = getEncryptedVersion(ciphertext)
  const current = getCurrentVersion()

  if (version === current) {
    return { data: ciphertext, needsUpdate: false }
  }

  const plaintext = decrypt(ciphertext)
  const reencrypted = encrypt(plaintext, current)
  return { data: reencrypted, needsUpdate: true }
}
