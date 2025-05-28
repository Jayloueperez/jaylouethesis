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
import { colleges, courses } from "~/const/courses";
import { useAlert } from "~/hooks/use-alert";
import { usePdf } from "~/hooks/use-pdf";
import {
  createReport,
  getUsersRealtime,
} from "~/lib/firebase/client/firestore";
import { TalentSchema, UserSchema } from "~/schema/data-client";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
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
  const [generating, setGenerating] = useState<boolean>(false);
  const [members, setMembers] = useState<UserSchema[]>([]);
  const [title, setTitle] = useState<string>("");
  const [filter, setFilter] = useState<{
    college: string;
    course: string;
    gender: string;
  }>({ college: "all", course: "all", gender: "all" });
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const { toPDF, targetRef } = usePdf({
    filename: `${talent.id}-members-${new Date().getTime()}.pdf`,
  });
  const { component, openAlert } = useAlert();

  const filteredMembers = members.filter((m) => {
    const courseObj = courses.find((c) => c.id === m.course);

    const filterCollege =
      filter.college === "all" || !courseObj
        ? true
        : courseObj.college === filter.college;
    const filterCourse =
      filter.course === "all" ? true : m.course === filter.course;
    const filterGender =
      filter.gender === "all" ? true : m.gender === filter.gender;

    return filterCollege && filterCourse && filterGender;
  });

  async function handleDownload() {
    if (selectedMembers.length === 0) {
      openAlert({
        title: "Failed",
        description: "Cannot generate report if there's no member.",
      });
    }

    setGenerating(true);

    try {
      await createReport({
        title,
        members: selectedMembers,
        talentId: talent.id,
      });
      await toPDF();

      openAlert({
        title: "Success",
        description: "Successfully generated and downloaded report.",
      });

      rest.onOpenChange?.(false);
    } catch (error) {
      console.log("handleDownload error:", error);

      openAlert({
        title: "Failed",
        description: "Failed generating report.",
      });
    }

    setGenerating(false);
  }

  function handleToggleSelect(memberId: string) {
    const exists = selectedMembers.includes(memberId);

    if (exists)
      setSelectedMembers((mIds) => mIds.filter((mId) => mId !== memberId));
    else setSelectedMembers((mIds) => [...mIds, memberId]);
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
      <DialogContent className="flex max-h-[calc(100vh-4rem)] w-full flex-col gap-4 overflow-y-auto sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-3xl 2xl:max-w-4xl">
        <div className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Generate Report</DialogTitle>

            <DialogDescription>
              Must select student(s) to generate report.
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
                  <span>College:</span>

                  <Select
                    value={filter.college}
                    onValueChange={(v) => {
                      setSelectedMembers([]);
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
                      setSelectedMembers([]);
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
                      setSelectedMembers([]);
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
                    <TableHead data-html2canvas-ignore>
                      <Checkbox
                        checked={
                          filteredMembers.length > 0 &&
                          filteredMembers.length === selectedMembers.length
                        }
                        onCheckedChange={() =>
                          setSelectedMembers((mIds) =>
                            mIds.length === members.length
                              ? []
                              : members.map((m) => m.id),
                          )
                        }
                      />
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Age</TableHead>
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
                    <TableRow
                      key={member.id}
                      {...(selectedMembers.includes(member.id)
                        ? {}
                        : { "data-html2canvas-ignore": true })}
                    >
                      <TableCell data-html2canvas-ignore>
                        <Checkbox
                          checked={selectedMembers.includes(member.id)}
                          onCheckedChange={() => handleToggleSelect(member.id)}
                        />
                      </TableCell>
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
                      <TableCell>{member.age}</TableCell>
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
              disabled={selectedMembers.length === 0}
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
