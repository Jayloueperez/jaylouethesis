"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import _ from "lodash";
import { Calendar, Check, ChevronLeft, Loader, Trash } from "lucide-react";

import { ButtonLink } from "~/components/custom-ui/button-link";
import { Loading } from "~/components/custom-ui/loading";
import { BooleanDialog } from "~/components/dialogs/boolean-dialog";
import { ScheduleTryoutDialog } from "~/components/dialogs/schedule-tryout-dialog";
import { AdminLayout } from "~/components/layout/admin-layout";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  ApplicationWithData,
  useApplications,
} from "~/hooks/firestore/use-applications";
import { useAlert } from "~/hooks/use-alert";
import { useTalentTypeParams } from "~/hooks/use-talent-type-params";
import { updateApplication } from "~/lib/firebase/client/firestore";
import { useTalentContext } from "~/providers/TalentProvider";
import { ApplicationStatusSchema, TalentTypeSchema } from "~/schema/data";
import { getError } from "~/utils/error";

const TalentApplicantsPage = () => {
  const [filter, setFilter] = useState<{
    status: ApplicationStatusSchema | "all";
  }>({ status: "all" });
  const [loadingState, setLoadingState] = useState<
    "none" | "accepting" | "rejecting"
  >("none");
  const [acceptApplication, setAcceptApplication] =
    useState<ApplicationWithData | null>(null);
  const [rejectApplication, setRejectApplication] =
    useState<ApplicationWithData | null>(null);
  const [studentTryout, setStudentTryout] =
    useState<ApplicationWithData | null>(null);
  const [search, setSearch] = useState<string>("");

  const { talentId, talentType } = useParams<{
    talentId: string;
    talentType: TalentTypeSchema;
  }>();

  const { talent, loading } = useTalentContext();
  const { data: applications, loading: applicationsLoading } = useApplications({
    talentId,
    talentType,
  });
  const { loading: talentTypeLoading } = useTalentTypeParams();
  const { openAlert, component } = useAlert();

  const filteredApplications = applications.filter((a) => {
    const filterSearch =
      search.trim().length > 0
        ? a.user.keywords.includes(search.toLowerCase())
        : true;
    const filterStatus =
      filter.status !== "all" ? a.status === filter.status : true;

    return filterSearch && filterStatus;
  });

  const handleAccept = async () => {
    if (!acceptApplication) return;

    setLoadingState("accepting");

    try {
      await updateApplication(acceptApplication.id, {
        status: "tryout",
      });
    } catch (error) {
      console.log("handleAccept error:", error);
      const err = getError(error, "Failed accepting request.");

      openAlert({
        title: "Failed",
        description: err.message,
      });
    }

    setLoadingState("none");
  };

  const handleReject = async () => {
    if (!rejectApplication) return;

    setLoadingState("rejecting");

    try {
      await updateApplication(rejectApplication.id, {
        status: "rejected",
      });
    } catch (error) {
      console.log("handleReject error:", error);
      const err = getError(error, "Failed rejecting request.");

      openAlert({
        title: "Failed",
        description: err.message,
      });
    }

    setLoadingState("none");
  };

  if (!talent || talentTypeLoading || loading) return <Loading />;

  return (
    <AdminLayout className="gap-8 p-4">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <ButtonLink
            variant="outline"
            size="icon"
            shape="pill"
            href={`/admin/${talentType}/${talentId}`}
          >
            <ChevronLeft className="size-4" />
          </ButtonLink>

          <div className="flex items-center gap-2">
            <span>Status:</span>

            <Select
              value={filter.status}
              onValueChange={(v) =>
                setFilter((f) => ({
                  ...f,
                  status: v as ApplicationStatusSchema,
                }))
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="tryout">Tryout</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Input
          className="w-64"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {/* HEADER */}

      {/* LIST */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-lg">
            {talent.name} {_.upperFirst(talentType)} Applicants
          </span>
        </div>

        <Card className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-36 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {applicationsLoading && (
                <TableRow>
                  <TableCell className="text-center text-gray-500" colSpan={5}>
                    <div className="flex items-center justify-center gap-2">
                      <Loader className="size-4 animate-spin" />

                      <span>Loading...</span>
                    </div>
                  </TableCell>
                </TableRow>
              )}

              {!applicationsLoading && filteredApplications.length === 0 && (
                <TableRow>
                  <TableCell className="text-center text-gray-500" colSpan={5}>
                    No student applications.
                  </TableCell>
                </TableRow>
              )}

              {!applicationsLoading &&
                filteredApplications.map((application) => {
                  const { user: student, status } = application;

                  return (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div className="flex items-center gap-4">
                          <Avatar className="size-12">
                            <AvatarImage
                              src={student.profile}
                              alt={`${student.firstName} ${student.surname}`}
                            />
                            <AvatarFallback>
                              {student.firstName.substring(0, 2)}
                            </AvatarFallback>
                          </Avatar>

                          <span>
                            {student.firstName} {student.surname}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{student.course}</TableCell>
                      <TableCell>{student.year}</TableCell>
                      <TableCell>{student.section}</TableCell>
                      <TableCell className="text-gray-500 uppercase">
                        {status}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          {status === "pending" && (
                            <>
                              <Button
                                type="button"
                                variant="yellow"
                                size="icon"
                                shape="pill"
                                onClick={() =>
                                  setAcceptApplication(application)
                                }
                              >
                                <Check className="size-4" />
                              </Button>

                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                shape="pill"
                                onClick={() =>
                                  setRejectApplication(application)
                                }
                              >
                                <Trash className="size-4" />
                              </Button>
                            </>
                          )}

                          {status === "tryout" && (
                            <>
                              <Button
                                type="button"
                                variant="yellow"
                                onClick={() => setStudentTryout(application)}
                              >
                                <Calendar className="size-4" />

                                <span>Schedule Tryout</span>
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </Card>
      </div>
      {/* LIST */}

      {/* MODALS */}
      <BooleanDialog
        open={!!acceptApplication}
        onOpenChange={() => setAcceptApplication(null)}
        title="Confirm Accept"
        description="Are you sure you want to accept this student? The student will then proceed to tryout."
        positiveText="Accept Request"
        positiveProps={{ variant: "yellow" }}
        negativeProps={{
          variant: "outline",
          disabled: loadingState === "accepting",
        }}
        onPositive={handleAccept}
        positiveLoading={loadingState === "accepting"}
      />

      <BooleanDialog
        open={!!rejectApplication}
        onOpenChange={() => setRejectApplication(null)}
        title="Confirm Reject"
        description="Are you sure you want to reject this student?"
        positiveText="Reject Request"
        positiveProps={{ variant: "destructive" }}
        negativeProps={{
          variant: "outline",
          disabled: loadingState === "rejecting",
        }}
        onPositive={handleReject}
        positiveLoading={loadingState === "rejecting"}
      />

      {!!studentTryout && (
        <ScheduleTryoutDialog
          open={!!studentTryout}
          onOpenChange={(v) => setStudentTryout((p) => (v ? p : null))}
          talentId={talentId}
          talentType={talentType}
          student={studentTryout}
        />
      )}

      {component}
      {/* MODALS */}
    </AdminLayout>
  );
};

export default TalentApplicantsPage;
