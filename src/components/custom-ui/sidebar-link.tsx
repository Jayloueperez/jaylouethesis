"use client";

import { ComponentProps } from "react";
import Link, { LinkProps } from "next/link";
import { Slot } from "@radix-ui/react-slot";
import { LucideIcon } from "lucide-react";

import { cn } from "~/lib/utils";

export interface SidebarLinkProps
  extends LinkProps,
    Omit<ComponentProps<"a">, "href"> {
  asChild?: boolean;
  active?: boolean;
  icon?: LucideIcon;
}

function SidebarLink(props: SidebarLinkProps) {
  const { asChild, className, active, icon: Icon, children, ...rest } = props;

  const Comp = asChild ? Slot : Link;

  return (
    <Comp
      className={cn(
        "hover:bg-flush-orange-500 flex h-16 items-center gap-4 rounded-md bg-violet-950 px-4 py-2 text-white transition-all",
        className,
        active && "bg-flush-orange-500",
      )}
      {...rest}
    >
      {!!Icon && <Icon className="h-6 w-6" />}

      {children}
    </Comp>
  );
}

export { SidebarLink };
