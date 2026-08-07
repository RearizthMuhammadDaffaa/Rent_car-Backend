import { Router } from "express";

import { VehicleCatController } from "./vehicleCat.controller";

const router = Router();

router.post('/',VehicleCatController.createVehileCat)
router.get('/',VehicleCatController.getVehileCats)
router.get('/:id',VehicleCatController.getVehileCatById)
router.put('/:id',VehicleCatController.updateVehileCat)
router.delete('/:id',VehicleCatController.deleteVehileCat)

export default router;