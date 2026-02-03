import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import WordHistory from "@/models/WordHistory";
import { auth } from "@/auth";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { _id, imageUrl } = await req.json();
        
        console.log(`📝 Update Request for ID: ${_id}, Image: ${imageUrl ? "Yes" : "No"}`);

        if (!_id || !imageUrl) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await connectDB();

        // Update the record
        const updatedRecord = await WordHistory.findOneAndUpdate(
            { _id: _id, userId: session.user.id }, // Ensure user owns the record
            { imageUrl: imageUrl },
            { new: true } // Return updated doc
        );

        if (!updatedRecord) {
            return NextResponse.json({ error: "Record not found" }, { status: 404 });
        }

        return NextResponse.json(updatedRecord);

    } catch (error) {
        console.error("Update History Error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}