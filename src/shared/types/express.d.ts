
import type { RoleStatus } from "../../../generated/prisma/enums";

declare global {
  namespace Express {
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
}

export {};

