"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Loader } from "lucide-react";

import { TeacherFormDialog } from "~/components/dialogs/teacher-form-dialog";
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
import { getUsersRealtime } from "~/lib/firebase/client/firestore";
import { UserSchema } from "~/schema/data-client";

function toLowerTrim(s: string) {
  return s.toLowerCase().trim();
}

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useState<UserSchema[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);

  const filteredTeachers = teachers.filter((t) => {
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
    const unsubscribe = getUsersRealtime({ role: "teacher" })((v) => {
      setTeachers(v);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AdminLayout className="gap-4 p-4">
      <div className="flex h-16 items-center justify-between">
        <span className="text-xl font-medium">Teachers</span>

        <div className="flex items-center gap-2">
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <Button variant="yellow" onClick={() => setOpen(true)}>
            Add Teacher
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

            {!loading && filteredTeachers.length === 0 && (
              <TableRow>
                <TableCell className="text-center text-gray-500" colSpan={6}>
                  No teacher records found.
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              filteredTeachers.map((teacher) => (
                <TableRow key={teacher.id}>
                  <TableCell>
                    <Avatar className="size-12">
                      <AvatarImage
                        src={teacher.profile}
                        alt={teacher.firstName[0].toUpperCase()}
                      />

                      <AvatarFallback>
                        {teacher.firstName[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    {teacher.firstName}{" "}
                    {teacher.middleInitial ? `${teacher.middleInitial}.` : ""}{" "}
                    {teacher.surname}
                  </TableCell>
                  <TableCell>{teacher.email}</TableCell>
                  <TableCell className="uppercase">{teacher.status}</TableCell>
                  <TableCell className="uppercase">
                    {format(teacher.dateCreated, "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2"></div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Card>

      <TeacherFormDialog open={open} onOpenChange={(v) => setOpen(v)} />
    </AdminLayout>
  );
}
