import bcrypt from "bcrypt";
import { prisma } from "../../config/db";
import path from "path";
import fs from "fs";

const imagePath = path.join(
      process.cwd(),
      "src",
      "tests",
      "fixtures",
      "logo.jpeg",
    );


export const removeTestUser = async () => {
  await prisma.user.deleteMany({
    where : {
      email: "test@gmail.com",
    }
  })
}

export const createTestUser = async () => {
  await prisma.user.create({
    data : {
      email : "test@gmail.com",
      password: await bcrypt.hash("rahasia",10),
      name: "test"
    }
  })
}

export const getTestUser = async () => {
  return prisma.user.findUnique({
    where: {
      email: "test@gmail.com",
    },
  });
};

export const createTestAdmin = async () => {
  await prisma.user.create({
    data : {
      email : "testAdmin@gmail.com",
      password: await bcrypt.hash("rahasia",10),
      name: "testAdmin",
      role:'ADMIN'
    }
  })
};

export const getTestAdmin = async () => {
  return prisma.user.findUnique({
    where: {
      email: "testAdmin@gmail.com",
    },
  });
};

export const removeTestAdmin = async () => {
  await prisma.user.deleteMany({
    where : {
      email: "testAdmin@gmail.com",
    }
  })
}

export const createTestBrands = async () => {
  await prisma.brands.create({
    data : {
      name : "toyotaTest",
      logo: "https://example.com/test-logo.jpeg"
    }
  })
}

export const removeAllTestBrands = async () => {
  await prisma.brands.deleteMany({
    where: {
      name:"toyotaTest"
    },
  });
};

export const createTestCategory = async () => {
  return prisma.vehicle_Categories.create({
    data: {
      name: "categoryTest",
      description: "Test category",
    },
  });
};

export const removeTestCategories = async () => {
  await prisma.vehicle_Categories.deleteMany({
    where: { name: "categoryTest" },
  });
};

export const createTestVehicle = async (brandId: string, categoryId: string) => {
  return prisma.vehicles.create({
    data: {
      brand_id: brandId,
      category_id: categoryId,
      plate_number: "B1234TEST",
      model: "Test Model",
      year: new Date().getFullYear(),
      pricePerDay: 500000,
      color: "Black",
      seat: "4",
      thumbnail: "https://example.com/test-vehicle.jpeg",
      description: "Test vehicle description",
    },
  });
};

export const removeTestVehicles = async () => {
  await prisma.vehicles.deleteMany({
    where: { plate_number: "B1234TEST" },
  });
};

export const createTestCoupon = async () => {
  return prisma.coupons.create({
    data: {
      code: "TEST10",
      discountValue: 10,
      usageLimit: 10,
      usedCount: 0,
      type: "PERCENTAGE",
      maximumDiscount: 100000,
      expiredAt: new Date(Date.now() + 86400000),
      isActive: true,
    },
  });
};

export const removeTestCoupons = async () => {
  await prisma.coupons.deleteMany({
    where: { code: "TEST10" },
  });
};
