import { NextResponse } from "next/server";
import { auth } from "@/auth";
import cloudinary from "@/lib/cloudinary";

export async function POST(req: Request) {
    const session = await auth();
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // 1. Get the Prompt and Universe from the request
        const { prompt, universe } = await req.json();

        // 2. Check API Key
        const apiKey = process.env.HUGGINGFACE_API_KEY || process.env.HF_TOKEN;
        if (!apiKey) {
            return NextResponse.json({ error: "Missing API Key" }, { status: 500 });
        }

        // 3. The Model URL (Router)
        const model = "black-forest-labs/FLUX.1-schnell";
        const url = `https://router.huggingface.co/hf-inference/models/${model}`;

        // 4. Enhanced Prompt Engineering
        const finalPrompt = `${prompt}. 
        Cinematic shot, in the visual style of the TV Show "${universe}". 
        High resolution, photorealistic, 4k, dramatic lighting.`;

        console.log("🎨 Generating Image for:", finalPrompt);

        // 5. Call Hugging Face
        const response = await fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ inputs: finalPrompt }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("❌ Image API Error:", errorText);
            return NextResponse.json({ error: "Image generation failed" }, { status: response.status });
        }

        // 6. Get Buffer
        const imageBlob = await response.blob();
        const arrayBuffer = await imageBlob.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // 7. Upload to Cloudinary
        // We use a Promise wrapper because cloudinary's upload_stream is callback-based
        const uploadToCloudinary = () => {
            return new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: "vocab-ai", // Folder in Cloudinary
                        resource_type: "image",
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                uploadStream.end(buffer);
            });
        };

        const cloudinaryResult: any = await uploadToCloudinary();
        const imageUrl = cloudinaryResult.secure_url;

        console.log("☁️ Uploaded to Cloudinary:", imageUrl);

        return NextResponse.json({ image: imageUrl });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error("🔥 Image Route Exception:", errorMessage);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}