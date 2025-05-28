"use client";

import { useState } from "react";
import Image from "next/image";
import { Download } from "lucide-react";

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
import { colleges, courses } from "~/const/courses";
import { talentTypeText } from "~/const/text";
import { ApplicationWithData } from "~/hooks/firestore/use-applications";
import { useAlert } from "~/hooks/use-alert";
import { usePdf } from "~/hooks/use-pdf";
import { ApplicationStatusSchema, TalentTypeSchema } from "~/schema/data-base";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface GenerateApplicationReportDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  applications: ApplicationWithData[];
}

function GenerateApplicationReportDialog(
  props: GenerateApplicationReportDialogProps,
) {
  const { applications, ...rest } = props;

  const [title, setTitle] = useState<string>("");
  const [generating, setGenerating] = useState<boolean>(false);
  const [filter, setFilter] = useState<{
    college: string;
    course: string;
    gender: string;
    type: TalentTypeSchema | "all";
    status: ApplicationStatusSchema | "all";
  }>({
    college: "all",
    course: "all",
    gender: "all",
    type: "all",
    status: "all",
  });

  const { toPDF, targetRef } = usePdf({
    filename: `applications-${new Date().getTime()}.pdf`,
  });
  const { component, openAlert } = useAlert();

  const filteredApplications = applications.filter((a) => {
    const { user, talent } = a;

    const courseObj = courses.find((c) => c.id === user.course);

    const filterCollege =
      filter.college === "all" || !courseObj
        ? true
        : courseObj.college === filter.college;
    const filterCourse =
      filter.course === "all" ? true : user.course === filter.course;
    const filterGender =
      filter.gender === "all" ? true : user.gender === filter.gender;
    const filterType =
      filter.type === "all" ? true : talent.type === filter.type;
    const filterStatus =
      filter.status === "all" ? true : a.status === filter.status;

    return (
      filterCollege &&
      filterCourse &&
      filterGender &&
      filterType &&
      filterStatus
    );
  });

  async function handleDownload() {
    if (filteredApplications.length === 0) {
      openAlert({
        title: "Failed",
        description: "Cannot generate report if there's no application.",
      });
    }

    setGenerating(true);

    try {
      await toPDF();

      openAlert({
        title: "Success",
        description:
          "Successfully generated and downloaded applications report.",
      });

      rest.onOpenChange?.(false);
    } catch (error) {
      console.log("handleDownload error:", error);

      openAlert({
        title: "Failed",
        description: "Failed generating application report.",
      });
    }

    setGenerating(false);
  }

  return (
    <Dialog {...rest}>
      <DialogContent className="flex max-h-[calc(100vh-4rem)] w-full flex-col gap-4 overflow-y-auto sm:max-w-7xl">
        <div className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Generate Report</DialogTitle>

            <DialogDescription>Generate applications report.</DialogDescription>
          </DialogHeader>

          <div className="flex flex-1 flex-col gap-8">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2">
                <span>Title:</span>

                <Input
                  wrapperClassName="flex-1"
                  placeholder="Report Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="shrink-0">Type:</span>

                <Select
                  value={filter.type}
                  onValueChange={(v: TalentTypeSchema | "all") => {
                    setFilter((f) => ({
                      ...f,
                      type: v,
                    }));
                  }}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="sports">Sports Only</SelectItem>
                    <SelectItem value="culture-and-arts">
                      Culture & Arts Only
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <span className="shrink-0">Status:</span>

                <Select
                  value={filter.status}
                  onValueChange={(v: ApplicationStatusSchema | "all") => {
                    setFilter((f) => ({ ...f, status: v }));
                  }}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <span>College:</span>

                <Select
                  value={filter.college}
                  onValueChange={(v) => {
                    setFilter((f) => ({
                      ...f,
                      college: v,
                      course: "all",
                    }));
                  }}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by college" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {colleges.map((c) => (
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
                  onValueChange={(v) => {
                    setFilter((f) => ({
                      ...f,
                      course: v,
                    }));
                  }}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by course" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {courses
                      .filter((c) =>
                        filter.college === "all"
                          ? true
                          : filter.college === c.college,
                      )
                      .map((c) => (
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
                  onValueChange={(v) => {
                    setFilter((f) => ({
                      ...f,
                      gender: v,
                    }));
                  }}
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

            <div
              ref={targetRef}
              className="flex flex-col gap-4 border border-gray-300 p-8"
            >
              <div className="flex flex-col items-center justify-around gap-8 lg:flex-row">
                <div className="flex shrink-0 flex-col items-center gap-4 lg:flex-row">
                  <Image
                    src="/images/logo.png"
                    alt="logo"
                    width={72}
                    height={72}
                  />

                  <div className="flex flex-col">
                    <span className="text-sm leading-tight">
                      Republic of the Philippines
                    </span>
                    <span className="text-sm leading-tight font-medium">
                      BOHOL ISLAND STATE UNIVERSITY
                    </span>
                    <span className="text-xs leading-tight">
                      Magsija, Balilihan, 6342, Bohol, Philippines
                    </span>
                    <span className="text-xs leading-tight">
                      Office of Instruction
                    </span>
                    <span className="text-xs leading-tight italic">
                      Balance | Integrity | Stewardship | Uprightness
                    </span>
                  </div>
                </div>

                <div className="flex items-center">
                  <Image
                    className="h-16 w-auto"
                    src="/images/report-header-1.png"
                    alt="bagong-pilipinas"
                    width={180}
                    height={167}
                  />
                  <Image
                    className="h-16 w-auto"
                    src="/images/report-header-2.jpg"
                    alt="bagong-pilipinas"
                    width={456}
                    height={231}
                  />
                </div>
              </div>

              {!!title && (
                <span className="text-center text-xl font-medium">{title}</span>
              )}

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Sports/Culture & Arts</TableHead>
                    <TableHead>Sports/Culture & Arts Name</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredApplications.map((application) => {
                    const { user } = application;

                    return (
                      <TableRow key={application.id}>
                        <TableCell>
                          <div className="flex items-center gap-4">
                            <Avatar className="size-12">
                              <AvatarImage
                                src={user.profile}
                                alt={user.firstName}
                              />
                              <AvatarFallback>
                                {user.firstName} {user.surname}
                              </AvatarFallback>
                            </Avatar>

                            <span>
                              {user.firstName} {user.surname}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="uppercase">
                          {talentTypeText[application.talent.type]}
                        </TableCell>
                        <TableCell className="">
                          {application.talent.name}
                        </TableCell>
                        <TableCell>{user.course}</TableCell>
                        <TableCell>{user.year}</TableCell>
                        <TableCell>{user.section}</TableCell>
                        <TableCell className="text-gray-500 uppercase">
                          {application.status}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="yellow"
              disabled={filteredApplications.length === 0}
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

export { GenerateApplicationReportDialog };
