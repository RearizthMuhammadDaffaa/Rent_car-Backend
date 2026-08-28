import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { uploadDocuments } from "../../middleware/upload.middleware";
import { documentController } from "./document.controller";

const router = Router();
const userRoles = ["CUSTOMER", "ADMIN", "SUPERADMIN"] as const;
const adminRoles = ["ADMIN", "SUPERADMIN"] as const;

router.get("/me", authMiddleware([...userRoles]), documentController.getOwn);
router.post(
  "/me",
  authMiddleware([...userRoles]),
  uploadDocuments.fields([{ name: "ktp", maxCount: 1 }, { name: "sim", maxCount: 1 }]),
  documentController.submit,
);
router.delete("/me", authMiddleware([...userRoles]), documentController.deleteOwn);
router.get("/", authMiddleware([...adminRoles]), documentController.getAll);
router.patch("/:id/status", authMiddleware([...adminRoles]), documentController.updateStatus);

export default router;