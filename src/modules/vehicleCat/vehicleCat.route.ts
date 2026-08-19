import { Router } from "express";

import { VehicleCatController } from "./vehicleCat.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
const router = Router();

router.post('/',authMiddleware(['ADMIN']),VehicleCatController.createVehileCat)
router.get('/',VehicleCatController.getVehileCats)
router.get('/:id',VehicleCatController.getVehileCatById)
router.put('/:id',authMiddleware(['ADMIN']),VehicleCatController.updateVehileCat)
router.delete('/:id',authMiddleware(['ADMIN']),VehicleCatController.deleteVehileCat)

export default router;