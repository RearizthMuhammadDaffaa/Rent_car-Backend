import { NotFoundError } from "../../errors/NotFoundError";
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

    return vehicleRepository.update(id, validatedData);
  },

  deleteVehicle: async (id: string) => {
    const vehicle = await vehicleRepository.getById(id);

    if (!vehicle) {
      throw new NotFoundError("Vehicle Not Found");
    }

    return vehicleRepository.delete(id);
  },
};
