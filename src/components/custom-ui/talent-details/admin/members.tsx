import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Bell,
  Calendar,
  Eye,
  ListCheck,
  Loader,
  MessageCircle,
  Trash,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { useApplications } from "~/hooks/firestore/use-applications";
import { getUsersRealtime } from "~/lib/firebase/client/firestore";
import { TalentTypeSchema } from "~/schema/data-base";
import { TalentSchema, UserSchema } from "~/schema/data-client";
import { ButtonLink } from "../../button-link";

interface TalentDetailsAdminMembersProps {
  talent: TalentSchema;
}

function TalentDetailsAdminMembers(props: TalentDetailsAdminMembersProps) {
  const { talent } = props;

  const [members, setMembers] = useState<UserSchema[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const { talentId, talentType } = useParams<{
    talentId: string;
    talentType: TalentTypeSchema;
  }>();
  const { count: applicationsCount } = useApplications({
    talentId,
    talentType,
    status: ["pending", "tryout"],
  });

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
      setLoading(false);
    }
  }, [talent]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-4">
        <span className="text-lg">Members</span>

        <div className="flex items-center gap-2">
          <ButtonLink
            className="flex items-center gap-2"
            href={`/admin/${talentType}/${talentId}/applicants`}
            variant="outline"
          >
            {applicationsCount > 0 ? (
              <Bell className="size-4" />
            ) : (
              <ListCheck className="size-4" />
            )}

            <span>
              {applicationsCount > 0
                ? `${applicationsCount} New ${applicationsCount === 1 ? "Applicant" : "Applicants"}`
                : "View Applications"}
            </span>
          </ButtonLink>

          <ButtonLink
            className="flex items-center gap-2"
            href={`/admin/${talentType}/${talentId}/schedules`}
            variant="yellow"
          >
            <Calendar className="size-4" />

            <span>Tryout Schedules</span>
          </ButtonLink>
        </div>
      </div>

      <Card className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Section</TableHead>
              <TableHead className="w-36">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading && (
              <TableRow>
                <TableCell className="text-center text-gray-500" colSpan={5}>
                  <div className="flex items-center justify-center gap-2">
                    <Loader className="size-4 animate-spin" />

                    <span>Loading...</span>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {!loading && members.length === 0 && (
              <TableRow>
                <TableCell className="text-center text-gray-500" colSpan={5}>
                  No members yet.
                </TableCell>
              </TableRow>
            )}

            {members.map((member) => (
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

                    <Button
                      type="button"
                      variant="yellow"
                      size="icon"
                      shape="pill"
                    >
                      <MessageCircle className="size-4" />
                    </Button>

                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      shape="pill"
                    >
                      <Trash className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

export { TalentDetailsAdminMembers };
