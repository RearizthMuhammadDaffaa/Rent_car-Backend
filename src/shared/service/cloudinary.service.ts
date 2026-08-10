import { cloudinary } from "../../config/cloudinary";

export const cloudinaryService = {
  uploadImage: async (
    file: Express.Multer.File,
    fileName: string,
    folder = "rent-car/brands"
  ) => {
    return new Promise<{
      url: string;
      publicId: string;
    }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: fileName,
          resource_type: "image",
        },
        (error, result) => {
          if (error) {
            console.error("CLOUDINARY ERROR:", error);
            reject(error);
            return;
          }

          if (!result) {
            reject(new Error("Cloudinary returned no result"));
            return;
          }

          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      );

      stream.end(file.buffer);
    });
  },

  deleteImage: async (publicId: string) => {
    return cloudinary.uploader.destroy(publicId);
  },
};