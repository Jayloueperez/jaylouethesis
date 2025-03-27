"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";

import { ButtonLink } from "~/components/custom-ui/button-link";
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
import { useApplications } from "~/hooks/firestore/use-applications";
import { useAlert } from "~/hooks/use-alert";
import { usePdf } from "~/hooks/use-pdf";

export default function AdminRegistrationsPage() {
  const [filterBy, setFilterBy] = useState<string>("all");

  const { data: applications, loading } = useApplications();
  const { toPDF, targetRef } = usePdf({
    filename: `applications-${new Date().getTime()}.pdf`,
  });
  const { component, openAlert } = useAlert();

  const filteredApplications = applications.filter((a) => {
    if (filterBy === "all") return true;

    return a.talentType === filterBy;
  });

  function handleGenerateReport() {
    if (applications.length === 0) {
      openAlert({
        title: "Warning",
        description: "Cannot generate pdf report if there are no data.",
      });
      return;
    }

    toPDF();
  }

  return (
    <AdminLayout className="gap-4 p-4">
      <div className="flex h-16 items-center justify-between">
        <span className="text-xl font-medium">
          Sport/Club Student Applications
        </span>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="shrink-0">Filter by:</span>

            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="sport">Sports Only</SelectItem>
                <SelectItem value="club">Clubs Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Input placeholder="Search..." />

          <Button variant="blue" onClick={handleGenerateReport}>
            Generate Report
          </Button>
        </div>
      </div>

      <Card className="p-0">
        <Table ref={targetRef}>
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
              <TableHead>Sport/Club</TableHead>
              <TableHead>Sport/Club Name</TableHead>
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
                  <span className="text-gray-500">
                    Loading student applications...
                  </span>
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
                const { id, user, talentType, talentId, status } = application;

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
                    <TableCell className="uppercase">{talentType}</TableCell>
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
                          href={`/admin/${talentType}/${talentId}/applicants`}
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

      {component}
    </AdminLayout>
  );
}
