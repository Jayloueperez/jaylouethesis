"use client";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { TalentSchema } from "~/schema/data";
import { useAppSelector } from "~/store";
import { Loading } from "../loading";
import { TalentDetailsAdminAnnouncements } from "./admin/announcements";
import { TalentDetailsAdminControls } from "./admin/controls";
import { TalentDetailsAdminMembers } from "./admin/members";
import { TalentDetailsStudentAnnouncements } from "./student/announcements";
import { TalentDetailsStudentControls } from "./student/controls";
import { TalentDetailsStudentMembers } from "./student/members";

interface TalentDetailsProps {
  talent: TalentSchema;
}

const TalentDetails = (props: TalentDetailsProps) => {
  const { talent } = props;

  const { userData, loading } = useAppSelector((state) => state.user);

  if (!userData || loading) return <Loading />;

  return (
    <>
      {/* HEADER */}
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

            {userData.role === "student" && (
              <TalentDetailsStudentControls talent={talent} />
            )}
          </div>
        </div>
        {/* CONTROLS */}
      </div>
      {/* HEADER */}

      {/* ANNOUNCEMENTS */}
      <div className="flex flex-col gap-2">
        <span className="text-lg">Announcements</span>

        {userData.role === "admin" && (
          <TalentDetailsAdminAnnouncements talent={talent} />
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

      {userData.role === "student" && (
        <TalentDetailsStudentMembers talent={talent} />
      )}
      {/* MEMBERS */}
    </>
  );
};

export { TalentDetails };
