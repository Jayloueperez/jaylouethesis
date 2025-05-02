"use client";

import { ComponentProps, KeyboardEvent, useState } from "react";
import { Check, ChevronDown, LucideIcon, X } from "lucide-react";

import { Badge } from "~/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Separator } from "~/components/ui/separator";
import { cn } from "~/lib/utils";

interface MultiSelectOption {
  label: string;
  value: string;
  icon?: LucideIcon;
  node: "parent" | "child";
  options?: MultiSelectOption[];
}

interface MultiSelectProps extends ComponentProps<"div"> {
  options: MultiSelectOption[];
  onValueChange: (value: string[]) => void;
  value: string[];
  defaultValue?: string[];
  placeholder?: string;
  asChild?: boolean;
  getOptionData?: (value: string) => MultiSelectOption | undefined;
}

function MultiSelectOptionComponent({
  label,
  node,
  value,
  options,
  onSelect,
  selectedValues,
}: MultiSelectOption & {
  onSelect: (value: string) => void;
  selectedValues: string[];
}) {
  const hasChildren = !!(node === "parent" && options && options.length > 0);

  if (node === "parent" && options && options.length === 0) {
    return null;
  }

  if (hasChildren) {
    return (
      <CommandGroup heading={label}>
        {options?.map((option) => (
          <MultiSelectOptionComponent
            key={`${value}-${option.value}`}
            {...option}
            onSelect={onSelect}
            selectedValues={selectedValues}
          />
        ))}
      </CommandGroup>
    );
  }

  const isSelected = selectedValues.includes(value);

  return (
    <CommandItem
      onSelect={() => onSelect(value)}
      className="flex cursor-pointer items-center gap-2"
    >
      <div
        className={cn(
          "border-primary mr-2 flex size-4 items-center justify-center rounded-sm border",
          isSelected
            ? "bg-primary text-primary-foreground"
            : "opacity-50 [&_svg]:invisible",
        )}
      >
        <Check className="size-4" />
      </div>

      <span>{label}</span>
    </CommandItem>
  );
}

function MultiSelect({
  className,
  options,
  onValueChange,
  defaultValue,
  placeholder,
  getOptionData,
  value,
  ...props
}: MultiSelectProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [selectedValues, setSelectedValues] = useState<string[]>(value);

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
    } else if (event.key === "Backspace" && !event.currentTarget.value) {
      const newSelectedValues = [...selectedValues];
      setSelectedValues(newSelectedValues);
      onValueChange(newSelectedValues);
    }
  };

  const toggleOption = (option: string) => {
    const newSelectedValues = selectedValues.includes(option)
      ? selectedValues.filter((value) => value !== option)
      : [...selectedValues, option];
    setSelectedValues(newSelectedValues);
    onValueChange(newSelectedValues);
  };

  const handleClear = () => {
    setSelectedValues([]);
    onValueChange([]);
  };

  const handleTogglePopover = () => {
    setOpen((prev) => !prev);
  };

  return (
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild>
        <div
          role="button"
          className={cn(
            "flex min-h-10 flex-col rounded-md border bg-transparent px-3 py-2 text-sm",
            className,
          )}
          onClick={() => handleTogglePopover()}
          {...props}
        >
          {selectedValues.length > 0 ? (
            <div className="flex flex-1 items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {selectedValues.map((sv) => {
                  const option = getOptionData
                    ? getOptionData(sv)
                    : options.find((o) => o.value === sv);

                  if (!option) {
                    return null;
                  }

                  return (
                    <Badge key={sv}>
                      <span>{option.label}</span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleOption(sv);
                        }}
                      >
                        <X className="size-4 cursor-pointer" />
                      </button>
                    </Badge>
                  );
                })}
              </div>

              <ChevronDown className="size-4 shrink-0" />
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-between gap-2">
              <span className="text-muted-foreground">
                {placeholder || "Select options"}
              </span>

              <ChevronDown className="size-4 shrink-0" />
            </div>
          )}
        </div>
      </PopoverTrigger>

      <PopoverContent align="start" className="p-0">
        <Command>
          <CommandInput
            placeholder="Search..."
            onKeyDown={handleInputKeyDown}
          />

          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>

            {options.map((option) => (
              <MultiSelectOptionComponent
                key={option.value}
                {...option}
                onSelect={toggleOption}
                selectedValues={selectedValues}
              />
            ))}

            <CommandSeparator />

            <CommandGroup>
              <div className="flex items-center justify-between">
                {selectedValues.length > 0 && (
                  <>
                    <CommandItem
                      onSelect={handleClear}
                      className="flex-1 cursor-pointer justify-center"
                    >
                      Clear
                    </CommandItem>
                    <Separator
                      orientation="vertical"
                      className="flex h-full min-h-6"
                    />
                  </>
                )}
                <CommandItem
                  onSelect={() => setOpen(false)}
                  className="max-w-full flex-1 cursor-pointer justify-center"
                >
                  Close
                </CommandItem>
              </div>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export { MultiSelect };
export type { MultiSelectOption, MultiSelectProps };
