"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ChevronsRight } from "lucide-react";

import { AnnouncementTypeSchema } from "~/schema/data-base";
import { AnnouncementSchema } from "~/schema/data-client";
import { ViewAnnouncementDialog } from "../dialogs/view-announcement-dialog";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Separator } from "../ui/separator";

const typeText: Record<AnnouncementTypeSchema, string> = {
  all: "All",
  "culture-and-arts": "Culture & Arts Only",
  sports: "Sports Only",
  ids: "Specific",
};

export interface AnnouncementCardProps {
  announcement: AnnouncementSchema;
  viewOnly?: boolean;
}

function AnnouncementCard(props: AnnouncementCardProps) {
  const { announcement, viewOnly } = props;

  const [open, setOpen] = useState<boolean>(false);

  return (
    <Card className="border-b-flush-orange-500 flex flex-col gap-4 border-b-4 bg-violet-950 p-4 text-white">
      <div className="flex flex-col">
        <span className="text-xl font-medium">{announcement.title}</span>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <span className="text-sm uppercase">{announcement.subject}</span>

          <span className="text-sm">{typeText[announcement.type]}</span>
        </div>
      </div>

      <Separator />

      <span className="line-clamp-3 flex-1">{announcement.description}</span>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <span className="text-sm font-light uppercase">
          {format(announcement.date, "MMM dd, yyyy @ hh:mma")}
        </span>

        <Button
          type="button"
          variant="yellow"
          size="sm"
          onClick={() => setOpen(true)}
        >
          <span>Read More</span>

          <ChevronsRight className="size-4" />
        </Button>
      </div>

      <ViewAnnouncementDialog
        open={open}
        onOpenChange={setOpen}
        announcement={announcement}
        viewOnly={viewOnly}
      />
    </Card>
  );
}

export { AnnouncementCard };
