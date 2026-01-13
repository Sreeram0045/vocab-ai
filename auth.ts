import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [Google],
  secret: process.env.AUTH_SECRET,
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const { email, name, image } = user;
          await connectDB();
          
          const existingUser = await User.findOne({ email });

          if (!existingUser) {
            await User.create({
              name,
              email,
              image,
            });
          }
          return true;
        } catch (error) {
          console.error("Error saving user to DB", error);
          return false;
        }
      }
      return true;
    },
    async session({ session }) {
        return session;
    }
  },
});