import express from 'express';
import dotenv from "dotenv";
import { Server } from "http";
import { disconnectDB } from './config/db.js';
import router from './routes/index.js';
import cookieParser from 'cookie-parser';
import { errorMiddleware } from './middleware/error.middleware.js';
import { multerErrorHandler } from './middleware/multer-error.middleware.js';
import cors from "cors";

dotenv.config();
const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/v1",router);
app.use(multerErrorHandler)
app.use(errorMiddleware);

export {app}