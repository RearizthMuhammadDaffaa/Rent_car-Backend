import { z } from "zod";

export const createVehicleCatSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Brand name minimal 3 karakter")
    .max(100),

  description: z
    .string()
    .optional(),
});

export const vehicleCatParamSchema = z.object({
  id: z.uuid(), // atau z.string().uuid() tergantung versi Zod
});

export const updateVehicleCatSchema =
  createVehicleCatSchema.partial();

export type CreateVehicleCatDto =
  z.infer<typeof createVehicleCatSchema>;

export type UpdateVehicleCatDto =
  z.infer<typeof updateVehicleCatSchema>;

export type VehicleCatParamsDto = 
z.infer<typeof vehicleCatParamSchema>