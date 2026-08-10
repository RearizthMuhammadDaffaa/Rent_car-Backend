import { Router } from "express";
import { couponController } from "./coupon.controller";

const router = Router();

router.post("/", couponController.createCoupon);
router.get("/", couponController.getCoupons);
router.get("/:id", couponController.getCouponById);
router.put("/:id", couponController.updateCoupon);
router.delete("/:id", couponController.deleteCoupon);

export default router;
