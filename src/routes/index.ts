import { Router } from "express";

import brandRoutes from "../modules/Brand/brand.route";
import vehicleCatRoutes from "../modules/vehicleCat/vehicleCat.route";
import vehicleRoutes from "../modules/Vehicle/vehicle.route";

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

export default router;