import { NotFoundError } from "../../errors/NotFoundError.js"
import { VehicleCatRepository } from "./vehicleCat.repository.js"
import { CreateVehicleCatDto, createVehicleCatSchema, UpdateVehicleCatDto, updateVehicleCatSchema } from "./vehicleCat.schema.js"

export const VehicleCatService = {
  createVehileCat : async (data:CreateVehicleCatDto) => {
     const vehicleCatSchema = createVehicleCatSchema.parse(data)
    return await VehicleCatRepository.create(vehicleCatSchema)
  },
  getVehileCats : async (page: number, limit: number) => {
    const vehicleCats = await VehicleCatRepository.get(page, limit)
    return vehicleCats
  },
  getVehileCatById: async (id:string) => {
    return await VehicleCatRepository.getbyId(id)
  },
  updateVehileCat: async (id:string,data:UpdateVehicleCatDto) =>{
    const vehicleCat = await VehicleCatRepository.getbyId(id);

    if(!vehicleCat){
      throw new NotFoundError("Vehile Categories Not Found")
    }
   
     const validatedData = updateVehicleCatSchema.parse(data)
  


    return await VehicleCatRepository.update(id,validatedData)
  },
  deleteVehileCat : async (id:string) => {
    const vehicleCat = await VehicleCatRepository.getbyId(id);

    if(!vehicleCat){
      throw new NotFoundError("Vehile Categories Not Found")
    }

    return await VehicleCatRepository.delete(id)
  }
}