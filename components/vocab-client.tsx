"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Sparkles, AlertCircle, ArrowRight, Book, Plus, History, LogOut, Tv, User, Settings2, Clock, Lightbulb, SearchX, Ban } from "lucide-react";
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
import SettingsModal from "@/components/settings-modal";
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
  phonetics?: string; 
  isLearning?: boolean;
}

interface VocabClientProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
}

export default function VocabClient({ user }: VocabClientProps) {
  // --- STATE ---
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
  const [showSettings, setShowSettings] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userShows, setUserShows] = useState<string[]>([]);

  // Validation Logic
  const inputValidation = useMemo(() => {
    const trimmed = inputWord.trim();
    if (!trimmed) return { isValid: true, reason: "" };
    
    const wordCount = trimmed.split(/\s+/).length;
    if (trimmed.length > 50) return { isValid: false, reason: "Too many characters" };
    if (wordCount > 4) return { isValid: false, reason: "Too many words" };
    
    return { isValid: true, reason: "" };
  }, [inputWord]);

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

  // --- THE BRAIN: Handles the Search Logic ---
  async function handleSearch(wordOverride?: string) {
    const term = wordOverride || inputWord;
    if (!term.trim()) return;

    setShowSuggestions(false);
    setSelectedIndex(-1);

    if (wordOverride) setInputWord(wordOverride);

    const currentSearchWord = term.trim();

    setLoadingText(true);
    setLoadingImage(false);
    setError("");
    setResult(null);

    try {
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
        return; 
      }

      console.log("💨 Cache Miss: Generating Fresh Content");

      const textPromise = fetch("/api/generate", {
        method: "POST",
        body: JSON.stringify({
          word: currentSearchWord,
          preferredShows: userShows
        }),
      });

      const dictionaryPromise = fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${currentSearchWord}`);

      const [textRes, dictRes] = await Promise.all([textPromise, dictionaryPromise]);

      if (!textRes.ok) {
        const textData = await textRes.json();
        throw new Error(textData.error || "Failed to fetch definition");
      }

      const textData = await textRes.json();

      if (textData.meaning === "Spelling error") {
        setResult({ ...textData, word: currentSearchWord });
        setLoadingText(false);
        setInputWord("");
        return;
      }

      let phoneticText = "";
      try {
        if (dictRes.ok) {
          const dictData = await dictRes.json();
          phoneticText = dictData[0]?.phonetic || dictData[0]?.phonetics?.find((p: any) => p.text)?.text || "";
        }
      } catch (err) { console.error("Dictionary parsing error", err); }

      const resultWithPhonetics = { ...textData, word: currentSearchWord, phonetics: phoneticText };
      
      let savedId = null;
      let savedIsLearning = false;

      try {
        console.log("💾 Saving text early...");
        const saveRes = await fetch("/api/history/save", {
            method: "POST",
            body: JSON.stringify(resultWithPhonetics),
        });
        if (saveRes.ok) {
            const savedData = await saveRes.json();
            savedId = savedData._id;
            savedIsLearning = savedData.isLearning;
            console.log("✅ Saved Early. ID:", savedId);
        } else {
            console.error("❌ Early save failed. Status:", saveRes.status);
        }
      } catch (err) { console.error("❌ Early save exception", err); }

      setResult({
        ...resultWithPhonetics,
        _id: savedId,
        isLearning: savedIsLearning
      });
      setLoadingText(false);
      setInputWord("");

      setLoadingImage(true);
      let imageUrl = null;

      try {
        console.log("🎨 Requesting Image...");
        const imgRes = await fetch("/api/image", {
          method: "POST",
          body: JSON.stringify({
            prompt: textData.visual_prompt,
            universe: textData.universe
          }),
          signal: AbortSignal.timeout(20000) 
        });

        if (imgRes.ok) {
          const imgData = await imgRes.json();
          imageUrl = imgData.image || imgData.url;
          console.log("🖼️ Image Received:", imageUrl);
        } else {
            console.error("❌ Image API Error:", imgRes.status);
        }
      } catch (e) {
        console.warn("⚠️ Image generation skipped/failed", e);
      } finally {
        setLoadingImage(false);
      }

      if (imageUrl) {
        setResult((prev) => {
            console.log("🔄 Updating Local State with Image");
            return prev ? { ...prev, imageUrl } : null;
        });

        if (savedId) {
            console.log("💾 Patching DB with Image for ID:", savedId);
            await fetch("/api/history/update", {
                method: "POST",
                body: JSON.stringify({ _id: savedId, imageUrl }),
            });
        }
      }

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
    <div className="max-w-5xl w-full p-4 md:p-12 space-y-12 md:space-y-16 relative">

      {/* --- STICKY NAVBAR --- */}
      <div className="w-full flex justify-between items-center sticky top-0 z-50 animate-in fade-in slide-in-from-top-4 duration-700 backdrop-blur-md bg-background/40 p-2 md:p-4 rounded-full border border-border shadow-[0_0_20px_rgba(0,0,0,0.03)] dark:shadow-[0_0_20px_rgba(255,255,255,0.05)] mb-8 md:mb-8">
        <a href="/" className="flex items-center gap-1 select-none pl-2 cursor-pointer hover:opacity-80 transition-opacity">
          <span className="text-xl font-black tracking-tighter text-foreground">
            Vocabul
          </span>
          <span className="text-xl font-medium tracking-tight text-foreground/90">
            AI
          </span>
        </a>
        <div className="flex gap-2 md:gap-3 items-center">
          <Link href="/history">
            <Button variant="ghost" size="icon" className="rounded-full w-10 h-10 hover:bg-foreground/5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
              <History className="w-5 h-5" />
            </Button>
          </Link>

          {/* Profile Dropdown */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full p-0 overflow-hidden border border-border hover:border-foreground/30 transition-all cursor-pointer bg-muted"
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
              <DropdownMenuContent className="w-56 bg-card border-border text-card-foreground shadow-xl dark:shadow-[0_0_30px_rgba(0,0,0,0.5)]" align="end" forceMount>
                <DropdownMenuLabel className="font-normal p-3">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-foreground">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground truncate">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem onClick={() => setShowPreferences(true)} className="cursor-pointer focus:bg-muted focus:text-foreground p-2.5">
                  <Tv className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Personalize</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowSettings(true)} className="cursor-pointer focus:bg-muted focus:text-foreground p-2.5">
                  <Settings2 className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem onClick={() => handleSignOut()} className="cursor-pointer text-destructive dark:text-red-400 focus:text-destructive dark:focus:text-red-300 focus:bg-destructive/10 dark:focus:bg-red-950/20 p-2.5">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/api/auth/signin">
              <Button variant="outline" size="sm" className="rounded-full bg-foreground/5 border-border hover:bg-foreground/10 text-foreground shadow-sm">Sign In</Button>
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
            className="fixed bottom-6 right-6 md:bottom-8 md:right-8 h-12 w-12 md:h-14 md:w-14 rounded-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/20 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-900 dark:text-white shadow-[0_10px_30px_rgba(0,0,0,0.1)] dark:shadow-[0_0_30px_rgba(255,255,255,0.12)] cursor-pointer z-50 transition-all duration-300 hover:scale-110 hover:-translate-y-1 opacity-0 animate-fade-in-up delay-500"
          >
            <Book size={24} />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="sm:max-w-md bg-card/95 backdrop-blur-xl border-l border-border overflow-y-auto">
          <SheetHeader className="mb-8 text-left">
            <SheetTitle className="text-2xl font-black tracking-tighter text-foreground">Writer&apos;s Room</SheetTitle>
            <SheetDescription className="text-muted-foreground font-light">
              Your creative workspace.
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-col gap-6 mt-2">

            <Link href="/notes" className="group relative flex items-center justify-between p-6 rounded-2xl bg-gradient-to-br from-foreground/10 to-foreground/5 border border-border hover:border-emerald-500/60 hover:from-emerald-900/20 hover:to-background transition-all duration-500 overflow-hidden cursor-pointer shadow-sm hover:shadow-xl dark:hover:shadow-[0_0_30px_rgba(16,185,129,0.1)]">
              <div className="relative z-10">
                <h3 className="text-lg font-bold text-foreground group-hover:text-emerald-500 transition-colors">Enter Room</h3>
                <p className="text-xs text-muted-foreground mt-1">View all {notesList.length} notes</p>
              </div>
              <div className="relative z-10 p-3 rounded-full bg-foreground/5 group-hover:bg-emerald-500/20 group-hover:text-emerald-500 transition-all text-foreground/50">
                <ArrowRight size={20} />
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            </Link>

            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Quick Drafts</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCreateNote}
                  className="h-8 text-xs text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 -mr-2 cursor-pointer"
                >
                  <Plus className="w-3 h-3 mr-1.5" /> New Note
                </Button>
              </div>

              {notesList.length === 0 ? (
                <div className="p-8 border border-dashed border-border rounded-2xl text-center shadow-inner">
                  <p className="text-muted-foreground italic text-sm mb-4">No notes yet.</p>
                  <Button variant="secondary" size="sm" onClick={handleCreateNote} className="cursor-pointer">Create First Note</Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {notesList.slice(0, 5).map((note) => (
                    <Link
                      key={note._id}
                      href={`/notes/${note._id}`}
                      className="block p-4 rounded-xl bg-muted/20 border border-border hover:border-foreground/30 hover:bg-muted transition-all group cursor-pointer shadow-sm hover:shadow-md"
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-muted-foreground group-hover:text-foreground transition-colors truncate pr-4 text-sm">
                          {note.title || "Untitled Note"}
                        </h4>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-2 font-mono uppercase tracking-wider">
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
        <p className="text-foreground/50 text-lg max-w-xl mx-auto font-light tracking-wide opacity-0 animate-fade-in-up">
          Master vocabulary through the lens of cinema.
        </p>
      </div>

      {/* --- SEARCH BAR --- */}
      <div
        ref={searchContainerRef}
        className="relative max-w-lg mx-auto w-full group z-50 opacity-0 animate-fade-in-up delay-200"
      >
        <div className={`absolute -inset-0.5 bg-gradient-to-r ${inputValidation.isValid ? 'from-foreground/20 to-foreground/10' : 'bg-transparent'} rounded-full blur opacity-30 group-hover:opacity-50 transition duration-1000`}></div>

        <div className={`relative flex items-center gap-2 bg-background border ${inputValidation.isValid ? 'border-border' : 'border-muted-foreground border-dashed'} rounded-full p-1.5 md:p-2 shadow-2xl dark:shadow-[0_0_40px_rgba(255,255,255,0.05)] backdrop-blur-xl transition-all duration-300 focus-within:ring-1 ${inputValidation.isValid ? 'focus-within:ring-foreground/30 focus-within:border-foreground/40 hover:border-foreground/30' : 'focus-within:ring-transparent focus-within:border-muted-foreground hover:border-muted-foreground'}`}>
          <Search className={`ml-3 transition-colors w-4 h-4 md:w-5 md:h-5 ${inputValidation.isValid ? 'text-muted-foreground group-focus-within:text-foreground' : 'text-muted-foreground'}`} />
          <Input
            placeholder="Type a word..."
            className={`flex-1 bg-muted/50 border-none text-foreground placeholder:text-muted-foreground focus-visible:ring-0 px-4 text-base h-10 md:h-12 font-light tracking-wide rounded-full ${!inputValidation.isValid && 'text-muted-foreground'}`}
            value={inputWord}
            onChange={(e) => {
              setInputWord(e.target.value);
              setShowSuggestions(true);
              setSelectedIndex(-1);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && inputValidation.isValid) {
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
          <div className="relative group/btn">
            {!inputValidation.isValid && (
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-background border border-border text-foreground text-[10px] font-bold uppercase tracking-wider rounded-lg whitespace-nowrap opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none shadow-xl">
                {inputValidation.reason}
              </div>
            )}
            <Button
              onClick={() => handleSearch()}
              disabled={loadingText || !inputWord.trim() || !inputValidation.isValid}
              size="icon"
              className={`h-10 w-10 md:h-12 md:w-12 rounded-full transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(0,0,0,0.15)] ${inputValidation.isValid ? 'bg-foreground text-background hover:bg-foreground/90' : 'bg-muted text-muted-foreground border border-border shadow-none'}`}
            >
              {loadingText ? <Sparkles className="animate-spin text-background w-4 h-4 md:w-5 md:h-5" /> : inputValidation.isValid ? <ArrowRight className="w-5 h-5 md:w-6 md:h-6" /> : <Ban className="w-4 h-4 md:w-5 md:h-5" />}
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.99 }}
              transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
              className="absolute top-full left-0 right-0 mt-2 bg-background/60 backdrop-blur-2xl border border-border rounded-2xl overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] z-40 ring-1 ring-foreground/5"
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
                        ${isActive ? "bg-foreground/[0.08]" : "hover:bg-foreground/[0.03]"}
                      `}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`
                          transition-all duration-300
                          ${isActive ? "text-foreground scale-110" : "text-muted-foreground"}
                        `}>
                          {suggestion.type === 'history' ? (
                            <Clock className="w-3.5 h-3.5" />
                          ) : (
                            <Lightbulb className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <span className={`
                          text-sm tracking-tight transition-all duration-300
                          ${isActive ? "text-foreground font-medium" : "text-muted-foreground font-light"}
                        `}>
                          {suggestion.word}
                        </span>
                      </div>

                      {isActive && (
                        <motion.div
                          layoutId="arrow"
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="text-foreground/40"
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

      {error && (
        <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loadingText && (
        <div className="space-y-8 animate-pulse">
          <div className="h-40 w-full rounded-3xl bg-foreground/5 border border-border" />
          <div className="grid md:grid-cols-2 gap-8">
            <div className="h-80 w-full rounded-3xl bg-foreground/5 border border-border" />
            <div className="h-80 w-full rounded-3xl bg-foreground/5 border border-border" />
          </div>
        </div>
      )}

      {result && !loadingText && (
        result.meaning === "Spelling error" ? (
          <div className="max-w-xl mx-auto w-full animate-in fade-in zoom-in-95 duration-500">
            <div className="bg-background/60 border border-border backdrop-blur-3xl rounded-3xl p-8 md:p-12 text-center space-y-6 shadow-2xl">
              <div className="inline-flex p-5 rounded-full bg-foreground/5 text-foreground mb-2 ring-1 ring-border shadow-[0_0_15px_-3px_rgba(0,0,0,0.1)]">
                <SearchX size={32} />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-black text-foreground tracking-tighter uppercase">Script Error</h3>
                <p className="text-muted-foreground text-lg font-light leading-relaxed">
                  We couldn&apos;t find a cinematic match for <br/>
                  <span className="text-foreground font-medium border-b border-border pb-0.5">&quot;{result.word}&quot;</span>
                </p>
                <p className="text-xs text-muted-foreground/60 font-mono tracking-wider uppercase pt-2">
                  Check spelling // Try another term
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => {
                  setResult(null); 
                  setInputWord("");
                  setTimeout(() => document.querySelector('input')?.focus(), 10);
                }}
                className="mt-6 border-border bg-foreground/5 hover:bg-foreground text-foreground hover:text-background transition-all duration-300 rounded-full px-8"
              >
                Clear & Retry
              </Button>
            </div>
          </div>
        ) : (
          <WordCard data={result} loadingImage={loadingImage} ImageComponent={Image} />
        )
      )}

      <PreferencesModal
        isOpen={showPreferences}
        initialShows={userShows}
        userEmail={userEmail}
        onSave={handlePreferencesSaved}
        onClose={() => setShowPreferences(false)}
      />

      <SettingsModal 
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />

      {!result && !loadingText && <ReviewSession />}
    </div>
  );
}