"use client";

import { ReactNode } from "react";
import { useParams } from "next/navigation";

import { TalentProvider } from "~/providers/TalentProvider";
import { TalentTypeSchema } from "~/schema/data-base";

interface LayoutProps {
  children?: ReactNode;
}

export default function Layout(props: LayoutProps) {
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
}
