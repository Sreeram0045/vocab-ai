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

import HistoryPagination from "./history-pagination";
import BackButton from "./back-button";

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
            <BackButton />
            <h1 className="text-6xl md:text-7xl font-black tracking-tighter text-foreground">Library</h1>
            <p className="text-muted-foreground text-2xl font-light max-w-2xl leading-relaxed">
              Your collection of <span className="text-foreground font-medium">{totalItems}</span> curated words, mastered through the lens of cinema.
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
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-muted border border-border group-hover:border-border/80 transition-all duration-500 shadow-sm group-hover:shadow-md">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.visual_prompt || item.word}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : (
                <div className="absolute inset-0 bg-muted flex items-center justify-center">
                   <span className="text-muted-foreground font-mono text-xs uppercase tracking-widest">No Visual</span>
                </div>
              )}
              
              {/* Context Badge on Image */}
              <div className="absolute top-3 left-3">
                <Badge className="bg-background/60 backdrop-blur-md text-foreground border-border hover:bg-background/80 font-normal">
                  {item.context}
                </Badge>
              </div>
            </div>

            {/* Content Below */}
            <div className="flex flex-col gap-2 px-1 min-w-0">
               <div className="flex flex-col gap-1">
                 <span className="text-xs font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-wider line-clamp-1">
                    {item.universe}
                 </span>
                 <h3 
                   className="text-3xl font-black text-foreground tracking-tight capitalize group-hover:text-emerald-500 transition-colors truncate block w-full"
                   title={item.word}
                 >
                    {item.word}
                 </h3>
               </div>
               <p className="text-muted-foreground text-sm line-clamp-2 font-light leading-relaxed h-10">
                 {item.meaning}
               </p>
            </div>
          </Link>
        ))}
        </div>

        {historyItems.length === 0 ? (
          <div className="text-center py-20 animate-in fade-in zoom-in duration-500">
            <p className="text-muted-foreground text-xl">No words found yet.</p>
            <Link href="/">
              <Button className="mt-4" variant="secondary">Start Learning</Button>
            </Link>
          </div>
        ) : (
          /* Pagination */
          <HistoryPagination currentPage={page} totalPages={totalPages} />
        )}
      </div>
    </div>
  );
}