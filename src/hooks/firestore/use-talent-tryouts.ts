import { useEffect, useMemo, useState } from "react";

import { getTalentTryoutsRealtime } from "~/lib/firebase/client/firestore";
import { TalentTypeSchema } from "~/schema/data-base";
import { TalentTryoutSchema } from "~/schema/data-client";

export interface UseTalentTryoutsParams {
  talentId?: string;
  talentType?: TalentTypeSchema;
  dateAfter?: number;
  dateBefore?: number;
}

const useTalentTryouts = (params?: UseTalentTryoutsParams) => {
  const { dateAfter, dateBefore, talentId, talentType } = params ?? {};

  const [talentTryouts, setTalentTryouts] = useState<TalentTryoutSchema[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const hookParams = useMemo(
    () => ({ dateAfter, dateBefore, talentId, talentType }),
    [dateAfter, dateBefore, talentId, talentType],
  );

  useEffect(() => {
    setLoading(true);

    const unsubscribe = getTalentTryoutsRealtime(hookParams)((v) => {
      setTalentTryouts(v);
      setLoading(false);
    });

    return unsubscribe;
  }, [hookParams]);

  return {
    loading,
    data: talentTryouts,
    count: talentTryouts.length,
  };
};

export { useTalentTryouts };
