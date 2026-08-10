import { z } from "zod";

export const createVehicleImageSchema = z.object({
  vehicle_id: z.string().uuid("Vehicle ID harus berupa UUID"),
  image_url: z.string().url("Image URL harus berupa URL"),
  imagePublicId: z.string().optional(),
});

export const vehicleImageParamSchema = z.object({
  id: z.uuid(),
});

export const updateVehicleImageSchema = createVehicleImageSchema.partial();

export type CreateVehicleImageDto = z.infer<typeof createVehicleImageSchema>;
export type UpdateVehicleImageDto = z.infer<typeof updateVehicleImageSchema>;
export type VehicleImageParamsDto = z.infer<typeof vehicleImageParamSchema>;
