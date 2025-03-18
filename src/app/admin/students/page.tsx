"use client";

import { useEffect, useState } from "react";
import { Eye, Trash } from "lucide-react";

import { AdminLayout } from "~/components/layout/admin-layout";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
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
import { UserSchema } from "~/schema/data";
import { generateUsers } from "~/utils/faker";

const AdminStudentsPage = () => {
  const [students, setStudents] = useState<UserSchema[]>([]);
  const [all, setAll] = useState<boolean>(false);
  const [selected, setSelected] = useState<string[]>([]);

  // const handleDeleteStudent = async (id: string) => {
  //   console.log(id);
  // };

  const handleToggleStudent = (id: string) => {
    const exist = selected.indexOf(id) !== -1;

    if (exist) return setSelected((v) => v.filter((v1) => v1 !== id));

    setSelected((v) => [...v, id]);
  };

  useEffect(() => {
    if (all) {
      setSelected(students.map((d) => d.id));
    } else {
      setSelected([]);
    }
  }, [all, students]);

  useEffect(() => {
    setStudents(generateUsers(5, "student"));
  }, []);

  return (
    <AdminLayout className="gap-4 p-4">
      <div className="flex h-16 items-center justify-between">
        <span className="text-xl font-medium">Students</span>

        <div className="flex items-center gap-2">
          <Input placeholder="Search..." />
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox checked={all} onCheckedChange={(v) => setAll(!!v)} />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Section</TableHead>
              <TableHead className="w-36">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell>
                  <Checkbox
                    checked={selected.includes(student.id)}
                    onCheckedChange={() => handleToggleStudent(student.id)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-4">
                    <Avatar className="size-12">
                      <AvatarImage
                        src="https://placehold.co/400x400"
                        alt="Example Club 1"
                      />
                      <AvatarFallback>{student.firstName}</AvatarFallback>
                    </Avatar>

                    <span>
                      {student.firstName} {student.middleInitial}.{" "}
                      {student.surname}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{student.course}</TableCell>
                <TableCell>{student.year}</TableCell>
                <TableCell>{student.section}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="blue"
                      size="icon"
                      shape="pill"
                    >
                      <Eye className="size-4" />
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          shape="pill"
                        >
                          <Trash className="size-4" />
                        </Button>
                      </AlertDialogTrigger>

                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>

                          <AlertDialogDescription>
                            Are you sure you want to delete{" "}
                            <span className="font-bold text-destructive">
                              {student.firstName} {student.middleInitial}.{" "}
                              {student.surname}
                            </span>
                            ?
                          </AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction variant="destructive">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </AdminLayout>
  );
};

export default AdminStudentsPage;
