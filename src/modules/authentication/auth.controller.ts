
import type { NextFunction, Request, Response } from "express";
import { authService } from "./auth.service";
import {
  registerSchema,
  loginSchema,
} from "./auth.schema";

export const authController = {
  register: async (
    req: Request,
    res: Response,
    next:NextFunction
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
      return next(error)
    }
  },

  login: async (
    req: Request,
    res: Response,
    next:NextFunction
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
      return next(error)
    }
  },

   refresh: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const refreshToken =
        req.cookies?.refreshToken;

      if (!refreshToken) {
        res.status(401).json({
          status: "error",
          message: "Refresh token not provided",
        });

        return;
      }

      const result =
        await authService.refresh(
          refreshToken,
          res
        );

      res.status(200).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  },

   logout: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const refreshToken =
        req.cookies?.refreshToken;

      const result =
        await authService.logout(
          refreshToken,
          res
        );

      res.status(200).json({
        status: "success",
        ...result,
      });
    } catch (error) {
      return next(error);
    }
  },

   create: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data =
        registerSchema.parse(req.body);

      const result =
        await authService.createAdmin(
          data,
          res
        );

      res.status(201).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  },
};

