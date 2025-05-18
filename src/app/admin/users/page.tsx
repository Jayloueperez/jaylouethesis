"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Loader } from "lucide-react";

import { AdminLayout } from "~/components/layout/admin-layout";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Card } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
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

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserSchema[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [all, setAll] = useState<boolean>(false);
  const [selected, setSelected] = useState<string[]>([]);
  // const [assignUserRole, setAssignUserRole] = useState<string>("");
  // const [assigning, setAssigning] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");

  const filteredUsers = users.filter((u) => {
    const lowerSearch = toLowerTrim(search);
    const searchFilter =
      search.length > 0
        ? toLowerTrim(u.firstName).includes(lowerSearch) ||
          toLowerTrim(u.surname).includes(lowerSearch) ||
          toLowerTrim(u.role).includes(lowerSearch)
        : true;

    return searchFilter;
  });

  const handleToggleUser = (id: string) => {
    const exist = selected.indexOf(id) !== -1;

    if (exist) return setSelected((v) => v.filter((v1) => v1 !== id));

    setSelected((v) => [...v, id]);
  };

  // async function handleAssignUserRole(
  //   role: Exclude<UserRoleSchema, "unassigned">,
  // ) {
  //   if (!assignUserRole) return;

  //   setAssigning(true);

  //   try {
  //     await updateUser(assignUserRole, { role, status: "confirmed" });
  //     setAssignUserRole("");

  //     openAlert({
  //       title: "Success",
  //       description: `Successfully assigned user role to ${role}.`,
  //     });
  //   } catch (error) {
  //     console.log("handleAssignUserRole error:", error);

  //     openAlert({
  //       title: "Failed",
  //       description: "Failed assigning user role.",
  //     });
  //   }

  //   setAssigning(false);
  // }

  useEffect(() => {
    if (all) {
      setSelected(users.map((d) => d.id));
    } else {
      setSelected([]);
    }
  }, [all, users]);

  useEffect(() => {
    const unsubscribe = getUsersRealtime({
      roles: ["student", "coach"],
    })((v) => {
      setUsers(v);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AdminLayout className="gap-4 p-4">
      <div className="flex lg:h-16 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <span className="text-xl font-medium">Users</span>

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
              <TableHead className="w-12">
                <Checkbox checked={all} onCheckedChange={(v) => setAll(!!v)} />
              </TableHead>
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

            {!loading && filteredUsers.length === 0 && (
              <TableRow>
                <TableCell className="text-center text-gray-500" colSpan={6}>
                  No student records found.
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Checkbox
                      checked={selected.includes(user.id)}
                      onCheckedChange={() => handleToggleUser(user.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <Avatar className="size-12">
                        <AvatarImage
                          src={user.profile}
                          alt={user.firstName[0].toUpperCase()}
                        />

                        <AvatarFallback>
                          {user.firstName[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <span>
                        {user.firstName}{" "}
                        {user.middleInitial ? `${user.middleInitial}.` : ""}{" "}
                        {user.surname}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="uppercase">{user.role}</TableCell>
                  <TableCell className="uppercase">
                    {format(user.dateCreated, "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      {/* {user.role === "unassigned" && (
                        <Button
                          type="button"
                          variant="yellow"
                          loading={assigning && assignUserRole === user.id}
                          onClick={() => setAssignUserRole(user.id)}
                        >
                          Assign Role
                        </Button>
                      )} */}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Card>

      {/* <AssignRoleDialog
        open={!!assignUserRole}
        onOpenChange={(b) => setAssignUserRole((v) => (b ? v : ""))}
        onRoleSelect={handleAssignUserRole}
      /> */}
    </AdminLayout>
  );
}
