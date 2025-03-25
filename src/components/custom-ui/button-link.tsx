"use client";

import { ComponentProps } from "react";
import Link, { LinkProps } from "next/link";
import { Slot } from "@radix-ui/react-slot";
import { VariantProps } from "class-variance-authority";

import { cn } from "~/lib/utils";
import { buttonVariants } from "../ui/button";

export interface ButtonLinkProps
  extends LinkProps,
    Omit<ComponentProps<"a">, "href">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

function ButtonLink(props: ButtonLinkProps) {
  const { asChild, className, variant, size, shape, ...rest } = props;

  const Comp = asChild ? Slot : Link;

  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className, shape }))}
      {...rest}
    />
  );
}

export { ButtonLink };
