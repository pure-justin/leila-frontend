import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import jwt from 'jsonwebtoken';
import { serverConfig } from '../config/secure-config';

interface ApiHandlerOptions {
  requireAuth?: boolean;
  requireApiKey?: boolean;
  allowedMethods?: string[];
  rateLimit?: number;
}

interface AuthenticatedRequest extends NextRequest {
  userId?: string;
  userEmail?: string;
  apiKeyId?: string;
  ip?: string;
}

// API Response wrapper for consistent responses
export class ApiResponse {
  static success(data: any, meta?: any) {
    return NextResponse.json({
      success: true,
      data,
      meta,
      timestamp: new Date().toISOString(),
    });
  }

  static error(message: string, statusCode: number = 400, details?: any) {
    return NextResponse.json({
      success: false,
      error: {
        message,
        details,
        timestamp: new Date().toISOString(),
      },
    }, { status: statusCode });
  }

  static unauthorized(message: string = 'Unauthorized') {
    return this.error(message, 401);
  }

  static forbidden(message: string = 'Forbidden') {
    return this.error(message, 403);
  }

  static notFound(message: string = 'Not found') {
    return this.error(message, 404);
  }

  static tooManyRequests(retryAfter: number = 60) {
    return NextResponse.json({
      success: false,
      error: {
        message: 'Too many requests',
        retryAfter,
        timestamp: new Date().toISOString(),
      },
    }, {
      status: 429,
      headers: {
        'Retry-After': String(retryAfter),
      },
    });
  }
}

// Secure API handler wrapper
export function secureApiHandler(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>,
  options: ApiHandlerOptions = {}
) {
  return async (req: NextRequest) => {
    try {
      // Check allowed methods
      if (options.allowedMethods && !options.allowedMethods.includes(req.method)) {
        return ApiResponse.error(`Method ${req.method} not allowed`, 405);
      }

      // Authenticate request
      if (options.requireAuth || options.requireApiKey) {
        const authResult = await authenticateRequest(req, options);
        if (!authResult.success) {
          return ApiResponse.unauthorized(authResult.error);
        }
        
        // Attach auth info to request
        (req as AuthenticatedRequest).userId = authResult.userId;
        (req as AuthenticatedRequest).userEmail = authResult.userEmail;
        (req as AuthenticatedRequest).apiKeyId = authResult.apiKeyId;
        (req as AuthenticatedRequest).ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
      }

      // Execute handler
      return await handler(req as AuthenticatedRequest);
      
    } catch (error) {
      console.error('[API Error]:', error);
      
      // Don't expose internal errors in production
      if (process.env.NODE_ENV === 'production') {
        return ApiResponse.error('Internal server error', 500);
      }
      
      return ApiResponse.error(
        error instanceof Error ? error.message : 'Unknown error',
        500,
        error
      );
    }
  };
}

// Authentication helper
async function authenticateRequest(
  req: NextRequest,
  options: ApiHandlerOptions
): Promise<{
  success: boolean;
  userId?: string;
  userEmail?: string;
  apiKeyId?: string;
  error?: string;
}> {
  const authHeader = req.headers.get('authorization');
  const apiKey = req.headers.get('x-api-key');

  // Check for API key
  if (options.requireApiKey && apiKey) {
    const validation = await validateApiKey(apiKey);
    if (validation.success) {
      return {
        success: true,
        apiKeyId: validation.apiKeyId,
        userId: validation.userId || undefined,
      };
    }
  }

  // Check for JWT token
  if (options.requireAuth && authHeader) {
    const token = authHeader.replace('Bearer ', '');
    try {
      const decoded = jwt.verify(token, serverConfig.security.jwtSecret) as any;
      return {
        success: true,
        userId: decoded.userId,
        userEmail: decoded.email,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Invalid or expired token',
      };
    }
  }

  return {
    success: false,
    error: 'Authentication required',
  };
}

// API key validation
async function validateApiKey(apiKey: string): Promise<{
  success: boolean;
  apiKeyId?: string;
  error?: string;
}> {
  // TODO: Implement actual API key validation against database
  // For now, basic validation
  
  if (!apiKey || apiKey.length < 32) {
    return {
      success: false,
      error: 'Invalid API key format',
    };
  }

  // Check if it's a test key in production
  if (process.env.NODE_ENV === 'production' && apiKey.includes('test')) {
    return {
      success: false,
      error: 'Test API keys not allowed in production',
    };
  }

  // TODO: Query database for API key validation
  // const apiKeyRecord = await db.collection('api_keys').where('key', '==', hashApiKey(apiKey)).get();
  
  return {
    success: true,
    apiKeyId: 'temp-id', // Replace with actual ID from database
  };
}

// Request validation helpers
export const validators = {
  isEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isPhoneNumber(phone: string): boolean {
    const phoneRegex = /^\+?1?\d{10,14}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
  },

  isValidId(id: string): boolean {
    // Firestore document ID validation
    return /^[a-zA-Z0-9_-]{1,}$/.test(id);
  },

  sanitizeInput(input: string): string {
    // Basic input sanitization
    return input
      .trim()
      .replace(/<script.*?<\/script>/gi, '')
      .replace(/<[^>]*>/g, '');
  },
};

// Encryption utilities
export const crypto = {
  async encrypt(text: string): Promise<string> {
    // TODO: Implement actual encryption
    const encrypted = Buffer.from(text).toString('base64');
    return encrypted;
  },

  async decrypt(encrypted: string): Promise<string> {
    // TODO: Implement actual decryption
    const decrypted = Buffer.from(encrypted, 'base64').toString('utf-8');
    return decrypted;
  },

  hashApiKey(apiKey: string): string {
    // TODO: Implement proper hashing (use bcrypt or similar)
    return Buffer.from(apiKey).toString('base64');
  },
};