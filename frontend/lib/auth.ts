import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { query } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRATION = 900; // 15 min
const REFRESH_TOKEN_EXPIRATION = 604800; // 7 days

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function generateAccessToken(userId: string, role: string) {
  return jwt.sign({ sub: userId, role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRATION,
  });
}

export function generateRefreshToken(userId: string) {
  return jwt.sign({ sub: userId }, JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRATION,
  });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch (error) {
    return null;
  }
}

export async function getUserById(userId: string) {
  const result = await query(
    'SELECT id, phone, name, role FROM users WHERE id = $1',
    [userId]
  );
  return result.rows[0] || null;
}

export async function getUserByPhone(phone: string) {
  const result = await query(
    'SELECT id, phone, password_hash, name, role FROM users WHERE phone = $1',
    [phone]
  );
  return result.rows[0] || null;
}
