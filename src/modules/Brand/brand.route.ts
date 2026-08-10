import { Router } from "express";

import { brandController } from "./brand.controller";
import { upload } from "../../middleware/upload.middleware";

const router = Router();

router.post('/',upload.single("logo"),brandController.createBrand)
router.get('/',brandController.getBrands)
router.get('/:id',brandController.getBrandById)
router.put('/:id',upload.single("logo"),brandController.updateBrand)
router.delete('/:id',brandController.deleteBrand)

export default router;