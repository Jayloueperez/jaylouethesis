"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader } from "lucide-react";

import { Loading } from "~/components/custom-ui/loading";
import { TalentCard } from "~/components/custom-ui/talent-card";
import { TalentFormDialog } from "~/components/dialogs/talent-form-dialog";
import { CoachLayout } from "~/components/layout/coach-layout";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { talentTypeText } from "~/const/text";
import { useTalentTypeParams } from "~/hooks/use-talent-type-params";
import { getTalentsRealtime } from "~/lib/firebase/client/firestore";
import { TalentTypeSchema } from "~/schema/data-base";
import { TalentSchema } from "~/schema/data-client";

export default function TalentListPage() {
  const [talents, setTalents] = useState<TalentSchema[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const { talentType } = useParams<{
    talentType: TalentTypeSchema;
  }>();

  const { loading: talentTypeLoading } = useTalentTypeParams();

  const filteredTalents = talents.filter(
    (t) =>
      t.name.toLowerCase().includes(search.trim().toLowerCase()) ||
      t.description.toLowerCase().includes(search.trim().toLowerCase()) ||
      t.keywords.includes(search.trim().toLowerCase()),
  );

  useEffect(() => {
    if (talentType !== "culture-and-arts" && talentType !== "sports") return;

    const unsubscribe = getTalentsRealtime({
      type: talentType,
      node: "parent",
      orderBy: "asc",
    })((v) => {
      setTalents(v);
      setLoading(false);
    });

    return unsubscribe;
  }, [talentType]);

  if (talentTypeLoading) return <Loading />;

  return (
    <CoachLayout className="gap-4 p-4">
      <div className="flex lg:h-16 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <span className="text-xl font-medium">
          {talentTypeText[talentType]}
        </span>

        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <Button variant="yellow" onClick={() => setOpen(true)}>
            Add {talentTypeText[talentType]}
          </Button>
        </div>
      </div>

      {loading && (
        <div className="flex flex-1 items-center justify-center gap-2">
          <Loader className="size-4 animate-spin" />

          <span>Loading...</span>
        </div>
      )}

      {!loading && filteredTalents.length === 0 && (
        <div className="flex flex-1 items-center justify-center">
          <span className="text-gray-500">
            No {talentTypeText[talentType]} records found.
          </span>
        </div>
      )}

      {!loading && filteredTalents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTalents.map((talent) => (
            <TalentCard
              key={talent.id}
              href={`/coach/${talentType}/${talent.id}`}
              talent={talent}
              talentType={talentType}
            />
          ))}
        </div>
      )}

      <TalentFormDialog
        talentType={talentType}
        open={open}
        onOpenChange={setOpen}
      />
    </CoachLayout>
  );
}
