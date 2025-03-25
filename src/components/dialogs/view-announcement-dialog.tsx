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
  club: "Clubs Only",
  sport: "Sports Only",
  ids: "Specific",
};

interface ViewAnnouncementDialogProps {
  announcement: AnnouncementSchema;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function ViewAnnouncementDialog(props: ViewAnnouncementDialogProps) {
  const { announcement, ...rest } = props;

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

          <div className="flex items-center justify-between gap-4">
            <span className="text-sm uppercase">{announcement.subject}</span>

            <span className="text-sm">{typeText[announcement.type]}</span>
          </div>
        </DialogHeader>

        <div>
          <p>{announcement.description}</p>
        </div>

        <span className="text-sm font-light uppercase">
          {format(announcement.date, "MMM dd, yyyy @ hh:mma")}
        </span>

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
