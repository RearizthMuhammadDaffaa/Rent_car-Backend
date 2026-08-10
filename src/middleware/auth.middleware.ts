
import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { prisma } from "../config/db";
import { RoleStatus } from "../../generated/prisma/enums";

interface AuthPayload extends JwtPayload {
  id: string;
  role: RoleStatus;
}

export const authMiddleware = (
  allowedRoles: RoleStatus[] = [RoleStatus.CUSTOMER]
) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    console.log("Auth middleware reached");

    let token: string | undefined;

    // Get token from Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // Get token from cookie
    else if (req.cookies?.jwt) {
      token = req.cookies.jwt;
    }

    // Token doesn't exist
    if (!token) {
      res.status(401).json({
        success: false,
        message: "Unauthorized - token not provided",
      });
      return;
    }

    try {
      const secret = process.env.JWT_SECRET;

      if (!secret) {
        throw new Error("JWT_SECRET is not defined");
      }

      // Verify token
      const decoded = jwt.verify(token, secret) as AuthPayload;

      // Validate payload
      if (!decoded.id) {
        res.status(401).json({
          success: false,
          message: "Unauthorized - invalid token",
        });
        return;
      }

      // Find user
      const user = await prisma.user.findUnique({
        where: {
          id: decoded.id,
        },
      });

      // User no longer exists
      if (!user) {
        res.status(401).json({
          success: false,
          message: "User no longer exists",
        });
        return;
      }

      // Check role
      if (!allowedRoles.includes(user.role)) {
        res.status(403).json({
          success: false,
          message: "Forbidden - insufficient permissions",
        });
        return;
      }

      // Attach user to request
      req.user = user;

      console.log("User Role:", user.role);

      next();
    } catch (error) {
      console.error("Auth middleware error:", error);

      res.status(401).json({
        success: false,
        message: "Unauthorized - invalid or expired token",
      });
    }
  };
};

