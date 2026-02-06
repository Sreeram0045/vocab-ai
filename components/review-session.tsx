"use client";

import { useState, useEffect, useRef } from "react";
import { BrainCircuit, Check, X, Eye, Trophy, ChevronDown, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion, LayoutGroup } from "framer-motion";

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
    const [isExpanded, setIsExpanded] = useState(false);
    const [isPinned, setIsPinned] = useState(false); // New state to track "Sticky" mode
    const [totalSessionCount, setTotalSessionCount] = useState(0);
    const [isSessionComplete, setIsSessionComplete] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    
    // Hover timer ref
    const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const reviewContainerRef = useRef<HTMLDivElement>(null);

    const currentWord = dueWords[0];
    const progress = totalSessionCount > 0
        ? ((totalSessionCount - dueWords.length) / totalSessionCount) * 100
        : 0;

    // Handle click outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (reviewContainerRef.current && !reviewContainerRef.current.contains(event.target as Node) && isExpanded) {
                setIsExpanded(false);
                setIsPinned(false); // Reset pin state
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isExpanded]);

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

        try {
            fetch("/api/review/update", {
                method: "POST",
                body: JSON.stringify({ wordId, result })
            });
        } catch (err) { console.error("Failed to update review", err); }

        if (dueWords.length === 1) {
            // 1. Enter Victory Mode immediately
            setIsSessionComplete(true);
            setIsExpanded(true);
            setIsPinned(true);

            // 2. Wait 3 seconds, then shrink to "Done" pill
            setTimeout(() => {
                setDueWords([]); 
                setIsExpanded(false);
                setIsPinned(false);

                // 3. After another 3 seconds, fade out completely
                setTimeout(() => {
                    setIsVisible(false);
                }, 3000);
            }, 3000);
        } else {
            setDueWords((prev) => prev.slice(1));
            setIsRevealed(false);
        }
    };

    const handleMouseEnter = () => {
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = null;
        }
        if (!isExpanded && !isSessionComplete && !isPinned) {
            hoverTimeoutRef.current = setTimeout(() => {
                setIsExpanded(true);
            }, 100);
        }
    };

    const handleMouseLeave = () => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
        }
        if (isExpanded && !isPinned) {
            closeTimeoutRef.current = setTimeout(() => {
                setIsExpanded(false);
            }, 500);
        }
    };

    const handleContainerClick = () => {
        setIsExpanded(true);
        setIsPinned(true);
    };

    if (isLoading) return null;
    // Render if we have words OR if the session is complete (to show the "Done" pill)
    if (dueWords.length === 0 && !isSessionComplete) return null;
    if (!isVisible) return null;

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full flex justify-center pointer-events-none">
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        ref={reviewContainerRef}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ 
                            opacity: 1,
                            y: 0,
                            borderRadius: isExpanded ? 24 : 28,
                            width: isExpanded ? "min(400px, 92vw)" : 220,
                            height: isExpanded ? 520 : 56,
                            borderColor: isExpanded ? "var(--border)" : "var(--border)",
                            boxShadow: isExpanded 
                                ? "0 0 40px rgba(0, 0, 0, 0.2)" 
                                : "0 0 25px rgba(0, 0, 0, 0.05)"
                        }}
                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.4 } }}
                        className={`pointer-events-auto bg-card border overflow-hidden relative flex flex-col cursor-pointer shadow-2xl will-change-transform
                            ${isExpanded ? 'cursor-default' : 'hover:bg-foreground/[0.03]'}`}
                        onClick={handleContainerClick}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        whileHover={!isExpanded ? {
                            boxShadow: "0 0 35px rgba(0, 0, 0, 0.1)",
                            borderColor: "oklch(var(--border) / 0.8)"
                        } : {}}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    >
                        {/* 1. COMPACT "DONE" PILL */}
                        <motion.div 
                            className="absolute bottom-0 left-0 right-0 h-[56px] flex items-center justify-center gap-3 px-6 whitespace-nowrap pointer-events-none"
                            animate={{ opacity: (!isExpanded && isSessionComplete) ? 1 : 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="w-5 h-5 rounded-full bg-muted text-muted-foreground flex items-center justify-center shadow-sm">
                                <Check size={12} strokeWidth={3} />
                            </div>
                            <span className="text-sm font-medium text-muted-foreground tracking-tight">Session Finished</span>
                        </motion.div>

                        {/* 2. COMPACT "REVIEW" PILL */}
                        <motion.div 
                            className="absolute bottom-0 left-0 right-0 h-[56px] flex items-center justify-center gap-4 px-6 whitespace-nowrap pointer-events-none"
                            animate={{ opacity: (!isExpanded && !isSessionComplete) ? 1 : 0 }}
                            transition={{ duration: 0.1 }}
                        >
                            <div className="relative flex items-center justify-center">
                                <BrainCircuit size={18} className="text-muted-foreground" />
                                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
                            </div>
                            <span className="text-sm font-medium text-foreground">Daily Review</span>
                            <div className="h-4 w-[1px] bg-border mx-1" />
                            <span className="text-xs font-mono font-bold text-foreground">{dueWords.length}</span>
                        </motion.div>

                        {/* 3. EXPANDED CARD CONTENT */}
                        <motion.div
                            className="absolute inset-0 flex flex-col w-full h-full"
                            animate={{ 
                                opacity: isExpanded ? 1 : 0,
                                pointerEvents: isExpanded ? "auto" : "none"
                            }}
                            transition={{ duration: 0.2, delay: isExpanded ? 0.1 : 0 }}
                        >
                            {isSessionComplete ? (
                                <div className="flex flex-col items-center justify-center h-full space-y-8 p-12 text-center relative">
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--foreground)_5%,transparent_70%)] opacity-[0.03]" />
                                    
                                    <motion.div
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
                                        className="relative"
                                    >
                                        <div className="absolute inset-0 blur-3xl bg-foreground/10 rounded-full scale-150" />
                                        <div className="relative inline-flex p-8 rounded-full bg-gradient-to-b from-card to-muted border border-border text-foreground shadow-2xl">
                                            <Trophy size={56} strokeWidth={1.5} className="drop-shadow-[0_0_15px_rgba(0,0,0,0.1)] dark:drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
                                        </div>
                                    </motion.div>

                                    <div className="space-y-3 relative z-10">
                                        <h3 className="text-3xl font-light text-foreground tracking-tighter italic">
                                            Session Complete
                                        </h3>
                                        <p className="text-muted-foreground text-sm font-light max-w-[240px] leading-relaxed mx-auto">
                                            Your linguistic neural paths have been successfully reinforced.
                                        </p>
                                    </div>

                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsExpanded(false);
                                            setIsPinned(false);
                                        }}
                                        className="px-8 py-2 rounded-full border border-border bg-transparent text-muted-foreground text-xs font-medium tracking-widest uppercase hover:border-foreground/30 hover:text-foreground transition-all duration-300 cursor-pointer relative z-10"
                                    >
                                        Dismiss
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center justify-between p-5 border-b border-border shrink-0">
                                        <div className="flex items-center gap-2">
                                            <Brain size={16} className="text-muted-foreground" />
                                            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-bold">Neural Link</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-xs font-mono text-muted-foreground">
                                                {totalSessionCount - dueWords.length + 1} / {totalSessionCount}
                                            </span>
                                            <button 
                                                onClick={(e) => { 
                                                    e.stopPropagation(); 
                                                    setIsExpanded(false); 
                                                    setIsPinned(false);
                                                }}
                                                className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                            >
                                                <ChevronDown size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-8 text-center flex-1 flex flex-col justify-center relative overflow-y-auto">
                                        <LayoutGroup>
                                            <div className="relative z-10 space-y-10">
                                                <motion.div 
                                                    layout
                                                    transition={{ type: "spring", stiffness: 120, damping: 20 }}
                                                    className="space-y-3"
                                                >
                                                    <h3 className="text-4xl font-black text-foreground tracking-tight">
                                                        {currentWord.word}
                                                    </h3>
                                                    {currentWord.universe && (
                                                        <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                                                            {currentWord.universe}
                                                        </p>
                                                    )}
                                                </motion.div>

                                                <div className="min-h-[120px] flex items-center justify-center">
                                                    <AnimatePresence>
                                                        {!isRevealed ? (
                                                            <motion.div
                                                                key="reveal-btn"
                                                                layout
                                                                initial={{ opacity: 0, scale: 0.95 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                exit={{ opacity: 0, scale: 0.95, position: "absolute" }}
                                                                transition={{ type: "spring", stiffness: 120, damping: 20 }}
                                                            >
                                                                <Button
                                                                    variant="ghost"
                                                                    onClick={(e) => { e.stopPropagation(); setIsRevealed(true); }}
                                                                    className="h-12 px-8 rounded-full border border-border bg-foreground/5 hover:bg-foreground/10 text-muted-foreground hover:text-foreground transition-all duration-300 backdrop-blur-md cursor-pointer"
                                                                >
                                                                    <Eye size={16} className="mr-2 opacity-70" />
                                                                    <span className="tracking-wide font-light">Reveal Definition</span>
                                                                </Button>
                                                            </motion.div>
                                                        ) : (
                                                            <motion.div
                                                                key="definition"
                                                                layout
                                                                initial={{ opacity: 0, y: 20 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                className="space-y-8 w-full"
                                                                transition={{ type: "spring", stiffness: 120, damping: 20 }}
                                                            >
                                                                <div className="p-6 rounded-2xl bg-gradient-to-b from-foreground/[0.05] to-transparent border border-border shadow-inner">
                                                                    <p className="text-foreground/90 font-light leading-relaxed text-xl drop-shadow-sm">
                                                                        {currentWord.meaning}
                                                                    </p>
                                                                </div>

                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); handleVote('forgot'); }}
                                                                        className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border border-border bg-foreground/[0.02] hover:bg-amber-500/10 hover:border-amber-500/20 hover:text-amber-700 dark:hover:text-amber-200 text-muted-foreground transition-all duration-300 cursor-pointer group"
                                                                    >
                                                                        <X size={20} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                                                                        <span className="text-[10px] font-medium uppercase tracking-widest opacity-70 group-hover:opacity-100">Forgot</span>
                                                                    </button>
                                                                    
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); handleVote('remembered'); }}
                                                                        className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border border-border bg-foreground/[0.02] hover:bg-emerald-500/10 hover:border-emerald-500/20 hover:text-emerald-700 dark:hover:text-emerald-200 text-muted-foreground transition-all duration-300 cursor-pointer group"
                                                                    >
                                                                        <Check size={20} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                                                                        <span className="text-[10px] font-medium uppercase tracking-widest opacity-70 group-hover:opacity-100">Recall</span>
                                                                    </button>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </div>
                                        </LayoutGroup>
                                    </div>

                                    <div className="absolute bottom-0 left-0 w-full h-1 bg-muted">
                                        <motion.div 
                                            className="h-full bg-emerald-600"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                            transition={{ duration: 0.5 }}
                                        />
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}