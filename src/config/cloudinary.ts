
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv"

dotenv.config();

console.log({
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_API_KEY
    ? "EXISTS"
    : "MISSING",
  apiSecret: process.env.CLOUDINARY_API_SECRET
    ? "EXISTS"
    : "MISSING",
});


const cloudinaryConfig = cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary, cloudinaryConfig };

