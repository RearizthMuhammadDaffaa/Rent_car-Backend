import { Router } from "express";

import { brandController } from "./brand.controller";
import { upload } from "../../middleware/upload.middleware";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();

router.post('/',authMiddleware(["ADMIN"]),upload.single("logo"),brandController.createBrand)
router.get('/',brandController.getBrands)
router.get('/:id',brandController.getBrandById)
router.put('/:id',authMiddleware(["ADMIN"]),upload.single("logo"),brandController.updateBrand)
router.delete('/:id',authMiddleware(["ADMIN"]),brandController.deleteBrand)

export default router;