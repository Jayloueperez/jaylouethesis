"use client";

import { useState } from "react";
import { format } from "date-fns";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { useBoolean } from "~/hooks/use-boolean";
import { deleteAnnouncement } from "~/lib/firebase/client/firestore";
import { AnnouncementTypeSchema } from "~/schema/data-base";
import { AnnouncementSchema } from "~/schema/data-client";
import { Button } from "../ui/button";
import { CreateAnnouncementDialog } from "./create-announcement-dialog";

const typeText: Record<AnnouncementTypeSchema, string> = {
  all: "All",
  "culture-and-arts": "Culture & Arts Only",
  sports: "Sports Only",
  ids: "Specific",
};

interface ViewAnnouncementDialogProps {
  announcement: AnnouncementSchema;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  viewOnly?: boolean;
}

function ViewAnnouncementDialog(props: ViewAnnouncementDialogProps) {
  const { announcement, viewOnly, ...rest } = props;

  const [open, setOpen] = useState<boolean>(false);

  const { component, openBoolean } = useBoolean({
    onPositive: async () => {
      await deleteAnnouncement(announcement.id);

      rest.onOpenChange?.(false);
    },
    positiveText: "Delete",
    positiveProps: { variant: "destructive" },
    negativeProps: { variant: "outline" },
  });

  return (
    <Dialog {...rest}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{announcement.title}</DialogTitle>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="text-sm uppercase">{announcement.subject}</span>

            <span className="text-sm">{typeText[announcement.type]}</span>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <span className="break-words">{announcement.description}</span>

          <span className="text-gray-500">
            {format(announcement.date, "MMM dd, yyyy @ hh:mma")}
          </span>
        </div>

        {!viewOnly && (
          <DialogFooter>
            <Button variant="yellow" onClick={() => setOpen(true)}>
              Edit
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                openBoolean({
                  title: "Confirm Delete",
                  description:
                    "Are you sure you want to delete this announcement?",
                })
              }
            >
              Delete
            </Button>
          </DialogFooter>
        )}
      </DialogContent>

      <CreateAnnouncementDialog
        open={open}
        onOpenChange={setOpen}
        announcement={announcement}
      />

      {component}
    </Dialog>
  );
}

export { ViewAnnouncementDialog };
