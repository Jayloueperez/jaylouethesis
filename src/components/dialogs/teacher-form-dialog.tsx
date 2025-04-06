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
import { createTeacher } from "~/lib/firebase/client/auth";
import { UserSchema } from "~/schema/data-client";
import { newUserFormSchema, NewUserFormSchema } from "~/schema/form";
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

interface TeacherFormDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  teacher?: UserSchema | null;
}

function TeacherFormDialog({
  onOpenChange,
  open,
  teacher,
}: TeacherFormDialogProps) {
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

  async function handleSubmitTeacherForm(data: NewUserFormSchema) {
    setLoading(true);

    try {
      await createTeacher(data);

      openAlert({
        title: "Success",
        description: "Successfully created new teacher account.",
      });

      reset();
      onOpenChange?.(false);
    } catch (error) {
      console.log("handleSubmitTeacherForm error:", error);

      openAlert({
        title: "Failed",
        description: "Failed creating new teacher account.",
      });
    }

    setLoading(false);
  }

  useEffect(() => {
    if (open === false) reset();
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form
            onSubmit={handleSubmit(handleSubmitTeacherForm)}
            className="flex flex-col gap-4"
          >
            <DialogHeader>
              <DialogTitle>Create Teacher Account</DialogTitle>
              <DialogDescription>
                Create a new teacher account.
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

export { TeacherFormDialog };
