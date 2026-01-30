import cssText from "data-text:~/style.css"
import type { PlasmoCSConfig } from "plasmo"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Sparkles, Loader2, BookOpen } from "lucide-react"

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
      // 1. Check History
      const historyRes = await api.get(`/api/history/check?word=${encodeURIComponent(searchWord)}`)
      if (historyRes.ok) {
        const historyData = await historyRes.json()
        if (historyData) {
          // Ensure word is set, even if DB record is weird
          setData({ ...historyData, word: historyData.word || searchWord })
          setLoading(false)
          return
        }
      }

      // 2. Generate Text
      const textRes = await api.post("/api/generate", { word: searchWord })
      if (!textRes.ok) {
        if (textRes.status === 401) throw new Error("Please log in to VocabAI")
        throw new Error("Failed to generate definition")
      }
      const textData = await textRes.json()
      
      const fullData = { ...textData, word: searchWord }
      setData(fullData)
      setLoading(false)

      // 3. Generate Image (Background)
      setLoadingImage(true)
      const imgRes = await api.post("/api/image", {
        prompt: textData.visual_prompt,
        universe: textData.universe
      })
      const imgData = await imgRes.json()

      if (imgData.image) {
        const dataWithImage = { ...fullData, imageUrl: imgData.image }
        setData(dataWithImage)
        
        // 4. Save
        await api.post("/api/history/save", dataWithImage)
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong")
    } finally {
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
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm text-center">
                  <p className="font-bold mb-2">Error</p>
                  <p>{error}</p>
                  {error.includes("log in") && (
                     <Button 
                       variant="outline" 
                       size="sm" 
                       className="mt-4 w-full bg-red-950/30 border-red-800/30 hover:bg-red-900/50"
                       onClick={() => window.open("http://localhost:3000/login", "_blank")}
                     >
                       Log In
                     </Button>
                  )}
                </div>
              ) : data ? (
                <WordCard data={data} loadingImage={loadingImage} compact={true} />
              ) : null}
            </div>

            {/* Footer */}
            <div className="p-3 bg-zinc-900/50 border-t border-white/5 text-center">
               <p className="text-[10px] text-zinc-600">
                 Generated by AI. Information may be inaccurate.
               </p>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
