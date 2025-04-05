"use client";

import { useCallback, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parse } from "date-fns";
import { useForm } from "react-hook-form";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { useAlert } from "~/hooks/use-alert";
import { createTalentTryout } from "~/lib/firebase/client/firestore";
import {
  createTalentTryoutInputSchema,
  CreateTalentTryoutInputSchema,
} from "~/schema/crud";
import { TalentTypeSchema } from "~/schema/data-base";
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

interface CreateTalentTryoutDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  talentId: string;
  talentType: TalentTypeSchema;
}

function CreateTalentTryoutDialog(props: CreateTalentTryoutDialogProps) {
  const { open, onOpenChange, talentId, talentType } = props;
  const [loading, setLoading] = useState<boolean>(false);

  const { openAlert, component } = useAlert();

  const form = useForm<CreateTalentTryoutInputSchema>({
    resolver: zodResolver(createTalentTryoutInputSchema),
    defaultValues: {
      talentId,
      talentType,
      title: "",
      description: "",
      date: new Date().getTime(),
      students: [],
    },
  });

  const { control, handleSubmit, reset } = form;

  const handleReset = useCallback(() => {
    reset({
      talentId,
      talentType,
      title: "",
      description: "",
      date: new Date().getTime(),
      students: [],
    });
  }, [reset, talentId, talentType]);

  async function handleCreateTalentTryout(data: CreateTalentTryoutInputSchema) {
    setLoading(true);

    try {
      await createTalentTryout(data);

      openAlert({
        title: "Success",
        description: "Successfully created talent tryout schedule.",
      });

      handleReset();
      onOpenChange?.(false);
    } catch (error) {
      console.log("handleCreateTalentTryout error:", error);
      const err = getError(
        error,
        "Failed creating new talent tryout schedule.",
      );

      openAlert({
        title: "Failed",
        description: err.message,
      });
    }

    setLoading(false);
  }

  useEffect(() => {
    if (!open) handleReset();
  }, [handleReset, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form
            onSubmit={handleSubmit(handleCreateTalentTryout)}
            className="flex flex-col gap-4"
          >
            <DialogHeader>
              <DialogTitle>Schedule Tryout Schedule</DialogTitle>
              <DialogDescription>
                Create or select existing tryout schedule for student(s).
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-1 flex-col gap-4">
              <FormField
                control={control}
                name="title"
                render={({ field }) => {
                  return (
                    <FormItem className="flex flex-col gap-2 space-y-0">
                      <FormLabel className="px-1">Title</FormLabel>

                      <FormControl>
                        <Input {...field} />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={control}
                name="description"
                render={({ field }) => {
                  return (
                    <FormItem className="flex flex-col gap-2 space-y-0">
                      <FormLabel className="px-1">Description</FormLabel>

                      <FormControl>
                        <Textarea className="resize-none" cols={4} {...field} />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={control}
                name="date"
                render={({ field }) => {
                  const { value, onChange, ...fieldRest } = field;

                  return (
                    <FormItem className="flex flex-col gap-2 space-y-0">
                      <FormLabel className="px-1">Date</FormLabel>

                      <FormControl>
                        <Input
                          type="datetime-local"
                          min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                          value={format(new Date(value), "yyyy-MM-dd'T'HH:mm")}
                          onChange={(e) =>
                            onChange(
                              parse(
                                e.target.value,
                                "yyyy-MM-dd'T'HH:mm",
                                new Date(),
                              ).getTime(),
                            )
                          }
                          {...fieldRest}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>

            <DialogFooter>
              <Button type="submit" variant="yellow" loading={loading}>
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>

      {component}
    </Dialog>
  );
}

export { CreateTalentTryoutDialog };
export type { CreateTalentTryoutDialogProps };
