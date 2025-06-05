import type { Metadata } from "next";
// import { Inter } from "next/font/google";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { NavigationProvider } from "@/components/providers/NavigationProvider";
import { AuthModalProvider } from "@/components/providers/AuthModalProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
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
    <AuthProvider>
      <NavigationProvider>
        <AuthModalProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <Toaster />
            <main className="flex-1 px-4 sm:px-24">{children}</main>
            <Footer />
          </div>
        </AuthModalProvider>
      </NavigationProvider>
    </AuthProvider>
  );
}
