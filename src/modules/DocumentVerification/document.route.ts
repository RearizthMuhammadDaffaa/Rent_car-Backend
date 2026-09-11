import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { uploadDocuments } from "../../middleware/upload.middleware";
import { documentController } from "./document.controller";
import { RoleStatus } from "../../../generated/prisma/enums";

const router = Router();
const userRoles = ["CUSTOMER", "ADMIN", "SUPERADMIN"] as const;
const adminRoles = ["ADMIN", "SUPERADMIN"] as const;

router.get("/me", authMiddleware(["CUSTOMER"]), documentController.getMyDocument);
router.post(
  "/me",
  authMiddleware(["CUSTOMER"]),
  uploadDocuments.fields([{ name: "ktp", maxCount: 1 }, { name: "sim", maxCount: 1 }]),
  documentController.submit,
);
router.delete("/me", authMiddleware([...userRoles]), documentController.deleteOwn);
router.get("/", authMiddleware([...adminRoles]), documentController.getAll);
router.patch("/:id/status", authMiddleware(["ADMIN", "SUPERADMIN"]), documentController.updateStatus);
router.get(
  "/:id",
  authMiddleware([...adminRoles]),
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