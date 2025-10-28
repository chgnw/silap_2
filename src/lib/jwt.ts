import jwt, { Secret, SignOptions } from 'jsonwebtoken';

const SECRET: Secret = process.env.JWT_SECRET!;

type Expiry = `${number}${'s' | 'm' | 'h' | 'd' | 'y'}` | number;

/**
 * Generate JWT token
 */
export function signToken(payload: object, expiresIn: Expiry = '1d'): string {
  const options: SignOptions = { expiresIn };
  return jwt.sign(payload, SECRET, options);
}

/**
 * Verify JWT token
 */
export function verifyToken<T = any>(token: string): T {
  return jwt.verify(token, SECRET) as T;
}

/**
 * Safe verify (return null kalau invalid)
 */
export function safeVerifyToken<T = any>(token: string): T | null {
  try {
    return jwt.verify(token, SECRET) as T;
  } catch {
    return null;
  }
}
