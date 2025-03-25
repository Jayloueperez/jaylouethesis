"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { PageLayout } from "~/components/layout/page-layout";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { courses } from "~/const/courses";
import { useAlert } from "~/hooks/use-alert";
import { registerSchema, RegisterSchema } from "~/schema/auth";
import { useAppDispatch, useAppSelector } from "~/store";
import { register } from "~/store/auth-slice";
import { getError } from "~/utils/error";

export default function RegisterPage() {
  const form = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      middleInitial: "",
      surname: "",
      gender: undefined,
      age: "",
      address: "",
      contact: "",
      course: "",
      section: "",
      year: "",
      status: "pending",
    },
  });
  const { control, handleSubmit } = form;

  const router = useRouter();
  const { openAlert, component } = useAlert();
  const { loading } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const handleRegister = async (data: RegisterSchema) => {
    try {
      await dispatch(register(data)).unwrap();

      router.replace("/student");
    } catch (error) {
      const err = getError(error, "Failed to log in user.");

      openAlert({
        title: "Failed",
        description: err.message,
      });
    }
  };

  return (
    <PageLayout className="items-center justify-center p-4">
      <Form {...form}>
        <form
          onSubmit={handleSubmit(handleRegister)}
          className="flex flex-col gap-4 lg:w-[640px]"
        >
          <div className="flex items-center justify-center">
            <Image
              className="h-40 w-40"
              src="/images/logo.png"
              alt="logo"
              width={1600}
              height={1600}
            />
          </div>

          <span className="text-center text-lg font-medium">
            STUDENT REGISTRATION
          </span>

          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="flex flex-1 flex-col gap-4">
              <FormField
                control={control}
                name="email"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2 space-y-0">
                    <FormLabel className="px-1">Email</FormLabel>

                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="password"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2 space-y-0">
                    <FormLabel className="px-1">Password</FormLabel>

                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="firstName"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2 space-y-0">
                    <FormLabel className="px-1">First Name</FormLabel>

                    <FormControl>
                      <Input {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="middleInitial"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2 space-y-0">
                    <FormLabel className="px-1">Middle Initial</FormLabel>

                    <FormControl>
                      <Input {...field} maxLength={1} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="surname"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2 space-y-0">
                    <FormLabel className="px-1">Surname</FormLabel>

                    <FormControl>
                      <Input {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-1 flex-col gap-4">
              <FormField
                control={control}
                name="age"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2 space-y-0">
                    <FormLabel className="px-1">Age</FormLabel>

                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2 space-y-0">
                    <FormLabel className="px-1">Gender</FormLabel>

                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="contact"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2 space-y-0">
                    <FormLabel className="px-1">Contact</FormLabel>

                    <FormControl>
                      <Input {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="address"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2 space-y-0">
                    <FormLabel className="px-1">Address</FormLabel>

                    <FormControl>
                      <Input {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="course"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2 space-y-0">
                    <FormLabel className="px-1">Course</FormLabel>

                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select course" />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent>
                        {courses.map((course, i) => (
                          <SelectItem key={`course-${i}`} value={course}>
                            {course}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="section"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2 space-y-0">
                    <FormLabel className="px-1">Section</FormLabel>

                    <FormControl>
                      <Input {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="year"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2 space-y-0">
                    <FormLabel className="px-1">Year</FormLabel>

                    <FormControl>
                      <Input {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" variant="yellow" loading={loading}>
                SIGN UP WITH GMAIL
              </Button>
            </div>
          </div>
        </form>
      </Form>

      {component}
    </PageLayout>
  );
}
