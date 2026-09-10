import express from 'express';
import dotenv from "dotenv";
import { Server } from "http";
import { disconnectDB } from './config/db';
import router from './routes';
import cookieParser from 'cookie-parser';
import { errorMiddleware } from './middleware/error.middleware';
import { multerErrorHandler } from './middleware/multer-error.middleware';

dotenv.config();
const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api/v1",router);
app.use(multerErrorHandler)
app.use(errorMiddleware)


const PORT = 5001;
const server = app.listen(PORT,()=> {
  console.log(`server running op port ${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason: unknown) => {
  console.error("Unhandled Rejection:", reason);

  server.close(async () => {
    await disconnectDB();
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", async (error: Error) => {
  console.error("Uncaught Exception:", error);

  await disconnectDB();
  process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");

  server.close(async () => {
    await disconnectDB();
    process.exit(0);
  });
});