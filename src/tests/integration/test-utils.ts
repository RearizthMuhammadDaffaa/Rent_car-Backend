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
