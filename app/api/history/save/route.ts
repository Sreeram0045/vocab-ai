import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import WordHistory from "@/models/WordHistory";
// import User from "@/models/User"; // You aren't using this import, it can be removed

export async function POST(req: Request) {
  try {
    const session = await auth();
    // Ensure we check for user ID since we use it for the DB query
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const { word, meaning, universe, visual_prompt, imageUrl, synonyms, antonyms, conversation, context } = data;

    if (!word || !meaning || !universe) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // --- NEW LOGIC: Fetch Phonetics ---
    let phonetics = "";
    try {
      // We fetch from the free Dictionary API
      const dictionaryRes = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.trim()}`);

      if (dictionaryRes.ok) {
        const dictData = await dictionaryRes.json();
        // logic: try to get the top-level phonetic, or find the first one in the phonetics array that has text
        phonetics = dictData[0]?.phonetic || dictData[0]?.phonetics?.find((p: any) => p.text)?.text || "";
      }
    } catch (err) {
      // If the dictionary API fails, we just log it and continue. 
      // We don't want to break the main save function just because phonetics failed.
      console.error("Phonetic fetch failed:", err);
    }
    // ----------------------------------

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
        context,
        phonetics, // <--- Add the fetched phonetics here
        // Note: 'isLearning' and 'srsStage' will default to false/0 via the Schema defaults on insert
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json(savedWord);
  } catch (error: any) {
    console.error("Error saving history:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}