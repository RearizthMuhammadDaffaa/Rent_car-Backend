import { NotFoundError } from "../../errors/NotFoundError";
import { cloudinaryService } from "../../shared/service/cloudinary.service";
import { documentRepository } from "./document.repository";
import { documentStatusSchema, type UpdateDocumentStatusDto } from "./document.schema";




export const documentService = {
  // getOwn: async (userId: string) => documentRepository.findByUserId(userId),

  submit:async ({
  userId,
  ktpPublicId,
  simPublicId,
}: {
  userId: string;
  ktpPublicId: string;
  simPublicId: string;
}) => documentRepository.upload(userId,ktpPublicId,simPublicId),

  deleteOwn: async (userId: string) => {
    const existing = await documentRepository.findByUserId(userId);
    if (!existing) throw new NotFoundError("Documents not found");

    const deleted = await documentRepository.delete(existing.id);
    await Promise.all(
      [existing.ktp_public_id, existing.sim_public_id]
        .filter((publicId): publicId is string => Boolean(publicId))
        .map((publicId) => cloudinaryService.deletePrivateDocument(publicId)),
    );
    return deleted;
  },

  getAll: async () => {
     const documents = await documentRepository.findAll();

     return documents.map((document) => ({
        id: document.id,
        user_id: document.user_id,
        status: document.status,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
  }));
  },

  updateStatus: async (id: string, data: UpdateDocumentStatusDto) => {
    const existing = await documentRepository.findById(id);
    if (!existing) throw new NotFoundError("Documents not found");

    return documentRepository.update(id, { status: documentStatusSchema.parse(data.status) });
  },
  getMyDocument: async (userId: string) => {
  const document = await documentRepository.findByUserId(userId);

  if (!document) {
    throw new NotFoundError("Document tidak ditemukan");
  }

  return {
    id: document.id,
    status: document.status,
  };
},
getDocumentForAdmin: async (id: string) => {
  const document =
    await documentRepository.findById(id);

  if (!document) {
    throw new NotFoundError(
      "Document tidak ditemukan"
    );
  }

  return {
    id: document.id,
    userId: document.user_id,
    status: document.status,

    ktpUrl: document.ktp_public_id
      ? cloudinaryService.generatePrivateDocumentUrl(
          document.ktp_public_id
        )
      : null,

    simUrl: document.sim_public_id
      ? cloudinaryService.generatePrivateDocumentUrl(
          document.sim_public_id
        )
      : null,
  };
},
reject: async (
  id: string
) => {
  const document =
    await documentRepository.findById(id);

  if (!document) {
    throw new NotFoundError(
      "Document tidak ditemukan"
    );
  }

  return documentRepository.update(id, {
    status: "REJECTED",
  });
},
};