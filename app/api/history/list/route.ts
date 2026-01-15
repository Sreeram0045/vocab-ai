import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import WordHistory from "@/models/WordHistory";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Fetch all words for this user
    const history = await WordHistory.find({ userId: session.user.id }).select('word');
    const words = history.map(item => item.word);

    return NextResponse.json(words);
  } catch (error: any) {
    console.error("Error fetching history list:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
