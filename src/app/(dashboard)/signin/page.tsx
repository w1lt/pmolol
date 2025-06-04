import { Metadata } from "next";
import { SignInForm } from "@/components/auth/SignInForm";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Get Started - pmo.lol",
  description: "Create your personalized link page in seconds",
};

export default async function SignInPage() {
  const session = await getServerSession(authOptions);

  // Redirect to dashboard if user is already authenticated
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-8 sm:w-[400px]">
      <div className="flex flex-col space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Ready to get started?
          </h1>
          <p className="text-lg text-muted-foreground">
            Sign in to create your personalized link page in under a minute
          </p>
        </div>
      </div>

      <SignInForm />

      <p className="text-xs text-center text-muted-foreground">
        By continuing, you agree to our Terms of Service and Privacy Policy
      </p>
    </div>
  );
}
