import { Request, Response } from "express";
import { cloudinaryService } from "../../shared/service/cloudinary.service";
import { VehicleService } from "./vehicle.service";
import { vehicleParamSchema, VehicleParamsDto } from "./vehicle.schema";

export const vehicleController = {
  async createVehicle(req: Request, res: Response) {
    try {
      if (!req.file) {
        res.status(400).json({ message: "Thumbnail is required" });
        return;
      }

      const fileName = `vehicle-${Date.now()}`;
      const image = await cloudinaryService.uploadImage(req.file, fileName, "rent-car/vehicles");

      const vehicle = await VehicleService.createVehicle({
        ...req.body,
        thumbnail: image.url,
        thumbnailPublicId: image.publicId,
      });

      return res.status(201).json({
        message: "Vehicle created successfully",
        data: vehicle,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        error,
      });
    }
  },

  async getVehicles(req: Request, res: Response) {
    try {
      const vehicles = await VehicleService.getVehicles();

      return res.status(200).json({
        vehicles,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        error,
      });
    }
  },

  async getVehicleById(req: Request<VehicleParamsDto>, res: Response) {
    try {
      const params = vehicleParamSchema.parse(req.params);
      const vehicle = await VehicleService.getVehicleById(params.id);

      return res.status(200).json({
        vehicle,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        error,
      });
    }
  },

  async updateVehicle(req: Request<VehicleParamsDto>, res: Response) {
    try {
      const params = vehicleParamSchema.parse(req.params);
      let thumbnail: string | undefined;
      let thumbnailPublicId: string | undefined;

      if (req.file) {
        const fileName = `vehicle-${Date.now()}`;
        const image = await cloudinaryService.uploadImage(req.file, fileName, "rent-car/vehicles");

        thumbnail = image.url;
        thumbnailPublicId = image.publicId;
      }

      const vehicle = await VehicleService.updateVehicle(params.id, {
        ...req.body,
        thumbnail,
        thumbnailPublicId,
      });

      return res.status(200).json({
        vehicle,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        error,
      });
    }
  },

  async deleteVehicle(req: Request<VehicleParamsDto>, res: Response) {
    try {
      const params = vehicleParamSchema.parse(req.params);
      await VehicleService.deleteVehicle(params.id);

      return res.status(200).json({
        message: "Data success deleted",
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        error,
      });
    }
  },
};
