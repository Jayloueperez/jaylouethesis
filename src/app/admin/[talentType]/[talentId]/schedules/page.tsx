"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { Calendar, ChevronLeft, List, Loader, Trash } from "lucide-react";

import { ButtonLink } from "~/components/custom-ui/button-link";
import { Loading } from "~/components/custom-ui/loading";
import { BooleanDialog } from "~/components/dialogs/boolean-dialog";
import { CreateTalentTryoutDialog } from "~/components/dialogs/create-talent-tryout-dialog";
import { ScheduleTryoutDialog } from "~/components/dialogs/schedule-tryout-dialog";
import { StudentListDialog } from "~/components/dialogs/student-list-dialog";
import { AdminLayout } from "~/components/layout/admin-layout";
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
import { ApplicationWithData } from "~/hooks/firestore/use-applications";
import { useTalentTryouts } from "~/hooks/firestore/use-talent-tryouts";
import { useAlert } from "~/hooks/use-alert";
import { useTalentTypeParams } from "~/hooks/use-talent-type-params";
import { deleteTalentTryout } from "~/lib/firebase/client/firestore";
import { useTalentContext } from "~/providers/TalentProvider";
import { ApplicationStatusSchema, TalentTypeSchema } from "~/schema/data-base";
import { TalentTryoutSchema } from "~/schema/data-client";
import { getError } from "~/utils/error";

function Component() {
  const [filter, setFilter] = useState<{
    status: ApplicationStatusSchema | "all";
  }>({ status: "all" });
  const [loadingState, setLoadingState] = useState<"none" | "deleting">("none");
  const [deleteTryoutSchedule, setDeleteTryoutSchedule] =
    useState<TalentTryoutSchema | null>(null);
  const [studentTryout, setStudentTryout] =
    useState<ApplicationWithData | null>(null);
  const [selectedTalentTryoutId, setSelectedTalentTryoutId] = useState<
    string | null
  >(null);
  const [search, setSearch] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);

  const searchParams = useSearchParams();
  const scheduleId = searchParams.get("scheduleId");

  const currentDate = useMemo(() => new Date().getTime(), []);

  const { talentId, talentType } = useParams<{
    talentId: string;
    talentType: TalentTypeSchema;
  }>();

  const { talent, loading } = useTalentContext();
  const { data: talentTryouts, loading: talentTryoutsLoading } =
    useTalentTryouts({
      talentId,
      talentType,
      dateAfter: currentDate,
    });
  const { loading: talentTypeLoading } = useTalentTypeParams();
  const { openAlert, component } = useAlert();

  const selectedTalentTryout =
    talentTryouts.find((tt) => tt.id === selectedTalentTryoutId) ?? null;

  async function handleDelete() {
    if (!deleteTryoutSchedule) return;

    setLoadingState("deleting");

    try {
      await deleteTalentTryout(deleteTryoutSchedule.id);

      openAlert({
        title: "Success",
        description: "Successfully delete tryout schedule.",
      });
    } catch (error) {
      console.log("handleDelete error:", error);
      const err = getError(error, "Failed deleting tryout schedule.");

      openAlert({
        title: "Failed",
        description: err.message,
      });
    }

    setLoadingState("none");
  }

  useEffect(() => {
    if (scheduleId) setSelectedTalentTryoutId(scheduleId);
  }, [scheduleId]);

  if (!talent || talentTypeLoading || loading) return <Loading />;

  return (
    <AdminLayout className="gap-8 p-4">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
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
          <span className="text-lg">{talent.name} Schedules</span>

          <Button variant="yellow" onClick={() => setOpen(true)}>
            <Calendar />

            <span>Create Tryout Schedule</span>
          </Button>
        </div>

        <Card className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-center">No. of Studens</TableHead>
                <TableHead className="w-36 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {talentTryoutsLoading && (
                <TableRow>
                  <TableCell className="text-center text-gray-500" colSpan={5}>
                    <div className="flex items-center justify-center gap-2">
                      <Loader className="size-4 animate-spin" />

                      <span>Loading...</span>
                    </div>
                  </TableCell>
                </TableRow>
              )}

              {!talentTryoutsLoading && talentTryouts.length === 0 && (
                <TableRow>
                  <TableCell className="text-center text-gray-500" colSpan={5}>
                    No tryout schedules.
                  </TableCell>
                </TableRow>
              )}

              {!talentTryoutsLoading &&
                talentTryouts.map((talentTryout) => {
                  const { id, title, description, students, date } =
                    talentTryout;

                  return (
                    <TableRow key={id}>
                      <TableCell>{title}</TableCell>
                      <TableCell className="text-gray-500">
                        {description}
                      </TableCell>
                      <TableCell>
                        {format(new Date(date), "MMM dd, yyyy @ hh:mma")}
                      </TableCell>
                      <TableCell className="text-center">
                        {students.length}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            type="button"
                            variant="yellow"
                            size="icon"
                            shape="pill"
                            onClick={() =>
                              setSelectedTalentTryoutId(talentTryout.id)
                            }
                          >
                            <List className="size-4" />
                          </Button>

                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            shape="pill"
                            onClick={() =>
                              setDeleteTryoutSchedule(talentTryout)
                            }
                          >
                            <Trash className="size-4" />
                          </Button>
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
        open={!!deleteTryoutSchedule}
        onOpenChange={() => setDeleteTryoutSchedule(null)}
        title="Confirm Delete"
        description="Are you sure you want to delete this schedule?"
        positiveText="Delete"
        positiveProps={{ variant: "destructive" }}
        negativeProps={{
          variant: "outline",
          disabled: loadingState === "deleting",
        }}
        onPositive={handleDelete}
        positiveLoading={loadingState === "deleting"}
      />

      {!!studentTryout && (
        <ScheduleTryoutDialog
          open={!!studentTryout}
          onOpenChange={(v) => setStudentTryout((p) => (v ? p : null))}
          talentId={talentId}
          talentType={talentType}
          student={studentTryout}
          talent={talent}
        />
      )}

      {!!selectedTalentTryout && (
        <StudentListDialog
          open={!!selectedTalentTryout}
          onOpenChange={(v) =>
            setSelectedTalentTryoutId((tt) => (v ? tt : null))
          }
          talentTryout={selectedTalentTryout}
        />
      )}

      <CreateTalentTryoutDialog
        open={open}
        onOpenChange={setOpen}
        talentId={talentId}
        talentType={talentType}
      />

      {component}
      {/* MODALS */}
    </AdminLayout>
  );
}

export default function TalentSchedulesPage() {
  return (
    <Suspense fallback={<Loading />}>
      <Component />
    </Suspense>
  );
}
