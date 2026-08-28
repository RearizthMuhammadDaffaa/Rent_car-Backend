import multer from "multer";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const storage = multer.memoryStorage();

export const upload = multer({
  storage,

  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },

  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(
        new Error(
          "Invalid file type. Only JPG, PNG, and WEBP are allowed."
        )
      );

      return;
    }

    cb(null, true);
  },
});

export const uploadDocuments = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 2,
  },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(new Error("Invalid file type. Only JPG, PNG, and WEBP are allowed."));
      return;
    }

    cb(null, true);
  },
});