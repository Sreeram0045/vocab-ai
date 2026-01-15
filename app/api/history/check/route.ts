import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import WordHistory from "@/models/WordHistory";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const word = searchParams.get("word");

    if (!word) {
      return NextResponse.json({ error: "Word is required" }, { status: 400 });
    }

    await connectDB();

    console.log(`🔍 Checking History | User: ${session.user.id} | Word: '${word}'`);

    // Find the word for this user (case-insensitive search handled by saving lowercase)
    const historyItem = await WordHistory.findOne({
      userId: session.user.id, // Ensure your User model exposes ID
      word: word.trim().toLowerCase(),
    });

    console.log(`✅ History Result:`, historyItem ? "FOUND" : "NOT FOUND");

    if (!historyItem) {
      return NextResponse.json(null); // Explicit null for "not found"
    }

    return NextResponse.json(historyItem);
  } catch (error: any) {
    console.error("Error checking history:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
