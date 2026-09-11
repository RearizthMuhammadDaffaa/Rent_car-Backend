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
  upload:async (userId:string,ktpPublicId:string,simPublicId:string) => {
      return prisma.userDocuments.upsert({
        where: {
          user_id: userId,
        },
        create: {
          user_id: userId,
          ktp_public_id: ktpPublicId,
          sim_public_id: simPublicId,
          status: "PENDING",
        },
        update: {
          ktp_public_id: ktpPublicId,
          sim_public_id: simPublicId,
          status: "PENDING",
        },
      });
  },
};