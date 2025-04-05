import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { TalentTypeSchema } from "~/schema/data-base";
import { useAppSelector } from "~/store";

function useTalentTypeParams() {
  const [loadingState, setLoadingState] = useState<"none" | "loading">("none");

  const { talentType } = useParams<{
    talentType: TalentTypeSchema | (string & {});
  }>();
  const router = useRouter();

  const { loading, userData, status } = useAppSelector((state) => state.user);

  useEffect(() => {
    if (!userData) return;
    if (status === "fetched" && !userData) return router.replace("/login");

    setLoadingState("loading");

    if (!(talentType === "culture-and-arts" || talentType === "sports"))
      return router.replace(`/${userData.role}`);

    setLoadingState("none");
  }, [router, status, talentType, userData]);

  return { loading: loadingState === "loading" || loading };
}

export { useTalentTypeParams };
