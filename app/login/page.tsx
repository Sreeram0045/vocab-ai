import { signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe } from "lucide-react";
import ClearIntroState from "@/components/auth/clear-intro-state";

export default function LoginPage() {

  return (

    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative overflow-hidden">

      <ClearIntroState />

      {/* Background glow effects - Dynamic */}

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-foreground/[0.03] rounded-full blur-3xl pointer-events-none" />

      

                              <Card className="w-full max-w-sm bg-card/40 backdrop-blur-2xl border-border text-foreground shadow-[0_30px_70px_-20px_rgba(0,0,0,0.1),0_15px_40px_-20px_rgba(0,0,0,0.05)] dark:shadow-none relative z-10 transition-all duration-500 hover:border-border/80">

      

                                <CardHeader className="text-center space-y-3 pb-8">

      

                                  <div className="mx-auto w-12 h-12 rounded-full bg-foreground/5 flex items-center justify-center border border-border mb-2 shadow-inner">

      

                                    <Globe className="w-6 h-6 text-foreground/80" />

      

                                  </div>

      

                                  <CardTitle className="text-2xl font-black tracking-tighter text-foreground/90">

      

                                    VocabulAI

      

                                  </CardTitle>

      

                                  <CardDescription className="text-muted-foreground text-sm font-light">

      

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

      

                                      className="w-full h-14 bg-background dark:bg-white/5 border border-border text-foreground hover:bg-muted dark:hover:bg-white/10 transition-all duration-500 font-bold tracking-tight cursor-pointer rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.02)] dark:shadow-none hover:shadow-[0_10px_25px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"

      

                                    >

      

                                      <div className="flex items-center justify-center gap-3">

      

                                        <svg className="w-5 h-5 shrink-0" viewBox="0 0 48 48">

      

                                          <path fill="currentColor" d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"/>

      

                                        </svg>

      

                                        <span>Continue with Google</span>

      

                                      </div>

      

                                    </Button>

      

                                  </form>

      

                                </CardContent>

      

                        

      

                  

      

            

      

      

        

      </Card>

      

        {/* Footer */}

        <div className="mt-8 text-center">

          <p className="text-xs text-muted-foreground/60">

            &copy; {new Date().getFullYear()} VocabulAI. All rights reserved.

          </p>

        </div>

    </div>

  );

}
