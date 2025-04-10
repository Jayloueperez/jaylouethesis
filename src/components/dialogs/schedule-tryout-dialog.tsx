"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { ArrowRight, Loader, Plus, X } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { ApplicationWithData } from "~/hooks/firestore/use-applications";
import { useTalentTryouts } from "~/hooks/firestore/use-talent-tryouts";
import { useAlert } from "~/hooks/use-alert";
import {
  createNotification,
  updateTalentTryout,
} from "~/lib/firebase/client/firestore";
import { sendNotification } from "~/lib/firebase/client/messaging";
import { TalentTypeSchema } from "~/schema/data-base";
import { TalentSchema, TalentTryoutSchema } from "~/schema/data-client";
import { useAppSelector } from "~/store";
import { getError } from "~/utils/error";
import { ButtonLink } from "../custom-ui/button-link";
import { Button } from "../ui/button";
import { CreateTalentTryoutDialog } from "./create-talent-tryout-dialog";

export interface ScheduleTryoutDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  talentId: string;
  talentType: TalentTypeSchema;
  student: ApplicationWithData;
  talent: TalentSchema;
}

function ScheduleTryoutDialog(props: ScheduleTryoutDialogProps) {
  const { talentId, talentType, student, talent, ...rest } = props;

  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<string | null>(null);

  const currentDate = useMemo(() => new Date().getTime(), []);

  const { userData } = useAppSelector((state) => state.user);
  const { data: talentTryouts, loading: talentTryoutsLoading } =
    useTalentTryouts({ talentId, talentType, dateAfter: currentDate });
  const { openAlert, component } = useAlert();

  async function handleAssignStudent(talentTryout: TalentTryoutSchema) {
    if (!userData) return;

    setLoading(talentTryout.id);

    if (talentTryout.students.includes(student.id)) {
      openAlert({
        title: "Failed",
        description: "Student is already assigned to the tryout schedule.",
      });
      setLoading(null);
      return;
    }

    try {
      await updateTalentTryout(talentTryout.id, {
        students: [...talentTryout.students, student.id],
      });

      await sendNotification({
        title: `Tryout Schedule`,
        body: `${userData.firstName} assigned you to ${talent.name}'s ${talentTryout.title} schedule. Please check your schedule for the date.`,
        // isRead: false,
        receiver: student.id,
        sender: userData.id,
      });

      await createNotification({
        title: `Tryout Schedule`,
        body: `${userData.firstName} assigned you to ${talent.name}'s ${talentTryout.title} schedule. Please check your schedule for the date.`,
        // isRead: false,
        receiver: student.id,
        sender: userData.id,
      });
    } catch (error) {
      console.log("handleAddStudent error:", error);
      const err = getError(
        error,
        "Failed assigning student to a talent tryout.",
      );

      openAlert({
        title: "Failed",
        description: err.message,
      });
    }

    setLoading(null);
  }

  async function handleRemoveStudent(talentTryout: TalentTryoutSchema) {
    if (!userData) return;

    setLoading(talentTryout.id);

    try {
      await updateTalentTryout(talentTryout.id, {
        students: talentTryout.students.filter((sid) => sid !== student.id),
      });

      await sendNotification({
        title: `Tryout Schedule Removed`,
        body: `${userData.firstName} removed you from ${talent.name}'s ${talentTryout.title} schedule. Please wait for the next tryout schedule.`,
        // isRead: false,
        receiver: student.id,
        sender: userData.id,
      });

      await createNotification({
        title: `Tryout Schedule Removed`,
        body: `${userData.firstName} removed you from ${talent.name}'s ${talentTryout.title} schedule. Please wait for the next tryout schedule.`,
        // isRead: false,
        receiver: student.id,
        sender: userData.id,
      });
    } catch (error) {
      console.log("handleAddStudent error:", error);
      const err = getError(
        error,
        "Failed assigning student to a talent tryout.",
      );

      openAlert({
        title: "Failed",
        description: err.message,
      });
    }

    setLoading(null);
  }

  return (
    <Dialog {...rest}>
      <DialogContent className="flex flex-col gap-4 sm:max-w-lg">
        <div className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Schedule Student Tryout</DialogTitle>

            <DialogDescription>
              Assign an existing tryout schedule for student(s).
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-1 flex-col gap-2">
            {talentTryoutsLoading && <Loader className="size-4 animate-spin" />}

            {!talentTryoutsLoading && talentTryouts.length === 0 && (
              <>
                <span className="text-center text-sm text-gray-500">
                  No tryout schedule.
                </span>
              </>
            )}

            {talentTryouts.map((talentTryout) => {
              const { id, title, description, date, students } = talentTryout;

              const studentExist = students.includes(student.id);

              return (
                <div
                  key={id}
                  className="flex items-center gap-4 rounded-lg border border-gray-300 p-4"
                >
                  <div className="flex flex-1 flex-col gap-4">
                    <div className="flex flex-col">
                      <span>{title}</span>
                      <span className="text-sm text-gray-500">
                        {description}
                      </span>
                    </div>

                    <span className="text-xs">
                      {format(new Date(date), "MMM dd, yyyy @ hh:mma")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {!loading && studentExist ? (
                      <Button
                        variant="destructive"
                        size="icon"
                        shape="pill"
                        loading={loading === talentTryout.id}
                        onClick={() => handleRemoveStudent(talentTryout)}
                        disabled={
                          typeof loading === "string" &&
                          loading !== talentTryout.id
                        }
                      >
                        <X className="size-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="yellow"
                        size="icon"
                        shape="pill"
                        loading={loading === talentTryout.id}
                        onClick={() => handleAssignStudent(talentTryout)}
                        disabled={
                          typeof loading === "string" &&
                          loading !== talentTryout.id
                        }
                      >
                        <Plus className="size-4" />
                      </Button>
                    )}

                    <ButtonLink
                      variant="outline"
                      size="icon"
                      shape="pill"
                      href={`/admin/${talentType}/${talentId}/schedules?scheduleId=${talentTryout.id}`}
                    >
                      <ArrowRight className="size-4" />
                    </ButtonLink>
                  </div>
                </div>
              );
            })}
          </div>

          <DialogFooter>
            <Button variant="yellow" onClick={() => setOpen(true)}>
              Create Schedule
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>

      <CreateTalentTryoutDialog
        open={open}
        onOpenChange={setOpen}
        talentId={talentId}
        talentType={talentType}
      />

      {component}
    </Dialog>
  );
}

export { ScheduleTryoutDialog };
