import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import History from "@/models/WordHistory"; // Ensure this path is correct

export async function POST(req: Request) {
    try {
        const { wordId, result } = await req.json(); // result = 'remembered' or 'forgot'

        // 1. Connect to DB first!
        await connectDB();

        // 2. Get the word (Mongoose models have findById)
        const wordItem = await History.findById(wordId);

        if (!wordItem) {
            return NextResponse.json({ error: "Word not found" }, { status: 404 });
        }

        // 3. Calculate New Stage & Date
        let newStage = wordItem.srsStage || 0; // Handle undefined default
        let daysToAdd = 0;

        if (result === 'forgot') {
            newStage = 0; // Reset to 0 if forgotten!
            daysToAdd = 0; // Review again today
        } else {
            // EXPONENTIAL BACKOFF LOGIC
            newStage = newStage + 1;

            switch (newStage) {
                case 1: daysToAdd = 1; break;
                case 2: daysToAdd = 3; break;
                case 3: daysToAdd = 7; break;
                case 4: daysToAdd = 14; break;
                case 5: daysToAdd = 30; break;
                default: daysToAdd = 60; // Max out at 2 months
            }
        }

        // 4. Set the new Date
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + daysToAdd);

        // 5. Update DB
        wordItem.srsStage = newStage;
        wordItem.nextReviewDate = nextDate;
        wordItem.lastReviewedAt = new Date();
        await wordItem.save();

        return NextResponse.json({ success: true, nextDate });

    } catch (error: any) {
        console.error("Update Error:", error);
        return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    }
}