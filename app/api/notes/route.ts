import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Note from "@/models/Note";
import User from "@/models/User";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Find the note for this user
    const note = await Note.findOne({ userId: session.user.id });

    if (!note) {
      // If no note exists, return empty content instead of error
      return NextResponse.json({ content: "" });
    }

    return NextResponse.json(note);
  } catch (error: any) {
    console.error("Error fetching note:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content, title } = await req.json();

    await connectDB();

    // Upsert the note for the user
    const note = await Note.findOneAndUpdate(
      { userId: session.user.id },
      { 
        content,
        title: title || "My Vocabulary Journal",
        userId: session.user.id
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json(note);
  } catch (error: any) {
    console.error("Error saving note:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
