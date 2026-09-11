import type { Request, Response,NextFunction } from "express";
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
  // async getOwn(req: Request, res: Response) {
  //   return res.status(200).json({ data: await documentService.getOwn(req.user.id) });
  // },

  async submit(req: Request, res: Response,next:NextFunction) {
      try {
    const userId = req.user!.id;
    const files = req.files as {
      ktp?: Express.Multer.File[];
      sim?: Express.Multer.File[];
    };

    if (!files?.ktp?.[0] || !files?.sim?.[0]) {
      return res.status(400).json({
        success: false,
        message: "KTP dan SIM wajib diupload",
      });
    }

    const ktp = await cloudinaryService.uploadPrivateDocument(
      files.ktp[0],
      `ktp-${userId}-${Date.now()}`
    );

    const sim = await cloudinaryService.uploadPrivateDocument(
      files.sim[0],
      `sim-${userId}-${Date.now()}`
    );

    const document = await documentService.submit({
      userId,
      ktpPublicId: ktp.publicId,
      simPublicId: sim.publicId,
    });

    return res.status(201).json({
      success: true,
      message: "Dokumen berhasil diupload",
      data: document,
    });
  } catch (error) {
    return next(error);
  }
  },

  async deleteOwn(req: Request, res: Response) {
    return res.status(200).json({ message: "Documents deleted successfully", data: await documentService.deleteOwn(req.user.id) });
  },

  async getAll(_req: Request, res: Response,next: NextFunction) {
    try {
    const documents = await documentService.getAll();

    return res.status(200).json({
      success: true,
      data: documents,
    });
  } catch (error) {
    return next(error);
  }
  },

  async updateStatus(req: Request, res: Response) {
    const { id } = documentParamSchema.parse(req.params);
    const data = updateDocumentStatusSchema.parse(req.body);
    return res.status(200).json({ message: "Document status updated successfully", data: await documentService.updateStatus(id, data) });
  },
  async getMyDocument(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const document = await documentService.getMyDocument(
      req.user!.id
    );

    return res.status(200).json({
      success: true,
      data: document,
    });
  } catch (error) {
    return next(error);
  }
},
async getDocumentById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = documentParamSchema.parse(req.params);

    const document =
      await documentService.getDocumentForAdmin(id);

    return res.status(200).json({
      success: true,
      data: document,
    });
  } catch (error) {
    return next(error);
  }
},

reject: async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
   const { id } = documentParamSchema.parse(req.params);


    const document = await documentService.reject(
      id
    );

    res.status(200).json({
      success: true,
      message: "Dokumen berhasil ditolak",
      data: document,
    });
  } catch (error) {
    next(error);
  }
},
};