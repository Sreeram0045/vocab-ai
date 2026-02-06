import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { VocabularyMatcher } from './extensions/vocabulary-matcher'
import { useEffect, useState, useRef } from 'react'
import { Bold, Italic, List, ListOrdered, Quote, Heading1 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'

interface VocabularyItem {
  word: string;
  meaning: string;
  universe: string;
}

interface TiptapEditorProps {
  initialContent?: string
  vocabulary?: VocabularyItem[]
  onSave?: (content: string) => void
}

export default function TiptapEditor({
  initialContent = "",
  vocabulary = [],
  onSave
}: TiptapEditorProps) {
  const [isSaving, setIsSaving] = useState(false)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const { theme, resolvedTheme } = useTheme()
  const currentTheme = resolvedTheme || theme
  
  // Tooltip State
  const [hoveredWord, setHoveredWord] = useState<{
    word: string;
    meaning: string;
    universe: string;
    x: number;
    y: number;
    height: number;
  } | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      VocabularyMatcher.configure({
        words: vocabulary,
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: cn(
          'prose max-w-none focus:outline-none min-h-[300px] py-4 leading-relaxed transition-colors duration-300',
          currentTheme === 'dark' ? 'prose-invert text-foreground/90' : 'text-foreground/90'
        ),
      },
      handleDOMEvents: {
        mouseover: (view, event) => {
          const target = (event.target as HTMLElement).closest('[data-meaning]') as HTMLElement;
          if (target) {
            const rect = target.getBoundingClientRect();
            setHoveredWord({
              word: target.getAttribute('data-word') || '',
              meaning: target.getAttribute('data-meaning') || '',
              universe: target.getAttribute('data-universe') || '',
              x: rect.left + (rect.width / 2),
              y: rect.top,
              height: rect.height
            });
          }
          return false;
        },
        mouseout: (view, event) => {
           const target = (event.target as HTMLElement).closest('[data-meaning]') as HTMLElement;
           if (target) {
             setHoveredWord(null);
           }
           return false;
        }
      }
    },
    onUpdate: ({ editor }) => {
      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }

      setIsSaving(true) // Indicate pending save

      // Set new timeout (Debounce 1.5s)
      saveTimeoutRef.current = setTimeout(() => {
        const html = editor.getHTML()
        onSave?.(html)
        setIsSaving(false) // Save complete
      }, 1500)
    },
  })

  // Update vocabulary words dynamically
  useEffect(() => {
    if (editor && vocabulary.length > 0) {
      // Use transaction meta to update the plugin state
      editor.view.dispatch(editor.state.tr.setMeta('setVocabulary', vocabulary));
    }
  }, [vocabulary, editor])

  // Update content if initialContent changes
  useEffect(() => {
    if (editor && initialContent && editor.getHTML() !== initialContent) {
        if (editor.getText().trim() === "" || !editor.isFocused) {
             editor.commands.setContent(initialContent)
        }
    }
  }, [initialContent, editor])

  if (!editor) return null

  return (
    <div className="relative w-full" ref={wrapperRef}>
      
      {/* Tooltip Overlay */}
      {hoveredWord && (
        <div 
          className="fixed z-[9999] w-64 p-4 bg-card/95 border border-emerald-500/30 rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.2)] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200 pointer-events-none"
          style={{ 
            top: hoveredWord.y - 12, // slightly above the word
            left: hoveredWord.x, 
            transform: 'translate(-50%, -100%)' 
          }}
        >
           <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-card border-b border-r border-emerald-500/30 rotate-45"></div>
           
           <div className="flex items-center gap-2 mb-2 border-b border-border pb-2">
             <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                {hoveredWord.universe}
             </span>
           </div>
           
           <h4 className="text-xl font-bold text-foreground mb-1 capitalize">
             {hoveredWord.word}
           </h4>
           <p className="text-sm text-muted-foreground leading-relaxed font-light">
             {hoveredWord.meaning}
           </p>
        </div>
      )}

      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-2">
            <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={cn("p-2 rounded-md hover:bg-foreground/5 border border-border/50", editor.isActive('bold') && "bg-foreground/10 text-emerald-600 dark:text-emerald-400")}
            >
                <Bold size={18} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={cn("p-2 rounded-md hover:bg-foreground/5 border border-border/50", editor.isActive('italic') && "bg-foreground/10 text-emerald-600 dark:text-emerald-400")}
            >
                <Italic size={18} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={cn("p-2 rounded-md hover:bg-foreground/5 border border-border/50", editor.isActive('heading', { level: 1 }) && "bg-foreground/10 text-emerald-600 dark:text-emerald-400")}
            >
                <Heading1 size={18} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={cn("p-2 rounded-md hover:bg-foreground/5 border border-border/50", editor.isActive('bulletList') && "bg-foreground/10 text-emerald-600 dark:text-emerald-400")}
            >
                <List size={18} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={cn("p-2 rounded-md hover:bg-foreground/5 border border-border/50", editor.isActive('orderedList') && "bg-foreground/10 text-emerald-600 dark:text-emerald-400")}
            >
                <ListOrdered size={18} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={cn("p-2 rounded-md hover:bg-foreground/5 border border-border/50", editor.isActive('blockquote') && "bg-foreground/10 text-emerald-600 dark:text-emerald-400")}
            >
                <Quote size={18} />
            </button>
        </div>
        
        {isSaving && (
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground/50 animate-pulse">
                Saving changes...
            </span>
        )}
      </div>

      <EditorContent editor={editor} />

      <style jsx global>{`
        .prose h1 { @apply text-3xl font-bold mb-4 mt-8 text-foreground; }
        .prose h2 { @apply text-2xl font-semibold mb-3 mt-6 text-foreground/90; }
        .prose p { @apply mb-4; }
        .prose blockquote { @apply border-l-2 border-emerald-500/50 pl-4 italic text-muted-foreground my-6; }
        .prose ul { @apply list-disc list-inside mb-4 space-y-2; }
        .prose ol { @apply list-decimal list-inside mb-4 space-y-2; }
      `}</style>
    </div>
  )
}
