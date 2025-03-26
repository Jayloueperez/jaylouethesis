"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import _ from "lodash";
import { ArrowLeft, CheckCheck, Plus, X } from "lucide-react";

import { JoinTalentDialog } from "~/components/dialogs/join-talent-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { useAlert } from "~/hooks/use-alert";
import {
  createApplication,
  getApplicationByRealtime,
  updateApplication,
  updateTalent,
} from "~/lib/firebase/client/firestore";
import { CreateApplicationInputSchema } from "~/schema/crud";
import { ApplicationStatusSchema, TalentTypeSchema } from "~/schema/data-base";
import { ApplicationSchema, TalentSchema } from "~/schema/data-client";
import { useAppSelector } from "~/store";
import { getError } from "~/utils/error";
import { Loading } from "../../loading";

const buttonText: Record<ApplicationStatusSchema, string> = {
  pending: "Pending",
  tryout: "Tryout",
  accepted: "Member",
  rejected: "Join",
  cancelled: "Cancelled",
  removed: "Removed",
  left: "Left",
};

interface TalentDetailsStudentControlsProps {
  talent: TalentSchema;
}

function TalentDetailsStudentControls(
  props: TalentDetailsStudentControlsProps,
) {
  const { talent } = props;

  const [application, setApplication] = useState<ApplicationSchema | null>(
    null,
  );
  const [loadingState, setLoadingState] = useState<
    "none" | "joining" | "cancelling" | "leaving"
  >("none");
  const [openState, setOpenState] = useState<
    "none" | "join-talent" | "cancel-application" | "leave-talent"
  >("none");

  const { talentId, talentType } = useParams<{
    talentId: string;
    talentType: TalentTypeSchema;
  }>();

  const { userData, loading } = useAppSelector((state) => state.user);
  const { component, openAlert } = useAlert();

  const canJoin = !!(userData && loadingState === "none");

  const handleJoin = async (data: CreateApplicationInputSchema) => {
    if (canJoin) {
      setLoadingState("joining");

      try {
        await createApplication(data);

        openAlert({
          title: "Success",
          description: "Successfully sent talent application.",
        });
      } catch (error) {
        console.log("handleJoin error:", error);
        const err = getError(error, `Failed joining ${talentType}.`);

        openAlert({
          title: "Failed",
          description: err.message,
        });
      }

      setLoadingState("none");
    }
  };

  const handleCancelApplication = async (applicationId: string) => {
    if (!userData || !application) return;

    setLoadingState("cancelling");

    try {
      await updateApplication(applicationId, { status: "cancelled" });

      openAlert({
        title: "Success",
        description: "Successfully cancelled application.",
      });
    } catch (error) {
      console.log("handleCancelApplication error:", error);

      openAlert({
        title: "Failed",
        description: "Failed cancelling application.",
      });
    }

    setLoadingState("none");
  };

  const handleLeaveTalent = async (applicationId: string) => {
    if (!userData || !application) return;

    setLoadingState("leaving");

    try {
      await updateApplication(applicationId, { status: "left" });
      await updateTalent(talent.id, {
        members: talent.members.filter((m) => m !== userData.id),
      });

      openAlert({
        title: "Success",
        description: `Successfully left ${talentType}.`,
      });
    } catch (error) {
      console.log("handleLeaveTalent error:", error);

      openAlert({
        title: "Failed",
        description: `Failed leaving ${talentType}.`,
      });
    }

    setLoadingState("none");
  };

  useEffect(() => {
    if (userData) {
      const unsubscribe = getApplicationByRealtime({
        talentType,
        talentId,
        userId: userData.id,
        status: ["pending", "tryout", "accepted"],
      })(setApplication);

      return unsubscribe;
    }
  }, [talentId, talentType, userData]);

  if (!userData || loading) return <Loading />;

  return (
    <>
      <Button
        variant="yellow"
        size="lg"
        disabled={!!(application && application.status !== "rejected")}
        loading={loadingState === "joining"}
        onClick={() => setOpenState("join-talent")}
      >
        {application ? (
          <CheckCheck className="size-4" />
        ) : (
          <Plus className="size-4" />
        )}

        <span>{application ? buttonText[application.status] : "Join"}</span>
      </Button>

      {application?.status === "pending" && (
        <AlertDialog
          open={openState === "cancel-application"}
          onOpenChange={(b) => setOpenState((v) => (b ? v : "none"))}
        >
          <AlertDialogTrigger
            asChild
            onClick={() => setOpenState("cancel-application")}
          >
            <Button variant="destructive">
              <X className="size-4" />

              <span>Cancel Application</span>
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Action</AlertDialogTitle>

              <AlertDialogDescription>
                Are you sure you want to cancel your application?
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogAction
                variant="destructive"
                onClick={() => handleCancelApplication(application.id)}
                loading={loadingState === "cancelling"}
              >
                Cancel Application
              </AlertDialogAction>

              <AlertDialogCancel disabled={loadingState === "cancelling"}>
                Cancel
              </AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {application?.status === "accepted" && (
        <AlertDialog
          open={openState === "leave-talent"}
          onOpenChange={(b) => setOpenState((v) => (b ? v : "none"))}
        >
          <AlertDialogTrigger
            asChild
            onClick={() => setOpenState("leave-talent")}
          >
            <Button variant="destructive">
              <ArrowLeft className="size-4" />

              <span>Leave {_.capitalize(talentType)}</span>
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Action</AlertDialogTitle>

              <AlertDialogDescription>
                Are you sure you want to leave this {talentType}?
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogAction
                variant="destructive"
                onClick={() => handleLeaveTalent(application.id)}
                loading={loadingState === "leaving"}
              >
                Leave {_.capitalize(talentType)}
              </AlertDialogAction>

              <AlertDialogCancel disabled={loadingState === "leaving"}>
                Cancel
              </AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {application?.status === "tryout" && (
        <Button variant="outline">
          <span>View Tryout Schedule</span>
        </Button>
      )}

      <JoinTalentDialog
        open={openState === "join-talent"}
        onOpenChange={(v) => setOpenState(v ? "join-talent" : "none")}
        talent={talent}
        onSubmit={handleJoin}
      />

      {component}
    </>
  );
}

export { TalentDetailsStudentControls };
