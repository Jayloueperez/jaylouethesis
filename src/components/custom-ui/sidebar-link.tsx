import { ComponentProps, ComponentRef, forwardRef } from "react";
import Link, { LinkProps } from "next/link";
import { Slot } from "@radix-ui/react-slot";
import { LucideIcon } from "lucide-react";

import { cn } from "~/utils/style";

export interface SidebarLinkProps
  extends LinkProps,
    Omit<ComponentProps<"a">, "href"> {
  asChild?: boolean;
  active?: boolean;
  icon?: LucideIcon;
}

const SidebarLink = forwardRef<ComponentRef<typeof Link>, SidebarLinkProps>(
  (props, ref) => {
    const { asChild, className, active, icon: Icon, children, ...rest } = props;

    const Comp = asChild ? Slot : Link;

    return (
      <Comp
        className={cn(
          "flex h-16 items-center gap-4 rounded-md bg-violet-950 px-4 py-2 text-white transition-all hover:bg-flush-orange-500",
          className,
          active && "bg-flush-orange-500",
        )}
        ref={ref}
        {...rest}
      >
        {!!Icon && <Icon className="h-6 w-6" />}

        {children}
      </Comp>
    );
  },
);
SidebarLink.displayName = "SidebarLink";

export { SidebarLink };
