import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import History from "@/models/WordHistory";
import { auth } from "@/auth";

export async function GET(req: Request) {
    const session = await auth();

    // 1. Security Check: Ensure user exists and has an ID
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // 2. Query using 'userId' (Matches your MongoDB data)
    const dueWords = await History.find({
        userId: session.user.id, // <--- CHANGED FROM userEmail to userId
        isLearning: true,
        nextReviewDate: { $lte: new Date() } // "Is the due date in the past?"
    }).limit(10);

    return NextResponse.json(dueWords);
}