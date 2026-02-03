// "use client";

// import { Check, X, Tv, Sparkles, Volume2 } from "lucide-react";
// import { Badge } from "@/components/ui/badge";
// import { useEffect, useState } from "react";


// interface VocabData {
//   _id?: string;
//   word: string;
//   meaning: string;
//   universe: string;
//   visual_prompt: string;
//   synonyms: string[];
//   antonyms: string[];
//   conversation: string[];
//   context?: string;
//   imageUrl?: string;
// }

// interface WordCardProps {
//   data: VocabData;
//   loadingImage?: boolean;
//   ImageComponent?: any; // Flexible component type
//   compact?: boolean; // New prop for extension mode
// }

// export default function WordCard({ data, loadingImage = false, ImageComponent, compact = false }: WordCardProps) {
//   const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);

//   useEffect(() => {
//     if (!("speechSynthesis" in window)) return;

//     const synth = window.speechSynthesis;

//     const detect = () => {
//       const voices = synth.getVoices();
//       const googleVoice =
//         voices.find(
//           v => v.name.includes("Google") && v.lang.startsWith("en")
//         ) ?? null;

//       setVoice(googleVoice);
//     };

//     synth.getVoices().length ? detect() : (synth.onvoiceschanged = detect);
//   }, []);

//   const displayWord = data.word || "Unknown";

//   function speakWord() {
//     if (!voice) return;

//     const utterance = new SpeechSynthesisUtterance(displayWord);
//     utterance.rate = 0.8;
//     utterance.voice = voice;
//     window.speechSynthesis.speak(utterance);
//   }

//   // Determine which image component to use
//   const Img = ImageComponent || "img";

//   return (
//     <div className={`animate-in fade-in slide-in-from-bottom-12 duration-1000 ${compact ? 'space-y-6' : 'space-y-12'}`}>

//       {/* 1. THE "DATA HUD" DEFINITION CARD */}
//       <div className={`relative overflow-hidden rounded-3xl bg-black/40 border border-white/30 backdrop-blur-2xl shadow-2xl group hover:border-white/50 transition-all duration-500 ${compact ? 'p-6' : 'p-8 md:p-12'}`}>
//         {/* Background Glow */}
//         <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

//         <div className={`relative z-10 grid gap-8 items-start ${compact ? 'grid-cols-1' : 'md:grid-cols-[1fr_auto]'}`}>
//           <div className={compact ? 'space-y-4' : 'space-y-6'}>
//             <div>
//               <div className="flex items-center gap-3 mb-2">
//                 {voice && (
//                   <button
//                     onClick={speakWord}
//                     className="text-white/60 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition"
//                   >
//                     <Volume2 className={compact ? "w-6 h-6" : "w-16 h-16 md:w-16 md:h-16"} />
//                   </button>

//                 )}
//                 <h2 className={`font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/40 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)] ${compact ? 'text-3xl leading-tight' : 'text-7xl md:text-8xl mb-4'}`}>
//                   {displayWord.charAt(0).toUpperCase() + displayWord.slice(1)}
//                 </h2>
//               </div>
//               <div className={`flex gap-2 ${compact ? 'flex-col items-start' : 'flex-wrap items-center'}`}>
//                 <Badge className="bg-white/10 hover:bg-white/20 text-white border-white/20 px-2.5 py-0.5 text-xs backdrop-blur-md transition-colors">
//                   {data.context}
//                 </Badge>
//                 <span className="text-white/40 text-xs flex items-center font-mono tracking-widest uppercase">
//                   {"//"} {data.universe}
//                 </span>
//               </div>
//             </div>

//             <p className={`font-light text-white/80 leading-relaxed ${compact ? 'text-base' : 'text-2xl md:text-3xl max-w-3xl'}`}>
//               {data.meaning}
//             </p>

//             {/* Meta Data Grid */}
//             <div className={`grid gap-8 pt-8 border-t border-white/30 mt-8 ${compact ? 'grid-cols-2 gap-4 pt-4 mt-4' : 'grid-cols-2'}`}>
//               <div>
//                 <h4 className={`${compact ? 'text-[10px]' : 'text-xs'} text-emerald-400/60 font-bold uppercase tracking-[0.2em] mb-4 flex items-center gap-2`}>
//                   <Check size={compact ? 12 : 14} /> Synonyms
//                 </h4>
//                 <div className="flex flex-wrap gap-2">
//                   {data.synonyms?.map(syn => (
//                     <span key={syn} className={`flex items-center px-2 py-1 rounded-md bg-emerald-500/5 border border-emerald-500/10 text-emerald-400/80 hover:text-emerald-300 hover:border-emerald-500/30 transition-all cursor-default ${compact ? 'text-xs' : 'text-sm'}`}>
//                       <Check className="w-3 h-3 mr-1.5 opacity-50" /> {syn}
//                     </span>
//                   )) || <span className="text-white/20">None</span>}
//                 </div>
//               </div>
//               <div>
//                 <h4 className={`${compact ? 'text-[10px]' : 'text-xs'} text-rose-400/60 font-bold uppercase tracking-[0.2em] mb-4 flex items-center gap-2`}>
//                   <X size={compact ? 12 : 14} /> Antonyms
//                 </h4>
//                 <div className="flex flex-wrap gap-2">
//                   {data.antonyms?.map(ant => (
//                     <span key={ant} className={`flex items-center px-2 py-1 rounded-md bg-rose-500/5 border border-rose-500/10 text-rose-400/80 hover:text-rose-300 hover:border-rose-500/30 transition-all cursor-default ${compact ? 'text-xs' : 'text-sm'}`}>
//                       <X className="w-3 h-3 mr-1.5 opacity-50" /> {ant}
//                     </span>
//                   )) || <span className="text-white/20">None</span>}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* 2. VISUALIZATION GRID */}
//       <div className={`grid gap-8 ${compact ? 'grid-cols-1' : 'md:grid-cols-2'}`}>

//         {/* IMAGE COLUMN */}
//         <div className={`group relative rounded-3xl overflow-hidden border border-white/30 bg-black/50 shadow-2xl hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.1)] transition-all duration-500 ${compact ? 'aspect-video' : 'aspect-square'}`}>
//           {/* Cinema Screen Effect */}
//           <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10 opacity-60 group-hover:opacity-20 transition-opacity duration-500" />

//           {loadingImage ? (
//             <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
//               <Sparkles className="w-10 h-10 text-white animate-pulse" />
//               <p className="text-sm text-white/40 font-mono tracking-widest uppercase">Rendering Scene...</p>
//             </div>
//           ) : data.imageUrl ? (
//             <Img
//               src={data.imageUrl}
//               alt={data.visual_prompt || data.word}
//               fill={ImageComponent ? true : undefined} // Only use fill for next/image
//               sizes={ImageComponent ? "(max-width: 768px) 100vw, 50vw" : undefined}
//               className={`object-cover animate-in fade-in duration-1000 group-hover:scale-105 transition-transform duration-1000 ease-out ${!ImageComponent ? 'w-full h-full' : ''}`}
//             />
//           ) : (
//             <div className="absolute inset-0 flex items-center justify-center text-white/20">No Visual Data</div>
//           )}

//           <div className="absolute bottom-0 left-0 right-0 p-6 z-20 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
//             <p className="text-xs text-white/60 font-mono border-l-2 border-white pl-3 line-clamp-2">
//               &quot;{data.visual_prompt}&quot;
//             </p>
//           </div>
//         </div>

//         {/* CONVERSATION COLUMN */}
//         <div className={`rounded-3xl border border-white/30 bg-white/5 backdrop-blur-xl flex flex-col justify-center shadow-2xl relative overflow-hidden group hover:border-white/50 transition-all duration-500 ${compact ? 'p-6 space-y-4' : 'p-8 space-y-6'}`}>
//           <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

//           <div className={`flex items-center gap-3 text-white/90 border-b border-white/20 ${compact ? 'pb-2' : 'pb-4'}`}>
//             <Tv size={compact ? 16 : 20} className="text-white/60" />
//             <h3 className={`font-bold tracking-wide ${compact ? 'text-sm' : 'text-lg'}`}>Script Fragment</h3>
//           </div>

//           <div className={compact ? 'space-y-4' : 'space-y-6'}>
//             {data.conversation?.map((line, i) => {
//               const [speaker, ...rest] = line.split(":");
//               const dialogue = rest.join(":").trim();

//               return (
//                 <div key={i} className={`relative border-l-2 border-white/20 hover:border-white/50 transition-all duration-300 ${compact ? 'pl-4' : 'pl-6'}`}>
//                   <span className={`block font-bold tracking-widest uppercase text-white/40 mb-1 ${compact ? 'text-[10px]' : 'text-xs'}`}>
//                     {speaker}
//                   </span>
//                   <p className={`text-white/90 font-serif leading-relaxed italic ${compact ? 'text-base' : 'text-xl'}`}>
//                     &quot;{dialogue}&quot;
//                   </p>
//                 </div>
//               );
//             }) || <div className="text-white/20 italic">No script generated</div>}
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// }

"use client";

import { Check, X, Tv, Sparkles, Volume2, GraduationCap, CheckCircle, Loader2 } from "lucide-react"; // Added Icons
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button"; // Added Button
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
  phonetics?: string; // <--- ADDED
  isLearning?: boolean; // <--- ADDED
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
    // ... (Your existing voice detection code is fine) ...
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
      {/* Only show if we have an ID (saved to DB) */}
      {data._id && (
        <div className="absolute top-4 right-4 z-50">
          <Button
            size="sm"
            onClick={handleToggleLearning}
            disabled={isToggling}
            className={`rounded-full transition-all border shadow-xl backdrop-blur-md ${isLearning
              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50 hover:bg-emerald-500/30"
              : "bg-black/40 text-zinc-400 border-white/10 hover:text-white hover:bg-black/60"
              }`}
          >
            {isLearning ? (
              <>
                <CheckCircle className="w-4 h-4 mr-1.5" /> Learning
              </>
            ) : (
              <>
                <GraduationCap className="w-4 h-4 mr-1.5" /> Memorize
              </>
            )}
          </Button>
        </div>
      )}

      {/* 1. THE "DATA HUD" DEFINITION CARD */}
      <div className={`relative overflow-hidden rounded-3xl bg-black/40 border border-white/30 backdrop-blur-2xl shadow-2xl group hover:border-white/50 transition-all duration-500 ${compact ? 'p-6' : 'p-8 md:p-12'}`}>
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className={`relative z-10 grid gap-8 items-start ${compact ? 'grid-cols-1' : 'md:grid-cols-[1fr_auto]'}`}>
          <div className={compact ? 'space-y-4' : 'space-y-6'}>
            <div>
              <div className="flex items-center gap-3 mb-2">
                {voice && (
                  <button onClick={speakWord} className="text-white/60 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition">
                    <Volume2 className={compact ? "w-6 h-6" : "w-16 h-16 md:w-16 md:h-16"} />
                  </button>
                )}

                {/* WORD TITLE */}
                <h2 className={`font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/40 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)] ${compact ? 'text-3xl leading-tight' : 'text-7xl md:text-8xl mb-4'}`}>
                  {displayWord.charAt(0).toUpperCase() + displayWord.slice(1)}
                </h2>
              </div>

              {/* --- PHONETICS (Conditionally Rendered) --- */}
              {/* Only show if data.phonetics is defined AND not an empty string */}
              {data.phonetics && data.phonetics.trim().length > 0 && (
                <span className="text-zinc-500 font-mono text-lg mb-4 block tracking-wide">
                  {data.phonetics}
                </span>
              )}

              <div className={`flex gap-2 ${compact ? 'flex-col items-start' : 'flex-wrap items-center'}`}>
                <Badge className="bg-white/10 hover:bg-white/20 text-white border-white/20 px-2.5 py-0.5 text-xs backdrop-blur-md transition-colors">
                  {data.context}
                </Badge>
                <span className="text-white/40 text-xs flex items-center font-mono tracking-widest uppercase">
                  {"//"} {data.universe}
                </span>
              </div>
            </div>

            <p className={`font-light text-white/80 leading-relaxed ${compact ? 'text-base' : 'text-2xl md:text-3xl max-w-3xl'}`}>
              {data.meaning}
            </p>

            {/* ... (Meta Grid, Synonyms, Antonyms - Keep Existing Code) ... */}
            <div className={`grid gap-8 pt-8 border-t border-white/30 mt-8 ${compact ? 'grid-cols-2 gap-4 pt-4 mt-4' : 'grid-cols-2'}`}>
              {/* ... Paste your existing synonyms/antonyms code here ... */}
              <div>
                <h4 className={`${compact ? 'text-[10px]' : 'text-xs'} text-emerald-400/60 font-bold uppercase tracking-[0.2em] mb-4 flex items-center gap-2`}>
                  <Check size={compact ? 12 : 14} /> Synonyms
                </h4>
                <div className="flex flex-wrap gap-2">
                  {data.synonyms?.map(syn => (
                    <span key={syn} className={`flex items-center px-2 py-1 rounded-md bg-emerald-500/5 border border-emerald-500/10 text-emerald-400/80 hover:text-emerald-300 hover:border-emerald-500/30 transition-all cursor-default ${compact ? 'text-xs' : 'text-sm'}`}>
                      <Check className="w-3 h-3 mr-1.5 opacity-50" /> {syn}
                    </span>
                  )) || <span className="text-white/20">None</span>}
                </div>
              </div>
              <div>
                <h4 className={`${compact ? 'text-[10px]' : 'text-xs'} text-rose-400/60 font-bold uppercase tracking-[0.2em] mb-4 flex items-center gap-2`}>
                  <X size={compact ? 12 : 14} /> Antonyms
                </h4>
                <div className="flex flex-wrap gap-2">
                  {data.antonyms?.map(ant => (
                    <span key={ant} className={`flex items-center px-2 py-1 rounded-md bg-rose-500/5 border border-rose-500/10 text-rose-400/80 hover:text-rose-300 hover:border-rose-500/30 transition-all cursor-default ${compact ? 'text-xs' : 'text-sm'}`}>
                      <X className="w-3 h-3 mr-1.5 opacity-50" /> {ant}
                    </span>
                  )) || <span className="text-white/20">None</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ... (Keep Visualization Grid Code exactly as is) ... */}
      <div className={`grid gap-8 ${compact ? 'grid-cols-1' : 'md:grid-cols-2'}`}>
        {/* ... Image Column ... */}
        <div className={`group relative rounded-3xl overflow-hidden border border-white/30 bg-black/50 shadow-2xl hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.1)] transition-all duration-500 ${compact ? 'aspect-video' : 'aspect-square'}`}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10 opacity-60 group-hover:opacity-20 transition-opacity duration-500" />
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
            <p className="text-xs text-white/60 font-mono border-l-2 border-white pl-3 line-clamp-2">
              &quot;{data.visual_prompt}&quot;
            </p>
          </div>
        </div>

        {/* ... Conversation Column ... */}
        <div className={`rounded-3xl border border-white/30 bg-white/5 backdrop-blur-xl flex flex-col justify-center shadow-2xl relative overflow-hidden group hover:border-white/50 transition-all duration-500 ${compact ? 'p-6 space-y-4' : 'p-8 space-y-6'}`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          <div className={`flex items-center gap-3 text-white/90 border-b border-white/20 ${compact ? 'pb-2' : 'pb-4'}`}>
            <Tv size={compact ? 16 : 20} className="text-white/60" />
            <h3 className={`font-bold tracking-wide ${compact ? 'text-sm' : 'text-lg'}`}>Script Fragment</h3>
          </div>
          <div className={compact ? 'space-y-4' : 'space-y-6'}>
            {data.conversation?.map((line, i) => {
              const [speaker, ...rest] = line.split(":");
              const dialogue = rest.join(":").trim();
              return (
                <div key={i} className={`relative border-l-2 border-white/20 hover:border-white/50 transition-all duration-300 ${compact ? 'pl-4' : 'pl-6'}`}>
                  <span className={`block font-bold tracking-widest uppercase text-white/40 mb-1 ${compact ? 'text-[10px]' : 'text-xs'}`}>
                    {speaker}
                  </span>
                  <p className={`text-white/90 font-serif leading-relaxed italic ${compact ? 'text-base' : 'text-xl'}`}>
                    &quot;{dialogue}&quot;
                  </p>
                </div>
              );
            }) || <div className="text-white/20 italic">No script generated</div>}
          </div>
        </div>
      </div>
    </div>
  );
}