"use client";

import { ComponentProps, useCallback, useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";

interface UseBooleanData {
  title: string;
  description: string;
}

interface UseBooleanProps {
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

function useBoolean(props?: UseBooleanProps) {
  const {
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
  } = props ?? {};

  const [data, setData] = useState<UseBooleanData | null>(null);

  const openBoolean = useCallback((d: UseBooleanData) => setData(d), []);

  const handlePositive = useCallback(async () => {
    await onPositive?.();

    setData(null);
  }, [onPositive]);

  const handleNegative = useCallback(async () => {
    await onNegative?.();

    setData(null);
  }, [onNegative]);

  return {
    openBoolean,
    component: data ? (
      <AlertDialog open={!!data}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{data.title}</AlertDialogTitle>

            <AlertDialogDescription>{data.description}</AlertDialogDescription>
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
    ) : null,
  };
}

export { useBoolean };
