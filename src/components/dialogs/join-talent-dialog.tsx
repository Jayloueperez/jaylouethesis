"use client";

import { useEffect, useState } from "react";
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
import { useAlert } from "~/hooks/use-alert";
import {
  createApplicationInputSchema,
  CreateApplicationInputSchema,
} from "~/schema/crud";
import { TalentSchema } from "~/schema/data-client";
import { useAppSelector } from "~/store";
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
import { Textarea } from "../ui/textarea";

interface JoinTalentDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSubmit: (data: CreateApplicationInputSchema) => void;
  talent: TalentSchema;
}

function JoinTalentDialog(props: JoinTalentDialogProps) {
  const { open, onOpenChange, onSubmit, talent } = props;

  const [loading, setLoading] = useState<boolean>(false);

  const { userData } = useAppSelector((state) => state.user);
  const { openAlert, component } = useAlert();

  const form = useForm<CreateApplicationInputSchema>({
    resolver: zodResolver(createApplicationInputSchema),
    defaultValues: {
      message: "",
      status: "pending",
      talentId: talent.id,
      talentType: talent.type,
      userId: userData?.id,
    },
  });

  const { control, handleSubmit, reset } = form;

  async function handleCreateApplication(data: CreateApplicationInputSchema) {
    setLoading(true);

    try {
      await onSubmit(data);

      reset();
      onOpenChange?.(false);
    } catch (error) {
      const err = getError(error, "Failed creating application.");

      openAlert({ title: "Failed", description: err.message });
    }

    setLoading(false);
  }

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form
            onSubmit={handleSubmit(handleCreateApplication)}
            className="flex flex-col gap-4"
          >
            <DialogHeader>
              <DialogTitle>Join {talent.name}</DialogTitle>
              <DialogDescription>
                Send application to join {talent.type}.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-1 flex-col gap-4">
              <FormField
                control={control}
                name="message"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2 space-y-0">
                    <FormLabel className="px-1">Message</FormLabel>

                    <FormControl>
                      <Textarea className="resize-none" rows={4} {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="submit" variant="yellow" loading={loading}>
                Apply
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>

      {component}
    </Dialog>
  );
}

export { JoinTalentDialog };
