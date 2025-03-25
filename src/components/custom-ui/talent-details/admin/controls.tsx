"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { SquarePen, Trash } from "lucide-react";

import { TalentFormDialog } from "~/components/dialogs/talent-form-dialog";
import { Button } from "~/components/ui/button";
import { useBoolean } from "~/hooks/use-boolean";
import { deleteTalent } from "~/lib/firebase/client/firestore";
import { TalentTypeSchema } from "~/schema/data-base";
import { TalentSchema } from "~/schema/data-client";

interface TalentDetailsAdminControlsProps {
  talent: TalentSchema;
}

function TalentDetailsAdminControls(props: TalentDetailsAdminControlsProps) {
  const { talent } = props;

  const [loadingState, setLoadingState] = useState<
    "none" | "updating" | "deleting"
  >("none");
  const [openState, setOpenState] = useState<"none" | "edit">("none");
  const router = useRouter();

  const { talentId, talentType } = useParams<{
    talentId: string;
    talentType: TalentTypeSchema;
  }>();

  const { component, openBoolean } = useBoolean({
    positiveText: "Delete",
    positiveProps: { variant: "destructive" },
    positiveLoading: loadingState === "deleting",
    onPositive: async () => {
      setLoadingState("deleting");

      await deleteTalent(talentId);
      router.replace(`/admin/${talentType}`);
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
            description: `Are you sure you want to delete this ${talentType}?`,
          })
        }
      >
        <Trash className="size-4" />
        <span>Delete</span>
      </Button>

      <TalentFormDialog
        type={talentType}
        talent={talent}
        open={openState === "edit"}
        onOpenChange={(v) => setOpenState(v ? "edit" : "none")}
      />

      {component}
    </>
  );
}

export { TalentDetailsAdminControls };
