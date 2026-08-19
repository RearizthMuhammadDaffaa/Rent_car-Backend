
import bcrypt from "bcrypt";
import type { Response } from "express";

import { authRepository } from "./auth.repository";
import type { RegisterInput,LoginInput } from "./auth.schema";
import { generateToken } from "../../shared/utils/utils";

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

  logout: async (res: Response) => {
    res.cookie("jwt", "", {
      httpOnly: true,
      expires: new Date(0),
    });
  },
  createAdmin: async (data:RegisterInput,res:Response) => {
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
    const user = await authRepository.createAdmin({
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
  }
};

