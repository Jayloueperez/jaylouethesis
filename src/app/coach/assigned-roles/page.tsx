"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

import { ButtonLink } from "~/components/custom-ui/button-link";
import { Loading } from "~/components/custom-ui/loading";
import { CoachLayout } from "~/components/layout/coach-layout";
import { Card } from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { talentTypeText } from "~/const/text";
import { getTalentsRealtime } from "~/lib/firebase/client/firestore";
import { TalentSchema } from "~/schema/data-client";
import { useAppSelector } from "~/store";

function AssignedRolePage() {
  const [talents, setTalents] = useState<TalentSchema[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const { userData } = useAppSelector((state) => state.user);

  useEffect(() => {
    if (!userData || (userData && userData.talentsAssigned.length === 0))
      return;

    setLoading(true);

    const unsubscribe = getTalentsRealtime({ ids: userData.talentsAssigned })((
      v,
    ) => {
      setTalents(v);
      setLoading(false);
    });

    return unsubscribe;
  }, [userData]);

  if (!userData) return <Loading />;

  return (
    <CoachLayout className="gap-4 p-4">
      <div className="flex lg:h-16 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <span className="text-xl font-medium">Assigned Roles</span>
      </div>

      <Card className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="w-36">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading && (
              <TableRow>
                <TableCell className="text-center" colSpan={7}>
                  <span className="text-gray-500">Loading...</span>
                </TableCell>
              </TableRow>
            )}

            {!loading && talents.length === 0 && (
              <TableRow>
                <TableCell className="text-center" colSpan={7}>
                  <span className="text-gray-500">
                    Not assigned to any role yet.
                  </span>
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              talents.map((talent) => {
                const { id, name, parentId, type } = talent;

                return (
                  <TableRow key={id}>
                    <TableCell>{name}</TableCell>
                    <TableCell className="uppercase">
                      {talentTypeText[type]}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <ButtonLink
                          href={
                            type === "sports"
                              ? `/coach/${type}/${id}`
                              : `/coach/${type}/${parentId}/event/${id}`
                          }
                          type="button"
                          variant="blue"
                          size="icon"
                          shape="pill"
                        >
                          <ArrowRight className="size-4" />
                        </ButtonLink>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </Card>
    </CoachLayout>
  );
}

export default AssignedRolePage;
