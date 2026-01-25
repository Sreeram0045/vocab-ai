
import LoginButton from "@/components/auth/login-button";
import VocabClient from "@/components/vocab-client";
import { History } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col items-center overflow-x-hidden">
      
      {/* STICKY HEADER - Server Rendered */}
      <div className="w-full max-w-5xl px-6 md:px-12 py-8 flex justify-center sticky top-0 z-50">
        <nav className="flex justify-between items-center w-full animate-in fade-in slide-in-from-top-4 duration-700 backdrop-blur-md bg-black/40 p-4 rounded-full border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/" className="flex items-center gap-1 select-none pl-2 cursor-pointer hover:opacity-80 transition-opacity">
            <span className="text-xl font-black tracking-tighter text-white">
              Vocabul
            </span>
            <span className="text-xl font-medium tracking-tight text-white/90">
              AI
            </span>
          </a>
          <div className="flex gap-3 items-center">
            <Link href="/history">
              <Button variant="ghost" size="icon" className="rounded-full w-10 h-10 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer">
                <History className="w-5 h-5" />
              </Button>
            </Link>
            <LoginButton />
          </div>
        </nav>
      </div>


      {/* CLIENT LOGIC */}
      <VocabClient />
      
    </div>
  );
}
