import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import WordHistory from "@/models/WordHistory";
import { auth } from "@/auth";

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { wordId } = await req.json();

    await connectDB();

    const word = await WordHistory.findOne({ _id: wordId, userId: session.user.id });

    if (!word) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Toggle the status
    word.isLearning = !word.isLearning;

    if (word.isLearning) {
        const nextDate = new Date();

        // --- SMART TIMING LOGIC ---
        // If running locally (npm run dev), review in 1 minute.
        // If running live (Production), review in 24 hours.
        const isDev = process.env.NODE_ENV === "development";

        if (isDev) {
            console.log("⚠️ DEV MODE: Scheduling review for 1 minute from now.");
            nextDate.setMinutes(nextDate.getMinutes() + 1);
        } else {
            nextDate.setDate(nextDate.getDate() + 1); // 24 Hours
        }

        word.nextReviewDate = nextDate;
        word.srsStage = 0;
    } else {
        word.nextReviewDate = null;
    }

    await word.save();

    return NextResponse.json({ success: true, isLearning: word.isLearning });
}