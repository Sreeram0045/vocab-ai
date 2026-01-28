import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Note from "@/models/Note";

// GET /api/notes - List all notes for the user
export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Fetch notes, sorted by most recently updated
    const notes = await Note.find({ userId: session.user.id })
      .select("title content updatedAt createdAt")
      .sort({ updatedAt: -1 });

    return NextResponse.json(notes);
  } catch (error: any) {
    console.error("Error fetching notes:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/notes - Create a new note
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, content } = await req.json();

    await connectDB();

    const newNote = await Note.create({
      userId: session.user.id,
      title: title || "Untitled Note",
      content: content || "",
    });

    return NextResponse.json(newNote);
  } catch (error: any) {
    console.error("Error creating note:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}