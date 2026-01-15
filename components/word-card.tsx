"use client";

import { Check, X, Tv, Sparkles } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

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
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-1000">

      {/* 1. THE "DATA HUD" DEFINITION CARD */}
      <div className="relative overflow-hidden rounded-3xl bg-black/40 border border-white/30 backdrop-blur-2xl p-8 md:p-12 shadow-2xl group hover:border-white/50 transition-all duration-500">
         {/* Background Glow */}
         <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

         <div className="relative z-10 grid md:grid-cols-[1fr_auto] gap-8 items-start">
            <div className="space-y-6">
              <div>
                <h2 className="text-7xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/40 mb-4 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                  {data.word}
                </h2>
                <div className="flex flex-wrap gap-3">
                   <Badge className="bg-white/10 hover:bg-white/20 text-white border-white/20 px-3 py-1 text-sm backdrop-blur-md transition-colors">
                     {data.context}
                   </Badge>
                   <span className="text-white/40 text-sm flex items-center font-mono tracking-widest uppercase">
                      {"//"} {data.universe} Universe
                   </span>
                </div>
              </div>
              
              <p className="text-2xl md:text-3xl font-light text-white/80 leading-relaxed max-w-3xl">
                {data.meaning}
              </p>

              {/* Meta Data Grid */}
              <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/30 mt-8">
                 <div>
                    <h4 className="text-emerald-400/60 text-xs font-bold uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                       <Check size={14} /> Synonyms
                    </h4>
                    <div className="flex flex-wrap gap-2">
                       {data.synonyms.map(syn => (
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
                       {data.antonyms.map(ant => (
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
           {/* Cinema Screen Effect */}
           <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10 opacity-60 group-hover:opacity-20 transition-opacity duration-500"/>
           
           {loadingImage ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
                <Sparkles className="w-10 h-10 text-white animate-pulse" />
                <p className="text-sm text-white/40 font-mono tracking-widest uppercase">Rendering Scene...</p>
              </div>
            ) : data.imageUrl ? (
              <Image
                src={data.imageUrl}
                alt={data.visual_prompt || data.word}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover animate-in fade-in duration-1000 group-hover:scale-105 transition-transform duration-1000 ease-out"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-white/20">No Visual Data</div>
            )}

            <div className="absolute bottom-0 left-0 right-0 p-6 z-20 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
              <p className="text-xs text-white/60 font-mono border-l-2 border-white pl-3 line-clamp-2">
                 &quot;{data.visual_prompt}&quot;
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
            {data.conversation.map((line, i) => {
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
  );
}
