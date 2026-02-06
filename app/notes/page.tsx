import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Note from "@/models/Note";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import BackButton from "@/app/history/back-button"; // Reusing the back button
import { Plus, FileText, Calendar, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Writer's Room | VocabulAI",
  description: "Draft scenes, scripts, and journals using your vocabulary.",
};

export default async function NotesPage() {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }

  await connectDB();

  // Fetch all notes
  const notes = await Note.find({ userId: session.user.id })
    .sort({ updatedAt: -1 })
    .lean();

  return (
    <div className="min-h-screen bg-background text-foreground w-full flex flex-col items-center">
      <div className="max-w-5xl w-full px-6 md:px-12 py-16 md:py-24">
        
        {/* Header */}
        <div className="w-full mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <BackButton />
            <h1 className="text-6xl md:text-7xl font-black tracking-tighter text-foreground">Writer&apos;s Room</h1>
            <p className="text-muted-foreground text-2xl font-light max-w-2xl leading-relaxed">
              Your creative sandbox. Draft scenes, scripts, and journals.
            </p>
          </div>
        </div>

        {/* Grid */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Create New Card (Visual) */}
            <CreateNoteCard />

            {notes.map((note: any) => (
            <Link 
                key={note._id} 
                href={`/notes/${note._id}`}
                className="group relative flex flex-col justify-between p-8 rounded-3xl bg-card/40 border border-border hover:border-border/80 hover:bg-card/60 transition-all duration-500 aspect-[4/3] backdrop-blur-md shadow-lg hover:shadow-2xl overflow-hidden"
            >
                {/* Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-foreground/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                <div className="space-y-6 z-10">
                    <div className="flex items-center justify-between">
                        <div className="p-2.5 rounded-xl bg-foreground/5 text-muted-foreground group-hover:text-emerald-500 group-hover:bg-emerald-500/10 transition-colors duration-500">
                            <FileText size={20} />
                        </div>
                        {note.tags && note.tags.length > 0 && (
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest border border-border px-2 py-1 rounded-full">{note.tags[0]}</span>
                        )}
                    </div>
                    
                    <div className="space-y-3">
                      <h3 className="text-xl font-bold text-foreground/90 group-hover:text-foreground transition-colors line-clamp-1 tracking-tight">
                          {note.title || "Untitled Note"}
                      </h3>
                      
                      <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed font-serif italic opacity-70 group-hover:opacity-100 transition-opacity">
                          {/* Strip HTML simply for preview */}
                          {note.content?.replace(/<[^>]*>?/gm, '') || "Empty note..."}
                      </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono pt-6 border-t border-border uppercase tracking-widest group-hover:text-muted-foreground transition-colors z-10">
                    <Clock size={10} />
                    <span>Edited {new Date(note.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                </div>
            </Link>
            ))}
        </div>

        {notes.length === 0 && (
             <div className="text-center py-20 animate-in fade-in zoom-in duration-500">
                <p className="text-zinc-500 text-xl">The room is empty. Start writing.</p>
             </div>
        )}
      </div>
    </div>
  );
}

// Client Components (Inline for simplicity in this file, though usually separate)

import CreateNoteCard from "./create-note-card";
