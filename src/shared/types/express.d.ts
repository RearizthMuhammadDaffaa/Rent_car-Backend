
import type { RoleStatus } from "../../../generated/prisma/enums.js";

declare module "express-serve-static-core" {
  interface Request {
    user: {
      id: string;
      name: string;
      email: string;
      password: string;
      role: RoleStatus;
      createdAt: Date;
      updatedAt: Date;
    };
  }
}

export {};

