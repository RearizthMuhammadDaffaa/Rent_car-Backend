import jwt, { type SignOptions } from "jsonwebtoken";
import type { Response } from "express";
import crypto from "crypto";

export const generateToken = (
  userId: string,
  userRole: string
): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }

  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as SignOptions["expiresIn"],
  };

  const token = jwt.sign(
    {
      id: userId,
      role: userRole,
    },
    secret,
    options
  );

  return token;
};

export const generateRefreshToken = () => {
  return crypto.randomBytes(64).toString("hex");
};

export const hashRefreshToken = (token: string) => {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
};