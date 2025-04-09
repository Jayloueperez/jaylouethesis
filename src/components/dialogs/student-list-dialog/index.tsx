"use client";

import { useEffect, useState } from "react";
import { DialogProps } from "@radix-ui/react-dialog";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  getApplicationsRealtime,
  getUser,
} from "~/lib/firebase/client/firestore";
import {
  ApplicationSchema,
  TalentTryoutSchema,
  UserSchema,
} from "~/schema/data-client";
import { StudentItem } from "./student-item";

interface StudentListDialogProps extends DialogProps {
  talentTryout: TalentTryoutSchema;
}

function StudentListDialog(props: StudentListDialogProps) {
  const { talentTryout, open, onOpenChange } = props;

  const [applications, setApplications] = useState<
    (ApplicationSchema & { student: UserSchema })[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (talentTryout.students.length > 0) {
      const unsubscribe = getApplicationsRealtime({
        ids: talentTryout.students,
      })(async (applicationsArr) => {
        const promises = applicationsArr.map(async (a) => {
          const user = await getUser(a.userId);

          if (!user) return null;

          return {
            ...a,
            student: user,
          };
        });

        const result = await Promise.all(promises);
        const filtered = result.filter((a) => !!a);

        setApplications(filtered);
        setLoading(false);
      });

      return unsubscribe;
    } else {
      setApplications([]);
      setLoading(false);
    }
  }, [talentTryout]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <div className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Student List</DialogTitle>
            <DialogDescription>
              List of students for the selected tryout schedule.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-1 flex-col gap-4">
            {loading && (
              <span className="text-center">Loading...</span>
            )}

            {!loading && applications.length === 0 && (
              <span className="text-center">No students assigned.</span>
            )}

            {!loading &&
              applications.map((application) => {
                const { id } = application;

                return (
                  <StudentItem
                    key={id}
                    application={application}
                    talentTryout={talentTryout}
                  />
                );
              })}
          </div>

          <DialogFooter>
            {/* <Button type="submit" variant="yellow" loading={loading}>
              Apply
            </Button> */}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { StudentListDialog };
