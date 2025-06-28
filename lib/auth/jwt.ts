import jwt from 'jsonwebtoken';
import { serverConfig } from '../config/secure-config';

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'customer' | 'contractor' | 'admin';
  iat?: number;
  exp?: number;
}

const JWT_SECRET = serverConfig.security.jwtSecret;
const TOKEN_EXPIRY = '7d'; // 7 days
const REFRESH_TOKEN_EXPIRY = '30d'; // 30 days

/**
 * Generate a JWT token for a user
 */
export async function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET not configured');
  }

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY,
    issuer: 'leila-home-services',
    audience: 'leila-api',
  });
}

/**
 * Generate a refresh token
 */
export async function generateRefreshToken(userId: string): Promise<string> {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET not configured');
  }

  return jwt.sign(
    { userId, type: 'refresh' },
    JWT_SECRET,
    {
      expiresIn: REFRESH_TOKEN_EXPIRY,
      issuer: 'leila-home-services',
    }
  );
}

/**
 * Verify and decode a JWT token
 */
export async function verifyToken(token: string): Promise<JWTPayload> {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET not configured');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'leila-home-services',
      audience: 'leila-api',
    }) as JWTPayload;

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    throw error;
  }
}

/**
 * Verify a refresh token
 */
export async function verifyRefreshToken(token: string): Promise<{ userId: string }> {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET not configured');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'leila-home-services',
    }) as any;

    if (decoded.type !== 'refresh') {
      throw new Error('Invalid refresh token');
    }

    return { userId: decoded.userId };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Refresh token expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid refresh token');
    }
    throw error;
  }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
}

/**
 * Generate a secure API key
 */
export function generateApiKey(): string {
  const prefix = 'lhs_'; // Leila Home Services
  const randomBytes = require('crypto').randomBytes(32).toString('hex');
  return `${prefix}${randomBytes}`;
}

/**
 * Hash an API key for storage
 */
export async function hashApiKey(apiKey: string): Promise<string> {
  const crypto = require('crypto');
  return crypto
    .createHash('sha256')
    .update(apiKey)
    .digest('hex');
}