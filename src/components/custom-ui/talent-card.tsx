import { UrlObject } from "url";
import _ from "lodash";
import { ChevronsRight } from "lucide-react";

import { TalentTypeSchema } from "~/schema/data-base";
import { TalentSchema } from "~/schema/data-client";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Card } from "../ui/card";
import { Separator } from "../ui/separator";
import { ButtonLink } from "./button-link";

export interface TalentCardProps {
  href: string | UrlObject;
  talent: TalentSchema;
  type: TalentTypeSchema;
}

function TalentCard(props: TalentCardProps) {
  const { href, talent, type } = props;

  return (
    <Card className="border-b-flush-orange-500 flex flex-col gap-4 border-b-4 p-4">
      <div className="flex items-center gap-4">
        <Avatar className="size-12">
          <AvatarImage src={talent.image} alt={talent.name} />
          <AvatarFallback>{_.upperFirst(type)}</AvatarFallback>
        </Avatar>

        <span className="font-medium">{talent.name}</span>
      </div>

      <Separator />

      <span className="line-clamp-3 flex-1 text-sm">{talent.description}</span>

      <div className="flex items-center justify-end">
        <ButtonLink href={href} variant="blue">
          <span>View {_.upperFirst(type)}</span>

          <ChevronsRight className="size-4" />
        </ButtonLink>
      </div>
    </Card>
  );
}

export { TalentCard };
