import { Request, Response } from "express";
import { BrandService } from "./brand.service";
import { brandParamSchema, createBrandSchema } from "./brand.schema";
import { BrandParams } from "../../shared/types/types";
import { cloudinaryService } from "../../shared/service/cloudinary.service";

export const brandController = {
  async createBrand(req: Request, res: Response) {
    try {
      const { name } = req.body;

      console.log("BODY:", req.body);
      console.log("FILE:", req.file);

      if (!req.file) {
        res.status(400).json({ message: "Logo is required" });
        return;
      }

      const fileName = `brand-${Date.now()}`;

      const image = await cloudinaryService.uploadImage(req.file, fileName);

      const brand = await BrandService.createBrand({
        name,
        logo: image.url,
        logoPublicId: image.publicId,
      });

      return res.status(201).json({
        message: "Brand created successfully",
        data: brand,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        error,
      });
    }
  },

  async getBrands(req: Request, res: Response) {
    try {
      const brands = await BrandService.getBrands();
      res.status(200).json({
        brands,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        error,
      });
    }
  },

  async getBrandById(req: Request<BrandParams>, res: Response) {
    try {
      const params = brandParamSchema.parse(req.params);
      const brand = await BrandService.getBrandById(params.id);
      res.status(200).json({
        brand,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        error,
      });
    }
  },

  async updateBrand(req: Request<BrandParams>, res: Response) {
    try {
      const { name } = req.body;
      const params = brandParamSchema.parse(req.params);
      let logo: string | undefined;
      let logoPublicId: string | undefined;

      if (req.file) {
        const fileName = `brand-${Date.now()}`;

        const image = await cloudinaryService.uploadImage(req.file, fileName);

        logo = image.url;
        logoPublicId = image.publicId;
      }

      const brand = await BrandService.updateBrand(params.id, { name, logo, logoPublicId });
      res.status(200).json({
        brand,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        error,
      });
    }
  },
  async deleteBrand(req: Request<BrandParams>, res: Response) {
    try {
      const params = brandParamSchema.parse(req.params);
      await BrandService.deleteBrand(params.id);
      res.status(200).json({
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
