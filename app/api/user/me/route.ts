import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { auth } from "@/auth"; // <--- IMPORT FROM YOUR OWN auth.ts FILE

export async function GET(req: Request) {
    try {
        // 1. In v5, just call auth() to get the session
        const session = await auth();

        // 2. Security Check
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const email = session.user.email;

        await connectDB();

        const user = await User.findOne({ email });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            email: user.email,
            preferences: user.preferences
        });

    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}