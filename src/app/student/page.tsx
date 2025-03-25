"use client";

import { useEffect, useState } from "react";

import { AnnouncementCard } from "~/components/custom-ui/announcement-card";
import { StudentLayout } from "~/components/layout/student-layout";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { getAnnouncementsRealtime } from "~/lib/firebase/client/firestore";
import { AnnouncementSchema } from "~/schema/data-client";

export default function StudentPage() {
  const [announcements, setAnnouncements] = useState<AnnouncementSchema[]>([]);
  const [sort, setSort] = useState<
    "latest" | "oldest" | "latest-by-date" | "oldest-by-date"
  >("latest");

  useEffect(() => {
    const unsubscribe = getAnnouncementsRealtime({ type: "all", sort })(
      setAnnouncements,
    );

    return unsubscribe;
  }, [sort]);

  return (
    <StudentLayout className="gap-4 p-4">
      <div className="flex h-16 items-center justify-between">
        <span className="text-xl font-medium">Announcements</span>

        <div className="flex items-center gap-2">
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
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {announcements.map((announcement, i) => (
          <AnnouncementCard
            key={`announcement-${i}`}
            announcement={announcement}
          />
        ))}
      </div>
    </StudentLayout>
  );
}
