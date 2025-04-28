"use client";

import { useEffect, useState } from "react";
import { Loader } from "lucide-react";

import { getAnnouncementsRealtime } from "~/lib/firebase/client/firestore";
import { AnnouncementSchema, TalentSchema } from "~/schema/data-client";
import { AnnouncementCard } from "../../announcement-card";

interface TalentDetailsAdminAnnouncementsProps {
  talent: TalentSchema;
}

function TalentDetailsAdminAnnouncements(
  props: TalentDetailsAdminAnnouncementsProps,
) {
  const { talent } = props;

  const [announcements, setAnnouncements] = useState<AnnouncementSchema[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = getAnnouncementsRealtime({
      forIds: [talent.id],
      type: [talent.type, "all"],
    })((v) => {
      setAnnouncements(v);
      setLoading(false);
    });

    return unsubscribe;
  }, [talent]);

  return loading ? (
    <div className="col-span-3 flex items-center justify-center gap-2 text-gray-500">
      <Loader className="size-4 animate-spin" />

      <span>Loading...</span>
    </div>
  ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {announcements.length === 0 && (
        <span className="col-span-3 text-center text-gray-500">
          No announcements.
        </span>
      )}

      {announcements.map((announcement) => (
        <AnnouncementCard key={announcement.id} announcement={announcement} />
      ))}
    </div>
  );
}

export { TalentDetailsAdminAnnouncements };
