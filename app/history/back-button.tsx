"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useTransition } from "react";

export default function BackButton({ href = "/", label = "Back to Search" }: { href?: string, label?: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    startTransition(() => {
      router.push(href);
    });
  };

  return (
    <button 
      onClick={handleBack}
      disabled={isPending}
      className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 group cursor-pointer disabled:opacity-50"
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
      )}
      {label}
    </button>
  );
}
