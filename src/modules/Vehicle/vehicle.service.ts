import { redis } from "../../config/upstash";
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
    const vehicle = await vehicleRepository.create(vehicleSchema);
     await redis.del("vehicles:all");
    return vehicle;
  },

  getVehicles: async () => {
    const key = "vehicles:all"

    const cached = await redis.get(key)
     if (cached) {
      return cached;
    }

    const vehicles = await vehicleRepository.get();

    await redis.set(key, vehicles, {
      ex: 300,
    });

    return vehicles;

  },

  getVehicleById: async (id: string) => {
    const key = `vehicle:${id}`

    const cached = await redis.get(key)
     if (cached) {
      return cached;
    }
    const vehicle = await vehicleRepository.getById(id);
    await redis.set(key, vehicle, {
      ex: 300,
    });

    return vehicle
  },

  updateVehicle: async (id: string, data: UpdateVehicleDto) => {
    const vehicle = await vehicleRepository.getById(id);

    if (!vehicle) {
      throw new NotFoundError("Vehicle Not Found");
    }

    const validatedData = updateVehicleSchema.parse(data);
    const updatedVehicle = await vehicleRepository.update(id, validatedData);
    
    await redis.del(`vehicle:${id}`);
    await redis.del("vehicles:all");

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

    const deletedVehicle = await vehicleRepository.delete(id);
    
    await redis.del(`vehicle:${id}`);
    await redis.del("vehicles:all");

    return deletedVehicle;
  },
};
