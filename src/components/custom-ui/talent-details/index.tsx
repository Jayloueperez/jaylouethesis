"use client";

import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { getTalentsRealtime } from "~/lib/firebase/client/firestore";
import { TalentSchema } from "~/schema/data-client";
import { useAppSelector } from "~/store";
import { ButtonLink } from "../button-link";
import { Loading } from "../loading";
import { TalentCard } from "../talent-card";
import { TalentDetailsAdminAnnouncements } from "./admin/announcements";
import { TalentDetailsAdminControls } from "./admin/controls";
import { TalentDetailsAdminMembers } from "./admin/members";
import { TalentDetailsStudentAnnouncements } from "./student/announcements";
import { TalentDetailsStudentControls } from "./student/controls";
import { TalentDetailsStudentMembers } from "./student/members";
import { TalentDetailsTeacherAnnouncements } from "./teacher/announcements";
import { TalentDetailsTeacherControls } from "./teacher/controls";
import { TalentDetailsTeacherMembers } from "./teacher/members";

interface TalentDetailsProps {
  talent: TalentSchema;
}

function TalentDetails(props: TalentDetailsProps) {
  const { talent } = props;

  const [events, setEvents] = useState<TalentSchema[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const { userData, loading: userDataLoading } = useAppSelector(
    (state) => state.user,
  );

  if (!userData || userDataLoading) return <Loading />;

  useEffect(() => {
    if (talent.type !== "culture-and-arts") return;

    const unsubscribe = getTalentsRealtime({
      node: "child",
      orderBy: "asc",
      parentId: talent.id,
    })((v) => {
      setEvents(v);
      setLoading(false);
    });

    return unsubscribe;
  }, [talent]);

  return (
    <>
      {/* HEADER */}
      <div className="flex items-start gap-4">
        {talent.node === "child" && (
          <ButtonLink
            variant="outline"
            size="icon"
            shape="pill"
            href={`/${userData.role}/${talent.type}/${talent.parentId}`}
          >
            <ChevronLeft className="size-4" />
          </ButtonLink>
        )}

        <div className="flex items-center gap-4">
          <Avatar className="size-40">
            <AvatarImage src={talent.image} alt={talent.name} />

            <AvatarFallback>{talent.name.substring(0, 2)}</AvatarFallback>
          </Avatar>

          {/* CONTROLS */}
          <div className="flex flex-col items-start gap-4">
            <span className="text-4xl">{talent.name}</span>

            <span className="">{talent.description}</span>

            {/* CONTROLS */}
            <div className="flex items-center gap-2">
              {userData.role === "admin" && (
                <TalentDetailsAdminControls talent={talent} />
              )}

              {userData.role === "teacher" && (
                <TalentDetailsTeacherControls talent={talent} />
              )}

              {(talent.type === "sports" ||
                (talent.type === "culture-and-arts" &&
                  talent.node === "child")) &&
                userData.role === "student" && (
                  <TalentDetailsStudentControls talent={talent} />
                )}
            </div>
          </div>
          {/* CONTROLS */}
        </div>
      </div>
      {/* HEADER */}

      {(talent.type === "sports" ||
        (talent.type === "culture-and-arts" && talent.node === "child")) && (
        <>
          {/* ANNOUNCEMENTS */}
          <div className="flex flex-col gap-2">
            <span className="text-lg">Announcements</span>

            {userData.role === "admin" && (
              <TalentDetailsAdminAnnouncements talent={talent} />
            )}

            {userData.role === "teacher" && (
              <TalentDetailsTeacherAnnouncements talent={talent} />
            )}

            {userData.role === "student" && (
              <TalentDetailsStudentAnnouncements talent={talent} />
            )}
          </div>
          {/* ANNOUNCEMENTS */}

          {/* MEMBERS */}
          {userData.role === "admin" && (
            <TalentDetailsAdminMembers talent={talent} />
          )}

          {userData.role === "teacher" && (
            <TalentDetailsTeacherMembers talent={talent} />
          )}

          {userData.role === "student" && (
            <TalentDetailsStudentMembers talent={talent} />
          )}
          {/* MEMBERS */}
        </>
      )}

      {talent.type === "culture-and-arts" && talent.node === "parent" && (
        <>
          <div className="flex flex-col gap-2">
            <span className="text-lg">Events</span>

            {loading && (
              <span className="text-center text-gray-500">
                Loading events...
              </span>
            )}

            {!loading && events.length === 0 && (
              <span className="text-center text-gray-500">
                No event records found.
              </span>
            )}

            {!loading && (
              <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {events.map((e) => (
                  <TalentCard
                    key={e.id}
                    talent={e}
                    talentType="culture-and-arts"
                    href={`/${userData.role}/${talent.type}/${talent.id}/event/${e.id}`}
                  />
                ))}
              </div>
            )}
          </div>

          {loading}
        </>
      )}
    </>
  );
}

export { TalentDetails };
