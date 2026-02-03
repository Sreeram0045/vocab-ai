import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import { auth } from "@/auth";

// --- 1. CONFIGURATION & CHECKS ---

// Check API Keys immediately on server startup (or request)
if (!process.env.OPEN_ROUTER_TOKEN) {
    console.error("❌ CRITICAL ERROR: OPEN_ROUTER_TOKEN is missing from .env");
}
if (!process.env.GEMINI_API_KEY) {
    console.error("❌ CRITICAL ERROR: GEMINI_API_KEY is missing from .env");
}

const openRouter = createOpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPEN_ROUTER_TOKEN
});

// Initialize Gemini Client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// --- 2. SHARED SCHEMA (Moved outside to prevent scope errors) ---
const vocabSchema = z.object({
    meaning: z.string(),
    universe: z.string(),
    visual_prompt: z.string(),
    synonyms: z.array(z.string()),
    antonyms: z.array(z.string()),
    conversation: z.array(z.string()),
    context: z.string().optional()
});

// --- 3. HELPER FUNCTION ---
function processResponse(rawText: string, provider: string) {
    try {
        let cleanText = rawText.trim();
        // Remove markdown code blocks if present
        cleanText = cleanText.replace(/```json/g, "").replace(/```/g, "").trim();

        const rawData = JSON.parse(cleanText);
        // Validate against the Zod schema
        const validatedData = vocabSchema.parse(rawData);

        console.log(`✅ Success via ${provider}`);
        return Response.json(validatedData);
    } catch (error: any) {
        console.error(`❌ JSON Parsing failed for ${provider}. Raw Text:`, rawText);
        throw new Error(`JSON Parsing failed: ${error.message}`);
    }
}

// --- 4. MAIN ROUTE HANDLER ---
export async function POST(req: Request) {
    // Auth Check
    const session = await auth();
    if (!session || !session.user) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Input Validation
    const { word, preferredShows } = await req.json();
    if (!word) {
        return Response.json({ error: "Word is required" }, { status: 400 });
    }

    // --- PROMPT CONSTRUCTION ---
    // (Prompt preserved exactly as requested)
    let universeInstruction = "";
    if (preferredShows && preferredShows.length > 0) {
        universeInstruction = `
        CRITICAL: The user strictly prefers these shows: ${preferredShows.join(", ")}.
        1. FIRST, check if the word "${word}" fits the "vibe" of any show in this list. 
        2. IF YES, you MUST use that show.
        3. ONLY if the word makes absolutely no sense in those universes (e.g., a wizard spell in 'Suits'),choose a sitcom where the word suits.
        `;
    } else {
        universeInstruction = `
        Choose a universe based on the word's vibe:
        - Science/Complex -> "The Big Bang Theory"
        - Medical -> "House M.D."
        - Legal -> "Suits"
        - Corporate -> "The Office"
        - Detective -> "Sherlock"
        - Politics -> "Game of Thrones"
        - Tech -> "Mr. Robot"
        - Casual/Dating -> "Friends" or "HIMYM"
        - Rich/Drama -> "Succession"
        `;
    }

    const systemPrompt = `
    You are an expert Hollywood scriptwriter and linguist.
    
    YOUR GOAL:
    1. Define the user's word accurately. If misspelled, return { "meaning": "Spelling error" }.
    2. ${universeInstruction}
    3. Generate a SHORT, FUNNY dialogue using the WORD. The usage of the word should match the context and its usage should make sense.
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
    OUTPUT RULES:
    - Return ONLY valid JSON.
    - Synonyms must be separate strings.
    - Do NOT use "Character A". Use Real Names (e.g., Sheldon).
    `;

    try {
        console.log("Attempting Primary API: OpenRouter...");

        // Ensure API Key exists before calling
        if (!process.env.OPEN_ROUTER_TOKEN) {
            throw new Error("OpenRouter API Key is missing. Skipping to fallback.");
        }
        // openRouter("arcee-ai/trinity-large-preview:free")
        const { text } = await generateText({
            // SUGGESTION: This model is often available for free and is very smart (Flash 2.0)
            // You can revert to "arcee-ai/trinity-large-preview:free" if you prefer.
            model: openRouter("stepfun/step-3.5-flash:free"),
            system: systemPrompt,
            prompt: `Teach me the word: "${word}"`,
            temperature: 0.7,
        });

        return processResponse(text, "OpenRouter");

    } catch (primaryError: any) {
        console.warn("⚠️ OpenRouter Failed. Switching to Gemini Fallback.", primaryError.message);

        try {
            // Ensure Fallback Key exists
            if (!process.env.GEMINI_API_KEY) {
                throw new Error("Gemini API Key is missing. Cannot use fallback.");
            }

            // ATTEMPT 2: Gemini (Fallback)
            const model = genAI.getGenerativeModel({
                model: "gemini-flash-latest",
                generationConfig: { responseMimeType: "application/json" }
            });

            const result = await model.generateContent(
                systemPrompt + `\n\nUSER REQUEST: Generate JSON for word: "${word}"`
            );
            const text = result.response.text();

            return processResponse(text, "Gemini Fallback");

        } catch (secondaryError: any) {
            console.error("❌ CRITICAL: Both models failed.", secondaryError);
            return Response.json(
                {
                    error: "System overloaded. Please try again later.",
                    details: secondaryError.message
                },
                { status: 500 }
            );
        }
    }
}