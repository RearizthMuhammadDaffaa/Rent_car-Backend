import { Router } from "express";
import { couponController } from "./coupon.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
const router = Router();

router.post("/", authMiddleware(['ADMIN']),couponController.createCoupon);
router.get("/", couponController.getCoupons);
router.get("/:id", couponController.getCouponById);
router.put("/:id", authMiddleware(['ADMIN']),couponController.updateCoupon);
router.delete("/:id", authMiddleware(['ADMIN']),couponController.deleteCoupon);

export default router;
