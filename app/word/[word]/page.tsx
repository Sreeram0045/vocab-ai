import { auth } from "@/auth";
import connectDB from "@/lib/db";
import WordHistory from "@/models/WordHistory";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import WordCard from "@/components/word-card";

interface WordPageProps {
  params: Promise<{
    word: string;
  }>;
}

export default async function WordPage({ params }: WordPageProps) {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }

  const { word } = await params;
  const decodedWord = decodeURIComponent(word).toLowerCase();

  await connectDB();

  const wordData = await WordHistory.findOne({
    userId: session.user.id,
    word: decodedWord,
  }).lean();

  if (!wordData) {
    notFound();
  }

  // Cast lean document to VocabData type (lean returns a plain object)
  const data = JSON.parse(JSON.stringify(wordData));

  return (
    <div className="min-h-screen bg-background text-foreground w-full flex flex-col items-center">
      <div className="max-w-5xl w-full px-6 md:px-12 py-16 md:py-24 space-y-12">
        
        {/* Navigation */}
        <div className="animate-in fade-in slide-in-from-left-4 duration-700">
          <Link 
            href="/history" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> 
            Back to Library
          </Link>
        </div>

        {/* Word Display */}
        <WordCard data={data} />
        
      </div>
    </div>
  );
}
