import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 bg-background">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl">
              404
            </h1>
            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl md:text-3xl">
              Page not found
            </h2>
            <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
              The page you&apos;re looking for doesn&apos;t exist. Please check
              the URL or return to the homepage.
            </p>
          </div>
          <Button asChild>
            <Link href="/">Return Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
