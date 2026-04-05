"use client";

import { Plus, Minus, Tv, Sparkles, Volume2, Brain, BrainCircuit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface VocabData {
  _id?: string;
  word: string;
  meaning: string;
  universe: string;
  visual_prompt: string;
  synonyms: string[];
  antonyms: string[];
  conversation: string[];
  context?: string;
  imageUrl?: string;
  phonetics?: string;
  isLearning?: boolean;
}

interface WordCardProps {
  data: VocabData;
  loadingImage?: boolean;
  ImageComponent?: any;
  compact?: boolean;
}

export default function WordCard({ data, loadingImage = false, ImageComponent, compact = false }: WordCardProps) {
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);

  // --- MEMORIZE TOGGLE STATE ---
  const [isLearning, setIsLearning] = useState(data.isLearning || false);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const synth = window.speechSynthesis;
    const detect = () => {
      const voices = synth.getVoices();
      const googleVoice = voices.find(v => v.name.includes("Google") && v.lang.startsWith("en")) ?? null;
      setVoice(googleVoice);
    };
    synth.getVoices().length ? detect() : (synth.onvoiceschanged = detect);
  }, []);

  // --- MEMORIZE HANDLER ---
  const handleToggleLearning = async () => {
    if (!data._id) return;

    setIsToggling(true);
    const newState = !isLearning;
    setIsLearning(newState); // Optimistic update

    try {
      await fetch("/api/review/toggle", {
        method: "POST",
        body: JSON.stringify({ wordId: data._id })
      });
    } catch (err) {
      setIsLearning(!newState); // Revert on error
    } finally {
      setIsToggling(false);
    }
  };

  const displayWord = data.word || "Unknown";

  function speakWord() {
    if (!voice) return;
    const utterance = new SpeechSynthesisUtterance(displayWord);
    utterance.rate = 0.8;
    utterance.voice = voice;
    window.speechSynthesis.speak(utterance);
  }

  const Img = ImageComponent || "img";

  return (
    <div className={`animate-in fade-in slide-in-from-bottom-12 duration-1000 ${compact ? 'space-y-6' : 'space-y-12'} relative`}>

      {/* --- MEMORIZE BUTTON (Top Right) --- */}
      {data._id && (
        <div className="absolute top-4 right-4 z-50">
          <Button
            size="icon"
            onClick={handleToggleLearning}
            disabled={isToggling}
            className={`rounded-full transition-all duration-500 border backdrop-blur-md group cursor-pointer h-10 md:h-9 ${
              compact 
                ? 'w-10 hover:w-32 px-0 hover:px-4 gap-0 hover:gap-2' 
                : 'w-10 md:w-auto hover:w-32 md:hover:w-auto px-0 md:px-4 hover:px-4 md:hover:px-4 gap-0 md:gap-2 hover:gap-2 md:hover:gap-2'
            } ${isLearning
              ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/20 shadow-[0_0_20px_-5px_rgba(34,211,238,0.4)]"
              : "bg-background/40 text-muted-foreground border-border hover:text-foreground hover:bg-accent/60 hover:border-border/80"
              }`}
          >
            {isLearning ? (
              <>
                <BrainCircuit className={`w-4 h-4 shrink-0 ${!compact ? 'md:mr-1.5' : ''} animate-pulse`} />
                <span className={`overflow-hidden transition-all duration-300 ${compact ? 'max-w-0 group-hover:max-w-24' : 'max-w-0 md:max-w-none group-hover:max-w-24'}`}>
                  Learning
                </span>
              </>
            ) : (
              <>
                <Brain className={`w-4 h-4 shrink-0 ${!compact ? 'md:mr-1.5' : ''}`} />
                <span className={`overflow-hidden transition-all duration-300 ${compact ? 'max-w-0 group-hover:max-w-24' : 'max-w-0 md:max-w-none group-hover:max-w-24'}`}>
                  Memorize
                </span>
              </>
            )}
          </Button>
        </div>
      )}

      {/* 1. THE "DATA HUD" DEFINITION CARD */}
      <div className={`relative overflow-hidden rounded-3xl bg-card/40 border border-border backdrop-blur-2xl shadow-xl dark:shadow-[0_0_30px_rgba(255,255,255,0.02)] group hover:border-border/80 transition-all duration-500 ${compact ? 'p-6' : 'p-5 md:p-12'}`}>
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-foreground/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className={`relative z-10 grid gap-8 items-start max-w-full ${compact ? 'grid-cols-1' : 'md:grid-cols-[1fr_auto]'}`}>
          <div className={`min-w-0 ${compact ? 'space-y-4' : 'space-y-6'}`}>
            <div>
              <div className="flex items-center gap-3 mb-2 w-full min-w-0">
                {voice && (
                  <button onClick={speakWord} className="shrink-0 text-foreground/60 hover:text-foreground hover:bg-foreground/10 p-1.5 rounded-lg transition">
                    <Volume2 className={compact ? "w-6 h-6" : "w-10 h-10 md:w-16 md:h-16"} />
                  </button>
                )}

                <div className="overflow-x-auto pb-2 w-full">
                  <h2 className={`font-black text-transparent bg-clip-text bg-gradient-to-br from-foreground via-foreground to-foreground/40 drop-shadow-[0_0_20px_rgba(255,255,255,0.1)] whitespace-nowrap ${compact ? 'text-3xl leading-tight' : 'text-4xl sm:text-5xl md:text-8xl mb-4'} pr-4 w-fit`}>
                    {displayWord.charAt(0).toUpperCase() + displayWord.slice(1)}
                  </h2>
                </div>
              </div>

              {data.phonetics && data.phonetics.trim().length > 0 && (
                <span className="text-muted-foreground font-mono text-lg mb-4 block tracking-wide">
                  {data.phonetics}
                </span>
              )}

              <div className={`flex gap-2 ${compact ? 'flex-col items-start' : 'flex-wrap items-center'}`}>
                <Badge className="bg-foreground/10 hover:bg-foreground/20 text-foreground border-border px-2.5 py-0.5 text-xs backdrop-blur-md transition-colors">
                  {data.context}
                </Badge>
                <span className="text-foreground/40 text-xs flex items-center font-mono tracking-widest uppercase">
                  {"//"} {data.universe}
                </span>
              </div>
            </div>

            <p className={`font-light text-foreground/80 leading-relaxed ${compact ? 'text-base' : 'text-xl md:text-3xl max-w-3xl'}`}>
              {data.meaning}
            </p>

            <div className={`grid gap-8 pt-8 border-t border-border mt-8 ${compact ? 'grid-cols-2 gap-4 pt-4 mt-4' : 'grid-cols-2'}`}>
              <div>
                <h4 className={`${compact ? 'text-[10px]' : 'text-xs'} text-cyan-600 dark:text-cyan-400 font-bold uppercase tracking-[0.2em] mb-4 flex items-center gap-2 drop-shadow-[0_0_8px_rgba(34,211,238,0.3)]`}>
                  <Plus size={compact ? 12 : 14} /> Synonyms
                </h4>
                <div className="flex flex-wrap gap-2">
                  {data.synonyms?.map(syn => (
                    <span key={syn} className={`flex items-center px-3 py-1 rounded-full bg-cyan-500/5 border border-cyan-500/20 text-cyan-700 dark:text-cyan-200 shadow-[0_0_15px_-3px_rgba(34,211,238,0.1)] hover:bg-cyan-500/10 hover:border-cyan-500/30 transition-all duration-300 cursor-default ${compact ? 'text-xs' : 'text-sm'}`}>
                      {syn}
                    </span>
                  )) || <span className="text-foreground/20">None</span>}
                </div>
              </div>
              <div>
                <h4 className={`${compact ? 'text-[10px]' : 'text-xs'} text-amber-600 dark:text-amber-400 font-bold uppercase tracking-[0.2em] mb-4 flex items-center gap-2 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]`}>
                  <Minus size={compact ? 12 : 14} /> Antonyms
                </h4>
                <div className="flex flex-wrap gap-2">
                  {data.antonyms?.map(ant => (
                    <span key={ant} className={`flex items-center px-3 py-1 rounded-full bg-amber-500/5 border border-amber-500/20 text-amber-700 dark:text-amber-200 shadow-[0_0_15px_-3px_rgba(245,158,11,0.1)] hover:bg-amber-500/10 hover:border-amber-500/30 transition-all duration-300 cursor-default ${compact ? 'text-xs' : 'text-sm'}`}>
                      {ant}
                    </span>
                  )) || <span className="text-foreground/20">None</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. VISUALIZATION GRID */}
      <div className={`grid gap-8 ${compact ? 'grid-cols-1' : 'md:grid-cols-2'}`}>
        <div className={`group relative rounded-3xl overflow-hidden border border-border bg-black shadow-2xl dark:shadow-[0_0_40px_rgba(255,255,255,0.03)] hover:shadow-[0_0_40px_-10px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_0_50px_-10px_rgba(255,255,255,0.05)] transition-all duration-500 ${compact ? 'aspect-video' : 'aspect-video md:aspect-square'}`}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
          {loadingImage ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
              <Sparkles className="w-10 h-10 text-white animate-pulse" />
              <p className="text-sm text-white/40 font-mono tracking-widest uppercase">Rendering Scene...</p>
            </div>
          ) : data.imageUrl ? (
            <Img
              src={data.imageUrl}
              alt={data.visual_prompt || data.word}
              fill={ImageComponent ? true : undefined}
              sizes={ImageComponent ? "(max-width: 768px) 100vw, 50vw" : undefined}
              className={`object-cover animate-in fade-in duration-1000 group-hover:scale-105 transition-transform duration-1000 ease-out ${!ImageComponent ? 'w-full h-full' : ''}`}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-white/20">No Visual Data</div>
          )}
          <div className="absolute bottom-0 left-0 right-0 p-6 z-20 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            <p className="text-xs text-white/80 font-mono border-l-2 border-emerald-500/50 pl-3 line-clamp-2">
              &quot;{data.visual_prompt}&quot;
            </p>
          </div>
        </div>

        <div className={`rounded-3xl border border-border bg-foreground/5 backdrop-blur-xl flex flex-col justify-center shadow-xl dark:shadow-[0_0_30px_rgba(255,255,255,0.02)] relative overflow-hidden group hover:border-border/80 transition-all duration-500 ${compact ? 'p-6 space-y-4' : 'p-5 md:p-8 space-y-6'}`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-foreground/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          <div className={`flex items-center gap-3 text-foreground/90 border-b border-border ${compact ? 'pb-2' : 'pb-4'}`}>
            <Tv size={compact ? 16 : 20} className="text-foreground/60" />
            <h3 className={`font-bold tracking-wide ${compact ? 'text-sm' : 'text-lg'}`}>Script Fragment</h3>
          </div>
          <div className={compact ? 'space-y-4' : 'space-y-6'}>
            {data.conversation?.map((line, i) => {
              const [speaker, ...rest] = line.split(":");
              const dialogue = rest.join(":").trim();
              return (
                <div key={i} className={`relative border-l-2 border-border hover:border-foreground/50 transition-all duration-300 ${compact ? 'pl-4' : 'pl-6'}`}>
                  <span className={`block font-bold tracking-widest uppercase text-foreground/40 mb-1 ${compact ? 'text-[10px]' : 'text-xs'}`}>
                    {speaker}
                  </span>
                  <p className={`text-foreground/90 font-serif leading-relaxed italic ${compact ? 'text-base' : 'text-xl'}`}>
                    &quot;{dialogue}&quot;
                  </p>
                </div>
              );
            }) || <div className="text-foreground/20 italic">No script generated</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
