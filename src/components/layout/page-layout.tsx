"use client";

import { ReactNode } from "react";

import { cn } from "~/lib/utils";
import { Header } from "./header";

interface PageLayoutProps {
  children?: ReactNode;
  className?: string;
}

function PageLayout(props: PageLayoutProps) {
  const { children, className } = props;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main
        className={cn(
          "mt-[calc(theme('spacing.24')+4px)] flex min-h-[calc(100vh-theme('spacing.48')-4px)] flex-col",
          className,
        )}
      >
        {children}
      </main>

      <footer className="shrink-0 bg-violet-950 text-white">
        <div className="container flex h-24 items-center justify-between">
          <span>Alrights reserved.</span>
        </div>
      </footer>
    </div>
  );
}

export { PageLayout };
