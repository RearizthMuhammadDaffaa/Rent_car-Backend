import { Router } from "express";

import { authController } from "./auth.controller";

const router = Router();

router.post('/login',authController.login)
router.post('/sign-up',authController.register)
router.delete('/logout',authController.logout)

export default router;