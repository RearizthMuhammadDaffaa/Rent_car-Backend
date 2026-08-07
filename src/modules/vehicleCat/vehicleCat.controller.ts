import { Request, Response } from "express";
import { VehicleCatService } from "./vehicleCat.service";
import { vehicleCatParamSchema , VehicleCatParamsDto } from "./vehicleCat.schema";

export const VehicleCatController = {
  async createVehileCat(req: Request, res: Response) {
    try {
      const { name, description } = req.body;
      const vehicleCat = await VehicleCatService.createVehileCat({name,description});

      return res.status(201).json({
        message: "Vehicle Categories created successfully",
        data: vehicleCat,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        error,
      });
    }
  },

  async getVehileCats (req:Request,res:Response){
    try {
      const brands = await VehicleCatService.getVehileCats();
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

  async getVehileCatById (req:Request<VehicleCatParamsDto>,res:Response){
    try {
      const params = vehicleCatParamSchema.parse(req.params);
      const vehicleCat = await VehicleCatService.getVehileCatById(params.id);
      res.status(200).json({
        vehicleCat
      })
    } catch (error) {
       console.error(error);

      return res.status(500).json({
        error,
      });
    }

  },

   async updateVehileCat (req:Request<VehicleCatParamsDto>,res:Response){
    try {
      const {name,description}  = req.body
      const params = vehicleCatParamSchema.parse(req.params);
      const vehicleCat = await VehicleCatService.updateVehileCat(params.id, {name,description});
      res.status(200).json({
        vehicleCat
      })
    } catch (error) {
       console.error(error);

      return res.status(500).json({
        error,
      });
    }

  },
   async deleteVehileCat (req:Request<VehicleCatParamsDto>,res:Response){
    try {
       const params = vehicleCatParamSchema.parse(req.params);
       await VehicleCatService.deleteVehileCat(params.id);
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