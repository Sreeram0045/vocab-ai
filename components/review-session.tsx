"use client";

import { useState, useEffect } from "react";
import { BrainCircuit, Check, X, Eye, Trophy } from "lucide-react";
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

    // Track total for the progress bar
    const [totalSessionCount, setTotalSessionCount] = useState(0);
    const [isSessionComplete, setIsSessionComplete] = useState(false);

    const currentWord = dueWords[0];
    // Calculate progress: (Total - Remaining) / Total
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

    const handleVote = async (result: 'remembered' | 'forgot') => {
        if (!currentWord) return;

        const wordId = currentWord._id;

        // 1. Send to API in background (Fire & Forget)
        try {
            fetch("/api/review/update", {
                method: "POST",
                body: JSON.stringify({ wordId, result })
            });
        } catch (err) {
            console.error("Failed to update review", err);
        }

        // 2. UI Update
        if (dueWords.length === 1) {
            // If this was the last word, show success state briefly
            setIsSessionComplete(true);
            setTimeout(() => {
                setDueWords([]); // Clear data
                setIsSessionComplete(false); // <--- FIX IS HERE: Turn off the trophy so the component hides
            }, 3000); // Hide after 3 seconds
        } else {
            setDueWords((prev) => prev.slice(1));
            setIsRevealed(false);
        }
    };

    if (isLoading) return null;

    // If finished, show the Trophy screen briefly
    if (isSessionComplete) {
        return (
            <div className="w-full max-w-2xl mx-auto my-12 animate-in zoom-in-95 duration-500">
                <Card className="bg-gradient-to-br from-emerald-900/20 to-black border border-emerald-500/30 p-12 text-center backdrop-blur-xl">
                    <div className="flex flex-col items-center gap-4">
                        <div className="p-4 rounded-full bg-emerald-500/10 text-emerald-400 mb-2">
                            <Trophy size={48} />
                        </div>
                        <h3 className="text-3xl font-black text-white">Session Complete!</h3>
                        <p className="text-zinc-400">You're getting sharper every day.</p>
                        <div className="w-full h-1 bg-emerald-900/30 rounded-full mt-4 overflow-hidden">
                            <div className="h-full bg-emerald-500 w-full animate-[shimmer_2s_infinite]" />
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    if (dueWords.length === 0) return null;

    return (
        <div className="w-full max-w-2xl mx-auto my-12 relative group">
            {/* Header / Meta Info */}
            <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2 text-emerald-400">
                    <BrainCircuit size={18} />
                    <span className="font-mono text-xs uppercase tracking-widest font-bold">
                        Neural Recall
                    </span>
                </div>
                <span className="text-xs font-mono text-zinc-500">
                    {totalSessionCount - dueWords.length + 1} / {totalSessionCount}
                </span>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentWord._id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25, type: "spring" }}
                >
                    <Card className="bg-black/60 border border-white/10 overflow-hidden relative backdrop-blur-xl shadow-2xl">

                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                        <div className="p-8 md:p-10 text-center space-y-8 relative z-10">

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
                            <div className="min-h-[100px] flex items-center justify-center">
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

                                        {/* DECISION BUTTONS */}
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
                                        className="h-12 px-8 border-white/10 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all rounded-full group"
                                    >
                                        <Eye size={18} className="mr-2 group-hover:text-emerald-400 transition-colors" />
                                        Tap to Reveal
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Progress Bar (Bottom) */}
                        <div className="absolute bottom-0 left-0 h-1 bg-white/5 w-full">
                            <motion.div
                                className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>
                    </Card>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}