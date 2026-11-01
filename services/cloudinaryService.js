import { v2 as cloudinary } from "cloudinary"; // reads CLOUDINARY_URL from the environment

class CloudinaryService {
  async uploadCSV(fileName, data) {
    const dataUri = `data:text/csv;base64,${Buffer.from(data).toString("base64")}`;
    return await cloudinary.uploader.upload(dataUri, {
      resource_type: "raw",
      public_id: fileName,
      folder: "expenses",
    });
  }
}

export default new CloudinaryService();
