import { ComponentProps, ComponentRef, forwardRef } from "react";
import Link, { LinkProps } from "next/link";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "~/utils/style";

export interface MenuLinkProps
  extends LinkProps,
    Omit<ComponentProps<"a">, "href"> {
  asChild?: boolean;
}

const MenuLink = forwardRef<ComponentRef<typeof Link>, MenuLinkProps>(
  (props, ref) => {
    const { asChild, className, ...rest } = props;

    const Comp = asChild ? Slot : Link;

    return (
      <Comp
        className={cn(
          "border-b-2 border-b-transparent px-3 py-2 transition-all hover:border-b-white",
          className,
        )}
        ref={ref}
        {...rest}
      />
    );
  },
);
MenuLink.displayName = "MenuLink";

export { MenuLink };
