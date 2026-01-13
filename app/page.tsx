
import LoginButton from "@/components/auth/login-button";
import VocabClient from "@/components/vocab-client";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col items-center overflow-x-hidden">
      
      {/* STICKY HEADER - Server Rendered */}
      <div className="sticky top-0 z-50 w-full backdrop-blur-md bg-background/50 border-b border-white/20 py-6 flex justify-center transition-all duration-500">
        <div className="max-w-5xl w-full px-6 md:px-12 flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2 select-none text-white/90">
            VocabAI <span className="text-white/40 font-light">2.0</span>
          </h1>
          
          <LoginButton />
        </div>
      </div>

      {/* CLIENT LOGIC */}
      <VocabClient />
      
    </div>
  );
}
