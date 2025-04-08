"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

import { Loading } from "~/components/custom-ui/loading";
import { TalentDetails } from "~/components/custom-ui/talent-details";
import { AdminLayout } from "~/components/layout/admin-layout";
import { useTalentTypeParams } from "~/hooks/use-talent-type-params";
import { useTalentEventContext } from "~/providers/TalentEventProvider";
import { TalentTypeSchema } from "~/schema/data-base";
import { useAppSelector } from "~/store";

export default function Page() {
  const router = useRouter();
  const { talentType } = useParams<{
    talentId: string;
    talentType: TalentTypeSchema;
  }>();

  const { userData } = useAppSelector((state) => state.user);
  const { talent, loading } = useTalentEventContext();

  const { loading: talentTypeLoading } = useTalentTypeParams();

  useEffect(() => {
    if (!userData) return;

    if (
      (!loading && !talent) ||
      (!loading && talent && talent.type !== talentType)
    ) {
      router.replace(`/${userData.role}/${talentType}`);
    }
  }, [loading, router, talent, talentType, userData]);

  if (
    !talent ||
    loading ||
    talentTypeLoading ||
    (!loading && !talent) ||
    (!loading && talent && talent.type !== talentType)
  )
    return <Loading />;

  return (
    <AdminLayout className="gap-8 p-4">
      <TalentDetails talent={talent} />
    </AdminLayout>
  );
}
