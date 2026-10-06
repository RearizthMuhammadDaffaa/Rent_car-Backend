import { Router } from "express";

import { authController } from "./auth.controller.js";
import rateLimiter from "../../middleware/rate-limit.middleware.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { RoleStatus } from "../../../generated/prisma/enums.js";

const router = Router();

router.post(
  "/create-admin",
  authMiddleware(["SUPERADMIN"]),
  authController.create,
);
router.post("/login", rateLimiter, authController.login);
router.post("/refresh", authController.refresh);
router.post("/sign-up", authController.register);
router.delete("/logout", authController.logout);
router.get("/me",authMiddleware([RoleStatus.CUSTOMER,RoleStatus.ADMIN,RoleStatus.SUPERADMIN,]), authController.getMe);

export default router;
