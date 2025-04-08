"use client";

import { ReactNode } from "react";
import { useParams } from "next/navigation";

import { TalentEventProvider } from "~/providers/TalentEventProvider";
import { TalentTypeSchema } from "~/schema/data-base";

interface LayoutProps {
  children?: ReactNode;
}

export default function Layout(props: LayoutProps) {
  const { children } = props;

  const { talentType, talentEventId } = useParams<{
    talentId: string;
    talentType: TalentTypeSchema;
    talentEventId: string;
  }>();

  return (
    <TalentEventProvider talentId={talentEventId} talentType={talentType}>
      {children}
    </TalentEventProvider>
  );
}
