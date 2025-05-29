"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { uploadDirect } from "@uploadcare/upload-client";
import { differenceInYears, format, parse } from "date-fns";
import { useForm } from "react-hook-form";

import { StudentLayout } from "~/components/layout/student-layout";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
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
import { Separator } from "~/components/ui/separator";
import { useAlert } from "~/hooks/use-alert";
import { updateUser } from "~/lib/firebase/client/firestore";
import { UpdateUserInfoSchema, updateUserInfoSchema } from "~/schema/crud";
import { useAppSelector } from "~/store";
import { generateKeywords } from "~/utils/string";

import "@uploadcare/react-uploader/core.css";

import Link from "next/link";
import { X } from "lucide-react";

import { Label } from "~/components/ui/label";
import { env } from "~/env";

export default function StudentProfilePage() {
  const [loading, setLoading] = useState<boolean>(false);
  const [files, setFiles] = useState<File[]>([]);

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
      birthdate: "",
      attachments: [],
    },
  });
  const { control, handleSubmit, setValue } = form;

  async function handleRemoveAttachment(index: number) {
    if (!userData) return;

    try {
      await updateUser(userData.id, {
        attachments: userData.attachments.filter((_a, i) => i !== index),
      });
    } catch (error) {
      console.log("handleRemoveAttachment error:", error);

      openAlert({
        title: "Failed",
        description: "Failed removing attachment.",
      });
    }
  }

  async function handleUpdateUserInfo(data: UpdateUserInfoSchema) {
    if (!userData) return;

    setLoading(true);

    try {
      const attachments: string[] = [];

      for (const file of files) {
        const result = await uploadFile(file);

        attachments.push(result);
      }

      await updateUser(userData.id, {
        ...data,
        attachments: [...userData.attachments, ...attachments],
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

      setFiles([]);
    } catch (error) {
      console.log("handleUpdateUserInfo error:", error);

      openAlert({
        title: "Failed",
        description: "Failed updating user information.",
      });
    }

    setLoading(false);
  }

  async function uploadFile(file: File) {
    const result = await uploadDirect(file, {
      publicKey: env.NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY,
      store: true,
    });

    return result.cdnUrl;
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const fileList = e.target.files;

    if (!fileList) return;

    const newFiles = [...files];
    const currentLength = files.length;
    const left = 5 - currentLength;

    if (left === 0) {
      openAlert({
        title: "Warning",
        description: "Maximum of 5 files only.",
      });

      e.target.value = "";

      return;
    }

    Array.from({
      length: fileList.length > left ? left : fileList.length,
    }).forEach((_v, i) => newFiles.push(fileList[i]));

    setFiles(newFiles);

    e.target.value = "";
  }

  useEffect(() => {
    if (userData) {
      setValue("address", userData.address);
      setValue("birthdate", userData.birthdate);
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
    <StudentLayout className="items-center gap-4 p-4">
      <Card className="w-full lg:max-w-4xl">
        <CardHeader>
          <CardTitle>Student Information</CardTitle>
          <CardDescription>
            Please provide all required information.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-6">
          <Form {...form}>
            <form
              onSubmit={handleSubmit(handleUpdateUserInfo)}
              className="flex w-full flex-col gap-6 lg:min-w-2xl lg:flex-row"
            >
              <div className="flex shrink-0 flex-col items-center gap-4 lg:items-start">
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

                {/* <span className="text-center text-lg font-medium">
                  {userData?.firstName}
                </span> */}

                {/* <div className="flex flex-col gap-1">
                  <Button type="button" variant="yellow">
                    Personal Information
                  </Button>
                  <Button type="button" variant="blue">
                    Email
                  </Button>
                  <Button type="button" variant="blue">
                    Password
                  </Button>
                </div> */}
              </div>

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
                  name="birthdate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-2 space-y-0">
                      <FormLabel className="px-1">Birthdate</FormLabel>

                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          max={format(new Date(), "yyyy-MM-dd")}
                          onChange={(v) => {
                            field.onChange(v);
                            form.setValue(
                              "age",
                              differenceInYears(
                                new Date(),
                                parse(v.target.value, "yyyy-MM-dd", new Date()),
                              ).toString(),
                            );
                          }}
                        />
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
                        <Input type="number" disabled {...field} />
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

                <div className="flex flex-col gap-2 space-y-0">
                  <Label className="px-1">
                    Attach Sports/Culture & Arts Background
                  </Label>

                  <Input
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*,application/pdf,application/msword,.doc,.docx"
                    multiple
                  />

                  {files.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1">
                      {files.map((f, i) => (
                        <div
                          className="flex items-center gap-1 rounded-full border border-gray-300 px-2 py-1 text-xs"
                          key={`file-${i}`}
                        >
                          <span>{f.name}</span>

                          <button
                            className="shrink-0 cursor-pointer"
                            type="button"
                            onClick={() =>
                              setFiles((v) => v.filter((_f, o) => o !== i))
                            }
                          >
                            <X className="size-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button type="submit" variant="yellow" loading={loading}>
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>

          <Separator />

          <div className="flex flex-col gap-4">
            <span>Attachments:</span>

            <div className="flex flex-col items-center gap-2 lg:flex-row lg:flex-wrap">
              {userData?.attachments.map((a, i) => (
                <div
                  className="flex items-center rounded-md border border-gray-300 text-xs"
                  key={`attachment-${i}`}
                >
                  <Link
                    className="flex cursor-pointer items-center gap-2 px-4 py-3"
                    href={a}
                    target="_blank"
                  >
                    <span>{a}</span>
                  </Link>

                  <button
                    type="button"
                    className="cursor-pointer px-4 py-3"
                    onClick={() => handleRemoveAttachment(i)}
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {component}
    </StudentLayout>
  );
}
