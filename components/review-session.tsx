"use client";

import { useState, useEffect } from "react";
import { BrainCircuit, Check, X, Eye, Trophy, ChevronDown, Play, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AnimatePresence, motion } from "framer-motion";

interface ReviewItem {
    _id: string;
    word: string;
    meaning: string;
    universe?: string;
}

export default function ReviewSession() {
    const [dueWords, setDueWords] = useState<ReviewItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRevealed, setIsRevealed] = useState(false);

    // --- NEW STATE: EXPANSION ---
    const [isExpanded, setIsExpanded] = useState(false);

    // Track total for the progress bar
    const [totalSessionCount, setTotalSessionCount] = useState(0);
    const [isSessionComplete, setIsSessionComplete] = useState(false);

    const currentWord = dueWords[0];
    const progress = totalSessionCount > 0
        ? ((totalSessionCount - dueWords.length) / totalSessionCount) * 100
        : 0;

    useEffect(() => {
        async function fetchReviews() {
            try {
                const res = await fetch("/api/review/due");
                if (res.ok) {
                    const data = await res.json();
                    setDueWords(data);
                    setTotalSessionCount(data.length);
                }
            } catch (error) {
                console.error("Failed to fetch reviews", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchReviews();
    }, []);

    // Sound effect
    // useEffect(() => {
    //     if (isSessionComplete) {
    //         const audio = new Audio("/success.mp3");
    //         audio.volume = 0.5;
    //         audio.play().catch((e) => console.log("Audio play blocked", e));
    //     }
    // }, [isSessionComplete]);

    const handleVote = async (result: 'remembered' | 'forgot') => {
        if (!currentWord) return;

        const wordId = currentWord._id;

        try {
            fetch("/api/review/update", {
                method: "POST",
                body: JSON.stringify({ wordId, result })
            });
        } catch (err) {
            console.error("Failed to update review", err);
        }

        if (dueWords.length === 1) {
            setIsSessionComplete(true);
            setTimeout(() => {
                setDueWords([]);
                setIsSessionComplete(false);
                setIsExpanded(false); // Reset expansion state
            }, 3000);
        } else {
            setDueWords((prev) => prev.slice(1));
            setIsRevealed(false);
        }
    };

    if (isLoading) return null;
    if (dueWords.length === 0 && !isSessionComplete) return null;

    return (
        <div className="w-full max-w-2xl mx-auto my-8 relative z-40">
            <AnimatePresence mode="wait">

                {/* 1. TROPHY VIEW (Celebration) */}
                {isSessionComplete ? (
                    <motion.div
                        key="trophy"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="animate-in zoom-in-95 duration-500"
                    >
                        <Card className="bg-gradient-to-br from-emerald-900/20 to-black border border-emerald-500/30 p-8 text-center backdrop-blur-xl">
                            <div className="flex flex-col items-center gap-4">
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", bounce: 0.5 }}
                                    className="p-4 rounded-full bg-emerald-500/10 text-emerald-400 mb-2"
                                >
                                    <Trophy size={48} />
                                </motion.div>
                                <h3 className="text-2xl font-black text-white">Session Complete!</h3>
                                <div className="w-full h-1 bg-emerald-900/30 rounded-full mt-2 overflow-hidden max-w-xs mx-auto">
                                    <div className="h-full bg-emerald-500 w-full animate-[shimmer_2s_infinite]" />
                                </div>
                            </div>
                        </Card>
                    </motion.div>

                ) : !isExpanded ? (

                    /* 2. MINIMIZED PILL VIEW (The "Notification") */
                    <motion.div
                        key="minimized"
                        layoutId="review-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsExpanded(true)}
                        className="cursor-pointer group"
                    >
                        <div className="bg-zinc-900/80 border border-emerald-500/30 hover:border-emerald-500/60 backdrop-blur-md p-4 rounded-2xl flex items-center justify-between shadow-lg hover:shadow-emerald-500/10 transition-all duration-300">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-emerald-500 blur-md opacity-20 animate-pulse" />
                                    <div className="bg-emerald-500/10 p-2.5 rounded-xl text-emerald-400 relative border border-emerald-500/20">
                                        <BrainCircuit size={20} />
                                    </div>
                                    {/* Notification Badge */}
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-black" />
                                </div>
                                <div className="text-left">
                                    <h4 className="text-white font-bold text-sm tracking-wide">Daily Review Ready</h4>
                                    <p className="text-zinc-400 text-xs mt-0.5">
                                        <span className="text-emerald-400 font-mono font-medium">{dueWords.length}</span> words pending from your history
                                    </p>
                                </div>
                            </div>

                            <Button size="sm" className="bg-white/5 hover:bg-white/10 text-white rounded-full px-4 border border-white/5 group-hover:border-emerald-500/30 transition-all">
                                <Play size={14} className="mr-2 fill-current" /> Start
                            </Button>
                        </div>
                    </motion.div>

                ) : (

                    /* 3. EXPANDED FLASHCARD VIEW */
                    <motion.div
                        key="expanded"
                        layoutId="review-card"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3, type: "spring", bounce: 0.2 }}
                    >
                        <div className="relative group">
                            {/* Meta Header */}
                            <div className="flex items-center justify-between mb-4 px-2">
                                <div className="flex items-center gap-2 text-emerald-400">
                                    <BrainCircuit size={18} />
                                    <span className="font-mono text-xs uppercase tracking-widest font-bold">Neural Recall</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-xs font-mono text-zinc-500">
                                        {totalSessionCount - dueWords.length + 1} / {totalSessionCount}
                                    </span>
                                    {/* Minimize Button */}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }}
                                        className="text-zinc-500 hover:text-white transition-colors"
                                    >
                                        <ChevronDown size={18} />
                                    </button>
                                </div>
                            </div>

                            <Card className="bg-black/80 border border-emerald-500/20 overflow-hidden relative backdrop-blur-xl shadow-2xl min-h-[400px] flex flex-col justify-between">

                                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                                <div className="p-8 md:p-10 text-center space-y-8 relative z-10 flex-1 flex flex-col justify-center">

                                    {/* THE WORD */}
                                    <div className="space-y-3">
                                        {currentWord.universe && (
                                            <span className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-zinc-400 uppercase tracking-widest mb-2">
                                                From: {currentWord.universe}
                                            </span>
                                        )}
                                        <h3 className="text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-lg">
                                            {currentWord.word}
                                        </h3>
                                    </div>

                                    {/* REVEAL AREA */}
                                    <div className="min-h-[120px] flex items-center justify-center">
                                        {isRevealed ? (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, filter: "blur(10px)" }}
                                                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                                className="space-y-6 w-full"
                                            >
                                                <div className="bg-white/5 rounded-2xl p-6 border border-white/10 shadow-inner">
                                                    <p className="text-zinc-200 text-lg font-light leading-relaxed">
                                                        "{currentWord.meaning}"
                                                    </p>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <Button
                                                        onClick={() => handleVote('forgot')}
                                                        variant="ghost"
                                                        className="h-14 border border-rose-500/20 text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 hover:border-rose-500/50 transition-all rounded-xl"
                                                    >
                                                        <X className="mr-2 h-5 w-5" /> Forgot
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleVote('remembered')}
                                                        className="h-14 bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all rounded-xl border-none"
                                                    >
                                                        <Check className="mr-2 h-5 w-5" /> I Remembered
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                onClick={() => setIsRevealed(true)}
                                                className="h-14 px-10 border-white/10 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all rounded-full group text-base"
                                            >
                                                <Eye size={20} className="mr-2 group-hover:text-emerald-400 transition-colors" />
                                                Tap to Reveal
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="absolute bottom-0 left-0 h-1 bg-white/5 w-full">
                                    <motion.div
                                        className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </div>
                            </Card>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}