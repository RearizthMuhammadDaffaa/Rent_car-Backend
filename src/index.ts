
import { Server } from "http";
import { disconnectDB } from './config/db';
import { app } from "./app";


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