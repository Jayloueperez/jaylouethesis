"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, Eye } from "lucide-react";

import { ReportDialog } from "~/components/dialogs/report-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  getReportsRealtime,
  getTalentsRealtime,
  getUsersRealtime,
} from "~/lib/firebase/client/firestore";
import { ReportSchema, TalentSchema, UserSchema } from "~/schema/data-client";
import { useAppSelector } from "~/store";
import { ButtonLink } from "../button-link";
import { Loading } from "../loading";
import { TalentCard } from "../talent-card";
import { TalentDetailsAdminAnnouncements } from "./admin/announcements";
import { TalentDetailsAdminControls } from "./admin/controls";
import { TalentDetailsAdminMembers } from "./admin/members";
import { TalentDetailsCoachAnnouncements } from "./coach/announcements";
import { TalentDetailsCoachControls } from "./coach/controls";
import { TalentDetailsCoachMembers } from "./coach/members";
import { TalentDetailsStudentAnnouncements } from "./student/announcements";
import { TalentDetailsStudentControls } from "./student/controls";
import { TalentDetailsStudentMembers } from "./student/members";

interface TalentDetailsProps {
  talent: TalentSchema;
}

function TalentDetails(props: TalentDetailsProps) {
  const { talent } = props;

  const [events, setEvents] = useState<TalentSchema[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [reports, setReports] = useState<ReportSchema[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReportSchema | null>(
    null,
  );
  const [coaches, setCoaches] = useState<UserSchema[]>([]);

  const { userData, loading: userDataLoading } = useAppSelector(
    (state) => state.user,
  );

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

  useEffect(() => {
    const unsubscribe = getReportsRealtime({ talentId: talent.id })((v) => {
      setReports(v);
    });

    return unsubscribe;
  }, [talent]);

  useEffect(() => {
    const unsubscribe = getUsersRealtime({ talentId: talent.id })(setCoaches);

    return unsubscribe;
  }, [talent]);

  if (!userData || userDataLoading) return <Loading />;

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

        <div className="flex flex-col items-center gap-4 lg:flex-row">
          <Avatar className="size-40">
            <AvatarImage src={talent.image} alt={talent.name} />

            <AvatarFallback>{talent.name.substring(0, 2)}</AvatarFallback>
          </Avatar>

          {/* CONTROLS */}
          <div className="flex flex-col items-start gap-4">
            <span className="text-4xl">{talent.name}</span>

            <span className="">{talent.description}</span>

            {/* CONTROLS */}
            <div className="flex flex-wrap items-center gap-2">
              {userData.role === "admin" && (
                <TalentDetailsAdminControls talent={talent} />
              )}

              {userData.role === "coach" && (
                <TalentDetailsCoachControls talent={talent} />
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

      <div className="flex flex-col gap-2">
        <span className="text-lg">Assigned Coaches: </span>

        <div className="flex flex-wrap items-center gap-2">
          {coaches.map((coach) => (
            <div
              key={coach.id}
              className="bg-flush-orange-600 rounded-full px-3 py-1 text-white"
            >
              <span>
                {coach.firstName}{" "}
                {coach.middleInitial ? `${coach.middleInitial}.` : ""}{" "}
                {coach.surname}
              </span>
            </div>
          ))}
        </div>
      </div>

      {(talent.type === "sports" ||
        (talent.type === "culture-and-arts" && talent.node === "child")) && (
        <>
          {/* ANNOUNCEMENTS */}
          <div className="flex flex-col gap-2">
            <span className="text-lg">Announcements</span>

            {userData.role === "admin" && (
              <TalentDetailsAdminAnnouncements talent={talent} />
            )}

            {userData.role === "coach" && (
              <TalentDetailsCoachAnnouncements talent={talent} />
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

          {userData.role === "coach" && (
            <TalentDetailsCoachMembers talent={talent} />
          )}

          {userData.role === "student" && (
            <TalentDetailsStudentMembers talent={talent} />
          )}
          {/* MEMBERS */}

          {reports.length > 0 && (
            <>
              <div className="flex flex-col gap-4">
                <span className="text-lg">Reports</span>

                <Card className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>No. of Members</TableHead>
                        <TableHead className="w-24 text-center">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {reports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell>{report.title}</TableCell>
                          <TableCell>{report.members.length}</TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="yellow"
                                size="icon"
                                shape="pill"
                                onClick={() => setSelectedReport(report)}
                              >
                                <Eye className="size-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </div>

              <ReportDialog
                talent={talent}
                report={selectedReport}
                open={!!selectedReport}
                onOpenChange={(v) => setSelectedReport((r) => (v ? r : null))}
                hideActions={userData.role === "student"}
              />
            </>
          )}
        </>
      )}

      {talent.type === "culture-and-arts" && talent.node === "parent" && (
        <>
          <div className="flex flex-col gap-2">
            <span className="text-lg">Events</span>

            {loading && (
              <span className="text-center text-gray-500">Loading...</span>
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
