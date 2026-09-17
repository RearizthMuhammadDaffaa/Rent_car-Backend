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
app.use(errorMiddleware);

export {app}