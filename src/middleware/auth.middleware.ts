import type {
  Request,
  Response,
  NextFunction,
} from "express";

import jwt, {
  type JwtPayload,
} from "jsonwebtoken";

import { prisma } from "../config/db";
import { RoleStatus } from "../../generated/prisma/enums";

interface AuthPayload extends JwtPayload {
  id: string;
  role: RoleStatus;
}

export const authMiddleware = (
  allowedRoles: RoleStatus[] = [
    RoleStatus.CUSTOMER,
  ]
) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    let token: string | undefined;

    // =========================
    // BEARER TOKEN
    // =========================

    const authorization =
      req.headers.authorization;

    if (
      authorization?.startsWith("Bearer ")
    ) {
      token = authorization
        .slice(7)
        .trim();
    }

    // =========================
    // COOKIE ACCESS TOKEN
    // =========================

    else if (req.cookies?.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message:
          "Unauthorized - token not provided",
      });

      return;
    }

    try {
      const secret =
        process.env.JWT_SECRET;

      if (!secret) {
        throw new Error(
          "JWT_SECRET is not defined"
        );
      }

      const decoded =
        jwt.verify(
          token,
          secret
        ) as AuthPayload;

      if (
        typeof decoded !== "object" ||
        decoded === null ||
        typeof decoded.id !== "string"
      ) {
        res.status(401).json({
          success: false,
          message:
            "Unauthorized - invalid token",
        });

        return;
      }

      const user =
        await prisma.user.findUnique({
          where: {
            id: decoded.id,
          },
        });

      if (!user) {
        res.status(401).json({
          success: false,
          message:
            "User no longer exists",
        });

        return;
      }

      if (
        !allowedRoles.includes(user.role)
      ) {
        res.status(403).json({
          success: false,
          message:
            "Forbidden - insufficient permissions",
        });

        return;
      }

      req.user = user;

      next();
    } catch (error) {
      console.error(
        "Auth middleware error:",
        error
      );

      res.status(401).json({
        success: false,
        message:
          "Unauthorized - invalid or expired token",
      });
    }
  };
};