"use client";

import { ArrowRight, Loader } from "lucide-react";

import { ButtonLink } from "~/components/custom-ui/button-link";
import { AdminLayout } from "~/components/layout/admin-layout";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Card } from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { talentTypeText } from "~/const/text";
import { useApplications } from "~/hooks/firestore/use-applications";

export default function AdminPage() {
  // const [] = useState<ApplicationSchema[]>([])

  // const {
  //   data: approvedApplications,
  //   count: approvedApplicationsCount,
  //   loading: approvedApplicationsLoading,
  // } = useApplications({
  //   status: "accepted",
  // });
  const {
    data: pendingApplications,
    count: pendingApplicationsCount,
    loading: pendingApplicationsLoading,
  } = useApplications({
    status: "pending",
  });

  return (
    <AdminLayout className="gap-4 p-4">
      <div className="grid grid-cols-1 gap-4">
        {/* <Card className="border-b-flush-orange-500 flex flex-col gap-4 border-b-4 bg-violet-950 p-4 text-white">
          <span>Approved Applicants</span>

          <div className="flex h-16 items-center">
            {approvedApplicationsLoading ? (
              <Loader className="size-16 animate-spin" />
            ) : (
              <span className="text-6xl font-bold">
                {approvedApplicationsCount}
              </span>
            )}
          </div>
        </Card> */}

        <Card className="border-b-flush-orange-500 flex flex-col gap-4 border-b-4 bg-violet-950 p-4 text-white">
          <span>Pending Applicants</span>

          <div className="flex h-16 items-center">
            {pendingApplicationsLoading ? (
              <Loader className="size-16 animate-spin" />
            ) : (
              <span className="text-6xl font-bold">
                {pendingApplicationsCount}
              </span>
            )}
          </div>
        </Card>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <span className="text-xl font-medium">Pending Applicants</span>

          <ButtonLink href="/admin/applications" variant="yellow" size="sm">
            View All
          </ButtonLink>
        </div>

        <Card className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Sports/Culture & Arts</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Section</TableHead>
                <TableHead className="w-36">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {pendingApplicationsLoading && (
                <TableRow>
                  <TableCell colSpan={6}>
                    <div className="flex items-center justify-center">
                      <Loader className="size-4 animate-spin" />
                    </div>
                  </TableCell>
                </TableRow>
              )}

              {!pendingApplicationsLoading &&
                pendingApplicationsCount === 0 && (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <div className="flex items-center justify-center">
                        <span className="text-center text-gray-500">
                          No pending applicants.
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                )}

              {!pendingApplicationsLoading &&
                pendingApplications.map((application) => {
                  const { id, user, talentType, talentId, talent } =
                    application;

                  return (
                    <TableRow key={id}>
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
                            {user.firstName} {user.surname}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="uppercase">
                        {talentTypeText[talentType]}
                      </TableCell>
                      <TableCell>{user.course}</TableCell>
                      <TableCell>{user.year}</TableCell>
                      <TableCell>{user.section}</TableCell>
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
      </div>
    </AdminLayout>
  );
}
