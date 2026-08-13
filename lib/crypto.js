import crypto from 'crypto';

// AES-256-GCM field-level encryption for highly sensitive values (SSNs).
// The key lives only in Vercel's environment variables — never in the
// database or in client-side code.

function getKey() {
  const hex = process.env.SSN_ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error('SSN_ENCRYPTION_KEY must be set to a 64-character hex string');
  }
  return Buffer.from(hex, 'hex');
}

export function encryptField(plainText) {
  if (!plainText) return null;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  // Store as iv:authTag:ciphertext, all base64
  return [iv.toString('base64'), authTag.toString('base64'), encrypted.toString('base64')].join(':');
}

export function decryptField(stored) {
  if (!stored) return null;
  const [ivB64, tagB64, dataB64] = stored.split(':');
  const decipher = crypto.createDecipheriv('aes-256-gcm', getKey(), Buffer.from(ivB64, 'base64'));
  decipher.setAuthTag(Buffer.from(tagB64, 'base64'));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(dataB64, 'base64')), decipher.final()]);
  return decrypted.toString('utf8');
}

export function last4(ssn) {
  if (!ssn) return '';
  const digits = ssn.replace(/\D/g, '');
  return digits.slice(-4);
}
