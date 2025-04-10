"use client";

import { Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Loading } from "~/components/custom-ui/loading";
import { PageLayout } from "~/components/layout/page-layout";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { useAlert } from "~/hooks/use-alert";
import { loginSchema, LoginSchema } from "~/schema/auth";
import { useAppDispatch, useAppSelector } from "~/store";
import { login } from "~/store/auth-slice";
import { getError } from "~/utils/error";

function Component() {
  const router = useRouter();

  const { openAlert, component } = useAlert();
  const { loading } = useAppSelector((state) => state.auth);

  const dispatch = useAppDispatch();

  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const { control, handleSubmit } = form;

  async function handleLogin(data: LoginSchema) {
    try {
      await dispatch(login({ ...data, role: "admin" })).unwrap();

      router.replace(redirect ?? "/admin");
    } catch (error) {
      const err = getError(error, "Failed to log in user.");

      openAlert({
        title: "Failed",
        description: err.message,
      });
    }
  }

  return (
    <PageLayout className="items-center justify-center p-4">
      <Form {...form}>
        <form
          onSubmit={handleSubmit(handleLogin)}
          className="flex w-80 flex-col gap-4"
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

          <span className="text-center text-lg font-medium">ADMIN LOGIN</span>

          <div className="flex flex-col gap-2">
            <FormField
              control={control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Email address"
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input type="password" placeholder="Password" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" variant="yellow" loading={loading}>
            LOGIN
          </Button>
        </form>
      </Form>

      {component}
    </PageLayout>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<Loading />}>
      <Component />
    </Suspense>
  );
}
