import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnLogin = nextUrl.pathname.startsWith("/login");

      if (isOnLogin) {
        if (isLoggedIn) return Response.redirect(new URL("/", nextUrl));
        return true;
      }

      // Protect all other routes
      if (isLoggedIn) return true;
      return false;
    },
  },
  providers: [], // Providers are added in auth.ts
  secret: process.env.AUTH_SECRET,
} satisfies NextAuthConfig;
