import { Router } from "express";
import { upload } from "../../middleware/upload.middleware";
import { vehicleController } from "./vehicle.controller";

const router = Router();

router.post("/", upload.single("thumbnail"), vehicleController.createVehicle);
router.get("/", vehicleController.getVehicles);
router.get("/:id", vehicleController.getVehicleById);
router.put("/:id", upload.single("thumbnail"), vehicleController.updateVehicle);
router.delete("/:id", vehicleController.deleteVehicle);

export default router;
