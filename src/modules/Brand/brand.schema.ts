import { z } from "zod";

export const createBrandSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Brand name minimal 3 karakter")
    .max(100),

  logo: z
    .string()
    .url("Logo harus berupa URL")
    ,
});

export const brandParamSchema = z.object({
  id: z.uuid(), // atau z.string().uuid() tergantung versi Zod
});

export const updateBrandSchema =
  createBrandSchema.partial();

export type CreateBrandDto =
  z.infer<typeof createBrandSchema>;

export type UpdateBrandDto =
  z.infer<typeof updateBrandSchema>;