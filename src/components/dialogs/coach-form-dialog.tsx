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
import { createCoach } from "~/lib/firebase/client/auth";
import { getTalentsRealtime } from "~/lib/firebase/client/firestore";
import { TalentSchema, UserSchema } from "~/schema/data-client";
import { newUserFormSchema, NewUserFormSchema } from "~/schema/form";
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
import { MultiSelect } from "../ui/multi-select";
import { Separator } from "../ui/separator";

interface CoachFormDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  coach?: UserSchema | null;
}

function CoachFormDialog({ onOpenChange, open }: CoachFormDialogProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [talents, setTalents] = useState<TalentSchema[]>([]);

  const form = useForm<NewUserFormSchema>({
    resolver: zodResolver(newUserFormSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      middleInitial: "",
      surname: "",
      talentsAssigned: [],
    },
  });
  const { control, handleSubmit, reset } = form;
  const { component, openAlert } = useAlert();

  async function handleSubmitCoachForm(data: NewUserFormSchema) {
    setLoading(true);

    try {
      await createCoach(data);

      openAlert({
        title: "Success",
        description: "Successfully created new coach account.",
      });

      reset();
      onOpenChange?.(false);
    } catch (error) {
      console.log("handleSubmitCoachForm error:", error);

      openAlert({
        title: "Failed",
        description: "Failed creating new coach account.",
      });
    }

    setLoading(false);
  }

  useEffect(() => {
    const unsubscribe = getTalentsRealtime()(setTalents);

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (open === false) reset();
  }, [open, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-screen overflow-y-auto sm:max-w-[425px]">
        <Form {...form}>
          <form
            onSubmit={handleSubmit(handleSubmitCoachForm)}
            className="flex flex-col gap-4"
          >
            <DialogHeader>
              <DialogTitle>Create Coach Account</DialogTitle>
              <DialogDescription>Create a new coach account.</DialogDescription>
            </DialogHeader>

            <div className="flex flex-1 flex-col gap-4">
              <div className="flex flex-col gap-4">
                <span className="text-sm">Coach Credentials</span>

                <FormField
                  control={control}
                  name="email"
                  render={({ field }) => {
                    return (
                      <FormItem className="flex flex-col gap-2 space-y-0">
                        <FormLabel className="px-1">Email</FormLabel>

                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                <FormField
                  control={control}
                  name="password"
                  render={({ field }) => {
                    return (
                      <FormItem className="flex flex-col gap-2 space-y-0">
                        <FormLabel className="px-1">Password</FormLabel>

                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                <FormField
                  control={control}
                  name="confirmPassword"
                  render={({ field }) => {
                    return (
                      <FormItem className="flex flex-col gap-2 space-y-0">
                        <FormLabel className="px-1">Confirm Password</FormLabel>

                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>

              <Separator />

              <div className="flex flex-col gap-4">
                <span className="text-sm">Coach Information</span>

                <FormField
                  control={control}
                  name="firstName"
                  render={({ field }) => {
                    return (
                      <FormItem className="flex flex-col gap-2 space-y-0">
                        <FormLabel className="px-1">First Name</FormLabel>

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
                  name="middleInitial"
                  render={({ field }) => {
                    return (
                      <FormItem className="flex flex-col gap-2 space-y-0">
                        <FormLabel className="px-1">Middle Initial</FormLabel>

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
                  name="surname"
                  render={({ field }) => {
                    return (
                      <FormItem className="flex flex-col gap-2 space-y-0">
                        <FormLabel className="px-1">Surname</FormLabel>

                        <FormControl>
                          <Input {...field} />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>

              <Separator />

              <div className="flex flex-col gap-4">
                <span className="text-sm">Assign Coach</span>

                <FormField
                  control={control}
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
                                      t.type === "sports" &&
                                      t.node === "parent",
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

export { CoachFormDialog };
