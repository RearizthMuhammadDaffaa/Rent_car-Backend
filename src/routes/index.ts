import { Router } from "express";

import brandRoutes from "../modules/Brand/brand.route.js";
import couponRoutes from "../modules/Coupons/coupon.route.js";
import vehicleCatRoutes from "../modules/vehicleCat/vehicleCat.route.js";
import vehicleRoutes from "../modules/Vehicle/vehicle.route.js";
import vehicleImageRoutes from "../modules/VehicleImage/vehicleImage.route.js";
import authRoutes from "../modules/authentication/auth.route.js"
import bookingRoutes from "../modules/Bookings/booking.route.js"
import documentRoutes from "../modules/DocumentVerification/document.route.js"
import paymentRoute from "../modules/payments/payment.route.js"

const router = Router();

router.use(
  "/brands",
  brandRoutes
);
router.use(
  "/vehicle-cat",
  vehicleCatRoutes
);
router.use(
  "/vehicles",
  vehicleRoutes
);
router.use(
  "/coupons",
  couponRoutes
);
router.use(
  "/vehicle-images",
  vehicleImageRoutes
);

router.use(
  "/auth",
  authRoutes
);

router.use(
  "/bookings",
  bookingRoutes
);

router.use(
  "/documents",
  documentRoutes
);

router.use(
  "/payments",
  paymentRoute
);

export default router;