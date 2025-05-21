"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowRight, Loader } from "lucide-react";

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
import { useAlert } from "~/hooks/use-alert";
import { usePdf } from "~/hooks/use-pdf";
import {
  createReport,
  getUsersRealtime,
} from "~/lib/firebase/client/firestore";
import { ReportSchema, TalentSchema, UserSchema } from "~/schema/data-client";
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

interface ReportDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  talent: TalentSchema;
  report: ReportSchema | null;
  hideActions?: boolean;
}

function ReportDialog(props: ReportDialogProps) {
  const { talent, report, hideActions = false, ...rest } = props;

  const [loading, setLoading] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);
  const [members, setMembers] = useState<UserSchema[]>([]);
  const [title, setTitle] = useState<string>("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [filter, setFilter] = useState<{
    gender: string;
  }>({ gender: "all" });

  const { toPDF, targetRef } = usePdf({
    filename: `${talent.id}-members-${new Date().getTime()}.pdf`,
  });
  const { component, openAlert } = useAlert();

  const filteredMembers = members.filter((m) => {
    const filterGender =
      filter.gender === "all" ? true : m.gender === filter.gender;

    return filterGender;
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
    const memberIds = report?.members ?? [];

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
  }, [report]);

  useEffect(() => {
    setTitle(report?.title ?? "");
    setSelectedMembers(report?.members ?? []);
  }, [report]);

  return (
    <Dialog {...rest}>
      <DialogContent className="flex w-full flex-col gap-4 sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-3xl 2xl:max-w-4xl">
        <div className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Proceed Report</DialogTitle>

            <DialogDescription>
              Must select student(s) to proceed.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-1 flex-col gap-8">
            {!hideActions && (
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
            )}

            <div
              ref={targetRef}
              className="flex flex-col gap-4 border border-gray-300 p-8"
            >
              <div className="flex items-center justify-around gap-8">
                <div className="flex shrink-0 items-center gap-4">
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

              <span className="text-center text-xl font-medium">{title}</span>

              <Table>
                <TableHeader>
                  <TableRow>
                    {!hideActions && (
                      <TableHead data-html2canvas-ignore>
                        <Checkbox
                          checked={
                            filteredMembers.length > 0 &&
                            filteredMembers.length === selectedMembers.length
                          }
                          onCheckedChange={() =>
                            setSelectedMembers((mIds) =>
                              mIds.length === filteredMembers.length
                                ? []
                                : filteredMembers.map((m) => m.id),
                            )
                          }
                        />
                      </TableHead>
                    )}
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
                    <TableRow
                      key={member.id}
                      {...(selectedMembers.includes(member.id)
                        ? {}
                        : { "data-html2canvas-ignore": true })}
                    >
                      {!hideActions && (
                        <TableCell data-html2canvas-ignore>
                          <Checkbox
                            checked={selectedMembers.includes(member.id)}
                            onCheckedChange={() =>
                              handleToggleSelect(member.id)
                            }
                          />
                        </TableCell>
                      )}
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

          {!hideActions && (
            <DialogFooter>
              <Button
                variant="blue"
                disabled={selectedMembers.length === 0}
                onClick={handleDownload}
                loading={generating}
              >
                <span>Proceed</span>
                <ArrowRight className="size-4" />
              </Button>
            </DialogFooter>
          )}
        </div>
      </DialogContent>

      {component}
    </Dialog>
  );
}

export { ReportDialog };
