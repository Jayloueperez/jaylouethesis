"use client";

import { useEffect, useState } from "react";
import { Loader } from "lucide-react";

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
import { getUsersRealtime } from "~/lib/firebase/client/firestore";
import { TalentSchema, UserSchema } from "~/schema/data-client";
import { useAppSelector } from "~/store";

interface TalentDetailsStudentMembersProps {
  talent: TalentSchema;
}

function TalentDetailsStudentMembers(props: TalentDetailsStudentMembersProps) {
  const { talent } = props;
  // const { id: talentId, type: talentType } = talent;

  // const [application, setApplication] = useState<ApplicationSchema | null>(
  //   null,
  // );
  const [members, setMembers] = useState<UserSchema[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const { userData } = useAppSelector((state) => state.user);

  const canShowMembers = userData
    ? talent.members.includes(userData.id)
    : false;

  useEffect(() => {
    const memberIds = talent.members ?? [];

    if (memberIds.length > 0) {
      setLoading(true);

      const unsubscribe = getUsersRealtime({ ids: memberIds })((v) => {
        setMembers(v);
        setLoading(false);
      });

      return unsubscribe;
    }
  }, [talent]);

  // useEffect(() => {
  //   if (userData) {
  //     const unsubscribe = getApplicationByRealtime({
  //       talentType,
  //       talentId,
  //       userId: userData.id,
  //       status: ["pending", "accepted"],
  //     })(setApplication);

  //     return unsubscribe;
  //   }
  // }, [talentId, talentType, userData]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <span className="text-lg">Members</span>

        <div className="flex items-center gap-2"></div>
      </div>

      <Card className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Section</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {!canShowMembers && (
              <TableRow>
                <TableCell className="text-center text-gray-500" colSpan={5}>
                  Only members can see other members.
                </TableCell>
              </TableRow>
            )}

            {loading && canShowMembers && (
              <TableRow>
                <TableCell className="text-center text-gray-500" colSpan={5}>
                  <div className="flex items-center justify-center gap-2">
                    <Loader className="size-4 animate-spin" />

                    <span>Loading...</span>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {!loading && canShowMembers && members.length === 0 && (
              <TableRow>
                <TableCell className="text-center text-gray-500" colSpan={5}>
                  No members yet.
                </TableCell>
              </TableRow>
            )}

            {canShowMembers &&
              members.map((member) => (
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
                  <TableCell>{member.age}</TableCell>
                  <TableCell>{member.course}</TableCell>
                  <TableCell>{member.year}</TableCell>
                  <TableCell>{member.section}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

export { TalentDetailsStudentMembers };
