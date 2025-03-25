import { useEffect, useMemo, useState } from "react";
import _ from "lodash";

import {
  getApplicationsRealtime,
  getTalents,
  getUsers,
} from "~/lib/firebase/client/firestore";
import { ApplicationStatusSchema, TalentTypeSchema } from "~/schema/data-base";
import {
  ApplicationSchema,
  TalentSchema,
  UserSchema,
} from "~/schema/data-client";

export interface UseApplicationsParams {
  status?: ApplicationStatusSchema | ApplicationStatusSchema[];
  talentType?: TalentTypeSchema;
  talentId?: string;
}

export type ApplicationWithData = ApplicationSchema & {
  user: UserSchema;
  talent: TalentSchema;
};

const useApplications = (params?: UseApplicationsParams) => {
  const { status, talentId, talentType } = params ?? {};

  const [applications, setApplications] = useState<ApplicationWithData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const hookParams = useMemo(
    () => ({ status, talentId, talentType }),
    [status, talentId, talentType],
  );

  useEffect(() => {
    const unsubscribe = getApplicationsRealtime(hookParams)(async (
      applicationsArr,
    ) => {
      if (applicationsArr.length === 0) {
        setApplications([]);
        setLoading(false);
        return;
      }

      const userIds = _.uniq(applicationsArr.map((a) => a.userId));
      const talentIds = _.uniq(applicationsArr.map((a) => a.talentId));

      const users = await getUsers({ ids: userIds });
      const talents = await getTalents({ ids: talentIds });

      const applicationsWithData = applicationsArr.map((a) => {
        const user = users.find((u) => u.id === a.userId);
        const talent = talents.find((t) => t.id === a.talentId);

        if (!user || !talent) return null;

        return { ...a, user, talent };
      });

      const filtered = applicationsWithData.filter((a) => !!a);

      setApplications(filtered);
      setLoading(false);
    });

    return unsubscribe;
  }, [hookParams]);

  return {
    loading,
    data: applications,
    count: applications.length,
  };
};

export { useApplications };
