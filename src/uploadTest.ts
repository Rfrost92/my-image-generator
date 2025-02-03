import { v2 as cloudinary } from "cloudinary";
import {cloudinaryApiKey, cloudinaryApiSecret, cloudinaryName} from "./secrets";
// Load environment variables from .env file

// Configure Cloudinary
cloudinary.config({
    cloud_name: cloudinaryName,
    api_key: cloudinaryApiKey,
    api_secret: cloudinaryApiSecret,
    secure: true,
});

async function uploadToCloudinary(imagePath: string, imageName: string): Promise<string> {
    try {
        const result = await cloudinary.uploader.upload(imagePath, {
            folder: "generated_images",
            public_id: imageName,
            type: "authenticated", // Ensures the image is private
        });

        console.log("File uploaded successfully!", result.secure_url);
        return result.secure_url;
    } catch (error) {
        console.error("Upload failed:", error);
        throw error;
    }
}

// Test the function
uploadToCloudinary("exampleImage.png", "exampleImage")
    .then((fileUrl) => console.log("Image URL:", fileUrl))
    .catch((error) => console.error("Error:", error));
