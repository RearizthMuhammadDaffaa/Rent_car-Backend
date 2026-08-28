import { Router } from "express";
import { upload } from "../../middleware/upload.middleware";
import { vehicleController } from "./vehicle.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
const router = Router();

router.post("/", authMiddleware(['ADMIN']),upload.single("thumbnail"), vehicleController.createVehicle);
router.get("/", vehicleController.getVehicles);
router.get("/:id", authMiddleware(['ADMIN']),vehicleController.getVehicleById);
router.put("/:id", upload.single("thumbnail"), vehicleController.updateVehicle);
router.delete("/:id", authMiddleware(['ADMIN']),vehicleController.deleteVehicle);

export default router;
