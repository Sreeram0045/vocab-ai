import { signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe } from "lucide-react";
import ClearIntroState from "@/components/auth/clear-intro-state";

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <ClearIntroState />
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />
      
      <Card className="w-full max-w-sm bg-black/40 backdrop-blur-xl border-white/10 text-white shadow-2xl relative z-10 transition-all duration-500 hover:border-white/20">
        <CardHeader className="text-center space-y-3 pb-8">
          <div className="mx-auto w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 mb-2 shadow-inner">
            <Globe className="w-6 h-6 text-white/80" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-white/90">
            VocabulAI
          </CardTitle>
          <CardDescription className="text-white/40 text-sm">
            Sign in to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/" });
            }}
          >
            <Button 
              variant="outline" 
              className="w-full h-11 bg-white/5 border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all duration-300 font-medium tracking-wide cursor-pointer"
            >
              Sign in with Google
            </Button>
          </form>
        </CardContent>
      </Card>
      
        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-zinc-600">
            &copy; {new Date().getFullYear()} VocabulAI. All rights reserved.
          </p>
        </div>
    </div>
  );
}