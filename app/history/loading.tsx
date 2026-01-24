import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background text-foreground w-full flex flex-col items-center">
      <div className="max-w-5xl w-full px-6 md:px-12 py-16 md:py-24">
        
        {/* Header Skeleton */}
        <div className="w-full mb-16 flex items-center justify-between">
          <div className="space-y-4 w-full">
            <div className="inline-flex items-center text-sm text-zinc-500 mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Search
            </div>
            <Skeleton className="h-16 w-48 md:w-64 rounded-lg bg-zinc-800" />
            <Skeleton className="h-8 w-full max-w-2xl rounded-lg bg-zinc-800" />
          </div>
        </div>

        {/* Grid Skeleton */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-12 gap-y-20">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-4">
              {/* Image Card Skeleton */}
              <Skeleton className="aspect-[4/3] w-full rounded-2xl bg-zinc-800" />
              
              {/* Content Below Skeleton */}
              <div className="flex flex-col gap-2 px-1">
                 <div className="flex flex-col gap-2">
                   <Skeleton className="h-3 w-20 bg-zinc-800" /> {/* Universe Badge */}
                   <Skeleton className="h-8 w-3/4 bg-zinc-800" /> {/* Word Title */}
                 </div>
                 <div className="space-y-1 pt-1">
                    <Skeleton className="h-3 w-full bg-zinc-800" />
                    <Skeleton className="h-3 w-2/3 bg-zinc-800" />
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
