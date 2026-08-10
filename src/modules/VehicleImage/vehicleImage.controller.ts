import { Request, Response } from "express";
import { cloudinaryService } from "../../shared/service/cloudinary.service";
import { VehicleImageService } from "./vehicleImage.service";
import { vehicleImageParamSchema, VehicleImageParamsDto } from "./vehicleImage.schema";

export const vehicleImageController = {
  async createVehicleImage(req: Request, res: Response) {
    try {
      if (!req.file) {
        res.status(400).json({ message: "Image is required" });
        return;
      }

      const fileName = `vehicle-image-${Date.now()}`;
      const image = await cloudinaryService.uploadImage(req.file, fileName, "rent-car/vehicle-images");

      const vehicleImage = await VehicleImageService.createVehicleImage({
        ...req.body,
        image_url: image.url,
        imagePublicId: image.publicId,
      });

      return res.status(201).json({
        message: "Vehicle image created successfully",
        data: vehicleImage,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        error,
      });
    }
  },

  async getVehicleImages(req: Request, res: Response) {
    try {
      const vehicleImages = await VehicleImageService.getVehicleImages();

      return res.status(200).json({
        vehicleImages,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        error,
      });
    }
  },

  async getVehicleImageById(req: Request<VehicleImageParamsDto>, res: Response) {
    try {
      const params = vehicleImageParamSchema.parse(req.params);
      const vehicleImage = await VehicleImageService.getVehicleImageById(params.id);

      return res.status(200).json({
        vehicleImage,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        error,
      });
    }
  },

  async updateVehicleImage(req: Request<VehicleImageParamsDto>, res: Response) {
    try {
      const params = vehicleImageParamSchema.parse(req.params);
      let image_url: string | undefined;
      let imagePublicId: string | undefined;

      if (req.file) {
        const fileName = `vehicle-image-${Date.now()}`;
        const image = await cloudinaryService.uploadImage(req.file, fileName, "rent-car/vehicle-images");

        image_url = image.url;
        imagePublicId = image.publicId;
      }

      const vehicleImage = await VehicleImageService.updateVehicleImage(params.id, {
        ...req.body,
        image_url,
        imagePublicId,
      });

      return res.status(200).json({
        vehicleImage,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        error,
      });
    }
  },

  async deleteVehicleImage(req: Request<VehicleImageParamsDto>, res: Response) {
    try {
      const params = vehicleImageParamSchema.parse(req.params);
      await VehicleImageService.deleteVehicleImage(params.id);

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
