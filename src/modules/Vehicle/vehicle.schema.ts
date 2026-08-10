import { z } from "zod";

export const createVehicleSchema = z.object({
  category_id: z.string().uuid("Category ID harus berupa UUID"),
  brand_id: z.string().uuid("Brand ID harus berupa UUID"),
  plate_number: z
    .string()
    .trim()
    .min(3, "Plate number minimal 3 karakter")
    .max(20),
  model: z.string().trim().min(2, "Model minimal 2 karakter").max(100),
  year: z
    .union([z.number().int(), z.string().trim().regex(/^\d+$/).transform(Number)])
    .transform((value) => (typeof value === "string" ? Number(value) : value))
    .refine((value) => Number.isInteger(value) && value >= 1900 && value <= new Date().getFullYear() + 1, {
      message: "Tahun kendaraan tidak valid",
    }),
  color: z.string().trim().min(2, "Color minimal 2 karakter").max(50),
  seat: z.string().trim().min(1, "Seat wajib diisi").max(20),
  status: z
    .enum(["AVAILABLE", "BOOKED", "MAINTENANCE", "INACTIVE"])
    .default("AVAILABLE"),
  thumbnail: z.string().url("Thumbnail harus berupa URL"),
  thumbnailPublicId: z.string().optional(),
  description: z.string().trim().min(5, "Description minimal 5 karakter"),
});

export const vehicleParamSchema = z.object({
  id: z.uuid(),
});

export const updateVehicleSchema = createVehicleSchema.partial();

export type CreateVehicleDto = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleDto = z.infer<typeof updateVehicleSchema>;
export type VehicleParamsDto = z.infer<typeof vehicleParamSchema>;
