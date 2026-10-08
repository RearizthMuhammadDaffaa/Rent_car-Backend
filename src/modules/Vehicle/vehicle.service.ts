import { redis } from "../../config/upstash.js";
import { NotFoundError } from "../../errors/NotFoundError.js";
import { cloudinaryService } from "../../shared/service/cloudinary.service.js";
import { VehicleWithRelations } from "../../shared/types/types.js";
import { vehicleCacheKeys } from "./vehicle.cache.js";
import { vehicleRepository } from "./vehicle.repository.js";
import {
  CreateVehicleDto,
  createVehicleSchema,
  UpdateVehicleDto,
  updateVehicleSchema,
} from "./vehicle.schema.js";

type VehicleListResult = Awaited<ReturnType<typeof vehicleRepository.get>>;

export const VehicleService = {
  createVehicle: async (data: CreateVehicleDto) => {
    const vehicleSchema = createVehicleSchema.parse(data);
    const vehicle = await vehicleRepository.create(vehicleSchema);
     await redis.del(vehicleCacheKeys.all);
    return vehicle;
  },

  getVehicles: async (page: number, limit: number) => {
    const key = vehicleCacheKeys.all;
    const pageKey = `${page}:${limit}`;

    const cached = await redis.get<Record<string, VehicleListResult>>(key);
    const cachedPage = cached?.[pageKey];
    if (cachedPage) {
      return cachedPage;
    }

    const vehicles = await vehicleRepository.get(page, limit);

    await redis.set(key, {
      ...cached,
      [pageKey]: vehicles,
    }, {
      ex: 300,
    });

    return vehicles;

  },

  getAvailability: async (
  pickupAt: Date,
  returnAt: Date
) => {
  return vehicleRepository.getAvailability(
    pickupAt,
    returnAt
  );
},

  getVehicleById: async (id: string) => {
    const key = vehicleCacheKeys.byId(id)

   const cached = await redis.get<VehicleWithRelations>(key)
     if (cached) {
      return cached;
    }
    const vehicle = await vehicleRepository.getById(id);
    if (!vehicle) {
       throw new NotFoundError("Vehicle not found");
    }
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
    
    await redis.del(vehicleCacheKeys.byId(id));
    await redis.del(vehicleCacheKeys.all);

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
    
    await redis.del(vehicleCacheKeys.byId(id));
    await redis.del(vehicleCacheKeys.all);

    return deletedVehicle;
  },
};
