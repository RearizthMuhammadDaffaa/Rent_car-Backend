import multer from "multer";
import { fileTypeFromBuffer } from "file-type";
import { NextFunction } from "express";
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
});

export const uploadDocuments = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 2,
  },
});

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export const validateImageFile = async (
  req: Express.Request,
  _res: Express.Response,
  next: NextFunction
) => {
  try {
    const files = req.files
      ? Array.isArray(req.files)
        ? req.files
        : Object.values(req.files).flat()
      : req.file
        ? [req.file]
        : [];

    for (const file of files) {
      const detectedType = await fileTypeFromBuffer(file.buffer);

      if (
        !detectedType ||
        !ALLOWED_MIME_TYPES.includes(detectedType.mime)
      ) {
        throw new Error(
          "Invalid file type. Only JPG, PNG, and WEBP are allowed."
        );
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};