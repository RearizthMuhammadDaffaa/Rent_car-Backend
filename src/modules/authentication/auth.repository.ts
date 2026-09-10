
import { prisma } from "../../config/db";
import { RegisterInput } from "./auth.schema";
import { RoleStatus } from "../../../generated/prisma/enums";

export const authRepository = {
  findByEmail: async (email: string) => {
    return prisma.user.findUnique({
      where: {
        email,
      },
    });
  },

  createUser: async (
    data: RegisterInput & {
      password: string;
    }
  ) => {
    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
      },
    });
  },
  createAdmin: async (
    data: RegisterInput & {
      password: string;
    }
  ) => {
    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
        role:RoleStatus.ADMIN
      }
    });
  },
};

export const refreshTokenRepository = {
  create: async (
    tokenHash: string,
    userId: string,
    expiresAt: Date
  ) => {
    return await prisma.refreshToken.create({
      data: {
        tokenHash,
        userId,
        expiresAt,
      },
    });
  },

  findByHash: async (tokenHash: string) => {
    return await prisma.refreshToken.findUnique({
      where: {
        tokenHash,
      },
      include: {
        user: true,
      },
    });
  },

  revoke: async (id: string) => {
    return await prisma.refreshToken.update({
      where: {
        id,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  },

  revokeByHash: async (tokenHash: string) => {
    return await prisma.refreshToken.updateMany({
      where: {
        tokenHash,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  },
};

