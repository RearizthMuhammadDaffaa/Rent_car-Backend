import { Router } from "express";

import brandRoutes from "../modules/Brand/brand.route";
import couponRoutes from "../modules/Coupons/coupon.route";
import vehicleCatRoutes from "../modules/vehicleCat/vehicleCat.route";
import vehicleRoutes from "../modules/Vehicle/vehicle.route";
import vehicleImageRoutes from "../modules/VehicleImage/vehicleImage.route";
import authRoutes from "../modules/authentication/auth.route"
import bookingRoutes from "../modules/Bookings/booking.route"

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

export default router;