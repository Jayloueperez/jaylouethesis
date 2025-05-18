"use client";

import { useEffect, useState } from "react";

import { AnnouncementCard } from "~/components/custom-ui/announcement-card";
import { CreateAnnouncementDialog } from "~/components/dialogs/create-announcement-dialog";
import { CoachLayout } from "~/components/layout/coach-layout";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { getAnnouncementsRealtime } from "~/lib/firebase/client/firestore";
import { AnnouncementSchema } from "~/schema/data-client";

export default function CoachAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<AnnouncementSchema[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const [sort, setSort] = useState<
    "latest" | "oldest" | "latest-by-date" | "oldest-by-date"
  >("latest");

  useEffect(() => {
    const unsubscribe = getAnnouncementsRealtime({ sort })(setAnnouncements);

    return unsubscribe;
  }, [sort]);

  return (
    <CoachLayout className="gap-4 p-4">
      <div className="flex lg:h-16 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <span className="text-xl font-medium">Announcements</span>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <span>Sort:</span>

            <Select
              value={sort}
              onValueChange={(v) => setSort(v as "latest" | "oldest")}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="latest">Latest created</SelectItem>
                <SelectItem value="oldest">Oldest created</SelectItem>
                <SelectItem value="latest-by-date">Latest by date</SelectItem>
                <SelectItem value="oldest-by-date">Oldest by date</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button variant="yellow" onClick={() => setOpen(true)}>
            Create Announcement
          </Button>
        </div>
      </div>

      {announcements.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {announcements.map((announcement, i) => (
            <AnnouncementCard
              key={`announcement-${i}`}
              announcement={announcement}
            />
          ))}
        </div>
      )}

      {announcements.length === 0 && (
        <div className="flex flex-1 items-center justify-center">
          <span className="text-gray-500">No announcement records found.</span>
        </div>
      )}

      {open && <CreateAnnouncementDialog open={open} onOpenChange={setOpen} />}
    </CoachLayout>
  );
}
