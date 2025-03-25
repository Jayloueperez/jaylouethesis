"use client";

import { ComponentProps } from "react";
import Link, { LinkProps } from "next/link";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "~/lib/utils";

export interface MenuLinkProps
  extends LinkProps,
    Omit<ComponentProps<"a">, "href"> {
  asChild?: boolean;
}

function MenuLink(props: MenuLinkProps) {
  const { asChild, className, ...rest } = props;

  const Comp = asChild ? Slot : Link;

  return (
    <Comp
      className={cn(
        "border-b-2 border-b-transparent px-3 py-2 transition-all hover:border-b-white",
        className,
      )}
      {...rest}
    />
  );
}

export { MenuLink };
