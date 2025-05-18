"use client";

import { useEffect, useState } from "react";
import { Bell, ClipboardList, ListCheck, Loader } from "lucide-react";

import { GenerateReportDialog } from "~/components/dialogs/generate-report-dialog";
import { ViewProfileDialog } from "~/components/dialogs/view-profile-dialog";
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
import { useApplications } from "~/hooks/firestore/use-applications";
import { getUsersRealtime } from "~/lib/firebase/client/firestore";
import { TalentSchema, UserSchema } from "~/schema/data-client";
import { ButtonLink } from "../../button-link";

interface TalentDetailsAdminMembersProps {
  talent: TalentSchema;
}

function TalentDetailsAdminMembers(props: TalentDetailsAdminMembersProps) {
  const { talent } = props;
  const { id: talentId, type: talentType } = talent;

  const [members, setMembers] = useState<UserSchema[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  // const [loadingState, setLoadingState] = useState<"none" | "removing">("none");
  const [openState, setOpenState] = useState<
    "none" | "generate" | "remove-member"
  >("none");

  const { count: applicationsCount } = useApplications({
    talentId,
    talentType,
    status: ["pending"],
  });

  let applicationsUrl = `/admin/${talentType}/${talentId}/applicants`;

  if (talent.node === "child") {
    applicationsUrl = `/admin/${talentType}/${talent.parentId}/event/${talent.id}/applicants`;
  }

  // async function handleRemoveMember(memberId: string) {
  //   setLoadingState("removing");

  //   try {
  //     await updateTalent(talentId, {
  //       members: talent.members.filter((m) => m !== memberId),
  //     });

  //     openAlert({
  //       title: "Success",
  //       description: "Successfully removed student.",
  //     });
  //   } catch (error) {
  //     console.log("handleRemoveMember error:", error);

  //     openAlert({
  //       title: "Failed",
  //       description: "Failed removing member.",
  //     });
  //   }

  //   setLoadingState("none");
  // }

  function handleGenerateReport() {
    setOpenState("generate");
    // if (members.length === 0) {
    //   openAlert({
    //     title: "Warning",
    //     description: "Cannot generate pdf report if there are no data.",
    //   });
    //   return;
    // }

    // toPDF();
  }

  useEffect(() => {
    const memberIds = talent.members ?? [];

    if (memberIds.length > 0) {
      setLoading(true);

      const unsubscribe = getUsersRealtime({ ids: memberIds })((v) => {
        setMembers(v);
        setLoading(false);
      });

      return unsubscribe;
    } else {
      setMembers([]);
      setLoading(false);
    }
  }, [talent]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <span className="text-lg">Members</span>

        <div className="flex flex-wrap items-center gap-2">
          <ButtonLink
            className="flex items-center gap-2"
            href={applicationsUrl}
            variant="outline"
          >
            {applicationsCount > 0 ? (
              <Bell className="size-4" />
            ) : (
              <ListCheck className="size-4" />
            )}

            <span>
              {applicationsCount > 0
                ? `${applicationsCount} New ${applicationsCount === 1 ? "Applicant" : "Applicants"}`
                : "View Applicants"}
            </span>
          </ButtonLink>

          <Button
            className="flex items-center gap-2"
            variant="blue"
            onClick={handleGenerateReport}
          >
            <ClipboardList className="size-4" />

            <span>Generate Reports</span>
          </Button>
        </div>
      </div>

      <Card className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Section</TableHead>
              <TableHead className="w-36">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading && (
              <TableRow>
                <TableCell className="text-center text-gray-500" colSpan={5}>
                  <div className="flex items-center justify-center gap-2">
                    <Loader className="size-4 animate-spin" />

                    <span>Loading...</span>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {!loading && members.length === 0 && (
              <TableRow>
                <TableCell className="text-center text-gray-500" colSpan={5}>
                  No members yet.
                </TableCell>
              </TableRow>
            )}

            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex items-center gap-4">
                    <Avatar className="size-12">
                      <AvatarImage
                        src={member.profile}
                        alt={member.firstName}
                      />
                      <AvatarFallback>
                        {member.firstName} {member.surname}
                      </AvatarFallback>
                    </Avatar>

                    <span>
                      {member.firstName} {member.surname}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{member.age}</TableCell>
                <TableCell>{member.course}</TableCell>
                <TableCell>{member.year}</TableCell>
                <TableCell>{member.section}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <ViewProfileDialog user={member}>
                      View Profile
                    </ViewProfileDialog>
                    {/* <Button
                      type="button"
                      variant="blue"
                      size="icon"
                      shape="pill"
                    >
                      <Eye className="size-4" />
                    </Button> */}

                    {/* <AlertDialog
                      open={openState === "remove-member"}
                      onOpenChange={(b) =>
                        setOpenState((v) => (b ? v : "none"))
                      }
                    >
                      <AlertDialogTrigger
                        asChild
                        onClick={() => setOpenState("remove-member")}
                      >
                        <Button variant="destructive" size="icon" shape="pill">
                          <X className="size-4" />
                        </Button>
                      </AlertDialogTrigger>

                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirm Action</AlertDialogTitle>

                          <AlertDialogDescription>
                            Are you sure you want to remove this student?
                          </AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter>
                          <AlertDialogAction
                            variant="destructive"
                            onClick={() => handleRemoveMember(member.id)}
                            loading={loadingState === "removing"}
                          >
                            Remove Student
                          </AlertDialogAction>

                          <AlertDialogCancel
                            disabled={loadingState === "removing"}
                          >
                            Cancel
                          </AlertDialogCancel>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog> */}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <GenerateReportDialog
        open={openState === "generate"}
        onOpenChange={(o) => setOpenState(() => (o ? "generate" : "none"))}
        talent={talent}
      />
    </div>
  );
}

export { TalentDetailsAdminMembers };
