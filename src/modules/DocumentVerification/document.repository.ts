import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../config/db";

type Tx = Prisma.TransactionClient;

export const documentRepository = {
  findByUserId: async (userId: string) => {
    return prisma.userDocuments.findUnique({ where: { user_id: userId } });
  },

  findApprovedByUserId: async (userId: string, tx?: Tx) => {
    const db = tx ?? prisma;
    return db.userDocuments.findFirst({
      where: { user_id: userId, status: "APPROVED" },
      select: { id: true },
    });
  },

  findById: async (id: string) => {
    return prisma.userDocuments.findUnique({ where: { id } });
  },

  findAll: async () => {
    return prisma.userDocuments.findMany({ orderBy: { updatedAt: "desc" } });
  },

  create: async (data: Prisma.UserDocumentsUncheckedCreateInput) => {
    return prisma.userDocuments.create({ data });
  },

  update: async (id: string, data: Prisma.UserDocumentsUncheckedUpdateInput) => {
    return prisma.userDocuments.update({ where: { id }, data });
  },

  delete: async (id: string) => {
    return prisma.userDocuments.delete({ where: { id } });
  },
};