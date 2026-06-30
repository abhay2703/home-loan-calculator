import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site-header";

interface ToolPageShellProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function ToolPageShell({ title, description, children }: ToolPageShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {children}
      </main>
      <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        Built for Indian home loan borrowers. All calculations run locally in your browser — no
        data leaves your device.
      </footer>
    </div>
  );
}
