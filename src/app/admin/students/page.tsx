"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Loader } from "lucide-react";

import { ViewProfileDialog } from "~/components/dialogs/view-profile-dialog";
import { AdminLayout } from "~/components/layout/admin-layout";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
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

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<UserSchema[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");

  const filteredStudents = students.filter((t) => {
    const lowerSearch = toLowerTrim(search);
    const searchFilter =
      search.length > 0
        ? toLowerTrim(t.firstName).includes(lowerSearch) ||
          toLowerTrim(t.surname).includes(lowerSearch) ||
          toLowerTrim(t.role).includes(lowerSearch)
        : true;

    return searchFilter;
  });

  useEffect(() => {
    const unsubscribe = getUsersRealtime({ role: "student" })((v) => {
      setStudents(v);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AdminLayout className="gap-4 p-4">
      <div className="flex lg:h-16 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <span className="text-xl font-medium">Students</span>

        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Date Created</TableHead>
              <TableHead className="w-36 text-center">Actions</TableHead>
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

            {!loading && filteredStudents.length === 0 && (
              <TableRow>
                <TableCell className="text-center text-gray-500" colSpan={6}>
                  No student records found.
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <Avatar className="size-12">
                        <AvatarImage
                          src={student.profile}
                          alt={student.firstName[0].toUpperCase()}
                        />

                        <AvatarFallback>
                          {student.firstName[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <span>
                        {student.firstName}{" "}
                        {student.middleInitial
                          ? `${student.middleInitial}.`
                          : ""}{" "}
                        {student.surname}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="uppercase">{student.role}</TableCell>
                  <TableCell className="uppercase">
                    {format(student.dateCreated, "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <ViewProfileDialog user={student}>
                        View Profile
                      </ViewProfileDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Card>
    </AdminLayout>
  );
}
