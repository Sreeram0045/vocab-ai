import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Note from "@/models/Note";
import WordHistory from "@/models/WordHistory";
import { redirect } from "next/navigation";
import NoteEditorClient from "./note-editor-client";

export const dynamic = "force-dynamic";

export default async function NotePage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }

  await connectDB();

  const note = await Note.findOne({ _id: params.id, userId: session.user.id }).lean();

  if (!note) {
    redirect("/notes");
  }

  // Fetch vocabulary for the matcher
  // We explicitly fetch ALL words to enable the "Hover Context"
  const vocabulary = await WordHistory.find({ userId: session.user.id })
    .select("word meaning universe")
    .lean();

  // Transform vocabulary into the format expected by the client (strings or objects)
  // For now, let's pass the full objects so we can upgrade the matcher.
  // We need to serialize the _id
  const serializedVocab = vocabulary.map((v: any) => ({
    word: v.word,
    meaning: v.meaning,
    universe: v.universe
  }));

  const serializedNote = {
      ...note,
      _id: note._id.toString(),
      userId: note.userId.toString(),
      createdAt: note.createdAt.toString(),
      updatedAt: note.updatedAt.toString()
  };

  return (
    <div className="min-h-screen bg-background text-foreground w-full flex flex-col">
      <NoteEditorClient note={serializedNote} vocabulary={serializedVocab} />
    </div>
  );
}
