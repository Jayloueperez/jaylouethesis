"use client";

import { format } from "date-fns";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { TalentTryoutSchema } from "~/schema/data-client";

interface TryoutScheduleDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  talentTryout: TalentTryoutSchema | null;
}

function TryoutScheduleDialog(props: TryoutScheduleDialogProps) {
  const { open, onOpenChange, talentTryout } = props;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col gap-4 sm:max-w-lg">
        <div className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>{talentTryout?.title ?? "No Schedule"} </DialogTitle>

            <DialogDescription>
              {talentTryout?.description ??
                "You haven't assigned to a tryout schedule yet."}
            </DialogDescription>
          </DialogHeader>

          {talentTryout && (
            <div className="flex flex-col">
              <span className="text-center text-gray-500">
                Your tryout schedule
              </span>

              <span className="text-center text-2xl">
                {format(new Date(talentTryout.date), "MMM dd, yyyy hh:mma")}
              </span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { TryoutScheduleDialog };
