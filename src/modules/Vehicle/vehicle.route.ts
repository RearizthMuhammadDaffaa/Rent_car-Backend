import { Router } from "express";
import { upload, validateImageFile } from "../../middleware/upload.middleware";
import { vehicleController } from "./vehicle.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
const router = Router();

router.post("/", authMiddleware(['ADMIN']),upload.single("thumbnail"),validateImageFile, vehicleController.createVehicle);
router.get("/", vehicleController.getVehicles);
router.get("/:id",vehicleController.getVehicleById);
router.put("/:id", authMiddleware(['ADMIN']),upload.single("thumbnail"), validateImageFile,vehicleController.updateVehicle);
router.delete("/:id", authMiddleware(['ADMIN']),vehicleController.deleteVehicle);

export default router;
