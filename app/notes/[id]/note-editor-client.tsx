"use client";

import { useState, useEffect, useRef } from "react";
// Link is no longer needed for the back button, but might be used elsewhere? 
// Checking imports... Link was only used for the back button.
import { Save, Trash2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import TiptapEditor from "@/components/editor/tiptap-editor";
import { useRouter } from "next/navigation";
import BackButton from "@/app/history/back-button";

interface NoteEditorClientProps {
  note: any;
  vocabulary: any[];
}

export default function NoteEditorClient({ note, vocabulary }: NoteEditorClientProps) {
  const router = useRouter();
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(new Date(note.updatedAt));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const saveNote = async (newContent?: string, newTitle?: string) => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/notes/${note._id}`, {
        method: "PUT",
        body: JSON.stringify({
          title: newTitle !== undefined ? newTitle : title,
          content: newContent !== undefined ? newContent : content
        }),
      });
      
      if (res.ok) {
        setLastSaved(new Date());
      }
    } catch (err) {
      console.error("Failed to save", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this note?")) return;
    
    try {
      await fetch(`/api/notes/${note._id}`, { method: "DELETE" });
      router.push("/notes");
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  // Debounce title save
  useEffect(() => {
    const timer = setTimeout(() => {
      if (title !== note.title) {
        saveNote(undefined, title);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [title]);

  return (
    <div className="flex flex-col h-screen max-w-5xl mx-auto w-full p-6 md:p-12">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex flex-col gap-4">
             <BackButton href="/notes" label="Back to Room" />
        </div>

        <div className="flex items-center gap-4 pt-1">
             <span className="text-xs text-muted-foreground/60 font-mono hidden md:inline-block">
                {isSaving ? "Saving..." : (mounted && lastSaved ? `Last saved ${lastSaved.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : "")}
             </span>
             
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                        <MoreHorizontal size={20} />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-card border-border">
                    <DropdownMenuItem onClick={handleDelete} className="text-destructive dark:text-red-400 focus:text-destructive dark:focus:text-red-300 focus:bg-destructive/10 dark:focus:bg-red-950/20 cursor-pointer p-2.5">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete Note
                    </DropdownMenuItem>
                </DropdownMenuContent>
             </DropdownMenu>
        </div>
      </div>

      {/* Title Input */}
      <div className="mb-8">
        <Input 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-5xl md:text-6xl font-black bg-transparent border-none p-0 focus-visible:ring-0 placeholder:text-muted-foreground/30 h-auto text-foreground"
            placeholder="Untitled Note"
        />
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto pb-20">
        <TiptapEditor 
            initialContent={content}
            vocabulary={vocabulary}
            onSave={(html) => {
                setContent(html);
                saveNote(html, undefined);
            }}
        />
      </div>
    </div>
  );
}
