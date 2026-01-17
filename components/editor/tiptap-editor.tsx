import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { VocabularyMatcher } from './extensions/vocabulary-matcher'
import { useEffect, useState, useRef } from 'react'
import { Bold, Italic, List, ListOrdered, Quote, Heading1 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TiptapEditorProps {
  initialContent?: string
  vocabularyWords?: string[]
  onSave?: (content: string) => void
}

export default function TiptapEditor({
  initialContent = "",
  vocabularyWords = [],
  onSave
}: TiptapEditorProps) {
  const [isSaving, setIsSaving] = useState(false)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

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
        words: vocabularyWords,
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[300px] py-4 text-white/90 leading-relaxed',
      },
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
    if (editor && vocabularyWords.length > 0) {
      const extension = editor.extensionManager.extensions.find(ext => ext.name === 'vocabularyMatcher');
      if (extension) {
        // @ts-ignore - Direct option mutation for runtime update
        extension.options.words = vocabularyWords;
        
        // Force a re-render of decorations
        editor.view.dispatch(editor.state.tr);
      }
    }
  }, [vocabularyWords, editor])

  // Update content if initialContent changes (e.g. after fetch)
  useEffect(() => {
    if (editor && initialContent && editor.getHTML() !== initialContent) {
        // Only update if the content is actually different to avoid cursor jumps
        // Ideally we check if the editor is empty or if this is the first load
        if (editor.getText().trim() === "" || !editor.isFocused) {
             editor.commands.setContent(initialContent)
        }
    }
  }, [initialContent, editor])

  if (!editor) return null

  return (
    <div className="relative w-full">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-2">
            <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={cn("p-2 rounded-md hover:bg-white/5 border border-white/5", editor.isActive('bold') && "bg-white/10 text-emerald-400")}
            >
                <Bold size={18} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={cn("p-2 rounded-md hover:bg-white/5 border border-white/5", editor.isActive('italic') && "bg-white/10 text-emerald-400")}
            >
                <Italic size={18} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={cn("p-2 rounded-md hover:bg-white/5 border border-white/5", editor.isActive('heading', { level: 1 }) && "bg-white/10 text-emerald-400")}
            >
                <Heading1 size={18} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={cn("p-2 rounded-md hover:bg-white/5 border border-white/5", editor.isActive('bulletList') && "bg-white/10 text-emerald-400")}
            >
                <List size={18} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={cn("p-2 rounded-md hover:bg-white/5 border border-white/5", editor.isActive('orderedList') && "bg-white/10 text-emerald-400")}
            >
                <ListOrdered size={18} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={cn("p-2 rounded-md hover:bg-white/5 border border-white/5", editor.isActive('blockquote') && "bg-white/10 text-emerald-400")}
            >
                <Quote size={18} />
            </button>
        </div>
        
        {isSaving && (
            <span className="text-[10px] uppercase tracking-widest text-white/30 animate-pulse">
                Saving changes...
            </span>
        )}
      </div>

      <EditorContent editor={editor} />

      <style jsx global>{`
        .prose h1 { @apply text-3xl font-bold mb-4 mt-8 text-white/95; }
        .prose h2 { @apply text-2xl font-semibold mb-3 mt-6 text-white/90; }
        .prose p { @apply mb-4; }
        .prose blockquote { @apply border-l-2 border-emerald-500/50 pl-4 italic text-white/60 my-6; }
        .prose ul { @apply list-disc list-inside mb-4 space-y-2; }
        .prose ol { @apply list-decimal list-inside mb-4 space-y-2; }
      `}</style>
    </div>
  )
}
