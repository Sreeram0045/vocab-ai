"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CreateNoteCard() {
  const router = useRouter();

  const handleCreate = async () => {
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        body: JSON.stringify({ title: "Untitled Note", content: "" }),
      });
      if (res.ok) {
        const newNote = await res.json();
        router.push(`/notes/${newNote._id}`);
      }
    } catch (err) {
      console.error("Failed to create note", err);
    }
  };

  return (
    <button 
        onClick={handleCreate}
        className="group flex flex-col items-center justify-center gap-4 p-8 rounded-3xl bg-zinc-900/40 border border-white/20 hover:border-emerald-500/40 hover:bg-zinc-900 hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.1)] transition-all duration-500 aspect-[4/3] cursor-pointer"
    >
        <div className="p-4 rounded-full bg-white/5 text-zinc-400 group-hover:bg-emerald-500/10 group-hover:text-emerald-400 group-hover:scale-110 transition-all duration-500">
            <Plus size={32} />
        </div>
        <span className="text-zinc-400 font-medium tracking-wide group-hover:text-emerald-400/90 transition-colors uppercase text-xs letter-spacing-2">Create New Note</span>
    </button>
  );
}
