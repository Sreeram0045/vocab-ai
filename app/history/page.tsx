import { auth } from "@/auth";
import connectDB from "@/lib/db";
import WordHistory from "@/models/WordHistory";
import { redirect } from "next/navigation";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "History | VocabulAI",
  description: "Your personal vocabulary library.",
};

export default async function HistoryPage(props: {
  searchParams: Promise<{ page?: string }>;
}) {
  const searchParams = await props.searchParams;
  const page = Number(searchParams?.page) || 1;
  const limit = 12;
  const skip = (page - 1) * limit;

  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }

  await connectDB();

  // Fetch total count for pagination
  const totalItems = await WordHistory.countDocuments({ userId: session.user.id });
  const totalPages = Math.ceil(totalItems / limit);

  // Fetch paginated history items, sorted by newest first
  const historyItems = await WordHistory.find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return (
    <div className="min-h-screen bg-background text-foreground w-full flex flex-col items-center">
      <div className="max-w-5xl w-full px-6 md:px-12 py-16 md:py-24">
        
        {/* Header */}
        <div className="w-full mb-16 flex items-center justify-between">
          <div className="space-y-4">
            <Link 
              href="/" 
              className="inline-flex items-center text-sm text-zinc-500 hover:text-white transition-colors mb-4 group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Search
            </Link>
            <h1 className="text-6xl md:text-7xl font-black tracking-tighter text-white">Library</h1>
            <p className="text-zinc-500 text-2xl font-light max-w-2xl leading-relaxed">
              Your collection of <span className="text-white font-medium">{totalItems}</span> curated words, mastered through the lens of cinema.
            </p>
          </div>
        </div>

        {/* Grid */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-12 gap-y-20">
        {historyItems.map((item: any) => (
          <Link 
            key={item._id} 
            href={`/word/${encodeURIComponent(item.word)}`}
            className="group flex flex-col gap-4 cursor-pointer"
          >
            {/* Image Card */}
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-zinc-900 border border-white/10 group-hover:border-white/30 transition-all duration-500 shadow-sm group-hover:shadow-md">
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
                <Badge className="bg-black/60 backdrop-blur-md text-white border-white/10 hover:bg-black/80 font-normal">
                  {item.context}
                </Badge>
              </div>
            </div>

            {/* Content Below */}
            <div className="flex flex-col gap-2 px-1 min-w-0">
               <div className="flex flex-col gap-1">
                 <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider line-clamp-1">
                    {item.universe}
                 </span>
                 <h3 
                   className="text-3xl font-black text-white tracking-tight capitalize group-hover:text-emerald-400 transition-colors truncate block w-full"
                   title={item.word}
                 >
                    {item.word}
                 </h3>
               </div>
               <p className="text-zinc-400 text-sm line-clamp-2 font-light leading-relaxed h-10">
                 {item.meaning}
               </p>
            </div>
          </Link>
        ))}
        </div>

        {historyItems.length === 0 ? (
          <div className="text-center py-20 animate-in fade-in zoom-in duration-500">
            <p className="text-zinc-500 text-xl">No words found yet.</p>
            <Link href="/">
              <Button className="mt-4" variant="secondary">Start Learning</Button>
            </Link>
          </div>
        ) : (
          /* Pagination */
          <div className="mt-32 flex justify-between items-center border-t border-zinc-800 pt-10 w-full">
            <Button
              variant="ghost"
              disabled={page <= 1}
              className="text-zinc-400 hover:text-white pl-0 hover:bg-transparent"
              asChild={page > 1}
            >
              {page > 1 ? (
                <Link href={`/history?page=${page - 1}`}>
                   <ArrowLeft className="w-5 h-5 mr-2" /> Previous
                </Link>
              ) : (
                <span>
                   <ArrowLeft className="w-5 h-5 mr-2" /> Previous
                </span>
              )}
            </Button>
            
            <span className="text-zinc-600 text-sm font-mono tracking-widest uppercase">
              Page {page} / {totalPages}
            </span>

            <Button
              variant="ghost"
              disabled={page >= totalPages}
              className="text-zinc-400 hover:text-white pr-0 hover:bg-transparent"
              asChild={page < totalPages}
            >
              {page < totalPages ? (
                <Link href={`/history?page=${page + 1}`}>
                   Next <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              ) : (
                 <span>
                   Next <ArrowRight className="w-5 h-5 ml-2" />
                 </span>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}