"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { PageLayout } from "~/components/layout/page-layout";
import { Button } from "~/components/ui/button";
import { useAlert } from "~/hooks/use-alert";
import { getUser } from "~/lib/firebase/client/firestore";
import { useAppDispatch, useAppSelector } from "~/store";
import { loginWithGoogle } from "~/store/auth-slice";
import { getError } from "~/utils/error";

export default function LoginPage() {
  const router = useRouter();

  const { openAlert, component } = useAlert();
  const { loading } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  async function handleLoginWithGoogle() {
    try {
      const { uid } = await dispatch(loginWithGoogle()).unwrap();
      const udata = await getUser(uid);

      // if (udata.role === "unassigned") return router.replace("/pending");

      router.replace(`/${udata.role}`);
    } catch (error) {
      const err = getError(error, "Failed to log in with google.");

      openAlert({
        title: "Failed",
        description: err.message,
      });
    }
  }

  return (
    <PageLayout className="items-center justify-center p-4">
      <div className="flex w-80 flex-col gap-4">
        <div className="flex items-center justify-center">
          <Image
            className="h-40 w-40"
            src="/images/logo.png"
            alt="logo"
            width={1600}
            height={1600}
          />
        </div>

        <span className="text-center text-lg font-medium">LOGIN</span>

        <Button
          variant="blue"
          onClick={handleLoginWithGoogle}
          loading={loading}
        >
          LOGIN WITH GOOGLE
        </Button>
      </div>

      {component}
    </PageLayout>
  );
}
