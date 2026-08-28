import { z } from "zod";

export const documentStatusSchema = z.enum(["PENDING", "APPROVED", "REJECTED"]);

export const updateDocumentStatusSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
});

export const documentParamSchema = z.object({
  id: z.uuid(),
});

export type UpdateDocumentStatusDto = z.infer<typeof updateDocumentStatusSchema>;