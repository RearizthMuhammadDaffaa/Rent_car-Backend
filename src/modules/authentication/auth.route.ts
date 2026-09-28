import { Router } from "express";

import { authController } from "./auth.controller";
import rateLimiter from "../../middleware/rate-limit.middleware";
import { authMiddleware } from "../../middleware/auth.middleware";
import { RoleStatus } from "../../../generated/prisma/enums";

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
