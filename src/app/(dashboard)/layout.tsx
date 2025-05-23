import type { Metadata } from "next";
// import { Inter } from "next/font/google";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { Header } from "@/components/layout/Header";
import { Toaster } from "@/components/ui/sonner";

// const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "pmo.lol ",
  description: "Your personalized link page",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <AuthProvider>
        <Header />
        <Toaster />
        <div className="px-4 sm:px-6 lg:px-8">{children}</div>
      </AuthProvider>
    </>
  );
}
