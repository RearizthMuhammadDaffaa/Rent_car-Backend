import { Router } from "express";

import { brandController } from "./brand.controller";

const router = Router();

router.post('/',brandController.createBrand)
router.get('/',brandController.getBrands)
router.get('/:id',brandController.getBrandById)
router.put('/:id',brandController.updateBrand)
router.delete('/:id',brandController.deleteBrand)

export default router;