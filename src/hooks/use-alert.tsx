import { useCallback, useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";

interface UseAlertData {
  title: string;
  description: string;
  callback?: () => void;
}

function useAlert() {
  const [data, setData] = useState<UseAlertData | null>(null);

  const openAlert = useCallback((d: UseAlertData) => setData(d), []);

  return {
    openAlert,
    component: data ? (
      <AlertDialog open={!!data}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{data.title}</AlertDialogTitle>

            <AlertDialogDescription>{data.description}</AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                data.callback?.();
                setData(null);
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    ) : null,
  };
}

export { useAlert };
