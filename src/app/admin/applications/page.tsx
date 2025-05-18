"use client";

import { useState } from "react";
import _ from "lodash";
import { ArrowRight, ChevronDown } from "lucide-react";

import { ButtonLink } from "~/components/custom-ui/button-link";
import { GenerateApplicationReportDialog } from "~/components/dialogs/generate-application-report-dialog";
import { ViewProfileDialog } from "~/components/dialogs/view-profile-dialog";
import { AdminLayout } from "~/components/layout/admin-layout";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
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
import { useApplications } from "~/hooks/firestore/use-applications";
import { useAlert } from "~/hooks/use-alert";
import {
  updateApplications,
  updateTalentAddMembers,
} from "~/lib/firebase/client/firestore";
import { ApplicationStatusSchema, TalentTypeSchema } from "~/schema/data-base";

export default function AdminRegistrationsPage() {
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
  const [open, setOpen] = useState<boolean>(false);
  const [selectedApplications, setSelectedApplications] = useState<string[]>(
    [],
  );

  const { data: applications, loading } = useApplications();
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

  const toggleSelect = (applicationId: string) => {
    const exist = selectedApplications.includes(applicationId);

    if (exist) {
      setSelectedApplications((v) => v.filter((aid) => aid !== applicationId));
    } else {
      setSelectedApplications((v) => [...v, applicationId]);
    }
  };

  const handleBulkAction = async (status: ApplicationStatusSchema) => {
    try {
      const filteredSelectedApplications = selectedApplications.filter(
        (aid) => {
          const aData = filteredApplications.find((a) => a.id === aid);

          return aData ? aData.status === "pending" : true;
        },
      );
      const selectedApplicationsWithData = filteredSelectedApplications
        .map((applicationId) => {
          const applicationData = applications.find(
            (a) => a.id === applicationId,
          );

          return applicationData ?? null;
        })
        .filter((a) => !!a);

      if (selectedApplicationsWithData.length === 0) {
        openAlert({
          title: "Success",
          description: "Nothing to update.",
        });
        setSelectedApplications([]);
        return;
      }

      const selectedApplicationsWithDataIds = selectedApplicationsWithData.map(
        (a) => a.id,
      );

      await updateApplications(selectedApplicationsWithDataIds, {
        status,
      });

      if (status === "accepted") {
        const groupedByTalent = _.groupBy(
          selectedApplicationsWithData,
          (a) => a.talentId,
        );
        const promises = _.map(groupedByTalent, (v, k) => {
          return updateTalentAddMembers(
            k,
            v.map((a) => a.userId),
          );
        });

        await Promise.all(promises);
      }

      openAlert({
        title: "Success",
        description: `Successfully ${status} applications.`,
      });
      setSelectedApplications([]);
    } catch (error) {
      console.log("handleBulkAction error:", error);

      openAlert({
        title: "Failed",
        description: `Failed updating applications status.`,
      });
    }
  };

  return (
    <AdminLayout className="gap-4 p-4">
      <div className="flex lg:h-16 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <span className="text-xl font-medium">
          Sports/Culture & Arts Student Applicants
        </span>

        <div className="flex flex-wrap items-center gap-2">
          <Input placeholder="Search..." />

          <Button variant="blue" onClick={() => setOpen(true)}>
            Generate Report
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2">
          <span className="shrink-0">Type:</span>

          <Select
            value={filter.type}
            onValueChange={(v: TalentTypeSchema | "all") => {
              setFilter((f) => ({
                ...f,
                type: v,
              }));
              setSelectedApplications([]);
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
              setSelectedApplications([]);
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
              setSelectedApplications([]);
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
              setSelectedApplications([]);
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
              setSelectedApplications([]);
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

        {selectedApplications.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 rounded-md border px-3 py-2">
              <span>Bulk Action</span>

              <ChevronDown className="size-4" />
            </DropdownMenuTrigger>

            <DropdownMenuContent>
              <DropdownMenuItem
                className="text-center hover:bg-green-100"
                onClick={() => handleBulkAction("accepted")}
              >
                <span>Accept</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                className="text-center hover:bg-red-100"
                onClick={() => handleBulkAction("rejected")}
              >
                <span>Reject</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <Card className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    selectedApplications.length === filteredApplications.length
                  }
                  onCheckedChange={() => {
                    if (
                      selectedApplications.length ===
                      filteredApplications.length
                    ) {
                      setSelectedApplications([]);
                    } else {
                      setSelectedApplications(
                        filteredApplications.map((a) => a.id),
                      );
                    }
                  }}
                  disabled={filteredApplications.length === 0}
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Sports/Culture & Arts</TableHead>
              <TableHead>Sports/Culture & Arts Name</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Section</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-36">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading && (
              <TableRow>
                <TableCell className="text-center" colSpan={7}>
                  <span className="text-gray-500">Loading...</span>
                </TableCell>
              </TableRow>
            )}

            {!loading && filteredApplications.length === 0 && (
              <TableRow>
                <TableCell className="text-center" colSpan={7}>
                  <span className="text-gray-500">No student applicants.</span>
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              filteredApplications.map((application) => {
                const { id, user, talentType, talentId, status, talent } =
                  application;

                return (
                  <TableRow key={id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedApplications.includes(application.id)}
                        onCheckedChange={() => toggleSelect(application.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <Avatar className="size-12">
                          <AvatarImage
                            src={user.profile}
                            alt={`${user.firstName} ${user.surname}`}
                          />
                          <AvatarFallback>
                            {user.firstName.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>

                        <span>
                          {user.firstName}{" "}
                          {user.middleInitial ? `${user.middleInitial}.` : ""}{" "}
                          {user.surname}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="uppercase">
                      {talentTypeText[talentType]}
                    </TableCell>
                    <TableCell className="">
                      {application.talent.name}
                    </TableCell>
                    <TableCell>{user.age}</TableCell>
                    <TableCell>{user.course}</TableCell>
                    <TableCell>{user.year}</TableCell>
                    <TableCell>{user.section}</TableCell>
                    <TableCell className="text-gray-500 uppercase">
                      {status}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <ViewProfileDialog user={user}>
                          View Profile
                        </ViewProfileDialog>

                        <ButtonLink
                          href={
                            talentType === "sports"
                              ? `/admin/${talentType}/${talentId}/applicants`
                              : `/admin/${talentType}/${talent.parentId}/event/${talentId}/applicants`
                          }
                          type="button"
                          variant="blue"
                          size="icon"
                          shape="pill"
                        >
                          <ArrowRight className="size-4" />
                        </ButtonLink>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </Card>

      <GenerateApplicationReportDialog
        applications={applications}
        open={open}
        onOpenChange={setOpen}
      />

      {component}
    </AdminLayout>
  );
}
