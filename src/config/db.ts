import { PrismaClient } from "../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv"

dotenv.config();

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

export const prisma = new PrismaClient({
 adapter
});

export const connectDB = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log("✅ Database Connected via Prisma");
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`❌ Database connection error: ${error.message}`);
    } else {
      console.error("❌ Unknown database connection error", error);
    }

    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  await prisma.$disconnect();
};