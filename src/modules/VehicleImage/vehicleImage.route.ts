import { Router } from "express";
import { upload, validateImageFile } from "../../middleware/upload.middleware";
import { vehicleImageController } from "./vehicleImage.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
const router = Router();

router.post("/", authMiddleware(['ADMIN']),upload.single("image"), validateImageFile,vehicleImageController.createVehicleImage);
router.get("/", vehicleImageController.getVehicleImages);
router.get("/:id", vehicleImageController.getVehicleImageById);
router.put("/:id", authMiddleware(['ADMIN']),upload.single("image"), validateImageFile,vehicleImageController.updateVehicleImage);
router.delete("/:id", authMiddleware(['ADMIN']),vehicleImageController.deleteVehicleImage);

export default router;
