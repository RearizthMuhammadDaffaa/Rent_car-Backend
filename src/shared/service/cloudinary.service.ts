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

   async uploadPrivateDocument(
    file: Express.Multer.File,
    fileName: string
  ) {
    return new Promise<{
      publicId: string;
    }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          public_id: fileName,
          folder: "rent-car/documents",
          resource_type: "image",
          type: "authenticated",
        },
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }

          if (!result) {
            reject(new Error("Cloudinary upload failed"));
            return;
          }

          resolve({
            publicId: result.public_id,
          });
        }
      );

      stream.end(file.buffer);
    });
  },
  generatePrivateDocumentUrl(publicId: string) {
  return cloudinary.url(publicId, {
    type: "authenticated",
    resource_type: "image",
    sign_url: true,
    secure: true,
  });
},
deletePrivateDocument: async (publicId: string) => {
  return cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
    type: "authenticated",
  });
},
};