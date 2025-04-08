"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, SquarePen, Trash } from "lucide-react";

import { TalentFormDialog } from "~/components/dialogs/talent-form-dialog";
import { Button } from "~/components/ui/button";
import { talentTypeText } from "~/const/text";
import { useBoolean } from "~/hooks/use-boolean";
import { deleteTalent } from "~/lib/firebase/client/firestore";
import { TalentSchema } from "~/schema/data-client";

interface TalentDetailsAdminControlsProps {
  talent: TalentSchema;
}

function TalentDetailsAdminControls(props: TalentDetailsAdminControlsProps) {
  const { talent } = props;
  const { id: talentId, type: talentType } = talent;

  const [loadingState, setLoadingState] = useState<
    "none" | "updating" | "deleting"
  >("none");
  const [openState, setOpenState] = useState<"none" | "edit" | "event">("none");
  const router = useRouter();

  const { component, openBoolean } = useBoolean({
    positiveText: "Delete",
    positiveProps: { variant: "destructive" },
    positiveLoading: loadingState === "deleting",
    onPositive: async () => {
      setLoadingState("deleting");
      const redirect =
        talent.node === "parent"
          ? `/admin/${talentType}`
          : `/admin/${talentType}/${talent.parentId}`;

      await deleteTalent(talentId);

      if (talent.node === "child") {
        router.replace(redirect);
      } else {
        router.replace(redirect);
      }
    },
  });

  let deleteDescription = `Are you sure you want to delete this ${talentTypeText[talentType]}?`;

  if (talent.node === "child") {
    deleteDescription = `Are you sure you want to delete ${talent.name}?`;
  }

  return (
    <>
      <Button variant="blue" onClick={() => setOpenState("edit")}>
        <SquarePen className="size-4" />
        <span>Edit</span>
      </Button>

      {talentType === "culture-and-arts" && talent.node === "parent" && (
        <Button variant="yellow" onClick={() => setOpenState("event")}>
          <Plus className="size-4" />
          <span>Add Event</span>
        </Button>
      )}

      <Button
        variant="destructive"
        onClick={() =>
          openBoolean({
            title: "Confirm Delete",
            description: deleteDescription,
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

      <TalentFormDialog
        talentType={talentType}
        talent={talent}
        open={openState === "event"}
        onOpenChange={(v) => setOpenState(v ? "event" : "none")}
        parentId={talentId}
      />

      {component}
    </>
  );
}

export { TalentDetailsAdminControls };
