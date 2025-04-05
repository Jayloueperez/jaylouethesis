"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { StudentLayout } from "~/components/layout/student-layout";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
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
import { useAlert } from "~/hooks/use-alert";
import { updateUser } from "~/lib/firebase/client/firestore";
import { updateUserInfoSchema, UpdateUserInfoSchema } from "~/schema/crud";
import { useAppSelector } from "~/store";
import { generateKeywords } from "~/utils/string";

export default function StudentInfoPage() {
  const [loading, setLoading] = useState<boolean>(false);

  const router = useRouter();

  const { userData } = useAppSelector((state) => state.user);
  const { component, openAlert } = useAlert();

  const form = useForm<UpdateUserInfoSchema>({
    resolver: zodResolver(updateUserInfoSchema),
    defaultValues: {
      address: "",
      age: "",
      contact: "",
      course: "",
      firstName: "",
      gender: "",
      middleInitial: "",
      section: "",
      surname: "",
      year: "",
    },
  });
  const { control, handleSubmit, setValue } = form;

  async function handleUpdateUserInfo(data: UpdateUserInfoSchema) {
    if (!userData) return;

    setLoading(true);

    try {
      await updateUser(userData.id, {
        ...data,
        keywords: [
          ...generateKeywords(userData.email),
          ...generateKeywords(data.firstName),
          ...generateKeywords(data.surname),
        ],
      });

      openAlert({
        title: "Success",
        description: "Successfully updated user information.",
      });

      router.replace("/student");
    } catch (error) {
      console.log("handleUpdateUserInfo error:", error);

      openAlert({
        title: "Failed",
        description: "Failed updating user information.",
      });
    }

    setLoading(false);
  }

  useEffect(() => {
    if (userData) {
      setValue("address", userData.address);
      setValue("age", userData.age);
      setValue("contact", userData.contact);
      setValue("course", userData.course);
      setValue("firstName", userData.firstName);
      setValue("gender", userData.gender);
      setValue("middleInitial", userData.middleInitial);
      setValue("section", userData.section);
      setValue("surname", userData.surname);
      setValue("year", userData.year);
    }
  }, [userData, setValue]);

  return (
    <StudentLayout
      className="items-center justify-center gap-4 p-4"
      sidebarHidden
    >
      <Card>
        <CardHeader>
          <CardTitle>Student Information</CardTitle>
          <CardDescription>
            Please provide all required information.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form
              onSubmit={handleSubmit(handleUpdateUserInfo)}
              className="flex flex-col gap-4 lg:min-w-2xl lg:flex-row"
            >
              <div className="flex flex-1 flex-col gap-4">
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
                  control={control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-2 space-y-0">
                      <FormLabel className="px-1">Gender</FormLabel>

                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        {...field}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
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
              </div>

              <div className="flex flex-1 flex-col gap-4">
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
                  control={control}
                  name="course"
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-2 space-y-0">
                      <FormLabel className="px-1">Course</FormLabel>

                      <FormControl>
                        <Input {...field} />
                      </FormControl>

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
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {component}
    </StudentLayout>
  );
}
