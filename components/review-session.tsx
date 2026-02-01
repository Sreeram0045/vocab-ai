"use client";

import { useState, useEffect } from "react";
import { BrainCircuit, Check, X, Eye, Loader2, PartyPopper } from "lucide-react";
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

    // We only need to track the first item. 
    // When reviewed, we shift() it off the array.
    const currentWord = dueWords[0];

    useEffect(() => {
        async function fetchReviews() {
            try {
                const res = await fetch("/api/review/due");
                if (res.ok) {
                    const data = await res.json();
                    setDueWords(data);
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

        // 1. Optimistic Update: Remove from UI immediately
        const wordId = currentWord._id;
        setDueWords((prev) => prev.slice(1));
        setIsRevealed(false); // Reset flip state

        // 2. Send to API in background
        try {
            await fetch("/api/review/update", {
                method: "POST",
                body: JSON.stringify({ wordId, result })
            });
        } catch (err) {
            console.error("Failed to update review", err);
            // Optional: Add it back to queue on error if strictly needed
        }
    };

    if (isLoading) return null; // Or a small skeleton
    if (dueWords.length === 0) return null; // Hide if nothing to review

    return (
        <div className="w-full max-w-2xl mx-auto mb-12">
            <div className="flex items-center gap-2 mb-4 text-amber-500">
                <BrainCircuit size={20} />
                <span className="font-semibold tracking-wide text-sm uppercase">
                    Daily Review ({dueWords.length} pending)
                </span>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentWord._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                >
                    <Card className="bg-black/40 border-amber-500/20 overflow-hidden relative backdrop-blur-sm">
                        <div className="p-8 text-center space-y-6">

                            {/* THE WORD */}
                            <div className="space-y-2">
                                <h3 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                                    {currentWord.word}
                                </h3>
                                {currentWord.universe && (
                                    <span className="text-xs text-white/30 uppercase tracking-widest">
                                        Seen in {currentWord.universe}
                                    </span>
                                )}
                            </div>

                            {/* REVEAL AREA */}
                            {isRevealed ? (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    className="bg-white/5 rounded-xl p-4 border border-white/10"
                                >
                                    <p className="text-zinc-300 italic">"{currentWord.meaning}"</p>
                                </motion.div>
                            ) : (
                                <div className="h-16 flex items-center justify-center">
                                    <Button
                                        variant="ghost"
                                        onClick={() => setIsRevealed(true)}
                                        className="text-white/50 hover:text-white hover:bg-white/5 gap-2"
                                    >
                                        <Eye size={16} /> Reveal Meaning
                                    </Button>
                                </div>
                            )}

                            {/* ACTIONS (Only visible after reveal) */}
                            {isRevealed && (
                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <Button
                                        onClick={() => handleVote('forgot')}
                                        variant="outline"
                                        className="border-red-500/30 text-red-400 hover:bg-red-950/30 hover:text-red-300 h-12"
                                    >
                                        <X className="mr-2 h-4 w-4" /> Forgot
                                    </Button>
                                    <Button
                                        onClick={() => handleVote('remembered')}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white h-12 border-none"
                                    >
                                        <Check className="mr-2 h-4 w-4" /> I Remember
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Progress Bar */}
                        <div className="absolute bottom-0 left-0 h-1 bg-amber-500/20 w-full">
                            <div
                                className="h-full bg-amber-500 transition-all duration-500"
                                style={{ width: `${Math.max(5, (1 / (dueWords.length + 1)) * 100)}%` }} // Simple visual progress
                            />
                        </div>
                    </Card>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}