"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Landmark } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { TOOLS } from "@/lib/tools";

export function SiteHeader() {
  const pathname = usePathname();
  const currentTool = TOOLS.find((tool) => tool.href === pathname) ?? TOOLS[0];

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Landmark className="size-4" />
          </span>
          <span className="hidden text-base font-semibold tracking-tight sm:inline">
            Home Loan Calculator
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
              {currentTool.label}
              <ChevronDown className="size-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              {TOOLS.map((tool) => (
                <DropdownMenuItem key={tool.href} render={<Link href={tool.href} />}>
                  <tool.icon className="size-4 shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-medium">{tool.label}</span>
                    <span className="text-xs text-muted-foreground">{tool.description}</span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
