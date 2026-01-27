"use client";

import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, X, Tv, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const POPULAR_SHOWS = [
    { value: "friends", label: "Friends" },
    { value: "the-big-bang-theory", label: "The Big Bang Theory" },
    { value: "brooklyn-nine-nine", label: "Brooklyn Nine-Nine" },
    { value: "the-office-us", label: "The Office (US)" },
    { value: "suits", label: "Suits" },
    { value: "how-i-met-your-mother", label: "How I Met Your Mother" },
    { value: "breaking-bad", label: "Breaking Bad" },
    { value: "better-call-saul", label: "Better Call Saul" },
    { value: "sherlock", label: "Sherlock" },
    { value: "succession", label: "Succession" },
    { value: "house-md", label: "House M.D." },
    { value: "modern-family", label: "Modern Family" },
    { value: "seinfeld", label: "Seinfeld" },
    { value: "stranger-things", label: "Stranger Things" },
    { value: "game-of-thrones", label: "Game of Thrones" },
];

interface PreferencesModalProps {
    isOpen: boolean;
    onSave: (shows: string[]) => void;
    onClose: () => void;
    initialShows?: string[];
    userEmail: string;
}

export default function PreferencesModal({ isOpen, onSave, onClose, initialShows = [], userEmail }: PreferencesModalProps) {
    const [openCombobox, setOpenCombobox] = useState(false);
    const [selectedShows, setSelectedShows] = useState<string[]>(initialShows);
    const [isSaving, setIsSaving] = useState(false);

    // LOGIC: If the user came in with shows (initialShows > 0), they are allowed to close.
    // If they came in with nothing (New User), they MUST save (canClose = false).
    const canClose = initialShows.length > 0;

    useEffect(() => {
        if (isOpen) {
            setSelectedShows(initialShows);
        }
    }, [isOpen, initialShows]);

    const toggleShow = (showValue: string) => {
        setSelectedShows((current) =>
            current.includes(showValue)
                ? current.filter((item) => item !== showValue)
                : [...current, showValue]
        );
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
                    "sm:max-w-md bg-black/90 border-white/20 backdrop-blur-xl text-white",
                    // FIX IS HERE: We only hide buttons that are 'absolute' (which is the Close 'X' button)
                    // This allows the standard relative buttons (like Save) to stay visible.
                    !canClose && "[&>button.absolute]:hidden"
                )}
            >
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <Tv className="text-emerald-500" />
                        Calibrate Your Vibe
                    </DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Select the shows you have watched. We use this to generate metaphors you will actually understand.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={openCombobox}
                                className="w-full justify-between bg-zinc-900 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                            >
                                Search for a show...
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-zinc-900 border-zinc-700">
                            <Command className="bg-zinc-900 text-white">
                                <CommandInput placeholder="Type a show name..." />
                                {/* SCROLL FIX: Ensure pointer-events are auto and max-height is set */}
                                <CommandList className="max-h-[200px] overflow-y-auto pointer-events-auto custom-scrollbar">
                                    <CommandEmpty>No show found.</CommandEmpty>
                                    <CommandGroup>
                                        {POPULAR_SHOWS.map((show) => (
                                            <CommandItem
                                                key={show.value}
                                                value={show.label}
                                                onSelect={() => {
                                                    toggleShow(show.label);
                                                }}
                                                className="text-zinc-300 aria-selected:bg-zinc-800 aria-selected:text-white cursor-pointer"
                                            >
                                                <Check
                                                    className={`mr-2 h-4 w-4 ${selectedShows.includes(show.label)
                                                        ? "opacity-100 text-emerald-500"
                                                        : "opacity-0"
                                                        }`}
                                                />
                                                {show.label}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>

                    <div className="flex flex-wrap gap-2 min-h-[60px] p-4 bg-zinc-900/50 rounded-xl border border-white/5">
                        {selectedShows.length === 0 && (
                            <span className="text-sm text-zinc-600 italic">No shows selected yet...</span>
                        )}
                        {selectedShows.map((show) => (
                            <Badge
                                key={show}
                                variant="secondary"
                                className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20 pl-2 pr-1 py-1 flex items-center gap-1"
                            >
                                {show}
                                <button
                                    onClick={() => toggleShow(show)}
                                    className="ml-1 hover:bg-emerald-500/40 rounded-full p-0.5 transition-colors"
                                >
                                    <X size={12} />
                                </button>
                            </Badge>
                        ))}
                    </div>
                </div>

                {/* This button was being hidden before! Now it should be visible. */}
                <Button
                    onClick={handleSave}
                    disabled={selectedShows.length === 0 || isSaving}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-12 text-lg shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                        </>
                    ) : (
                        selectedShows.length === 0 ? "Select at least 1 show" : "Save Preferences"
                    )}
                </Button>
            </DialogContent>
        </Dialog>
    );
}