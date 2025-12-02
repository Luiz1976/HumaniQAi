import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_EXPIRES_IN = '7d';

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'admin' | 'empresa' | 'colaborador';
  empresaId?: string;
  colaboradorId?: string;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

function getJwtSecret(): string {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable must be set');
  }
  return process.env.JWT_SECRET;
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, getJwtSecret()) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

export function generateInviteToken(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
