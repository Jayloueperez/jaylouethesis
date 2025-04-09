"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";

import { ButtonLink } from "~/components/custom-ui/button-link";
import { GenerateApplicationReportDialog } from "~/components/dialogs/generate-application-report-dialog";
import { AdminLayout } from "~/components/layout/admin-layout";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
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
import { courses, departments } from "~/const/courses";
import { talentTypeText } from "~/const/text";
import { useApplications } from "~/hooks/firestore/use-applications";
import { ApplicationStatusSchema, TalentTypeSchema } from "~/schema/data-base";

export default function AdminRegistrationsPage() {
  const [filter, setFilter] = useState<{
    department: string;
    course: string;
    gender: string;
    type: TalentTypeSchema | "all";
    status: ApplicationStatusSchema | "all";
  }>({
    department: "all",
    course: "all",
    gender: "all",
    type: "all",
    status: "all",
  });
  const [open, setOpen] = useState<boolean>(false);

  const { data: applications, loading } = useApplications();

  const filteredApplications = applications.filter((a) => {
    const { user, talent } = a;

    const courseObj = courses.find((c) => c.id === user.course);

    const filterDepartment =
      filter.department === "all" || !courseObj
        ? true
        : courseObj.department === filter.department;
    const filterCourse =
      filter.course === "all" ? true : user.course === filter.course;
    const filterGender =
      filter.gender === "all" ? true : user.gender === filter.gender;
    const filterType =
      filter.type === "all" ? true : talent.type === filter.type;
    const filterStatus =
      filter.status === "all" ? true : a.status === filter.status;

    return (
      filterDepartment &&
      filterCourse &&
      filterGender &&
      filterType &&
      filterStatus
    );
  });

  return (
    <AdminLayout className="gap-4 p-4">
      <div className="flex h-16 items-center justify-between">
        <span className="text-xl font-medium">
          Sports/Culture & Arts Student Applications
        </span>

        <div className="flex items-center gap-2">
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
          <span>Department:</span>

          <Select
            value={filter.department}
            onValueChange={(v) => {
              setFilter((f) => ({
                ...f,
                department: v,
                course: "all",
              }));
            }}
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
                  filter.department === "all"
                    ? true
                    : filter.department === c.department,
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

      <Card className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              {/* <TableHead className="w-12">
                <Checkbox
                  checked={all}
                  onCheckedChange={(v) => {
                    if (!!v) {
                      setAll(true);
                      setSelected(applications.map((d) => d.id));
                    } else {
                      setAll(false);
                      setSelected([]);
                    }
                  }}
                  disabled={applications.length === 0}
                />
              </TableHead> */}
              <TableHead>Name</TableHead>
              <TableHead>Sports/Culture & Arts</TableHead>
              <TableHead>Sports/Culture & Arts Name</TableHead>
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
                  <span className="text-gray-500">
                    No student applications.
                  </span>
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              filteredApplications.map((application) => {
                const { id, user, talentType, talentId, status, talent } =
                  application;

                return (
                  <TableRow key={id}>
                    {/* <TableCell>
                      <Checkbox
                        checked={selected.includes(application.id)}
                        onCheckedChange={() =>
                          handleToggleApplication(application.id)
                        }
                      />
                    </TableCell> */}
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
                          {user.firstName} {user.middleInitial}. {user.surname}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="uppercase">
                      {talentTypeText[talentType]}
                    </TableCell>
                    <TableCell className="">
                      {application.talent.name}
                    </TableCell>
                    <TableCell>{user.course}</TableCell>
                    <TableCell>{user.year}</TableCell>
                    <TableCell>{user.section}</TableCell>
                    <TableCell className="text-gray-500 uppercase">
                      {status}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
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
    </AdminLayout>
  );
}
