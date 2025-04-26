"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SquarePen, Trash } from "lucide-react";

import { TalentFormDialog } from "~/components/dialogs/talent-form-dialog";
import { Button } from "~/components/ui/button";
import { talentTypeText } from "~/const/text";
import { useBoolean } from "~/hooks/use-boolean";
import { deleteTalent } from "~/lib/firebase/client/firestore";
import { TalentSchema } from "~/schema/data-client";

interface TalentDetailsCoachControlsProps {
  talent: TalentSchema;
}

function TalentDetailsCoachControls(
  props: TalentDetailsCoachControlsProps,
) {
  const { talent } = props;
  const { id: talentId, type: talentType } = talent;

  const [loadingState, setLoadingState] = useState<
    "none" | "updating" | "deleting"
  >("none");
  const [openState, setOpenState] = useState<"none" | "edit">("none");
  const router = useRouter();

  const { component, openBoolean } = useBoolean({
    positiveText: "Delete",
    positiveProps: { variant: "destructive" },
    positiveLoading: loadingState === "deleting",
    onPositive: async () => {
      setLoadingState("deleting");

      await deleteTalent(talentId);
      router.replace(`/coach/${talentType}`);
    },
  });

  return (
    <>
      <Button variant="blue" onClick={() => setOpenState("edit")}>
        <SquarePen className="size-4" />
        <span>Edit</span>
      </Button>

      <Button
        variant="destructive"
        onClick={() =>
          openBoolean({
            title: "Confirm Delete",
            description: `Are you sure you want to delete this ${talentTypeText[talentType]}?`,
          })
        }
      >
        <Trash className="size-4" />
        <span>Delete</span>
      </Button>

      <TalentFormDialog
        talentType={talentType}
        talent={talent}
        open={openState === "edit"}
        onOpenChange={(v) => setOpenState(v ? "edit" : "none")}
      />

      {component}
    </>
  );
}

export { TalentDetailsCoachControls };
