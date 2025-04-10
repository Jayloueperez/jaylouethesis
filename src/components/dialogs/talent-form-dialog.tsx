"use client";

import { useCallback, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { talentTypeText } from "~/const/text";
import { useAlert } from "~/hooks/use-alert";
import { createTalent, updateTalent } from "~/lib/firebase/client/firestore";
import {
  CreateTalentInputSchema,
  createTalentInputSchema,
} from "~/schema/crud";
import { TalentTypeSchema } from "~/schema/data-base";
import { TalentSchema } from "~/schema/data-client";
import { getError } from "~/utils/error";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

interface TalentFormDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  talent?: TalentSchema;
  talentType: TalentTypeSchema;
  parentId?: string;
}

function TalentFormDialog(props: TalentFormDialogProps) {
  const { open, onOpenChange, talent, talentType, parentId } = props;
  const [loading, setLoading] = useState<boolean>(false);

  const { openAlert, component } = useAlert();

  const form = useForm<CreateTalentInputSchema>({
    resolver: zodResolver(createTalentInputSchema),
    defaultValues: {
      name: "",
      description: "",
      image: "",
      members: [],
      type: talentType,
      node: parentId ? "child" : "parent",
      parentId: parentId ?? "",
    },
  });

  const { control, handleSubmit, setValue, reset } = form;

  let title = `Create ${talentTypeText[talentType]}`;
  let description = `Create new ${talentTypeText[talentType].toLowerCase()}.`;
  let labelText = `${talentTypeText[talentType]} Name`;
  let buttonText = `Save`;
  let successMessage = `Successfully added new ${talentTypeText[talentType]}.`;

  if (talent && !parentId) {
    title = `Update ${talent.name}`;
    description = `Update ${talent.name} data.`;
    buttonText = `Update`;
    successMessage = `Successfully updated ${talent.name}.`;
  } else if (talent && parentId) {
    title = `Create Event`;
    description = `Create new event for ${talent.name}.`;
    labelText = `Event Name`;
    successMessage = `Successfully added new ${talent.name} event.`;
  }

  const handleCreateOrUpdateTalent = useCallback(
    async (data: CreateTalentInputSchema) => {
      setLoading(true);

      try {
        if (talent && !parentId) {
          await updateTalent(talent.id, data);
        } else {
          await createTalent(data);

          reset();
        }

        openAlert({ title: "Success", description: successMessage });

        onOpenChange?.(false);
      } catch (error) {
        const err = getError(
          error,
          `Failed ${talent ? "updating" : "creating new"} ${talentTypeText[talentType]}.`,
        );

        openAlert({ title: "Failed", description: err.message });
      }

      setLoading(false);
    },
    [
      talent,
      onOpenChange,
      openAlert,
      reset,
      talentType,
      parentId,
      successMessage,
    ],
  );

  useEffect(() => {
    if (talent && !parentId) {
      setValue("name", talent.name);
      setValue("description", talent.description);
    }
  }, [parentId, talent, setValue]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form
            onSubmit={handleSubmit(handleCreateOrUpdateTalent)}
            className="flex flex-col gap-4"
          >
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </DialogHeader>

            <div className="flex flex-1 flex-col gap-4">
              <FormField
                control={control}
                name="name"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2 space-y-0">
                    <FormLabel className="px-1">{labelText}</FormLabel>

                    <FormControl>
                      <Input {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="description"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2 space-y-0">
                    <FormLabel className="px-1">Description</FormLabel>

                    <FormControl>
                      <Textarea className="resize-none" rows={6} {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="submit" variant="yellow" loading={loading}>
                {buttonText}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>

      {component}
    </Dialog>
  );
}

export { TalentFormDialog };
