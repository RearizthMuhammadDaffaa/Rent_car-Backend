
import bcrypt from "bcrypt";
import type { Response } from "express";

import { authRepository, refreshTokenRepository } from "./auth.repository";
import type { RegisterInput,LoginInput } from "./auth.schema";
import { generateRefreshToken, generateToken, hashRefreshToken } from "../../shared/utils/utils";
import { prisma } from "../../config/db";

const REFRESH_TOKEN_EXPIRES_IN = 7 * 24 * 60 * 60 * 1000;

export const authService = {
  register: async (
    data: RegisterInput,
    res: Response
  ) => {
    // Check existing user
    const userExists = await authRepository.findByEmail(data.email);

    if (userExists) {
      throw new Error("User already exists with this email");
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(
      data.password,
      salt
    );

    // Create user
    const user = await authRepository.createUser({
      name: data.name,
      email: data.email,
      password: hashedPassword,
    });

    // Generate JWT
    const token = generateToken(
      user.id,
      res,
      user.role
    );

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    };
  },

  login: async (
    data: LoginInput,
    res: Response
  ) => {
    // Find user
    const user = await authRepository.findByEmail(
      data.email
    );

    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      data.password,
      user.password
    );

    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    // Generate JWT
    const token = generateToken(
      user.id,
      res,
      user.role
    );

    const refreshToken =
      generateRefreshToken();

    const refreshTokenHash =
      hashRefreshToken(refreshToken);

    const expiresAt = new Date(
      Date.now() + REFRESH_TOKEN_EXPIRES_IN
    );

    await refreshTokenRepository.create(
      refreshTokenHash,
      user.id,
      expiresAt
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure:
        process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: REFRESH_TOKEN_EXPIRES_IN,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    };
  },

  refresh: async (
    refreshToken: string,
    res: Response
  ) => {
    const tokenHash =
      hashRefreshToken(refreshToken);

    const storedToken =
      await refreshTokenRepository.findByHash(
        tokenHash
      );

    if (!storedToken) {
      throw new Error("Invalid refresh token");
    }

    // Token sudah logout / digunakan
    if (storedToken.revokedAt) {
      throw new Error(
        "Refresh token has been revoked"
      );
    }

    // Token expired
    if (
      storedToken.expiresAt.getTime() <
      Date.now()
    ) {
      throw new Error(
        "Refresh token has expired"
      );
    }

    const user = storedToken.user;

    // =========================
    // NEW ACCESS TOKEN
    // =========================

    const accessToken = generateToken(
      user.id,
      res,
      user.role
    );

    // =========================
    // REFRESH TOKEN ROTATION
    // =========================

    const newRefreshToken =
      generateRefreshToken();

    const newRefreshTokenHash =
      hashRefreshToken(newRefreshToken);

    const newExpiresAt = new Date(
      Date.now() + REFRESH_TOKEN_EXPIRES_IN
    );

    await prisma.$transaction(async (tx) => {
      // Revoke old refresh token
      await tx.refreshToken.update({
        where: {
          id: storedToken.id,
        },
        data: {
          revokedAt: new Date(),
        },
      });

      // Create new refresh token
      await tx.refreshToken.create({
        data: {
          tokenHash: newRefreshTokenHash,
          userId: user.id,
          expiresAt: newExpiresAt,
        },
      });
    });

    // =========================
    // NEW COOKIE
    // =========================

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure:
        process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: REFRESH_TOKEN_EXPIRES_IN,
    });

    return {
      accessToken,
    };
  },

  logout: async (
    refreshToken: string | undefined,
    res: Response
  ) => {
    if (refreshToken) {
      const tokenHash =
        hashRefreshToken(refreshToken);

      await refreshTokenRepository.revokeByHash(
        tokenHash
      );
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure:
        process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return {
      message: "Logged out successfully",
    };
  },

  // =========================
  // CREATE ADMIN
  // =========================

  createAdmin: async (
    data: RegisterInput,
    res: Response
  ) => {
    const existingUser =
      await prisma.user.findUnique({
        where: {
          email: data.email,
        },
      });

    if (existingUser) {
      throw new Error("Email sudah digunakan");
    }

    const hashedPassword =
      await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: "ADMIN",
      },
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  },

};

