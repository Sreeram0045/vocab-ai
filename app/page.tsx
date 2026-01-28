
import { auth } from "@/auth";
import VocabClient from "@/components/vocab-client";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col items-center overflow-x-hidden">
      <VocabClient user={session?.user} />
    </div>
  );
}
