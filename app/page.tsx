import { auth } from "@/auth";
import VocabClient from "@/components/vocab-client";
import WelcomeScreen from "@/components/intro/welcome-screen";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col items-center overflow-x-hidden">
      <WelcomeScreen />
      <VocabClient user={session?.user} />
    </div>
  );
}