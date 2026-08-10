import { Router } from "express";
import { upload } from "../../middleware/upload.middleware";
import { vehicleImageController } from "./vehicleImage.controller";

const router = Router();

router.post("/", upload.single("image"), vehicleImageController.createVehicleImage);
router.get("/", vehicleImageController.getVehicleImages);
router.get("/:id", vehicleImageController.getVehicleImageById);
router.put("/:id", upload.single("image"), vehicleImageController.updateVehicleImage);
router.delete("/:id", vehicleImageController.deleteVehicleImage);

export default router;
