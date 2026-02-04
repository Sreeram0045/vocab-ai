import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function POST(req: Request) {
    try {
        const { email, shows } = await req.json();

        if (!email || !shows) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await connectDB();

        // The Magic Command: Find the user by email -> Update their shows
        const updatedUser = await User.findOneAndUpdate(
            { email: email }, // Filter
            {
                $set: {
                    "preferences.watchedShows": shows
                }
            },
            { new: true } // Return the updated document
        );

        if (!updatedUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            preferences: updatedUser.preferences
        });

    } catch (error: any) {
        console.error("Database Error:", error);
        return NextResponse.json({ error: "Failed to update preferences" }, { status: 500 });
    }
}