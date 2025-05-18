"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import _ from "lodash";
import { Loader } from "lucide-react";

import { AssignCoachDialog } from "~/components/dialogs/assign-coach-dialog";
import { CoachFormDialog } from "~/components/dialogs/coach-form-dialog";
import { AdminLayout } from "~/components/layout/admin-layout";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  getTalentsRealtime,
  getUsersRealtime,
} from "~/lib/firebase/client/firestore";
import { TalentSchema, UserSchema } from "~/schema/data-client";

function toLowerTrim(s: string) {
  return s.toLowerCase().trim();
}

export default function AdminCoachesPage() {
  const [coaches, setCoaches] = useState<UserSchema[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const [talents, setTalents] = useState<TalentSchema[]>([]);

  const filteredCoaches = coaches.filter((t) => {
    const lowerSearch = toLowerTrim(search);
    const searchFilter =
      search.length > 0
        ? toLowerTrim(t.firstName).includes(lowerSearch) ||
          toLowerTrim(t.surname).includes(lowerSearch) ||
          toLowerTrim(t.email).includes(lowerSearch)
        : true;

    return searchFilter;
  });

  useEffect(() => {
    const unsubscribe = getUsersRealtime({ role: "coach" })((v) => {
      setCoaches(v);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const talentIds = coaches.reduce((p, c) => {
      return _.uniq([...p, ...c.talentsAssigned]);
    }, [] as string[]);

    if (talentIds.length === 0) return;

    const unsubscribe = getTalentsRealtime({ ids: talentIds })(setTalents);

    return unsubscribe;
  }, [coaches]);

  return (
    <AdminLayout className="gap-4 p-4">
      <div className="flex lg:h-16 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <span className="text-xl font-medium">Coaches</span>

        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <Button variant="yellow" onClick={() => setOpen(true)}>
            Add Coach
          </Button>
        </div>
      </div>

      <Card className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16"></TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date Created</TableHead>
              <TableHead className="w-36 text-center"></TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={6}>
                  <div className="flex items-center justify-center gap-2">
                    <Loader className="size-4 animate-spin" />

                    <span>Loading...</span>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {!loading && filteredCoaches.length === 0 && (
              <TableRow>
                <TableCell className="text-center text-gray-500" colSpan={6}>
                  No coach records found.
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              filteredCoaches.map((coach) => {
                const coachTalents = talents.filter((t) =>
                  coach.talentsAssigned.includes(t.id),
                );
                const coachTalentsName = coachTalents.map((ct) => ct.name);

                return (
                  <TableRow key={coach.id}>
                    <TableCell>
                      <Avatar className="size-12">
                        <AvatarImage
                          src={coach.profile}
                          alt={coach.firstName[0].toUpperCase()}
                        />

                        <AvatarFallback>
                          {coach.firstName[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      {coach.firstName}{" "}
                      {coach.middleInitial ? `${coach.middleInitial}.` : ""}{" "}
                      {coach.surname}
                    </TableCell>
                    <TableCell>{coach.email}</TableCell>
                    <TableCell>{coachTalentsName.join(", ")}</TableCell>
                    <TableCell className="uppercase">{coach.status}</TableCell>
                    <TableCell className="uppercase">
                      {format(coach.dateCreated, "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>
                      <AssignCoachDialog coach={coach} />
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </Card>

      <CoachFormDialog open={open} onOpenChange={(v) => setOpen(v)} />
    </AdminLayout>
  );
}
