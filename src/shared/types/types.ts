import { Prisma } from "../../../generated/prisma/client";

export type BrandType = { 
  name: string 
  logo?: string
  logoPublicId?: string;
}

export type BrandParams = {
  id: string;
};

export type VehicleWithRelations = Prisma.VehiclesGetPayload<{
  include: {
    brand: true;
    category: true;
  };
}>;