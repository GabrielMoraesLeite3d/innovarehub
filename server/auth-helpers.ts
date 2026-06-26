import crypto from 'crypto';

/**
 * Secure password hashing using scrypt with random salt.
 * Outputs: salt:hash
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derivedKey}`;
}

/**
 * Verifies if the password matches the hash.
 * Supports legacy SHA-256 fallback check for seed users.
 */
export function verifyPassword(password: string, combinedHash: string): boolean {
  if (!combinedHash.includes(':')) {
    // Fallback to legacy SHA-256 for demo seed users
    const sha256 = crypto.createHash('sha256').update(password).digest('hex');
    return sha256 === combinedHash;
  }
  
  const [salt, key] = combinedHash.split(':');
  const derivedKey = crypto.scryptSync(password, salt, 64).toString('hex');
  return derivedKey === key;
}

/**
 * Generates a random cryptographically secure session token.
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

