import { Request, Response } from "express";
import { BrandService } from "./brand.service";
import { brandParamSchema, createBrandSchema } from "./brand.schema";
import { BrandParams } from "../../shared/types/types";

export const brandController = {
  async createBrand(req: Request, res: Response) {
    try {
      const { name, logo } = req.body;

      console.log("BODY:", req.body);


      const brand = await BrandService.createBrand({name,logo});

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

  async getBrands (req:Request,res:Response){
    try {
      const brands = await BrandService.getBrands();
      res.status(200).json({
        brands
      })
    } catch (error) {
       console.error(error);

      return res.status(500).json({
        error,
      });
    }

  },

  async getBrandById (req:Request<BrandParams>,res:Response){
    try {
      const params = brandParamSchema.parse(req.params);
      const brand = await BrandService.getBrandById(params.id);
      res.status(200).json({
        brand
      })
    } catch (error) {
       console.error(error);

      return res.status(500).json({
        error,
      });
    }

  },

   async updateBrand (req:Request<BrandParams>,res:Response){
    try {
      const {name,logo}  = req.body
      const params = brandParamSchema.parse(req.params);
      const brand = await BrandService.updateBrand(params.id, {name,logo});
      res.status(200).json({
        brand
      })
    } catch (error) {
       console.error(error);

      return res.status(500).json({
        error,
      });
    }

  },
   async deleteBrand (req:Request<BrandParams>,res:Response){
    try {
       const params = brandParamSchema.parse(req.params);
       await BrandService.deleteBrand(params.id);
      res.status(200).json({
        message: "Data success deleted"
      })
    } catch (error) {
       console.error(error);

      return res.status(500).json({
        error,
      });
    }

  }
};