"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Sparkles, AlertCircle, ArrowRight, Book, Plus, History, LogOut, Tv, User, Settings2, Clock, Lightbulb } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import WordCard from "./word-card";
import PreferencesModal from "@/components/preferences-modal";
import ReviewSession from "./review-session";
import { handleSignOut } from "@/app/actions";
import { COMMON_VOCAB } from "@/lib/common-vocab";

// --- UPDATED INTERFACE ---
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
  phonetics?: string; // Added
  isLearning?: boolean; // Added
}

interface VocabClientProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
}

export default function VocabClient({ user }: VocabClientProps) {
  // --- STATE: The "Memory" of the Screen ---
  const [inputWord, setInputWord] = useState("");
  const [result, setResult] = useState<VocabData | null>(null);
  const [loadingText, setLoadingText] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const [error, setError] = useState("");

  // Suggestions State
  const [historyWords, setHistoryWords] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Journal State
  const [notesList, setNotesList] = useState<any[]>([]);

  // Preferences State
  const [showPreferences, setShowPreferences] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userShows, setUserShows] = useState<string[]>([]);

  // Filtered Suggestions Logic
  const suggestions = useMemo(() => {
    if (!inputWord.trim() || inputWord.length < 2) return [];

    const lowerInput = inputWord.toLowerCase().trim();

    const historyMatches = historyWords
      .filter(w => w.toLowerCase().includes(lowerInput) && w.toLowerCase() !== lowerInput)
      .slice(0, 3)
      .map(word => ({ word, type: 'history' as const }));

    const historySet = new Set(historyMatches.map(h => h.word.toLowerCase()));

    const vocabMatches = COMMON_VOCAB
      .filter(w => w.toLowerCase().startsWith(lowerInput) && !historySet.has(w.toLowerCase()) && w.toLowerCase() !== lowerInput)
      .slice(0, 5)
      .map(word => ({ word, type: 'vocab' as const }));

    return [...historyMatches, ...vocabMatches];
  }, [inputWord, historyWords]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch initial data
  useEffect(() => {
    async function fetchData() {
      try {
        const [noteRes, historyRes, userRes] = await Promise.all([
          fetch("/api/notes"),
          fetch("/api/history/list"),
          fetch("/api/user/me")
        ]);

        if (noteRes.ok) {
          const notesData = await noteRes.json();
          if (Array.isArray(notesData)) setNotesList(notesData);
        }

        if (historyRes.ok) {
          const historyData = await historyRes.json();
          if (Array.isArray(historyData)) setHistoryWords(historyData);
        }

        if (userRes.ok) {
          const userData = await userRes.json();
          setUserEmail(userData.email);

          if (userData.preferences?.watchedShows?.length > 0) {
            setUserShows(userData.preferences.watchedShows);
          } else {
            setShowPreferences(true);
          }
        }

      } catch (err) {
        console.error("Failed to fetch initial data", err);
      }
    }
    fetchData();
  }, []);

  const handleCreateNote = async () => {
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        body: JSON.stringify({ title: "Untitled Note", content: "" }),
      });
      if (res.ok) {
        const newNote = await res.json();
        window.location.href = `/notes/${newNote._id}`;
      }
    } catch (err) {
      console.error("Failed to create note", err);
    }
  };

  const handlePreferencesSaved = (shows: string[]) => {
    setUserShows(shows);
    setShowPreferences(false);
  };

  // --- THE BRAIN: Handles the Search Logic (UPDATED) ---
  async function handleSearch(wordOverride?: string) {
    const term = wordOverride || inputWord;
    if (!term.trim()) return;

    setShowSuggestions(false);
    setSelectedIndex(-1);

    if (wordOverride) setInputWord(wordOverride);

    const currentSearchWord = term.trim();

    // 1. Reset everything
    setLoadingText(true);
    setLoadingImage(false);
    setError("");
    setResult(null);

    try {
      // --- STEP 1: CHECK DATABASE FIRST (Cache Hit) ---
      // We use the new /api/word/get endpoint which handles "Lazy Patching" of phonetics
      console.log("Checking database for:", currentSearchWord);
      const checkRes = await fetch("/api/word/get", {
        method: "POST",
        body: JSON.stringify({ word: currentSearchWord }),
      });

      if (checkRes.ok) {
        console.log("⚡ Cache Hit: Loaded from Database");
        const cachedData = await checkRes.json();
        setResult(cachedData);
        setLoadingText(false);
        return; // STOP HERE
      }

      // --- STEP 2: CACHE MISS - GENERATE NEW (LLM + Dictionary) ---
      console.log("💨 Cache Miss: Generating Fresh Content");

      // A. Parallel Fetch: LLM (Text) + Dictionary (Phonetics)
      const textPromise = fetch("/api/generate", {
        method: "POST",
        body: JSON.stringify({
          word: currentSearchWord,
          preferredShows: userShows
        }),
      });

      // Fetch Phonetics in parallel
      const dictionaryPromise = fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${currentSearchWord}`);

      const [textRes, dictRes] = await Promise.all([textPromise, dictionaryPromise]);

      if (!textRes.ok) {
        const textData = await textRes.json();
        throw new Error(textData.error || "Failed to fetch definition");
      }

      const textData = await textRes.json();

      // B. Process Phonetics
      let phoneticText = "";
      try {
        if (dictRes.ok) {
          const dictData = await dictRes.json();
          // Extract logic
          phoneticText = dictData[0]?.phonetic || dictData[0]?.phonetics?.find((p: any) => p.text)?.text || "";
        }
      } catch (err) { console.error("Dictionary parsing error", err); }

      // 3. Update the screen with text IMMEDIATELY
      const resultWithPhonetics = { ...textData, word: currentSearchWord, phonetics: phoneticText };
      setResult(resultWithPhonetics);
      setLoadingText(false);
      setInputWord("");

      // 4. Fetch IMAGE (Background Process)
      setLoadingImage(true);
      let imageUrl = null;

      try {
        const imgRes = await fetch("/api/image", {
          method: "POST",
          body: JSON.stringify({
            prompt: textData.visual_prompt,
            universe: textData.universe
          }),
          signal: AbortSignal.timeout(20000) // Safety timeout
        });

        if (imgRes.ok) {
          const imgData = await imgRes.json();
          imageUrl = imgData.image || imgData.url;
        }
      } catch (e) {
        console.warn("Image generation skipped/failed", e);
      } finally {
        setLoadingImage(false);
      }

      // 5. SAVE TO HISTORY (With Image + Phonetics)
      // Update local state first if image exists
      if (imageUrl) {
        setResult((prev) => prev ? { ...prev, imageUrl } : null);
      }

      const fullResult = { ...resultWithPhonetics, imageUrl };

      const saveRes = await fetch("/api/history/save", {
        method: "POST",
        body: JSON.stringify(fullResult),
      });

      const savedData = await saveRes.json();

      // Update state with the DB ID (needed for Memorize button)
      setResult({
        ...fullResult,
        _id: savedData._id,
        isLearning: savedData.isLearning
      });

    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Something went wrong");
      } else {
        setError("Something went wrong");
      }
      setLoadingText(false);
      setLoadingImage(false);
    }
  }

  // --- THE UI ---
  return (
    <div className="max-w-5xl w-full p-6 md:p-12 space-y-16 relative">

      {/* --- STICKY NAVBAR --- */}
      <div className="w-full flex justify-between items-center sticky top-0 z-50 animate-in fade-in slide-in-from-top-4 duration-700 backdrop-blur-md bg-black/40 p-4 rounded-full border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.05)] mb-8">
        <a href="/" className="flex items-center gap-1 select-none pl-2 cursor-pointer hover:opacity-80 transition-opacity">
          <span className="text-xl font-black tracking-tighter text-white">
            Vocabul
          </span>
          <span className="text-xl font-medium tracking-tight text-white/90">
            AI
          </span>
        </a>
        <div className="flex gap-3 items-center">
          <Link href="/history">
            <Button variant="ghost" size="icon" className="rounded-full w-10 h-10 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer">
              <History className="w-5 h-5" />
            </Button>
          </Link>

          {/* Profile Dropdown */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full p-0 overflow-hidden border border-white/10 hover:border-white/50 transition-all cursor-pointer bg-zinc-900"
                >
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={user.name || "User"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-emerald-500/10 text-emerald-500">
                      {user.name ? (
                        <span className="text-sm font-bold">{user.name[0].toUpperCase()}</span>
                      ) : (
                        <User className="h-5 w-5" />
                      )}
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-zinc-950 border-zinc-800 text-zinc-200" align="end" forceMount>
                <DropdownMenuLabel className="font-normal p-3">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-white">{user.name}</p>
                    <p className="text-xs leading-none text-zinc-500 truncate">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-zinc-800" />
                <DropdownMenuItem onClick={() => setShowPreferences(true)} className="cursor-pointer focus:bg-zinc-900 focus:text-white p-2.5">
                  <Settings2 className="mr-2 h-4 w-4 text-zinc-400 group-hover:text-white" />
                  <span>Personalize</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-zinc-800" />
                <DropdownMenuItem onClick={() => handleSignOut()} className="cursor-pointer text-red-400 focus:text-red-300 focus:bg-red-950/20 p-2.5">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/api/auth/signin">
              <Button variant="outline" size="sm" className="rounded-full bg-white/5 border-white/10 hover:bg-white/10 text-white">Sign In</Button>
            </Link>
          )}
        </div>
      </div>

      {/* --- JOURNAL SIDEBAR --- */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="fixed bottom-8 right-8 h-14 w-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white border-none shadow-[0_0_30px_rgba(16,185,129,0.4)] cursor-pointer z-50 transition-all duration-300 hover:scale-110 opacity-0 animate-fade-in-up delay-500"
          >
            <Book size={24} />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="sm:max-w-md bg-zinc-950/95 backdrop-blur-xl border-l border-white/10 overflow-y-auto">
          <SheetHeader className="mb-8 text-left">
            <SheetTitle className="text-2xl font-black tracking-tighter text-white">Writer&apos;s Room</SheetTitle>
            <SheetDescription className="text-zinc-500 font-light">
              Your creative workspace.
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-col gap-6 mt-2">

            {/* Primary Action: Go to Dashboard */}
            <Link href="/notes" className="group relative flex items-center justify-between p-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 hover:border-emerald-500/60 hover:from-emerald-900/20 hover:to-black transition-all duration-500 overflow-hidden cursor-pointer">
              <div className="relative z-10">
                <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">Enter Room</h3>
                <p className="text-xs text-zinc-400 mt-1">View all {notesList.length} notes</p>
              </div>
              <div className="relative z-10 p-3 rounded-full bg-white/5 group-hover:bg-emerald-500/20 group-hover:text-emerald-400 transition-all text-white/50">
                <ArrowRight size={20} />
              </div>
              {/* Glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            </Link>

            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-bold text-zinc-600 uppercase tracking-widest">Quick Drafts</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCreateNote}
                  className="h-8 text-xs text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 -mr-2 cursor-pointer"
                >
                  <Plus className="w-3 h-3 mr-1.5" /> New Note
                </Button>
              </div>

              {notesList.length === 0 ? (
                <div className="p-8 border border-dashed border-white/10 rounded-2xl text-center">
                  <p className="text-zinc-600 italic text-sm mb-4">No notes yet.</p>
                  <Button variant="secondary" size="sm" onClick={handleCreateNote} className="cursor-pointer">Create First Note</Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {notesList.slice(0, 5).map((note) => (
                    <Link
                      key={note._id}
                      href={`/notes/${note._id}`}
                      className="block p-4 rounded-xl bg-black/20 border border-white/10 hover:border-white/30 hover:bg-white/5 transition-all group cursor-pointer"
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-zinc-300 group-hover:text-white transition-colors truncate pr-4 text-sm">
                          {note.title || "Untitled Note"}
                        </h4>
                      </div>
                      <p className="text-[10px] text-zinc-600 mt-2 font-mono uppercase tracking-wider">
                        {new Date(note.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>

          </div>
        </SheetContent>
      </Sheet>

      <div className="text-center space-y-4">
        <p className="text-white/50 text-lg max-w-xl mx-auto font-light tracking-wide opacity-0 animate-fade-in-up">
          Master vocabulary through the lens of cinema.
        </p>
      </div>

      {/* --- SEARCH BAR --- */}
      <div
        ref={searchContainerRef}
        className="relative max-w-lg mx-auto w-full group z-50 opacity-0 animate-fade-in-up delay-200"
      >
        {/* Glow Effect behind */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-white/20 to-white/10 rounded-full blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>

        <div className="relative flex items-center gap-2 bg-black border border-white/20 rounded-full p-2 shadow-2xl backdrop-blur-xl transition-all duration-300 focus-within:ring-1 focus-within:ring-white/30 focus-within:border-white/40 hover:border-white/30">
          <Search className="ml-3 text-zinc-500 group-focus-within:text-zinc-300 transition-colors" size={20} />
          <Input
            placeholder="Type a word..."
            className="flex-1 bg-zinc-900/50 border-none text-white placeholder:text-zinc-600 focus-visible:ring-0 px-4 text-lg h-12 font-light tracking-wide rounded-full"
            value={inputWord}
            onChange={(e) => {
              setInputWord(e.target.value);
              setShowSuggestions(true);
              setSelectedIndex(-1);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (selectedIndex >= 0 && suggestions[selectedIndex]) {
                  handleSearch(suggestions[selectedIndex].word);
                } else {
                  handleSearch();
                }
              } else if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedIndex(prev => (prev > -1 ? prev - 1 : -1));
              } else if (e.key === "Escape") {
                setShowSuggestions(false);
              }
            }}
          />
          <Button
            onClick={() => handleSearch()}
            disabled={loadingText || !inputWord.trim()}
            size="icon"
            className="h-12 w-12 rounded-full bg-white text-black hover:bg-zinc-200 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,255,255,0.15)]"
          >
            {loadingText ? <Sparkles className="animate-spin text-black" size={20} /> : <ArrowRight size={24} />}
          </Button>
        </div>

        {/* --- SUGGESTIONS DROPDOWN --- */}
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.99 }}
              transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
              className="absolute top-full left-0 right-0 mt-2 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] z-40 ring-1 ring-white/5"
            >
              <div className="py-1.5 flex flex-col">
                {suggestions.map((suggestion, index) => {
                  const isActive = index === selectedIndex;
                  return (
                    <button
                      key={`${suggestion.type}-${suggestion.word}`}
                      onClick={() => handleSearch(suggestion.word)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`
                        relative w-full text-left px-5 py-3 flex items-center justify-between transition-all duration-300 cursor-pointer group
                        ${isActive ? "bg-white/[0.08]" : "hover:bg-white/[0.03]"}
                      `}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`
                          transition-all duration-300
                          ${isActive ? "text-white scale-110" : "text-zinc-600"}
                        `}>
                          {suggestion.type === 'history' ? (
                            <Clock className="w-3.5 h-3.5" />
                          ) : (
                            <Lightbulb className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <span className={`
                          text-sm tracking-tight transition-all duration-300
                          ${isActive ? "text-white font-medium [text-shadow:0_0_20px_rgba(255,255,255,0.3)]" : "text-zinc-400 font-light"}
                        `}>
                          {suggestion.word}
                        </span>
                      </div>

                      {isActive && (
                        <motion.div
                          layoutId="arrow"
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="text-white/40"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </motion.div>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <Alert variant="destructive" className="bg-red-950/30 border-red-900/50 text-red-200">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* LOADING SKELETON */}
      {loadingText && (
        <div className="space-y-8 animate-pulse">
          <div className="h-40 w-full rounded-3xl bg-white/5 border border-white/20" />
          <div className="grid md:grid-cols-2 gap-8">
            <div className="h-80 w-full rounded-3xl bg-white/5 border border-white/20" />
            <div className="h-80 w-full rounded-3xl bg-white/5 border border-white/20" />
          </div>
        </div>
      )}

      {/* --- RESULTS AREA --- */}
      {result && !loadingText && (
        <WordCard data={result} loadingImage={loadingImage} ImageComponent={Image} />
      )}

      {/* --- PREFERENCES MODAL --- */}
      <PreferencesModal
        isOpen={showPreferences}
        initialShows={userShows}
        userEmail={userEmail}
        onSave={handlePreferencesSaved}
        onClose={() => setShowPreferences(false)}
      />

      {/* --- REVIEW SESSION (Kept at bottom as requested) --- */}
      <ReviewSession />
    </div>
  );
}