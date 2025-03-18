import { ComponentProps, ComponentRef, forwardRef } from "react";
import Link, { LinkProps } from "next/link";
import { Slot } from "@radix-ui/react-slot";
import { VariantProps } from "class-variance-authority";

import { cn } from "~/utils/style";
import { buttonVariants } from "../ui/button";

export interface ButtonLinkProps
  extends LinkProps,
    Omit<ComponentProps<"a">, "href">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const ButtonLink = forwardRef<ComponentRef<typeof Link>, ButtonLinkProps>(
  (props, ref) => {
    const { asChild, className, variant, size, shape, ...rest } = props;

    const Comp = asChild ? Slot : Link;

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className, shape }))}
        ref={ref}
        {...rest}
      />
    );
  },
);
ButtonLink.displayName = "ButtonLink";

export { ButtonLink };
