import { createOpenAI } from "@ai-sdk/openai";
import { generateText, Output } from "ai";
import { z } from "zod";

const huggingface = createOpenAI({
    baseURL: "https://router.huggingface.co/v1",
    apiKey: process.env.HF_TOKEN
});

export async function POST(req: Request) {
    const { word } = await req.json();

    const vocabSchema = z.object({
        meaning: z.string(),
        universe: z.string(),
        visual_prompt: z.string(),
        synonyms: z.array(z.string()),
        antonyms: z.array(z.string()),
        conversation: z.array(z.string()),
        context: z.string().optional()
    });

    const systemPrompt = `
    You are an expert Hollywood scriptwriter and linguist.
    
    YOUR GOAL:
    1. Define the user's word accurately. If misspelled, return { "meaning": "Spelling error" }.
    2. CHOOSE A FICTIONAL UNIVERSE based on the word's "vibe":
       - Science/Complex -> "The Big Bang Theory"
       - Medical -> "House M.D."
       - Legal -> "Suits"
       - Corporate -> "The Office"
       - Detective -> "Sherlock"
       - Politics -> "Game of Thrones"
       - Tech -> "Mr. Robot"
       - Casual/Dating -> "Friends" or "HIMYM"
       - Rich/Drama -> "Succession"
    3. Generate a SHORT, FUNNY dialogue using the word strictly in character.
    4. VISUAL PROMPT: Describe a PHYSICAL SCENE for an image generator. 
       - describing the characters doing an action that represents the word.
       - DO NOT use abstract words. Be visual (e.g., "Joey eating a giant pizza").
       - DO NOT include the word itself.
    
    ONE-SHOT EXAMPLE:
    Input: "Serendipity"
    Output JSON:
    {
      "meaning": "Finding something good without looking for it.",
      "synonyms": ["fluke", "happy accident"],
      "antonyms": ["bad luck"],
      "context": "Casual",
      "universe": "Friends",
      "visual_prompt": "Joey Tribbiani looking shocked and happy holding a 20 dollar bill he found in an old coat, Central Perk coffee shop background",
      "conversation": [
        "Joey: I found a pizza in the hallway!",
        "Chandler: That is not serendipity, Joe."
      ]
    }
    You must return a SINGLE JSON Object with this exact structure:
        {
            "meaning": "Simple definition",
            "universe": "Name of show",
            "visual_prompt": "Description of a scene for an image generator (no text)",
            "synonyms": ["word1", "word2"],
            "antonyms": ["word1", "word2"],
            "conversation": [
                "Character A: Line 1",
                "Character B: Line 2"
            ],
            "context": "One word use case"
        }
    `;

    try {
        const { text } = await generateText({
            model: huggingface('meta-llama/Llama-3.1-8B-Instruct'),
            system: systemPrompt,
            prompt: `Teach me the word: "${word}"`,
            temperature: 0.8,
        });
        console.log(text);
        let cleanText = text.trim();
        // Remove markdown blocks if present
        if (cleanText.startsWith("```json")) cleanText = cleanText.replace(/^```json/, "").replace(/```$/, "");
        if (cleanText.startsWith("```")) cleanText = cleanText.replace(/^```/, "").replace(/```$/, "");

        // 5. Parse & Validate
        const rawData = JSON.parse(cleanText);
        const validatedData = vocabSchema.parse(rawData);

        return Response.json(validatedData);
    } catch (error: any) {
        console.error("🔥 Error:", error.message);
        console.error("The bad text was:", error.cause); // Check console if it fails

        // Fallback: If AI fails, return a safe error to frontend
        return Response.json({
            error: "AI got confused. Try searching again!",
            details: error.message
        }, { status: 500 });
    }
}