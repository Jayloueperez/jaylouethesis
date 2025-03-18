import { useState } from "react";
import { Check, CheckCheck, X } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { useAlert } from "~/hooks/use-alert";
import {
  updateApplication,
  updateTalent,
} from "~/lib/firebase/client/firestore";
import { useTalentContext } from "~/providers/TalentProvider";
import { ApplicationSchema, UserSchema } from "~/schema/data";
import { getError } from "~/utils/error";
import { BooleanDialog } from "../boolean-dialog";

interface StudentItemProps {
  application: ApplicationSchema & { student: UserSchema };
}

const StudentItem = (props: StudentItemProps) => {
  const { application } = props;
  const { student, status } = application;

  const [loadingState, setLoadingState] = useState<
    "none" | "accepting" | "rejecting"
  >("none");
  const [openState, setOpenState] = useState<"none" | "accept" | "reject">(
    "none",
  );

  const { component, openAlert } = useAlert();
  const { talent, loading } = useTalentContext();

  const handleAcceptApplication = async () => {
    if (!talent) return;
    setLoadingState("accepting");

    try {
      await updateApplication(application.id, {
        status: "accepted",
      });
      await updateTalent(talent.id, {
        members: [...talent.members, application.userId],
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
  };

  const handleRejectApplication = async () => {
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
  };

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
      <div className="flex items-center justify-between gap-4 rounded-lg border-b border-gray-300 border-b-gray-300 py-2 last:border-b-0">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Avatar className="size-12">
              <AvatarImage src={student.profile} alt="Example Club 1" />

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

          {status === "tryout" && (
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
          )}
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
        negativeProps={{ disabled: loadingState === "accepting" }}
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
        negativeProps={{ disabled: loadingState === "rejecting" }}
      />
    </>
  );
};

export { StudentItem };
