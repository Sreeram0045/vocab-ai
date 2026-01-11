"use client";

import { useState } from "react";
import { Search, Sparkles, BookOpen, AlertCircle, Tv } from "lucide-react";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

// --- THE BLUEPRINT (Interface) ---
// This tells TypeScript what our data looks like.
interface VocabData {
  meaning: string;
  universe: string;
  visual_prompt: string;
  synonyms: string[];
  antonyms: string[];
  conversation: string[];
  context?: string;
  imageUrl?: string; // Optional because it loads later
}

export default function Home() {
  // --- STATE: The "Memory" of the Screen ---
  const [inputWord, setInputWord] = useState("");
  const [result, setResult] = useState<VocabData | null>(null);

  // Two loading states: one for text, one for the image
  const [loadingText, setLoadingText] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);

  const [error, setError] = useState("");

  // --- THE BRAIN: Handles the Search Logic ---
  async function handleSearch() {
    if (!inputWord.trim()) return;

    // 1. Reset everything
    setLoadingText(true);
    setLoadingImage(false);
    setError("");
    setResult(null);

    try {
      // 2. Fetch TEXT (The Definition)
      const textRes = await fetch("/api/generate", {
        method: "POST",
        body: JSON.stringify({ word: inputWord }),
      });

      const textData = await textRes.json();

      if (!textRes.ok) throw new Error(textData.error || "Failed to fetch definition");

      // 3. Update the screen with text IMMEDIATELY
      // We don't wait for the image yet.
      setResult(textData);
      setLoadingText(false);

      // 4. Fetch IMAGE (Background Process)
      // We start this now so the user has something to read while the image loads.
      setLoadingImage(true);

      const imgRes = await fetch("/api/image", {
        method: "POST",
        body: JSON.stringify({
          // We pass the SPECIAL prompt Llama created, not just the word
          prompt: textData.visual_prompt,
          universe: textData.universe
        }),
      });

      const imgData = await imgRes.json();

      if (imgData.image) {
        // 5. Update the result AGAIN to add the image
        // We use a callback (prev) to ensure we don't lose the text data
        setResult((prev) => prev ? { ...prev, imageUrl: imgData.image } : null);
      }

    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoadingText(false);
      setLoadingImage(false);
    }
  }

  // --- THE UI: What the user sees ---
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-6 md:p-12 font-sans flex flex-col items-center">

      <div className="max-w-3xl w-full space-y-8">

        {/* HEADER */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-extrabold tracking-tight text-blue-500 flex justify-center items-center gap-3">
            VocabAI <span className="text-slate-100">2.0</span>
          </h1>
          <p className="text-slate-400 text-lg">
            Learn words through the lens of your favorite TV shows.
          </p>
        </div>

        {/* SEARCH BAR */}
        <div className="flex gap-3 shadow-lg">
          <Input
            placeholder="Enter a complex word (e.g. Serendipity)..."
            className="h-14 text-lg bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-blue-500"
            value={inputWord}
            onChange={(e) => setInputWord(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button
            onClick={handleSearch}
            disabled={loadingText}
            className="h-14 px-8 bg-blue-600 hover:bg-blue-700 text-lg font-semibold"
          >
            {loadingText ? <Sparkles className="animate-spin" /> : <Search />}
          </Button>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <Alert variant="destructive" className="bg-red-900/20 border-red-900">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* LOADING SKELETON (Shows while waiting for text) */}
        {loadingText && (
          <div className="space-y-4">
            <Skeleton className="h-40 w-full bg-slate-800 rounded-xl" />
            <Skeleton className="h-64 w-full bg-slate-800 rounded-xl" />
          </div>
        )}

        {/* RESULTS AREA */}
        {result && !loadingText && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* 1. DEFINITION CARD */}
            <Card className="bg-slate-900 border-slate-800 shadow-2xl overflow-hidden">
              <CardHeader className="border-b border-slate-800 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-4xl capitalize font-bold text-white mb-2">
                      {inputWord}
                    </CardTitle>
                    <CardDescription className="text-slate-400 text-lg">
                      {result.meaning}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-blue-900/50 text-blue-200 hover:bg-blue-900 px-3 py-1 text-sm">
                    {result.context}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-6 grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-green-400 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                    <BookOpen size={14} /> Synonyms
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.synonyms.map(syn => (
                      <Badge key={syn} variant="outline" className="border-green-900 text-green-300 bg-green-950/30">
                        {syn}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-red-400 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                    Antonyms
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.antonyms.map(ant => (
                      <Badge key={ant} variant="outline" className="border-red-900 text-red-300 bg-red-950/30">
                        {ant}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 2. IMAGE & CONVERSATION GRID */}
            <div className="grid md:grid-cols-5 gap-6">

              {/* IMAGE COLUMN (2/5 width) */}
              <div className="md:col-span-2 space-y-4">
                <div className="rounded-xl overflow-hidden border border-slate-700 shadow-lg bg-black aspect-square relative flex items-center justify-center">
                  {loadingImage ? (
                    <div className="text-center space-y-2">
                      <Sparkles className="w-8 h-8 text-purple-500 animate-bounce mx-auto" />
                      <p className="text-xs text-purple-400">Generating Scene...</p>
                    </div>
                  ) : result.imageUrl ? (
                    <img
                      src={result.imageUrl}
                      alt="Generated Scene"
                      className="w-full h-full object-cover animate-in fade-in duration-1000"
                    />
                  ) : (
                    <div className="text-slate-600 text-sm">No Image Available</div>
                  )}
                </div>
                <p className="text-xs text-slate-500 text-center italic px-4">
                  "{result.visual_prompt}"
                </p>
              </div>

              {/* CONVERSATION COLUMN (3/5 width) */}
              <Card className="md:col-span-3 bg-purple-950/10 border-purple-900/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-300 text-lg">
                    <Tv size={20} /> An Imaginative Scene from {result.universe}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {result.conversation.map((line, i) => (
                    <div key={i} className="p-4 bg-slate-950/80 rounded-lg border-l-4 border-purple-500 shadow-sm">
                      <p className="text-slate-200 leading-relaxed">{line}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}