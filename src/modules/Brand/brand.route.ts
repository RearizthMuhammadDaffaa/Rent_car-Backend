import { Router } from "express";

import { brandController } from "./brand.controller.js";
import { upload, validateImageFile } from "../../middleware/upload.middleware.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";

const router = Router();

router.post('/',authMiddleware(["ADMIN"]),upload.single("logo"),validateImageFile,brandController.createBrand)
router.get('/',brandController.getBrands)
router.get('/:id',brandController.getBrandById)
router.put('/:id',authMiddleware(["ADMIN"]),upload.single("logo"),validateImageFile,brandController.updateBrand)
router.delete('/:id',authMiddleware(["ADMIN"]),brandController.deleteBrand)

export default router;