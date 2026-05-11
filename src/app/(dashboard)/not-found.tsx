"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, LayoutDashboard, LifeBuoy, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardNotFound() {
  const pathname = usePathname();

  return (
    <div className="py-8">
      <div className="relative overflow-hidden rounded-2xl border bg-card shadow-card">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-[-20%] top-[-35%] h-[520px] w-[520px] rounded-full bg-gradient-ai opacity-10 blur-3xl" />
          <div className="absolute left-[-25%] bottom-[-45%] h-[560px] w-[560px] rounded-full bg-gradient-brand opacity-10 blur-3xl" />
        </div>

        <div className="relative p-6 sm:p-10">
          <Card className="mx-auto max-w-2xl shadow-elevated">
            <CardHeader className="gap-2">
              <div className="inline-flex w-fit items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground ring-1 ring-foreground/10">
                <Search className="size-3.5" />
                404 — Not found
              </div>
              <CardTitle className="text-2xl sm:text-3xl">We couldn’t find that page.</CardTitle>
              <CardDescription className="text-base">
                The route <span className="font-mono text-sm">{pathname}</span> doesn’t exist in this
                workspace.
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
                <Link href="/dashboard">
                  <LayoutDashboard className="mr-2" />
                  Dashboard
                </Link>
              </Button>
              <Button variant="secondary" asChild className="w-full sm:w-auto">
                <Link href="/clients">Clients</Link>
              </Button>
            </CardContent>

            <CardFooter className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
              <div className="text-xs text-muted-foreground">
                Tip: use the sidebar to navigate, or check if the item was deleted.
              </div>
              <Button variant="link" asChild className="h-auto p-0 text-xs">
                <Link href="/settings">
                  <LifeBuoy className="mr-1.5 size-3.5" />
                  Settings
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

