import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Extend Express Request type to include user
export interface AuthRequest extends Request {
  user: {
    userId: string;
  };
}

// JWT Payload interface
interface JWTPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

// Auth middleware
export const auth = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "No token provided" });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const JWT_SECRET = process.env.JWT_SECRET;

    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

    // Attach user info to request
    (req as AuthRequest).user = {
      userId: decoded.userId,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: "Invalid token" });
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: "Token expired" });
      return;
    }

    res.status(500).json({
      message: "Authentication error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Optional auth middleware (doesn't fail if no token)
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      next();
      return;
    }

    const token = authHeader.substring(7);
    const JWT_SECRET = process.env.JWT_SECRET;

    if (!JWT_SECRET) {
      next();
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

    (req as AuthRequest).user = {
      userId: decoded.userId,
    };

    next();
  } catch (error) {
    // If token is invalid, just continue without user
    next();
  }
};
