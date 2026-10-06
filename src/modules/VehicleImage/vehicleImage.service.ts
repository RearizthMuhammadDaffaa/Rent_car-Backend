import { NotFoundError } from "../../errors/NotFoundError.js";
import { cloudinaryService } from "../../shared/service/cloudinary.service.js";
import { vehicleImageRepository } from "./vehicleImage.repository.js";
import {
  CreateVehicleImageDto,
  createVehicleImageSchema,
  UpdateVehicleImageDto,
  updateVehicleImageSchema,
} from "./vehicleImage.schema.js";

export const VehicleImageService = {
  createVehicleImage: async (data: CreateVehicleImageDto) => {
    const vehicleImageSchema = createVehicleImageSchema.parse(data);
    return vehicleImageRepository.create(vehicleImageSchema);
  },

  getVehicleImages: async () => {
    return vehicleImageRepository.get();
  },

  getVehicleImageById: async (id: string) => {
    return vehicleImageRepository.getById(id);
  },

  updateVehicleImage: async (id: string, data: UpdateVehicleImageDto) => {
    const vehicleImage = await vehicleImageRepository.getById(id);

    if (!vehicleImage) {
      throw new NotFoundError("Vehicle Image Not Found");
    }

    const validatedData = updateVehicleImageSchema.parse(data);
    const updatedVehicleImage = await vehicleImageRepository.update(id, validatedData);

    if (validatedData.image_url && validatedData.imagePublicId && vehicleImage.imagePublicId) {
      await cloudinaryService.deleteImage(vehicleImage.imagePublicId);
    }

    return updatedVehicleImage;
  },

  deleteVehicleImage: async (id: string) => {
    const vehicleImage = await vehicleImageRepository.getById(id);

    if (!vehicleImage) {
      throw new NotFoundError("Vehicle Image Not Found");
    }

    if (vehicleImage.imagePublicId) {
      await cloudinaryService.deleteImage(vehicleImage.imagePublicId);
    }

    return vehicleImageRepository.delete(id);
  },
};
