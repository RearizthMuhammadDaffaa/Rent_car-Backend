
import { prisma } from "../../config/db";
import { RegisterInput } from "./auth.schema";

export const authRepository = {
  findByEmail: async (email: string) => {
    return prisma.user.findUnique({
      where: {
        email,
      },
    });
  },

  createUser: async (
    data: RegisterInput & {
      password: string;
    }
  ) => {
    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
      },
    });
  },
};

