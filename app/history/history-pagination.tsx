"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useTransition } from "react";

interface HistoryPaginationProps {
  currentPage: number;
  totalPages: number;
}

export default function HistoryPagination({ currentPage, totalPages }: HistoryPaginationProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handlePrev = () => {
    if (currentPage > 1) {
      startTransition(() => {
        router.push(`/history?page=${currentPage - 1}`);
        router.refresh(); // Ensure data is re-fetched
      });
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      startTransition(() => {
        router.push(`/history?page=${currentPage + 1}`);
        router.refresh(); // Ensure data is re-fetched
      });
    }
  };

  return (
    <div className="mt-32 flex justify-between items-center border-t border-zinc-800 pt-10 w-full">
      <Button
        variant="ghost"
        disabled={currentPage <= 1 || isPending}
        className="text-zinc-400 hover:text-white pl-0 hover:bg-transparent disabled:opacity-50 cursor-pointer"
        onClick={handlePrev}
      >
        {isPending ? (
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
        ) : (
          <ArrowLeft className="w-5 h-5 mr-2" />
        )}
        Previous
      </Button>

      <span className="text-zinc-600 text-sm font-mono tracking-widest uppercase">
        Page {currentPage} / {totalPages}
      </span>

      <Button
        variant="ghost"
        disabled={currentPage >= totalPages || isPending}
        className="text-zinc-400 hover:text-white pr-0 hover:bg-transparent disabled:opacity-50 cursor-pointer"
        onClick={handleNext}
      >
        Next
        {isPending ? (
          <Loader2 className="w-5 h-5 ml-2 animate-spin" />
        ) : (
          <ArrowRight className="w-5 h-5 ml-2" />
        )}
      </Button>
    </div>
  );
}
