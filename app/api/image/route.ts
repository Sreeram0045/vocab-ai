import { NextResponse } from "next/server";
import { auth } from "@/auth";

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
        // We tell the AI: "Subject first, Style second"
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

        // 6. Handle Errors (If HF is down or busy)
        if (!response.ok) {
            const errorText = await response.text();
            console.error("❌ Image API Error:", errorText);
            return NextResponse.json({ error: "Image generation failed" }, { status: response.status });
        }

        // 7. Success! Convert Blob -> Base64 for the frontend
        const imageBlob = await response.blob();
        const buffer = Buffer.from(await imageBlob.arrayBuffer());
        const base64Image = `data:image/jpeg;base64,${buffer.toString("base64")}`;

        return NextResponse.json({ image: base64Image });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error("🔥 Image Route Exception:", errorMessage);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}