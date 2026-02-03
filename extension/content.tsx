import cssText from "data-text:~/style.css"
import type { PlasmoCSConfig } from "plasmo"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Sparkles, Loader2, BookOpen, ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"
import WordCard from "@/components/word-card"
import { api } from "~/lib/api"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

// Inject Tailwind styles into Shadow DOM
export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

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

export default function VocabOverlay() {
  const [isOpen, setIsOpen] = useState(false)
  const [word, setWord] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingImage, setLoadingImage] = useState(false)
  const [data, setData] = useState<VocabData | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    const messageListener = (message: any) => {
      if (message.type === "OPEN_VOCAB_MODAL" && message.text) {
        setWord(message.text.trim())
        setIsOpen(true)
        handleSearch(message.text.trim())
      }
    }

    chrome.runtime.onMessage.addListener(messageListener)
    return () => chrome.runtime.onMessage.removeListener(messageListener)
  }, [])

  const handleSearch = async (searchWord: string) => {
    setLoading(true)
    setLoadingImage(false)
    setError("")
    setData(null)

    try {
      // 1. Check History (Use /api/word/get for "Lazy Patching" of phonetics)
      const historyRes = await api.post("/api/word/get", { word: searchWord })
      
      if (historyRes.ok) {
        const historyData = await historyRes.json()
        if (historyData) {
          setData(historyData)
          setLoading(false)
          return
        }
      }

      // 2. Generate Text + Fetch Phonetics (Parallel)
      const textPromise = api.post("/api/generate", { word: searchWord })
      const dictPromise = fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${searchWord}`)

      const [textRes, dictRes] = await Promise.all([textPromise, dictPromise])

      if (!textRes.ok) {
        if (textRes.status === 401) throw new Error("Please log in to VocabAI")
        throw new Error("Failed to generate definition")
      }
      const textData = await textRes.json()

      // Extract Phonetics
      let phoneticText = ""
      try {
        if (dictRes.ok) {
          const dictData = await dictRes.json()
          phoneticText = dictData[0]?.phonetic || dictData[0]?.phonetics?.find((p: any) => p.text)?.text || ""
        }
      } catch (e) { console.warn("No phonetics found") }
      
      const fullData = { 
        ...textData, 
        word: searchWord,
        phonetics: phoneticText
      }
      
      // --- SAVE EARLY (Text Only) ---
      let savedId = null;
      let savedIsLearning = false;

      try {
        const saveRes = await api.post("/api/history/save", fullData)
        if (saveRes.ok) {
            const savedRecord = await saveRes.json()
            savedId = savedRecord._id;
            savedIsLearning = savedRecord.isLearning;
            console.log("✅ Extension: Text saved early. ID:", savedId);
        } else {
            console.error("❌ Extension: Early save failed", saveRes.status);
        }
      } catch (err) {
        console.error("❌ Extension: Save exception", err);
      }

      // Update State (Button enabled immediately)
      setData({ ...fullData, _id: savedId, isLearning: savedIsLearning })
      setLoading(false)

      // 3. Generate Image (Background)
      setLoadingImage(true)
      let imageUrl = null;

      try {
        const imgRes = await api.post("/api/image", {
            prompt: textData.visual_prompt,
            universe: textData.universe
        })
        const imgData = await imgRes.json()
        imageUrl = imgData.image || imgData.url;
      } catch (e) {
        console.warn("⚠️ Extension: Image generation failed", e)
      } finally {
        setLoadingImage(false)
      }

      if (imageUrl) {
        // Update Local State with Image
        setData(prev => prev ? ({ ...prev, imageUrl }) : null)
        
        // 4. Update DB with Image (if we have an ID)
        if (savedId) {
            console.log("💾 Extension: Patching DB with Image...");
            await api.post("/api/history/update", {
                _id: savedId,
                imageUrl
            })
        }
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong")
      setLoading(false)
      setLoadingImage(false)
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    setData(null)
    setError("")
  }

  // Handle Escape Key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen && e.key === "Escape") {
        handleClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[99999] font-sans text-base flex items-start justify-end p-8 pointer-events-none">
      {/* BACKDROP - Intercepts clicks to close */}
      <div 
        className="absolute inset-0 pointer-events-auto" 
        onClick={handleClose}
      />
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.95 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="pointer-events-auto w-[400px] max-h-[90vh] overflow-y-auto rounded-2xl bg-zinc-950 border border-white/10 shadow-2xl relative z-10"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-zinc-950/80 backdrop-blur-md border-b border-white/5">
               <div className="flex items-center gap-2">
                 <div className="bg-emerald-500/10 p-1.5 rounded-lg">
                    <BookOpen size={16} className="text-emerald-500"/>
                 </div>
                 <span className="font-bold text-white tracking-tight">VocabulAI</span>
               </div>
               <Button variant="ghost" size="icon-sm" onClick={handleClose} className="text-zinc-400 hover:text-white rounded-full">
                 <X size={18} />
               </Button>
            </div>

            <div className="p-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                  <p className="text-zinc-500 text-sm animate-pulse">Consulting the archives...</p>
                </div>
              ) : error ? (
                error.includes("log in") ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
                    <div className="relative">
                      <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full" />
                      <div className="relative bg-zinc-900 border border-white/10 p-4 rounded-2xl shadow-xl">
                        <BookOpen size={32} className="text-emerald-400" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-2xl font-black text-white tracking-tight">VocabulAI</h3>
                      <p className="text-sm text-zinc-400 max-w-[200px] mx-auto leading-relaxed">
                        Unlock your personalized vocabulary universe.
                      </p>
                    </div>

                    <Button 
                      size="lg" 
                      className="w-full bg-white text-black hover:bg-zinc-200 rounded-full font-bold transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                      onClick={() => window.open("https://vocabulai.vercel.app/login", "_blank")}
                    >
                      Connect Account
                    </Button>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm text-center">
                    <p className="font-bold mb-2">Error</p>
                    <p>{error}</p>
                  </div>
                )
              ) : data ? (
                <WordCard data={data} loadingImage={loadingImage} compact={true} />
              ) : null}
            </div>

            {/* Footer */}
            <div className="p-4 bg-zinc-900/50 border-t border-white/5 space-y-4">
               {data && (
                 <button 
                   onClick={() => window.open(`https://vocabulai.vercel.app/word/${data.word}`, "_blank")}
                   className="w-full py-3 px-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/40 transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer"
                 >
                   <span className="text-[10px] font-black uppercase tracking-[0.2em]">Open in VocabulAI</span>
                   <ExternalLink size={12} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                 </button>
               )}
               <p className="text-[10px] text-zinc-600 text-center">
                 Generated by AI. Information may be inaccurate.
               </p>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
