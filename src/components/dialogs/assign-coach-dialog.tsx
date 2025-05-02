"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { useAlert } from "~/hooks/use-alert";
import {
  getTalentsRealtime,
  updateUser,
} from "~/lib/firebase/client/firestore";
import { TalentSchema, UserSchema } from "~/schema/data-client";
import { assignCoachFormSchema, AssignCoachFormSchema } from "~/schema/form";
import { MultiSelect } from "../ui/multi-select";

interface AssignCoachDialogProps {
  coach: UserSchema;
}

function AssignCoachDialog({ coach }: AssignCoachDialogProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [talents, setTalents] = useState<TalentSchema[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const form = useForm<AssignCoachFormSchema>({
    resolver: zodResolver(assignCoachFormSchema),
    defaultValues: {
      talentsAssigned: coach.talentsAssigned,
    },
  });
  const { component, openAlert } = useAlert();

  const handleSubmit = async (data: AssignCoachFormSchema) => {
    setLoading(true);

    try {
      await updateUser(coach.id, data);

      openAlert({
        title: "Success",
        description: "Successfully assigning coach.",
        callback: () => {
          form.reset();
          setOpen(false);
        },
      });
    } catch (error) {
      console.log("handleSubmit error:", error);

      openAlert({
        title: "Failed",
        description: "Failed assigning coach.",
      });
    }

    setLoading(false);
  };

  useEffect(() => {
    const unsubscribe = getTalentsRealtime()(setTalents);

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (open) {
      form.setValue("talentsAssigned", coach.talentsAssigned);
    } else {
      form.reset();
    }
  }, [open, coach, form]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="yellow" size="sm" onClick={() => setOpen(true)}>
          Assign
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-screen overflow-y-auto sm:max-w-[425px]">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col gap-4"
          >
            <DialogHeader>
              <DialogTitle>Assign Coach</DialogTitle>
              <DialogDescription>
                Assign coach to sports or culture & arts
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-1 flex-col gap-4">
              <FormField
                control={form.control}
                name="talentsAssigned"
                render={({ field }) => {
                  return (
                    <FormItem className="flex flex-col gap-2 space-y-0">
                      <FormLabel className="px-1">
                        Assign Sports/Culture & Arts
                      </FormLabel>

                      <FormControl>
                        <MultiSelect
                          options={[
                            {
                              label: "SPORTS",
                              value: "sports",
                              node: "parent",
                              options: talents
                                .filter(
                                  (t) =>
                                    t.type === "sports" && t.node === "parent",
                                )
                                .map((t) => ({
                                  label: t.name,
                                  value: t.id,
                                  node: t.node,
                                })),
                            },
                            {
                              label: "CULTURE & ARTS",
                              value: "culture-and-arts",
                              node: "parent",
                              options: talents
                                .filter(
                                  (t) =>
                                    t.type === "culture-and-arts" &&
                                    t.node === "parent",
                                )
                                .map((t) => {
                                  const subOptions = talents
                                    .filter(
                                      (t2) =>
                                        t2.node === "child" &&
                                        t2.parentId === t.id,
                                    )
                                    .map((o) => ({
                                      label: o.name,
                                      value: o.id,
                                      node: o.node,
                                    }));

                                  return {
                                    label: t.name,
                                    value: t.id,
                                    node: t.node,
                                    options: subOptions,
                                  };
                                }),
                            },
                          ]}
                          onValueChange={field.onChange}
                          value={field.value}
                          placeholder="Select Sports/Culture & Arts"
                          getOptionData={(v) => {
                            const talent = talents.find((t) => t.id === v);

                            return talent
                              ? {
                                  label: talent.name,
                                  value: talent.id,
                                  node: talent.node,
                                }
                              : undefined;
                          }}
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

export { AssignCoachDialog };
