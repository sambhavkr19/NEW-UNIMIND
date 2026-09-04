import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { logger } from '../utils/logger';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'student' | 'college_admin' | 'platform_admin' | 'admin';
  };
}

export function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'Access Denied: No authentication token provided',
    });
    return;
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    res.status(401).json({
      success: false,
      message: 'Access Denied: Invalid or expired authentication token',
    });
    return;
  }

  req.user = {
    id: decoded.id,
    email: decoded.email,
    role: decoded.role,
  };

  next();
}

export function requireRole(allowedRoles: string | string[]) {
  const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Access Denied: User is not authenticated',
      });
      return;
    }

    if (!rolesArray.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden: Required privilege [${rolesArray.join(', ')}] not matched for user role '${req.user.role}'`,
      });
      return;
    }

    next();
  };
}
