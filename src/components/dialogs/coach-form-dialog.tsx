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
import { UserSchema } from "~/schema/data-client";
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

interface CoachFormDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  coach?: UserSchema | null;
}

function CoachFormDialog({ onOpenChange, open }: CoachFormDialogProps) {
  const [loading, setLoading] = useState<boolean>(false);

  const form = useForm<NewUserFormSchema>({
    resolver: zodResolver(newUserFormSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      middleInitial: "",
      surname: "",
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
    if (open === false) reset();
  }, [open, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form
            onSubmit={handleSubmit(handleSubmitCoachForm)}
            className="flex flex-col gap-4"
          >
            <DialogHeader>
              <DialogTitle>Create Coach Account</DialogTitle>
              <DialogDescription>
                Create a new coach account.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-1 flex-col gap-4">
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
