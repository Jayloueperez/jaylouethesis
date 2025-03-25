import { useCallback, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import _ from "lodash";
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
  type: TalentTypeSchema;
}

function TalentFormDialog(props: TalentFormDialogProps) {
  const { open, onOpenChange, talent, type } = props;
  const [loading, setLoading] = useState<boolean>(false);

  const { openAlert, component } = useAlert();

  const form = useForm<CreateTalentInputSchema>({
    resolver: zodResolver(createTalentInputSchema),
    defaultValues: {
      name: "",
      description: "",
      accepting: new Date().getTime(),
      image: "",
      members: [],
      type,
    },
  });

  const { control, handleSubmit, setValue, reset } = form;

  const handleCreateOrUpdateTalent = useCallback(
    async (data: CreateTalentInputSchema) => {
      setLoading(true);

      try {
        if (talent) {
          await updateTalent(talent.id, data);
        } else {
          await createTalent(data);

          reset();
        }

        onOpenChange?.(false);
      } catch (error) {
        const err = getError(
          error,
          `Failed ${talent ? "updating" : "creating new"} ${type}.`,
        );

        openAlert({ title: "Failed", description: err.message });
      }

      setLoading(false);
    },
    [talent, onOpenChange, openAlert, reset, type],
  );

  useEffect(() => {
    if (talent) {
      setValue("name", talent.name);
      setValue("description", talent.description);
    }
  }, [talent, setValue]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form
            onSubmit={handleSubmit(handleCreateOrUpdateTalent)}
            className="flex flex-col gap-4"
          >
            <DialogHeader>
              <DialogTitle>
                {talent ? "Update" : "Create"} {_.upperFirst(type)}
              </DialogTitle>
              <DialogDescription>
                {talent ? "Update" : "Create new"} {type}.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-1 flex-col gap-4">
              <FormField
                control={control}
                name="name"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2 space-y-0">
                    <FormLabel className="px-1">
                      {_.upperFirst(type)} Name
                    </FormLabel>

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
                {talent ? "Update" : "Save"}
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
