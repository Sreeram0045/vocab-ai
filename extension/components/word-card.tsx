import { Check, X, Tv, Sparkles, Volume2 } from "lucide-react";
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
}

interface WordCardProps {
  data: VocabData;
  loadingImage?: boolean;
}

export default function WordCard({ data, loadingImage = false }: WordCardProps) {
  console.log("WordCard Rendered with:", data);
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    if (!("speechSynthesis" in window)) return;

    const synth = window.speechSynthesis;

    const detect = () => {
      const voices = synth.getVoices();
      const googleVoice =
        voices.find(
          v => v.name.includes("Google") && v.lang.startsWith("en")
        ) ?? null;

      setVoice(googleVoice);
    };

    synth.getVoices().length ? detect() : (synth.onvoiceschanged = detect);
  }, []);

  const safeWord = (data && typeof data.word === 'string' && data.word.length > 0) ? data.word : "Unknown";

  function speakWord() {
    if (!voice) return;

    const utterance = new SpeechSynthesisUtterance(safeWord);
    utterance.rate = 0.8;
    utterance.voice = voice;
    window.speechSynthesis.speak(utterance);
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans text-left">

      {/* 1. THE "DATA HUD" DEFINITION CARD */}
      <div className="relative overflow-hidden rounded-xl bg-black/80 border border-white/20 backdrop-blur-2xl p-6 shadow-2xl">
        {/* Background Glow */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between gap-4">
                 <h2 className="text-4xl font-black text-white mb-2">
                  {safeWord.charAt(0).toUpperCase() + safeWord.slice(1)}
                </h2>
                {voice && (
                  <button
                    onClick={speakWord}
                    className="text-white/60 hover:text-white hover:bg-white/10 p-2 rounded-lg transition"
                  >
                    <Volume2 className="w-6 h-6" />
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-white/10 text-white border-white/20 px-2 py-0.5 text-xs">
                  {data.context}
                </Badge>
                <span className="text-white/40 text-xs flex items-center font-mono tracking-widest uppercase">
                  {"//"} {data.universe}
                </span>
              </div>
            </div>

            <p className="text-lg font-light text-white/90 leading-relaxed">
              {data.meaning}
            </p>

            {/* Meta Data Grid */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10 mt-4">
              <div>
                <h4 className="text-emerald-400/60 text-[10px] font-bold uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                  <Check size={12} /> Synonyms
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {data.synonyms?.slice(0, 3).map(syn => (
                    <span key={syn} className="flex items-center px-1.5 py-0.5 rounded bg-emerald-500/5 border border-emerald-500/10 text-emerald-400/80 text-xs">
                       {syn}
                    </span>
                  )) || <span className="text-white/20 text-[10px]">None</span>}
                </div>
              </div>
              <div>
                <h4 className="text-rose-400/60 text-[10px] font-bold uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                  <X size={12} /> Antonyms
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {data.antonyms?.slice(0, 3).map(ant => (
                    <span key={ant} className="flex items-center px-1.5 py-0.5 rounded bg-rose-500/5 border border-rose-500/10 text-rose-400/80 text-xs">
                      {ant}
                    </span>
                  )) || <span className="text-white/20 text-[10px]">None</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. VISUALIZATION GRID (Compact for Overlay) */}
      <div className="grid grid-cols-1 gap-4">

        {/* IMAGE */}
        <div className="group relative rounded-xl overflow-hidden border border-white/20 bg-black/50 aspect-video shadow-2xl">
          {loadingImage ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2">
              <Sparkles className="w-6 h-6 text-emerald-500 animate-pulse" />
              <p className="text-[10px] text-white/40 font-mono tracking-widest uppercase">Rendering...</p>
            </div>
          ) : data.imageUrl ? (
            <img
              src={data.imageUrl}
              alt={data.visual_prompt || data.word}
              className="w-full h-full object-cover animate-in fade-in duration-700"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-white/20 text-xs">No Visual Data</div>
          )}
        </div>

        {/* SCRIPT */}
        <div className="rounded-xl border border-white/20 bg-zinc-900/90 p-4 space-y-3 shadow-lg">
          <div className="flex items-center gap-2 text-white/90 border-b border-white/10 pb-2">
            <Tv size={14} className="text-white/60" />
            <h3 className="text-xs font-bold tracking-wide uppercase">Scene</h3>
          </div>

          <div className="space-y-3">
            {data.conversation?.map((line, i) => {
              const [speaker, ...rest] = line.split(":");
              const dialogue = rest.join(":").trim();

              return (
                <div key={i} className="pl-3 border-l-2 border-emerald-500/30">
                  <span className="block text-[10px] font-bold tracking-widest uppercase text-white/40 mb-0.5">
                    {speaker}
                  </span>
                  <p className="text-sm text-white/90 font-serif italic">
                    &quot;{dialogue}&quot;
                  </p>
                </div>
              );
            }) || <div className="text-white/20 text-xs italic">No script generated.</div>}
          </div>
        </div>

      </div>
    </div>
  );
}
