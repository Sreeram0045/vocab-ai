"use client";

import { useState, useEffect, useRef } from "react";
import { X, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

const SUGGESTED_VIBES = [
    "Succession", "The Office (US)", "Breaking Bad", "Friends", "Game of Thrones",
    "Stranger Things", "Brooklyn Nine-Nine", "The Bear", "Rick and Morty",
    "Better Call Saul", "Seinfeld", "House M.D.", "Sherlock", "Ted Lasso",
    "Black Mirror", "Modern Family", "The Boys", "Arcane", "Parks and Rec",
    "Mad Men", "The Sopranos", "Avatar: TLA", "BoJack Horseman", "Severance",
    "Silicon Valley", "It's Always Sunny", "Fleabag", "Schitt's Creek",
    "Arrested Development", "Community", "Peaky Blinders", "The White Lotus"
];

interface PreferencesModalProps {
    isOpen: boolean;
    onSave: (shows: string[]) => void;
    onClose: () => void;
    initialShows?: string[];
    userEmail: string;
}

export default function PreferencesModal({ isOpen, onSave, onClose, initialShows = [], userEmail }: PreferencesModalProps) {
    const [selectedShows, setSelectedShows] = useState<string[]>(initialShows);
    const [inputValue, setInputValue] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const suggestions = SUGGESTED_VIBES.filter(
        show =>
            !selectedShows.includes(show) &&
            show.toLowerCase().includes(inputValue.toLowerCase())
    ).slice(0, 15);

    const canClose = initialShows.length > 0;

    useEffect(() => {
        if (isOpen) {
            setSelectedShows(initialShows);
        }
    }, [isOpen, initialShows]);

    const addShow = (show: string) => {
        if (!selectedShows.includes(show)) {
            setSelectedShows([...selectedShows, show]);
        }
        setInputValue("");
        inputRef.current?.focus();
    };

    const removeShow = (show: string) => {
        setSelectedShows(selectedShows.filter(s => s !== show));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            e.preventDefault();
            addShow(inputValue.trim());
        }
    };

    const handleSave = async () => {
        if (selectedShows.length === 0) return;

        setIsSaving(true);
        try {
            const res = await fetch("/api/user/preferences", {
                method: "POST",
                body: JSON.stringify({
                    email: userEmail,
                    shows: selectedShows
                }),
            });

            if (res.ok) {
                onSave(selectedShows);
            }
        } catch (error) {
            console.error("Failed to save", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open && canClose) {
                    onClose();
                }
            }}
        >
            <DialogContent
                className={cn(
                    "max-w-lg w-full bg-[#0A0A0A] border border-white/10 text-white p-0 shadow-2xl overflow-hidden rounded-3xl",
                    // Fix close button cursor
                    "[&>button[data-slot=dialog-close]]:cursor-pointer",
                    !canClose && "[&>button[data-slot=dialog-close]]:hidden"
                )}
            >
                {/* Header */}
                <div className="px-8 pt-10 pb-4 shrink-0">
                    <DialogTitle className="text-3xl font-black tracking-tighter text-white flex items-center gap-3">
                        Personalize
                    </DialogTitle>
                    <DialogDescription className="text-zinc-400 font-light text-lg mt-2 leading-relaxed">
                        Select your universes.
                    </DialogDescription>
                </div>

                {/* Scrollable Content Area */}
                <div className="px-8 space-y-8 overflow-y-auto max-h-[50vh] custom-scrollbar">
                    
                    {/* Input */}
                    <div className="relative group pt-1">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-emerald-500/0 rounded-full blur opacity-0 group-hover:opacity-100 transition duration-700"></div>
                        <div className="relative flex items-center bg-zinc-900/50 border border-white/10 rounded-full px-5 py-4 shadow-inner transition-colors group-focus-within:border-emerald-500/30 group-focus-within:bg-zinc-900">
                            <Search className="w-5 h-5 text-zinc-500 mr-3 group-focus-within:text-emerald-400 transition-colors" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Search or type..."
                                className="w-full bg-transparent border-none focus:outline-none text-white placeholder:text-zinc-600 font-light tracking-wide text-lg"
                            />
                            {inputValue && (
                                <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mr-2 animate-in fade-in">
                                    Enter
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Active Collection */}
                    <div className="space-y-4">
                        <div className="min-h-[40px] flex flex-wrap gap-2.5">
                             <AnimatePresence mode="popLayout">
                                {selectedShows.map((show) => (
                                    <motion.div
                                        key={show}
                                        layout
                                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.5 }}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                    >
                                        <Badge
                                            className="cursor-pointer bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-100 border border-emerald-500/20 pl-4 pr-3 py-2 rounded-full text-sm font-medium tracking-wide flex items-center gap-2 shadow-[0_0_15px_-3px_rgba(16,185,129,0.1)] hover:shadow-[0_0_20px_-3px_rgba(16,185,129,0.2)] transition-all group"
                                            onClick={() => removeShow(show)}
                                        >
                                            {show}
                                            <X size={14} className="opacity-50 group-hover:opacity-100 text-emerald-400" />
                                        </Badge>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {selectedShows.length === 0 && (
                                <div className="w-full text-center py-6 border border-dashed border-white/10 rounded-2xl bg-white/5">
                                    <span className="text-zinc-500 italic text-sm font-light">
                                        Your collection is empty.
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Suggestions */}
                    <div className="space-y-4 pb-4">
                        <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest pl-1">
                            Popular
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {suggestions.map((show) => (
                                <motion.button
                                    key={show}
                                    whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.2)" }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => addShow(show)}
                                    className="cursor-pointer px-4 py-2 rounded-full text-sm font-light bg-zinc-900/40 border border-white/5 text-zinc-400 transition-all duration-300"
                                >
                                    {show}
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 mt-2 bg-gradient-to-t from-black/50 to-transparent shrink-0">
                    <Button
                        onClick={handleSave}
                        disabled={selectedShows.length === 0 || isSaving}
                        className={cn(
                            "w-full h-14 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-500 cursor-pointer",
                            selectedShows.length > 0
                                ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_50px_rgba(16,185,129,0.5)] hover:-translate-y-1"
                                : "bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed"
                        )}
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                            </>
                        ) : (
                            "Confirm"
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}