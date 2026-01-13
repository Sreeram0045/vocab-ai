import { signOut, auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import Image from "next/image";

export default async function LoginButton() {
  const session = await auth();

  // Middleware ensures session exists, but we check just in case
  if (!session?.user) return null;

  return (
    <div className="flex items-center gap-4">
      {session.user.image && (
        <Image 
            src={session.user.image} 
            alt={session.user.name || "User"} 
            width={32}
            height={32}
            className="rounded-full border border-white/30"
        />
      )}
      <form
        action={async () => {
          "use server";
          await signOut();
        }}
      >
        <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-transparent cursor-pointer">
          <LogOut size={16} />
        </Button>
      </form>
    </div>
  );
}