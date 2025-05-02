"use client";

import { useEffect, useState } from "react";
import { CheckCheck, Plus, X } from "lucide-react";

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
import { talentTypeText } from "~/const/text";
import { useAlert } from "~/hooks/use-alert";
import {
  createApplication,
  createNotification,
  deleteApplication,
  getApplicationByRealtime,
} from "~/lib/firebase/client/firestore";
import { sendNotification } from "~/lib/firebase/client/messaging";
import { CreateApplicationInputSchema } from "~/schema/crud";
import { ApplicationSchema, TalentSchema } from "~/schema/data-client";
import { useAppSelector } from "~/store";
import { getError } from "~/utils/error";
import { Loading } from "../../loading";

interface TalentDetailsStudentControlsProps {
  talent: TalentSchema;
}

function TalentDetailsStudentControls(
  props: TalentDetailsStudentControlsProps,
) {
  const { talent } = props;
  const { id: talentId, type: talentType } = talent;

  const [application, setApplication] = useState<ApplicationSchema | null>(
    null,
  );
  // const [talentTryout, setTalentTryout] = useState<TalentTryoutSchema | null>(
  //   null,
  // );
  const [loadingState, setLoadingState] = useState<
    "none" | "joining" | "cancelling" | "leaving"
  >("none");
  const [openState, setOpenState] = useState<
    | "none"
    | "join-talent"
    | "cancel-application"
    | "leave-talent"
    | "tryout-schedule"
  >("none");

  const { userData, loading } = useAppSelector((state) => state.user);
  const { component, openAlert } = useAlert();

  const canJoin = !!(userData && loadingState === "none");
  const isMember = talent.members.find((m) => m === userData?.id);

  async function handleJoin(data: CreateApplicationInputSchema) {
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
        const err = getError(
          error,
          `Failed joining ${talentTypeText[talentType]}.`,
        );

        openAlert({
          title: "Failed",
          description: err.message,
        });
      }

      setLoadingState("none");
    }
  }

  async function handleCancelApplication(applicationId: string) {
    if (!userData) return;

    setLoadingState("cancelling");

    try {
      await deleteApplication(applicationId);

      // if (talentTryout) {
      //   await updateTalentTryout(talentTryout.id, {
      //     students: talentTryout.students.filter((s) => s !== applicationId),
      //   });
      // }

      await sendNotification({
        title: `Cancel Application`,
        body: `${userData.firstName} cancelled application for ${talent.name}.`,
        // isRead: false,
        receiver: "all",
        sender: userData.id,
      });

      await createNotification({
        title: `Cancel Application`,
        body: `${userData.firstName} cancelled application for ${talent.name}.`,
        // isRead: false,
        receiver: "all",
        sender: userData.id,
      });

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
  }

  // async function handleLeaveTalent() {
  //   if (!userData) return;

  //   setLoadingState("leaving");

  //   try {
  //     await updateTalent(talent.id, {
  //       members: talent.members.filter((m) => m !== userData.id),
  //     });

  //     await sendNotification({
  //       title: `Left ${talentTypeText[talentType]}`,
  //       body: `${userData.firstName} left ${talent.name}.`,
  //       // isRead: false,
  //       receiver: "all",
  //       sender: userData.id,
  //     });

  //     await createNotification({
  //       title: `Left ${talentTypeText[talentType]}`,
  //       body: `${userData.firstName} left ${talent.name}.`,
  //       // isRead: false,
  //       receiver: "all",
  //       sender: userData.id,
  //     });

  //     openAlert({
  //       title: "Success",
  //       description: `Successfully left ${talentTypeText[talentType]}.`,
  //     });
  //   } catch (error) {
  //     console.log("handleLeaveTalent error:", error);

  //     openAlert({
  //       title: "Failed",
  //       description: `Failed leaving ${talentTypeText[talentType]}.`,
  //     });
  //   }

  //   setLoadingState("none");
  // }

  useEffect(() => {
    if (userData) {
      const unsubscribe = getApplicationByRealtime({
        talentType,
        talentId,
        userId: userData.id,
        status: ["pending", "accepted"],
      })(setApplication);

      return unsubscribe;
    }
  }, [talentId, talentType, userData]);

  // useEffect(() => {
  //   if (application?.status === "tryout") {
  //     const unsubscribe = getTalentTryoutByRealtime({
  //       talentId,
  //       applicationId: application.id,
  //     })(setTalentTryout);

  //     return unsubscribe;
  //   } else {
  //     setTalentTryout(null);
  //   }
  // }, [application, talentId]);

  useEffect(() => {
    if (isMember && openState === "tryout-schedule") setOpenState("none");
  }, [isMember, openState]);

  if (!userData || loading) return <Loading />;

  return (
    <>
      {isMember && (
        <>
          <div className="flex h-10 items-center gap-2 px-3">
            <CheckCheck className="size-4 text-green-600" />

            <span className="text-sm">Member</span>
          </div>

          {/* <AlertDialog
            open={openState === "leave-talent"}
            onOpenChange={(b) => setOpenState((v) => (b ? v : "none"))}
          >
            <AlertDialogTrigger
              asChild
              onClick={() => setOpenState("leave-talent")}
            >
              <Button variant="destructive">
                <ArrowLeft className="size-4" />

                <span>Leave {_.capitalize(talentTypeText[talentType])}</span>
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Action</AlertDialogTitle>

                <AlertDialogDescription>
                  Are you sure you want to leave this{" "}
                  {talentTypeText[talentType]}?
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogAction
                  variant="destructive"
                  onClick={handleLeaveTalent}
                  loading={loadingState === "leaving"}
                >
                  Leave {_.capitalize(talentType)}
                </AlertDialogAction>

                <AlertDialogCancel disabled={loadingState === "leaving"}>
                  Cancel
                </AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog> */}
        </>
      )}

      {!isMember && !application && (
        <Button
          variant="yellow"
          loading={loadingState === "joining"}
          onClick={() =>
            handleJoin({
              message: "",
              status: "pending",
              talentId: talent.id,
              talentType: talent.type,
              userId: userData?.id,
            })
          }
        >
          <Plus className="size-4" />

          <span>Join</span>
        </Button>
      )}

      {/* {!isMember && application?.status === "tryout" && (
        <Button
          variant="outline"
          onClick={() => setOpenState("tryout-schedule")}
        >
          <Calendar className="size-4" />

          <span>View Tryout Schedule</span>
        </Button>
      )} */}

      {!isMember && application?.status === "pending" && (
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

      <JoinTalentDialog
        open={openState === "join-talent"}
        onOpenChange={(v) => setOpenState(v ? "join-talent" : "none")}
        talent={talent}
        onSubmit={handleJoin}
      />

      {/* <TryoutScheduleDialog
        open={openState === "tryout-schedule"}
        onOpenChange={(v) => setOpenState(v ? "tryout-schedule" : "none")}
        talentTryout={talentTryout}
      /> */}

      {component}
    </>
  );
}

export { TalentDetailsStudentControls };
