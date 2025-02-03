import { v2 as cloudinary } from "cloudinary";
import {cloudinaryApiKey, cloudinaryApiSecret, cloudinaryName} from "./secrets";

cloudinary.config({
    cloud_name: cloudinaryName,
    api_key: cloudinaryApiKey,
    api_secret: cloudinaryApiSecret,
    secure: true,
});

export { cloudinary };
