"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Home, LayoutDashboard } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NotFound() {
  const pathname = usePathname();

  return (
    <div className="min-h-[calc(100vh-0px)] bg-[hsl(var(--background))]">
      <div className="relative isolate mx-auto flex min-h-screen max-w-3xl items-center px-6 py-16">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/2 top-[-10%] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-gradient-ai opacity-15 blur-3xl" />
          <div className="absolute bottom-[-15%] right-[-10%] h-[420px] w-[420px] rounded-full bg-gradient-brand opacity-10 blur-3xl" />
        </div>

        <Card className="w-full shadow-elevated">
          <CardHeader className="gap-2">
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[hsl(var(--brand-soft))] px-3 py-1 text-xs font-medium text-[hsl(var(--accent-foreground))] ring-1 ring-[hsl(var(--brand)/0.20)]">
              404
              <span className="text-[hsl(var(--muted-foreground))]">•</span>
              Page not found
            </div>
            <CardTitle className="text-2xl sm:text-3xl">This page doesn’t exist.</CardTitle>
            <CardDescription className="text-base">
              We couldn’t find <span className="font-mono text-sm">{pathname}</span>. Try going back
              or jump to a main section.
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-3 sm:flex-row">
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <a href="javascript:history.back()">
                <ArrowLeft className="mr-2" />
                Go back
              </a>
            </Button>

            <Button asChild className="w-full sm:w-auto">
              <Link href="/">
                <Home className="mr-2" />
                Home
              </Link>
            </Button>

            <Button variant="secondary" asChild className="w-full sm:w-auto">
              <Link href="/dashboard">
                <LayoutDashboard className="mr-2" />
                Dashboard
              </Link>
            </Button>
          </CardContent>

          <CardFooter className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
            <div className="text-xs text-muted-foreground">
              If you think this is a bug, double-check the URL or navigate using the sidebar.
            </div>
            <Button variant="link" asChild className="h-auto p-0 text-xs">
              <Link href="/dashboard">Browse the app</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

