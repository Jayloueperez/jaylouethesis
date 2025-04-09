"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useForm } from "react-hook-form";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useAlert } from "~/hooks/use-alert";
import {
  createAnnouncement,
  updateAnnouncement,
} from "~/lib/firebase/client/firestore";
import {
  createAnnouncementInputSchema,
  CreateAnnouncementInputSchema,
} from "~/schema/crud";
import { AnnouncementSchema } from "~/schema/data-client";
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

interface CreateAnnouncementDialogProps {
  announcement?: AnnouncementSchema;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function CreateAnnouncementDialog(props: CreateAnnouncementDialogProps) {
  const { announcement, open, onOpenChange } = props;
  const [loading, setLoading] = useState<boolean>(false);

  const { openAlert, component } = useAlert();

  const form = useForm<CreateAnnouncementInputSchema>({
    resolver: zodResolver(createAnnouncementInputSchema),
    defaultValues: {
      title: "",
      subject: "",
      description: "",
      date: "",
      for: [],
      type: "all",
    },
  });

  const { control, handleSubmit, reset, setValue } = form;

  async function handleSubmitAnnouncement(data: CreateAnnouncementInputSchema) {
    setLoading(true);

    try {
      if (announcement) {
        await updateAnnouncement(announcement.id, data);
      } else {
        await createAnnouncement(data);
      }

      reset();
      onOpenChange?.(false);
    } catch (error) {
      const err = getError(error, "Failed creating new announcement.");

      openAlert({
        title: "Failed",
        description: err.message,
      });
    }

    setLoading(false);
  }

  useEffect(() => {
    if (announcement) {
      setValue("title", announcement.title);
      setValue("subject", announcement.subject);
      setValue("date", announcement.date);
      setValue("for", announcement.for);
      setValue("description", announcement.description);
    }
  }, [announcement, setValue, open]);

  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form
            onSubmit={handleSubmit(handleSubmitAnnouncement)}
            className="flex flex-col gap-4"
          >
            <DialogHeader>
              <DialogTitle>
                {announcement ? "Update" : "Create"} Announcement
              </DialogTitle>
              <DialogDescription>
                {announcement ? "Update" : "Create new"} announcement.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-1 flex-col gap-4">
              <FormField
                control={control}
                name="title"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2 space-y-0">
                    <FormLabel className="px-1">Title</FormLabel>

                    <FormControl>
                      <Input {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="subject"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2 space-y-0">
                    <FormLabel className="px-1">Subject</FormLabel>

                    <FormControl>
                      <Input {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2 space-y-0">
                    <FormLabel className="px-1">Date</FormLabel>

                    <FormControl>
                      {/* 2025-02-20T03:03 */}
                      <Input
                        type="datetime-local"
                        min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2 space-y-0">
                    <FormLabel className="px-1">For</FormLabel>

                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select for" />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="sports">Sports Only</SelectItem>
                        <SelectItem value="culture-and-arts">
                          Culture & Arts Only
                        </SelectItem>
                      </SelectContent>
                    </Select>

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
                      <Textarea className="resize-none" {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
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

export { CreateAnnouncementDialog };
