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

    const trimmedWord = word.trim();
    const wordCount = trimmedWord.split(/\s+/).length;

    if (trimmedWord.length > 50 || wordCount > 4) {
        return Response.json(
            { error: "Input too long. Please enter a word or a short phrase (max 4 words / 50 characters)." },
            { status: 400 }
        );
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
    1. FIRST, check if the input word "${word}" is a valid, recognized English word or a well-known proper noun (like "Targaryen" or "Hogwarts").
    2. IF IT IS GIBBERISH (e.g. "asddsaff"), A TYPO, OR NOT A REAL WORD:
       - You MUST return exactly: { "meaning": "Spelling error", "universe": "Error", "visual_prompt": "Error", "synonyms": [], "antonyms": [], "conversation": [] }
       - Do NOT try to interpret it. Do NOT make up a definition.
    3. IF IT IS A VALID WORD:
       - Define the user's word accurately.
       - ${universeInstruction}
       - Generate a SHORT, FUNNY dialogue using the WORD. The usage of the word should match the context and its usage should make sense.
       - VISUAL PROMPT: Describe a PHYSICAL SCENE for an image generator. 
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
    STRICT OUTPUT RULES:
    - Return ONLY valid JSON.
    - Synonyms must be separate strings.
    - Do NOT use "Character A". Use Real Names (e.g., Sheldon).
    - NO markdown formatting. No \`\`\`json tags.
    - NO introductory text, NO explanatory notes, and NO "Raw Text" labels.
    - Output MUST start with { and end with }.
    - Use double quotes for all keys and string values.
    `;

    try {
        console.log("Attempting Primary API: Gemini...");

        if (!process.env.GEMINI_API_KEY) {
            throw new Error("Gemini API Key is missing. Cannot use fallback.");
        }
        // using gemini 3.1 flash lite preview
        // we could use gemma but it fails in providing json structured output but it has 1.5 request limit while gemini 3.1 flash lite preview has a limit of 500 request per day which is also fine
        // To Do :- Create a curated prompt so that it provides a better output from gemma
        const model = genAI.getGenerativeModel({
            model: "gemini-3.1-flash-lite-preview",
            generationConfig: { responseMimeType: "application/json" }
        });

        const result = await model.generateContent(
            systemPrompt + `\n\nUSER REQUEST: Generate JSON for word: "${word}"`
        );
        const text = result.response.text();

        return processResponse(text, "Gemini Primary");

    } catch (primaryError: any) {
        console.warn("⚠️ Gemini Failed, Switching to OpenRouter fallback", primaryError.message);

        try {
            console.log("Attempting Secondary API: OpenRouter...");
            // Ensure Fallback Key exists
            if (!process.env.OPEN_ROUTER_TOKEN) {
                throw new Error("OpenRouter API Key is missing.");
            }
            // using gpt-oss free for now as it is one of the best models available for free in openrouter
            const { text } = await generateText({
                model: openRouter("openai/gpt-oss-120b:free"),
                system: systemPrompt,
                prompt: `Teach me the word: "${word}"`,
                temperature: 0.7,
            });

            return processResponse(text, "OpenRouter");

            // ATTEMPT 2: Gemini (Fallback)
            // gemini-3.1-flash-lite-preview
            // gemini-2.5-flash-lite

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