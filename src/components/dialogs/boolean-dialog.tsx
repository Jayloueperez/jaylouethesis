"use client";

import { ComponentProps, useCallback } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";

interface BooleanDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: string;
  description?: string;
  onPositive?: () => void;
  onNegative?: () => void;
  positiveText?: string;
  negativeText?: string;
  positiveProps?: Omit<ComponentProps<typeof AlertDialogAction>, "className">;
  negativeProps?: Omit<ComponentProps<typeof AlertDialogAction>, "className">;
  positiveClassName?: string;
  negativeClassName?: string;
  positiveLoading?: boolean;
  negativeLoading?: boolean;
}

function BooleanDialog(props: BooleanDialogProps) {
  const {
    open,
    onOpenChange,
    title,
    description,
    onPositive,
    onNegative,
    positiveText,
    negativeText,
    positiveProps,
    negativeProps,
    positiveClassName,
    negativeClassName,
    positiveLoading,
    negativeLoading,
  } = props;

  const handlePositive = useCallback(async () => {
    await onPositive?.();

    onOpenChange?.(false);
  }, [onPositive, onOpenChange]);

  const handleNegative = useCallback(async () => {
    await onNegative?.();

    onOpenChange?.(false);
  }, [onNegative, onOpenChange]);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>

          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogAction
            className={positiveClassName}
            onClick={handlePositive}
            loading={positiveLoading}
            disabled={negativeLoading}
            {...positiveProps}
          >
            {positiveText ?? "Continue"}
          </AlertDialogAction>

          <AlertDialogAction
            className={negativeClassName}
            onClick={handleNegative}
            loading={negativeLoading}
            disabled={positiveLoading}
            {...negativeProps}
          >
            {negativeText ?? "Cancel"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export { BooleanDialog };
