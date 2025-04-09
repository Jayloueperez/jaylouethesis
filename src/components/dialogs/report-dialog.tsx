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

interface ReportDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  talent: TalentSchema;
  report: ReportSchema | null;
}

function ReportDialog(props: ReportDialogProps) {
  const { talent, report, ...rest } = props;

  const [loading, setLoading] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);
  const [members, setMembers] = useState<UserSchema[]>([]);
  const [title, setTitle] = useState<string>("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const { toPDF, targetRef } = usePdf({
    filename: `${talent.id}-members-${new Date().getTime()}.pdf`,
  });
  const { component, openAlert } = useAlert();

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
            </div>

            <div
              ref={targetRef}
              className="flex flex-col gap-4 border border-gray-300 p-8"
            >
              <div className="flex items-center justify-center">
                <Image
                  src="/images/logo.png"
                  alt="logo"
                  width={128}
                  height={128}
                />
              </div>

              <span className="text-center text-xl font-medium">{title}</span>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead data-html2canvas-ignore>
                      <Checkbox
                        checked={members.length === selectedMembers.length}
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

                  {!loading && members.length === 0 && (
                    <TableRow>
                      <TableCell
                        className="text-center text-gray-500"
                        colSpan={5}
                      >
                        No members yet.
                      </TableCell>
                    </TableRow>
                  )}

                  {members.map((member) => (
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
              variant="blue"
              disabled={selectedMembers.length === 0}
              onClick={handleDownload}
              loading={generating}
            >
              <span>Proceed</span>
              <ArrowRight className="size-4" />
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>

      {component}
    </Dialog>
  );
}

export { ReportDialog };
