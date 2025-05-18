"use client";

import { useState } from "react";
import { CheckCheck, X } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { useAlert } from "~/hooks/use-alert";
import {
  createNotification,
  deleteApplication,
  updateApplication,
  updateTalent,
  updateTalentTryout,
} from "~/lib/firebase/client/firestore";
import { sendNotification } from "~/lib/firebase/client/messaging";
import { useTalentContext } from "~/providers/TalentProvider";
import {
  ApplicationSchema,
  TalentTryoutSchema,
  UserSchema,
} from "~/schema/data-client";
import { useAppSelector } from "~/store";
import { getError } from "~/utils/error";
import { BooleanDialog } from "../boolean-dialog";

interface StudentItemProps {
  application: ApplicationSchema & { student: UserSchema };
  talentTryout: TalentTryoutSchema;
}

function StudentItem(props: StudentItemProps) {
  const { application, talentTryout } = props;
  const { student, status } = application;

  const [loadingState, setLoadingState] = useState<
    "none" | "accepting" | "rejecting"
  >("none");
  const [openState, setOpenState] = useState<"none" | "accept" | "reject">(
    "none",
  );

  const { component, openAlert } = useAlert();
  const { talent, loading } = useTalentContext();
  const { userData } = useAppSelector((state) => state.user);

  async function handleAcceptApplication() {
    if (!talent || !userData) return;

    setLoadingState("accepting");

    try {
      await updateTalent(talent.id, {
        members: [...talent.members, application.userId],
      });
      await deleteApplication(application.id);
      await updateTalentTryout(talentTryout.id, {
        students: talentTryout.students.filter((s) => s !== application.id),
      });

      await sendNotification({
        title: `Request Accepted`,
        body: `You passed your tryout, you are now a member of ${talent.name} ${talent.type}.`,
        // isRead: false,
        receiver: application.userId,
        sender: userData.id,
      });

      await createNotification({
        title: `Request Accepted`,
        body: `You passed your tryout, you are now a member of ${talent.name} ${talent.type}.`,
        // isRead: false,
        receiver: application.userId,
        sender: userData.id,
      });

      openAlert({
        title: "Success",
        description:
          "Successfully accepted student application. Student is now a member.",
      });
    } catch (error) {
      console.log("handleAcceptApplication error:", error);
      const err = getError(error);

      openAlert({
        title: "Failed",
        description: err.message,
      });
    }

    setLoadingState("none");
  }

  async function handleRejectApplication() {
    if (!talent) return;
    setLoadingState("rejecting");

    try {
      await updateApplication(application.id, {
        status: "accepted",
      });

      openAlert({
        title: "Success",
        description: "Successfully rejected student application.",
      });
    } catch (error) {
      console.log("handleAcceptApplication error:", error);
      const err = getError(error);

      openAlert({
        title: "Failed",
        description: err.message,
      });
    }

    setLoadingState("none");
  }

  if (!talent || loading)
    return (
      <div className="flex animate-pulse items-center justify-between gap-4 rounded-lg border-b border-gray-300 border-b-gray-300 py-2 last:border-b-0">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <div className="size-12 rounded-full bg-gray-300"></div>

            <div className="h-4"></div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="size-12 rounded-full bg-gray-300"></div>
          <div className="size-12 rounded-full bg-gray-300"></div>
        </div>
      </div>
    );

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border-b border-gray-300 border-b-gray-300 py-2 last:border-b-0">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Avatar className="size-12">
              <AvatarImage src={student.profile} alt={student.firstName} />

              <AvatarFallback>
                {student.firstName.substring(0, 2)}
              </AvatarFallback>
            </Avatar>

            <span className="text-sm">
              {student.firstName} {student.surname}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {status === "accepted" && (
            <CheckCheck className="size-4 text-green-600" />
          )}

          {status === "rejected" && <X className="size-4 text-red-600" />}

          {/* {status === "tryout" && (
            <>
              <Button
                variant="yellow"
                size="icon"
                shape="pill"
                onClick={() => setOpenState("accept")}
                loading={loadingState === "accepting"}
                disabled={
                  loadingState !== "none" && loadingState !== "accepting"
                }
              >
                <Check className="size-4" />
              </Button>

              <Button
                variant="destructive"
                size="icon"
                shape="pill"
                onClick={() => setOpenState("reject")}
                loading={loadingState === "rejecting"}
                disabled={
                  loadingState !== "none" && loadingState !== "rejecting"
                }
              >
                <X className="size-4" />
              </Button>
            </>
          )} */}
        </div>
      </div>

      {component}

      <BooleanDialog
        open={openState === "accept"}
        onOpenChange={(v) => setOpenState(v ? "accept" : "none")}
        title="Confirm Action"
        description="Are you sure you want to accept this student application?"
        positiveText="Accept"
        positiveProps={{ variant: "yellow" }}
        negativeText="Cancel"
        onPositive={handleAcceptApplication}
        positiveLoading={loadingState === "accepting"}
        negativeProps={{
          variant: "outline",
          disabled: loadingState === "accepting",
        }}
      />

      <BooleanDialog
        open={openState === "reject"}
        onOpenChange={(v) => setOpenState(v ? "reject" : "none")}
        title="Confirm Action"
        description="Are you sure you want to reject this student application?"
        positiveText="Reject"
        positiveProps={{ variant: "destructive" }}
        negativeText="Cancel"
        onPositive={handleRejectApplication}
        positiveLoading={loadingState === "rejecting"}
        negativeProps={{
          variant: "outline",
          disabled: loadingState === "rejecting",
        }}
      />
    </>
  );
}

export { StudentItem };
