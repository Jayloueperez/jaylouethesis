import * as React from "react";
import { Eye, EyeOff } from "lucide-react";

import { cn } from "~/lib/utils";

function Input({
  wrapperClassName,
  className,
  type,
  ...props
}: React.ComponentProps<"input"> & { wrapperClassName?: string }) {
  const [show, setShow] = React.useState<boolean>(false);

  return (
    <div className={cn("relative", wrapperClassName)}>
      <input
        type={type === "password" ? (show ? "text" : "password") : type}
        data-slot="input"
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-10 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          className,
        )}
        {...props}
      />

      {type === "password" && (
        <button
          className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer"
          type="button"
          onClick={() => setShow((v) => !v)}
        >
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      )}
    </div>
  );
}

export { Input };
