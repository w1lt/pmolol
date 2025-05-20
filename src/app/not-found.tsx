import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Construction } from "lucide-react"; // Or any other icon

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
      <Construction className="w-24 h-24 text-destructive mb-8" />
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-lg text-muted-foreground mb-8 text-center">
        Oops! The page you are looking for does not exist or has been moved.
      </p>
      <Button asChild>
        <Link href="/">Go Back to Homepage</Link>
      </Button>
    </div>
  );
}
