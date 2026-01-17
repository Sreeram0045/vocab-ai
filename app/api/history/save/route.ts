import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import WordHistory from "@/models/WordHistory";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const { word, meaning, universe, visual_prompt, imageUrl, synonyms, antonyms, conversation, context } = data;

    if (!word || !meaning || !universe) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();

    // Upsert: Update if exists, Insert if new
    const savedWord = await WordHistory.findOneAndUpdate(
      {
        userId: session.user.id,
        word: word.trim().toLowerCase(),
      },
      {
        userId: session.user.id,
        word: word.trim().toLowerCase(),
        meaning,
        universe,
        visual_prompt,
        imageUrl,
        synonyms,
        antonyms,
        conversation,
        context
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json(savedWord);
  } catch (error: any) {
    console.error("Error saving history:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
