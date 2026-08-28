import { NotFoundError } from "../../errors/NotFoundError";
import { cloudinaryService } from "../../shared/service/cloudinary.service";
import { documentRepository } from "./document.repository";
import { documentStatusSchema, type UpdateDocumentStatusDto } from "./document.schema";

type UploadedDocuments = {
  ktp: { url: string; publicId: string };
  sim: { url: string; publicId: string };
};

export const documentService = {
  getOwn: async (userId: string) => documentRepository.findByUserId(userId),

  submit: async (userId: string, documents: UploadedDocuments) => {
    const existing = await documentRepository.findByUserId(userId);
    const data = {
      ktp_url: documents.ktp.url,
      ktp_public_id: documents.ktp.publicId,
      sim_url: documents.sim.url,
      sim_public_id: documents.sim.publicId,
      status: "PENDING" as const,
    };

    const saved = existing
      ? await documentRepository.update(existing.id, data)
      : await documentRepository.create({ user_id: userId, ...data });

    await Promise.all(
      [existing?.ktp_public_id, existing?.sim_public_id]
        .filter((publicId): publicId is string => Boolean(publicId))
        .map((publicId) => cloudinaryService.deleteImage(publicId)),
    );
    return saved;
  },

  deleteOwn: async (userId: string) => {
    const existing = await documentRepository.findByUserId(userId);
    if (!existing) throw new NotFoundError("Documents not found");

    const deleted = await documentRepository.delete(existing.id);
    await Promise.all(
      [existing.ktp_public_id, existing.sim_public_id]
        .filter((publicId): publicId is string => Boolean(publicId))
        .map((publicId) => cloudinaryService.deleteImage(publicId)),
    );
    return deleted;
  },

  getAll: async () => documentRepository.findAll(),

  updateStatus: async (id: string, data: UpdateDocumentStatusDto) => {
    const existing = await documentRepository.findById(id);
    if (!existing) throw new NotFoundError("Documents not found");

    return documentRepository.update(id, { status: documentStatusSchema.parse(data.status) });
  },
};