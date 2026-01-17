import { auth } from "@/auth";
import connectDB from "@/lib/db";
import WordHistory from "@/models/WordHistory";
import { redirect } from "next/navigation";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, Calendar } from "lucide-react";

export const metadata = {
  title: "History | VocabAI",
  description: "Your personal vocabulary library.",
};

export default async function HistoryPage() {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }

  await connectDB();

  // Fetch all history items, sorted by newest first
  const historyItems = await WordHistory.find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div className="min-h-screen bg-background text-foreground w-full flex flex-col items-center">
      <div className="max-w-5xl w-full px-6 md:px-12 py-16 md:py-24">
        
        {/* Header */}
        <div className="w-full mb-16 flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="space-y-4">
            <Link 
              href="/" 
              className="inline-flex items-center text-sm text-zinc-500 hover:text-white transition-colors mb-4 group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Search
            </Link>
            <h1 className="text-6xl md:text-7xl font-black tracking-tighter text-white">Library</h1>
            <p className="text-zinc-500 text-2xl font-light max-w-2xl leading-relaxed">
              Your collection of {historyItems.length} curated words, mastered through the lens of cinema.
            </p>
          </div>
        </div>

        {/* Grid */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-12 gap-y-20 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
        {historyItems.map((item: any) => (
          <Link 
            key={item._id} 
            href={`/word/${encodeURIComponent(item.word)}`}
            className="group flex flex-col gap-3 cursor-pointer"
          >
            {/* Image Card */}
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-zinc-900 border border-white/10 group-hover:border-white/30 transition-all duration-500">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.visual_prompt || item.word}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : (
                <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center">
                   <span className="text-zinc-700 font-mono text-xs uppercase tracking-widest">No Visual</span>
                </div>
              )}
              
              {/* Context Badge on Image */}
              <div className="absolute top-3 left-3">
                <Badge className="bg-black/60 backdrop-blur-md text-white border-white/10 hover:bg-black/80">
                  {item.context}
                </Badge>
              </div>
            </div>

            {/* Content Below */}
            <div className="space-y-1 px-1">
               <div className="flex justify-between items-start text-balance">
                 <h3 className="text-2xl font-bold text-white tracking-tight capitalize group-hover:text-emerald-400 transition-colors">
                    {item.word}
                 </h3>
                 <span className="text-[10px] text-zinc-500 font-mono pt-1.5 uppercase tracking-wider shrink-0">
                    {item.universe}
                 </span>
               </div>
               <p className="text-zinc-400 text-sm line-clamp-2 font-light leading-relaxed">
                 {item.meaning}
               </p>
            </div>
          </Link>
        ))}
        </div>

        {historyItems.length === 0 && (
          <div className="text-center py-20 animate-in fade-in zoom-in duration-500">
            <p className="text-zinc-500 text-xl">No words found yet.</p>
            <Link href="/">
              <Button className="mt-4" variant="secondary">Start Learning</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}