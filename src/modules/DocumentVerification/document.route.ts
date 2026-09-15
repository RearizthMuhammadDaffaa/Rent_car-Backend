import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { uploadDocuments, validateImageFile } from "../../middleware/upload.middleware";
import { documentController } from "./document.controller";
import { RoleStatus } from "../../../generated/prisma/enums";

const router = Router();

router.get("/me", authMiddleware([RoleStatus.CUSTOMER]),documentController.getMyDocument);
router.post(
  "/me",
  authMiddleware([RoleStatus.CUSTOMER]),
  uploadDocuments.fields([{ name: "ktp", maxCount: 1 }, { name: "sim", maxCount: 1 }]),
  validateImageFile,
  documentController.submit,
);
router.delete("/me", authMiddleware([RoleStatus.CUSTOMER,RoleStatus.ADMIN,RoleStatus.SUPERADMIN]), documentController.deleteOwn);
router.get("/", authMiddleware([RoleStatus.ADMIN,RoleStatus.SUPERADMIN]), documentController.getAll);
router.patch("/:id/status", authMiddleware([RoleStatus.ADMIN,RoleStatus.SUPERADMIN]), documentController.updateStatus);
router.get(
  "/:id",
  authMiddleware([RoleStatus.ADMIN,RoleStatus.SUPERADMIN]),
  documentController.getDocumentById
);

router.patch(
  "/:id/reject",
  authMiddleware([
    RoleStatus.ADMIN,
    RoleStatus.SUPERADMIN,
  ]),
  documentController.reject
);


export default router;