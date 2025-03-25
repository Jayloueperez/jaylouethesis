"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CheckCheck, Plus, X } from "lucide-react";

import { JoinTalentDialog } from "~/components/dialogs/join-talent-dialog";
import { Button } from "~/components/ui/button";
import { useAlert } from "~/hooks/use-alert";
import {
  createApplication,
  getApplicationByRealtime,
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
  kicked: "Kicked",
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
    "none" | "joining" | "cancelling"
  >("none");
  const [openState, setOpenState] = useState<"none" | "join-talent">("none");

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
        <Button variant="destructive">
          <X className="size-4" />

          <span>Cancel Application</span>
        </Button>
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
