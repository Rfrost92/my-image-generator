//server.ts
import express, { Request, Response, Application } from "express";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import { v2 as cloudinary } from "cloudinary";
import fetch from "node-fetch"; // Ensure node-fetch is installed
import dotenv from "dotenv";
dotenv.config();

const app: Application = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.VITE_RUNWARE_API_KEY;

// Define the expected response type
interface RunwareApiResponse {
  data: { imageURL: string }[];
}

cloudinary.config({
  cloud_name: process.env.VITE_CLOUDINARY_NAME,
  api_key: process.env.VITE_CLOUDINARY_API_KEY,
  api_secret: process.env.VITE_CLOUDINARY_API_SECRET,
  secure: true,
});

// Type guard to check if response is valid
const _isValidApiResponse = (obj: any): obj is RunwareApiResponse => {
  return obj && obj.data && Array.isArray(obj.data) && obj.data.length > 0 && typeof obj.data[0].imageURL === "string";
};

app.post("/api/generate", async (req: Request, res: Response): Promise<void> => {
  const { prompt, model, width, height } = req.body;

  if (!prompt) {
    res.status(400).json({ error: "Prompt is required" });
    return;
  }
 const payload = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${API_KEY}`,
    },
    body: JSON.stringify([
      {
        taskType: "authentication",
        apiKey: API_KEY,
      },
      {
        taskType: "imageInference",
        taskUUID: uuidv4(),
        positivePrompt: prompt,
        width: width || 512,
        height: height || 512,
        model: model || "runware:100@1",
        numberResults: 1,
      },
    ]),
  }
  try {
    const response = await fetch("https://api.runware.ai/v1", payload);

    console.log("payload", payload);

    const raw = await response.json();
    const data = raw as RunwareApiResponse;

    if (!data.data || data.data.length === 0) {
      console.error("Unexpected API response format:", raw);
      res.status(500).json({ error: "Invalid response from AI API" });
      return;
    }

    const imageUrl = data.data[0].imageURL;
    console.log(imageUrl);

    // Upload the generated image to Cloudinary
    const uploadedImage = await cloudinary.uploader.upload(imageUrl, {
      folder: "generated_images", // Organize in a folder
      public_id: `generated-${Date.now()}`, // Unique filename
      type: "authenticated", // Ensures it's only accessible when logged in
    });

    res.json({
      imageUrl: uploadedImage.secure_url, // URL of the uploaded image
      cloudinaryId: uploadedImage.public_id, // ID to access/delete later
    });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/images", async (_req: Request, res: Response): Promise<void> => {
  try {
    // ✅ Fetch all images from the "generated_images" folder
    const result = await cloudinary.search
        .expression("folder:generated_images") // Search in the folder
        .sort_by("created_at", "desc") // Sort by newest first
        .max_results(50) // Limit results
        .execute();

    // ✅ Extract only image URLs
    const images = result.resources.map((img: any) => ({
      url: img.secure_url,
      publicId: img.public_id, // Keep for potential deletion in the future
    }));

    res.json({ images });
  } catch (error) {
    console.error("Error fetching images:", error);
    res.status(500).json({ error: "Failed to fetch images" });
  }
});

const PORT = 5003;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
