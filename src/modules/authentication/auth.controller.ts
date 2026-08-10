
import type { Request, Response } from "express";
import { authService } from "./auth.service";
import {
  registerSchema,
  loginSchema,
} from "./auth.schema";

export const authController = {
  register: async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const data = registerSchema.parse(req.body);

      const result = await authService.register(
        data,
        res
      );

      res.status(201).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        res.status(400).json({
          status: "error",
          message: error.message,
        });

        return;
      }

      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  },

  login: async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const data = loginSchema.parse(req.body);

      const result = await authService.login(
        data,
        res
      );

      res.status(200).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      console.error(error);

      res.status(401).json({
        status: "error",
        message: "Invalid email or password",
      });
    }
  },

  logout: async (
    _req: Request,
    res: Response
  ): Promise<void> => {
    res.cookie("jwt", "", {
      httpOnly: true,
      expires: new Date(0),
    });

    res.status(200).json({
      status: "success",
      message: "Logged out successfully",
    });
  },
};

