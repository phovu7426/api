import { Request } from 'express';
import { AuthUser } from './auth-user.interface';

/**
 * Authenticated Request Interface
 * Extends Express Request with authenticated user information
 */
export interface AuthenticatedRequest extends Request {
  user: AuthUser;
}