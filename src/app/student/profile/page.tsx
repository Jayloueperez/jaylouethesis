"use client";

import { useForm } from "react-hook-form";

import { StudentLayout } from "~/components/layout/student-layout";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
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
import { useAppSelector } from "~/store";

export default function StudentProfilePage() {
  const { userData } = useAppSelector((state) => state.user);

  const form = useForm({
    defaultValues: {
      firstName: "",
      middleInitial: "",
      surname: "",
      age: "",
      gender: "",
      contact: "",
      address: "",
      course: "",
      section: "",
      year: "",
    },
  });
  const { control } = form;

  return (
    <StudentLayout>
      <div className="flex items-start gap-4 p-4">
        <div className="flex shrink-0 flex-col gap-4">
          <Avatar className="size-40">
            <AvatarImage
              src={
                userData?.profile ||
                `https://avatar.iran.liara.run/public/${userData ? (userData.gender === "male" ? "boy" : "girl") : ""}`
              }
            />
            <AvatarFallback>
              {userData?.firstName
                .trim()
                .split(" ")
                .map((s) => s.charAt(0).toUpperCase())
                .filter((_v, i) => i < 2)}
            </AvatarFallback>
          </Avatar>

          <span className="text-center text-lg font-medium">
            {userData?.firstName}
          </span>

          <div className="flex flex-col gap-1">
            <Button type="button" variant="yellow">
              Personal Information
            </Button>
            <Button type="button" variant="blue">
              Email
            </Button>
            <Button type="button" variant="blue">
              Password
            </Button>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-4 text-lg font-medium">
          <span>Account Information</span>

          <Form {...form}>
            <form className="flex flex-col gap-4 lg:flex-row">
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

                <Button variant="yellow">Update</Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </StudentLayout>
  );
}
