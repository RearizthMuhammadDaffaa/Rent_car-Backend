import { NotFoundError } from "../../errors/NotFoundError";
import { cloudinaryService } from "../../shared/service/cloudinary.service";
import { vehicleRepository } from "./vehicle.repository";
import {
  CreateVehicleDto,
  createVehicleSchema,
  UpdateVehicleDto,
  updateVehicleSchema,
} from "./vehicle.schema";

export const VehicleService = {
  createVehicle: async (data: CreateVehicleDto) => {
    const vehicleSchema = createVehicleSchema.parse(data);
    return vehicleRepository.create(vehicleSchema);
  },

  getVehicles: async () => {
    return vehicleRepository.get();
  },

  getVehicleById: async (id: string) => {
    return vehicleRepository.getById(id);
  },

  updateVehicle: async (id: string, data: UpdateVehicleDto) => {
    const vehicle = await vehicleRepository.getById(id);

    if (!vehicle) {
      throw new NotFoundError("Vehicle Not Found");
    }

    const validatedData = updateVehicleSchema.parse(data);
    const updatedVehicle = await vehicleRepository.update(id, validatedData);

    if (validatedData.thumbnail && validatedData.thumbnailPublicId && vehicle.thumbnailPublicId) {
      await cloudinaryService.deleteImage(vehicle.thumbnailPublicId);
    }

    return updatedVehicle;
  },

  deleteVehicle: async (id: string) => {
    const vehicle = await vehicleRepository.getById(id);

    if (!vehicle) {
      throw new NotFoundError("Vehicle Not Found");
    }

    if (vehicle.thumbnailPublicId) {
      await cloudinaryService.deleteImage(vehicle.thumbnailPublicId);
    }

    return vehicleRepository.delete(id);
  },
};
