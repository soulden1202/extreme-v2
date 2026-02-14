
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="h-[80vh] flex flex-col items-center justify-center text-center space-y-6">
      <h1 className="text-9xl font-extrabold tracking-tighter text-primary/20">404</h1>
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Page not found</h2>
        <p className="text-muted-foreground">The page you are looking for doesn't exist or has been moved.</p>
      </div>
      <Button asChild size="lg">
        <Link href="/">Back to Home</Link>
      </Button>
    </div>
  );
}
