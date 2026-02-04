import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import WordHistory from "@/models/WordHistory"; // Checked: Matches your model name

export async function POST(req: Request) {
    try {
        const { wordId, result } = await req.json(); // result = 'remembered' or 'forgot'

        await connectDB();

        const wordItem = await WordHistory.findById(wordId);

        if (!wordItem) {
            return NextResponse.json({ error: "Word not found" }, { status: 404 });
        }

        // --- CALCULATE NEW STAGE ---
        let newStage = wordItem.srsStage || 0;
        let unitsToAdd = 0; // "Units" will be Days in Prod, Minutes in Dev

        if (result === 'forgot') {
            newStage = 0; // Reset to 0
            unitsToAdd = 0; // Review immediately
        } else {
            // EXPONENTIAL BACKOFF (Leitner System)
            newStage = newStage + 1;

            switch (newStage) {
                case 1: unitsToAdd = 1; break;  // 1 unit wait
                case 2: unitsToAdd = 3; break;  // 3 unit wait
                case 3: unitsToAdd = 7; break;  // 7 unit wait
                case 4: unitsToAdd = 14; break; // 14 unit wait
                case 5: unitsToAdd = 30; break; // 30 unit wait
                default: unitsToAdd = 60;       // Max cap
            }
        }

        // --- SMART TIME LOGIC ---
        const nextDate = new Date();
        const isDev = process.env.NODE_ENV === "development";

        if (isDev && unitsToAdd > 0) {
            // DEV MODE: Use MINUTES for fast testing
            console.log(`⚠️ DEV MODE: Scheduling next review in ${unitsToAdd} minutes (Stage ${newStage}).`);
            nextDate.setMinutes(nextDate.getMinutes() + unitsToAdd);
        } else {
            // PROD MODE: Use DAYS (Standard SRS)
            nextDate.setDate(nextDate.getDate() + unitsToAdd);
        }

        // --- UPDATE DB ---
        wordItem.srsStage = newStage;
        wordItem.nextReviewDate = nextDate;
        wordItem.lastReviewedAt = new Date();

        await wordItem.save();

        return NextResponse.json({ success: true, nextDate, stage: newStage });

    } catch (error: any) {
        console.error("Update Error:", error);
        return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    }
}