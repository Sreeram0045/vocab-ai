import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import WordHistory from "@/models/WordHistory";
import { auth } from "@/auth";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { word } = await req.json();
        if (!word) return NextResponse.json({ error: "Word required" }, { status: 400 });

        await connectDB();

        // 1. Try to find the word in the user's history
        const existingWord = await WordHistory.findOne({
            userId: session.user.id,
            word: word.trim().toLowerCase()
        });

        if (!existingWord) {
            // Return 404 so frontend knows to generate a new one
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        // 2. CHECK: Does it have phonetics?
        // If NOT, we do a "Lazy Update" (Fetch -> Save -> Return)
        if (!existingWord.phonetics) {
            try {
                const dictRes = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
                if (dictRes.ok) {
                    const dictData = await dictRes.json();
                    // Extract phonetics
                    const phoneticText = dictData[0]?.phonetic || dictData[0]?.phonetics?.find((p: any) => p.text)?.text || "";

                    if (phoneticText) {
                        existingWord.phonetics = phoneticText;
                        await existingWord.save(); // Save to DB immediately
                    }
                }
            } catch (err) {
                console.error("Failed to patch phonetics:", err);
                // Continue without crashing
            }
        }

        return NextResponse.json(existingWord);

    } catch (error) {
        console.error("Get Word Error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}