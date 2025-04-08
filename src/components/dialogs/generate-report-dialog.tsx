"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Download, Loader } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { courses, departments } from "~/const/courses";
import { useAlert } from "~/hooks/use-alert";
import { usePdf } from "~/hooks/use-pdf";
import {
  createReport,
  getUsersRealtime,
} from "~/lib/firebase/client/firestore";
import { TalentSchema, UserSchema } from "~/schema/data-client";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface GenerateReportDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  talent: TalentSchema;
}

function GenerateReportDialog(props: GenerateReportDialogProps) {
  const { talent, ...rest } = props;

  const [loading, setLoading] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(true);
  const [members, setMembers] = useState<UserSchema[]>([]);
  const [title, setTitle] = useState<string>("");
  const [filter, setFilter] = useState<{
    department: string;
    course: string;
    gender: string;
  }>({ department: "all", course: "all", gender: "all" });

  const { toPDF, targetRef } = usePdf({
    filename: `${talent.id}-members-${new Date().getTime()}.pdf`,
  });
  const { component, openAlert } = useAlert();

  const filteredMembers = members.filter((m) => {
    const courseObj = courses.find((c) => c.id === m.course);

    const filterDepartment =
      filter.department === "all" || !courseObj
        ? true
        : courseObj.department === filter.department;
    const filterCourse =
      filter.course === "all" ? true : m.course === filter.course;
    const filterGender =
      filter.gender === "all" ? true : m.gender === filter.gender;

    return filterDepartment && filterCourse && filterGender;
  });

  async function handleDownload() {
    if (filteredMembers.length === 0) {
      openAlert({
        title: "Failed",
        description: "Cannot generate report if there's no member.",
      });
    }

    setGenerating(true);

    try {
      await createReport({ title, members: filteredMembers.map((m) => m.id) });
      await toPDF();

      openAlert({
        title: "Success",
        description: "Successfully generated and downloaded report.",
      });
    } catch (error) {
      console.log("handleDownload error:", error);

      openAlert({
        title: "Failed",
        description: "Failed generating report.",
      });
    }

    setGenerating(false);
  }

  useEffect(() => {
    const memberIds = talent.members ?? [];

    if (memberIds.length > 0) {
      setLoading(true);

      const unsubscribe = getUsersRealtime({ ids: memberIds })((v) => {
        setMembers(v);
        setLoading(false);
      });

      return unsubscribe;
    } else {
      setMembers([]);
      setLoading(false);
    }
  }, [talent]);

  return (
    <Dialog {...rest}>
      <DialogContent className="flex w-full flex-col gap-4 sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-3xl 2xl:max-w-4xl">
        <div className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Schedule Student Tryout</DialogTitle>

            <DialogDescription>
              Assign an existing tryout schedule for student(s).
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-1 flex-col gap-8">
            <div className="flex flex-col gap-2">
              <div className="flex flex-1 items-center gap-2">
                <span>Title:</span>

                <Input
                  wrapperClassName="flex-1"
                  placeholder="Report Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <span>Department:</span>

                  <Select
                    value={filter.department}
                    onValueChange={(v) =>
                      setFilter((f) => ({
                        ...f,
                        department: v,
                      }))
                    }
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by department" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      {departments.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <span>Course:</span>

                  <Select
                    value={filter.course}
                    onValueChange={(v) =>
                      setFilter((f) => ({
                        ...f,
                        course: v,
                      }))
                    }
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by course" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      {courses.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <span>Gender:</span>

                  <Select
                    value={filter.gender}
                    onValueChange={(v) =>
                      setFilter((f) => ({
                        ...f,
                        gender: v,
                      }))
                    }
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by gender" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div ref={targetRef} className="flex flex-col gap-4 p-8">
              <div className="flex items-center justify-center">
                <Image
                  src="/images/logo.png"
                  alt="logo"
                  width={128}
                  height={128}
                />
              </div>

              {!!title && (
                <span className="text-center text-xl font-medium">{title}</span>
              )}

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Section</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {loading && (
                    <TableRow>
                      <TableCell
                        className="text-center text-gray-500"
                        colSpan={5}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <Loader className="size-4 animate-spin" />

                          <span>Loading...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}

                  {!loading && filteredMembers.length === 0 && (
                    <TableRow>
                      <TableCell
                        className="text-center text-gray-500"
                        colSpan={5}
                      >
                        No members yet.
                      </TableCell>
                    </TableRow>
                  )}

                  {filteredMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-4">
                          <Avatar className="size-12">
                            <AvatarImage
                              src={member.profile}
                              alt={member.firstName}
                            />
                            <AvatarFallback>
                              {member.firstName} {member.surname}
                            </AvatarFallback>
                          </Avatar>

                          <span>
                            {member.firstName} {member.surname}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{member.course}</TableCell>
                      <TableCell>{member.year}</TableCell>
                      <TableCell>{member.section}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="yellow"
              disabled={filteredMembers.length === 0}
              onClick={handleDownload}
              loading={generating}
            >
              <Download className="size-4" />
              <span>Download</span>
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>

      {component}
    </Dialog>
  );
}

export { GenerateReportDialog };
