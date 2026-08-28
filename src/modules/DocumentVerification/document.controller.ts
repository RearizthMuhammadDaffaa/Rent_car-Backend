import type { Request, Response } from "express";
import { cloudinaryService } from "../../shared/service/cloudinary.service";
import { documentParamSchema, updateDocumentStatusSchema } from "./document.schema";
import { documentService } from "./document.service";

type DocumentFiles = {
  ktp?: Express.Multer.File[];
  sim?: Express.Multer.File[];
};

const getFiles = (req: Request) => {
  const files = (req.files ?? {}) as DocumentFiles;
  const ktp = files.ktp?.[0];
  const sim = files.sim?.[0];
  if (!ktp || !sim) throw new Error("Both ktp and sim files are required");
  return { ktp, sim };
};

export const documentController = {
  async getOwn(req: Request, res: Response) {
    return res.status(200).json({ data: await documentService.getOwn(req.user.id) });
  },

  async submit(req: Request, res: Response) {
    try {
      const files = getFiles(req);
      const [ktp, sim] = await Promise.all([
        cloudinaryService.uploadImage(files.ktp, `ktp-${req.user.id}-${Date.now()}`, "rent-car/documents/ktp"),
        cloudinaryService.uploadImage(files.sim, `sim-${req.user.id}-${Date.now()}`, "rent-car/documents/sim"),
      ]);
      const documents = await documentService.submit(req.user.id, { ktp, sim });
      return res.status(201).json({ message: "Documents submitted successfully", data: documents });
    } catch (error) {
      return res.status(400).json({ success: false, message: error instanceof Error ? error.message : "Invalid documents" });
    }
  },

  async deleteOwn(req: Request, res: Response) {
    return res.status(200).json({ message: "Documents deleted successfully", data: await documentService.deleteOwn(req.user.id) });
  },

  async getAll(_req: Request, res: Response) {
    return res.status(200).json({ data: await documentService.getAll() });
  },

  async updateStatus(req: Request, res: Response) {
    const { id } = documentParamSchema.parse(req.params);
    const data = updateDocumentStatusSchema.parse(req.body);
    return res.status(200).json({ message: "Document status updated successfully", data: await documentService.updateStatus(id, data) });
  },
};