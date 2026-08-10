import { Request, Response, NextFunction } from "express";
import multer from "multer";

export const multerErrorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      res.status(400).json({
        success: false,
        message: "File size must not exceed 5 MB",
      });

      return;
    }

    res.status(400).json({
      success: false,
      message: error.message,
    });

    return;
  }

  if (error instanceof Error) {
    if (error.message.includes("Invalid file type")) {
      res.status(400).json({
        success: false,
        message: error.message,
      });

      return;
    }
  }

  next(error);
};