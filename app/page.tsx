"use client";

import { useState } from "react";
import { Search, Sparkles, BookOpen, AlertCircle, Tv, ArrowRight, Check, X } from "lucide-react";

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
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col items-center overflow-x-hidden">

      {/* STICKY HEADER - Minimal & Clean */}
      <div className="sticky top-0 z-50 w-full backdrop-blur-md bg-background/50 border-b border-white/20 py-6 flex justify-center transition-all duration-500">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2 select-none text-white/90">
          VocabAI <span className="text-white/40 font-light">2.0</span>
        </h1>
      </div>

      <div className="max-w-5xl w-full p-6 md:p-12 space-y-16">

        <div className="text-center space-y-4 animate-in fade-in slide-in-from-top-4 duration-1000">
           <p className="text-white/50 text-lg max-w-xl mx-auto font-light tracking-wide">
            Master vocabulary through the lens of cinema.
          </p>
        </div>

        {/* --- REDESIGNED SEARCH BAR: The "Platinum Capsule" --- */}
        <div className="relative max-w-2xl mx-auto w-full group">
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-white/10 to-white/5 opacity-20 blur-xl group-hover:opacity-40 transition duration-500"></div>
          <div className="relative flex items-center bg-black/40 backdrop-blur-xl border border-white/30 rounded-full p-2 pr-2 shadow-2xl transition-all duration-300 hover:border-white/50">
            <Search className="ml-4 text-white/30" size={20} />
            <Input
              placeholder="Enter a word to explore..."
              className="h-12 border-none bg-transparent focus-visible:ring-0 text-white text-lg placeholder:text-white/30 px-4"
              value={inputWord}
              onChange={(e) => setInputWord(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button
              onClick={handleSearch}
              disabled={loadingText}
              size="icon"
              className="h-10 w-10 rounded-full bg-white/10 text-white hover:bg-white hover:text-black transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
            >
              {loadingText ? <Sparkles className="animate-spin" size={18} /> : <ArrowRight size={20} />}
            </Button>
          </div>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <Alert variant="destructive" className="bg-red-950/30 border-red-900/50 text-red-200">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* LOADING SKELETON */}
        {loadingText && (
          <div className="space-y-8 animate-pulse">
            <div className="h-40 w-full rounded-3xl bg-white/5 border border-white/20" />
            <div className="grid md:grid-cols-2 gap-8">
              <div className="h-80 w-full rounded-3xl bg-white/5 border border-white/20" />
              <div className="h-80 w-full rounded-3xl bg-white/5 border border-white/20" />
            </div>
          </div>
        )}

        {/* --- RESULTS AREA --- */}
        {result && !loadingText && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-1000">

            {/* 1. THE "DATA HUD" DEFINITION CARD */}
            <div className="relative overflow-hidden rounded-3xl bg-black/40 border border-white/30 backdrop-blur-2xl p-8 md:p-12 shadow-2xl group hover:border-white/50 transition-all duration-500">
               {/* Background Glow */}
               <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

               <div className="relative z-10 grid md:grid-cols-[1fr_auto] gap-8 items-start">
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-7xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/40 mb-4 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                        {inputWord}
                      </h2>
                      <div className="flex flex-wrap gap-3">
                         <Badge className="bg-white/10 hover:bg-white/20 text-white border-white/20 px-3 py-1 text-sm backdrop-blur-md transition-colors">
                           {result.context}
                         </Badge>
                         <span className="text-white/40 text-sm flex items-center font-mono tracking-widest uppercase">
                            // {result.universe} Universe
                         </span>
                      </div>
                    </div>
                    
                    <p className="text-2xl md:text-3xl font-light text-white/80 leading-relaxed max-w-3xl">
                      {result.meaning}
                    </p>

                    {/* Meta Data Grid */}
                    <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/30 mt-8">
                       <div>
                          <h4 className="text-emerald-400/60 text-xs font-bold uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                             <Check size={14} /> Synonyms
                          </h4>
                          <div className="flex flex-wrap gap-2">
                             {result.synonyms.map(syn => (
                               <span key={syn} className="flex items-center px-2 py-1 rounded-md bg-emerald-500/5 border border-emerald-500/10 text-emerald-400/80 text-sm hover:text-emerald-300 hover:border-emerald-500/30 transition-all cursor-default">
                                 <Check className="w-3 h-3 mr-1.5 opacity-50" /> {syn}
                               </span>
                             ))}
                          </div>
                       </div>
                       <div>
                          <h4 className="text-rose-400/60 text-xs font-bold uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                             <X size={14} /> Antonyms
                          </h4>
                          <div className="flex flex-wrap gap-2">
                             {result.antonyms.map(ant => (
                               <span key={ant} className="flex items-center px-2 py-1 rounded-md bg-rose-500/5 border border-rose-500/10 text-rose-400/80 text-sm hover:text-rose-300 hover:border-rose-500/30 transition-all cursor-default">
                                 <X className="w-3 h-3 mr-1.5 opacity-50" /> {ant}
                               </span>
                             ))}
                          </div>
                       </div>
                    </div>
                  </div>
               </div>
            </div>

            {/* 2. VISUALIZATION GRID */}
            <div className="grid md:grid-cols-2 gap-8">

              {/* IMAGE COLUMN */}
              <div className="group relative rounded-3xl overflow-hidden border border-white/30 bg-black/50 aspect-square shadow-2xl hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.1)] transition-all duration-500">
                 {/* Cinema Screen Effect - Top/Bottom bars removed, just pure content with border */}
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10 opacity-60 group-hover:opacity-20 transition-opacity duration-500"/>
                 
                 {loadingImage ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
                      <Sparkles className="w-10 h-10 text-white animate-pulse" />
                      <p className="text-sm text-white/40 font-mono tracking-widest uppercase">Rendering Scene...</p>
                    </div>
                  ) : result.imageUrl ? (
                    <img
                      src={result.imageUrl}
                      alt="Generated Scene"
                      className="w-full h-full object-cover animate-in fade-in duration-1000 group-hover:scale-105 transition-transform duration-1000 ease-out"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-white/20">No Visual Data</div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-6 z-20 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-xs text-white/60 font-mono border-l-2 border-white pl-3 line-clamp-2">
                       &quot;{result.visual_prompt}&quot;
                    </p>
                  </div>
              </div>

              {/* CONVERSATION COLUMN */}
              <div className="rounded-3xl border border-white/30 bg-white/5 backdrop-blur-xl p-8 flex flex-col justify-center space-y-6 shadow-2xl relative overflow-hidden group hover:border-white/50 transition-all duration-500">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                <div className="flex items-center gap-3 text-white/90 border-b border-white/20 pb-4">
                  <Tv size={20} className="text-white/60" />
                  <h3 className="text-lg font-bold tracking-wide">Script Fragment</h3>
                </div>

                <div className="space-y-6">
                  {result.conversation.map((line, i) => {
                    const [speaker, ...rest] = line.split(":");
                    const dialogue = rest.join(":").trim();
                    
                    return (
                      <div key={i} className="relative pl-6 border-l-2 border-white/20 hover:border-white/50 transition-all duration-300">
                        <span className="block text-xs font-bold tracking-widest uppercase text-white/40 mb-1">
                          {speaker}
                        </span>
                        <p className="text-xl text-white/90 font-serif leading-relaxed italic">
                          &quot;{dialogue}&quot;
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}