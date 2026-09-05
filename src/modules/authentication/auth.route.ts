import { Router } from "express";

import { authController } from "./auth.controller";
import rateLimiter from "../../middleware/rate-limit.middleware";

const router = Router();

router.post('/create-admin',authController.create)
router.post('/login',rateLimiter,authController.login)
router.post('/sign-up',authController.register)
router.delete('/logout',authController.logout)

export default router;