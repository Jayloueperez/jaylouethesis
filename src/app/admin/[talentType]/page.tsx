"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import _ from "lodash";

import { Loading } from "~/components/custom-ui/loading";
import { TalentCard } from "~/components/custom-ui/talent-card";
import { TalentFormDialog } from "~/components/dialogs/talent-form-dialog";
import { AdminLayout } from "~/components/layout/admin-layout";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { talentTypePlurals } from "~/const/text";
import { useTalentTypeParams } from "~/hooks/use-talent-type-params";
import { getTalentsRealtime } from "~/lib/firebase/client/firestore";
import { TalentSchema, TalentTypeSchema } from "~/schema/data";

const TalentList = () => {
  const [talents, setTalents] = useState<TalentSchema[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");

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
    if (talentType !== "club" && talentType !== "sport") return;

    const unsubscribe = getTalentsRealtime({ type: talentType })(setTalents);

    return unsubscribe;
  }, [talentType]);

  if (talentTypeLoading) return <Loading />;

  return (
    <AdminLayout className="gap-4 p-4">
      <div className="flex h-16 items-center justify-between">
        <span className="text-xl font-medium">
          {talentTypePlurals[talentType]}
        </span>

        <div className="flex items-center gap-2">
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <Button variant="yellow" onClick={() => setOpen(true)}>
            Add {_.upperFirst(talentType)}
          </Button>
        </div>
      </div>

      {filteredTalents.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {filteredTalents.map((talent) => (
            <TalentCard
              key={talent.id}
              href={`/admin/${talentType}/${talent.id}`}
              talent={talent}
              type={talentType}
            />
          ))}
        </div>
      )}

      {filteredTalents.length === 0 && (
        <div className="flex flex-1 items-center justify-center">
          <span className="text-gray-500">
            No {talentType} records found.
          </span>
        </div>
      )}

      <TalentFormDialog type={talentType} open={open} onOpenChange={setOpen} />
    </AdminLayout>
  );
};

export default TalentList;
