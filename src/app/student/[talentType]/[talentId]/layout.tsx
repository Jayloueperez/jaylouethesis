"use client";

import { ReactNode } from "react";
import { useParams } from "next/navigation";

import { TalentProvider } from "~/providers/TalentProvider";
import { TalentTypeSchema } from "~/schema/data";

interface TalentLayoutProps {
  children?: ReactNode;
}

const TalentLayout = (props: TalentLayoutProps) => {
  const { children } = props;

  const { talentId, talentType } = useParams<{
    talentId: string;
    talentType: TalentTypeSchema;
  }>();

  return (
    <TalentProvider talentId={talentId} talentType={talentType}>
      {children}
    </TalentProvider>
  );
};

export default TalentLayout;
