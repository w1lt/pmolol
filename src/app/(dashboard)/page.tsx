import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
        Your Links, Your Style
      </h1>
      <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl">
        Create a custom link page that matches your style and personality. Share
        multiple links with a single URL, customize colors, fonts, and more.
      </p>
      <div className="mt-10 flex items-center justify-center gap-x-6">
        <Link href="/signin">
          <Button size="lg">
            Get started
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
        <Link href="#examples" className="text-sm font-semibold leading-6">
          See examples <span aria-hidden="true">→</span>
        </Link>
      </div>

      <div className="mt-20 max-w-5xl">
        <h2 className="text-3xl font-bold mb-8">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-card rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-2">Custom URL</h3>
            <p className="text-muted-foreground">
              Choose your own custom URL slug like pmo.lol/yourname
            </p>
          </div>
          <div className="bg-card rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-2">Unlimited Links</h3>
            <p className="text-muted-foreground">
              Add as many links as you need and organize them your way
            </p>
          </div>
          <div className="bg-card rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-2">Detailed Analytics</h3>
            <p className="text-muted-foreground">
              Track views, clicks, and where your visitors are coming from
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
