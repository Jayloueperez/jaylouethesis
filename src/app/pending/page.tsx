"use client";

import { useRouter } from "next/navigation";

import { PageLayout } from "~/components/layout/page-layout";
import { Button } from "~/components/ui/button";
import { useAlert } from "~/hooks/use-alert";
import { useAppDispatch, useAppSelector } from "~/store";
import { logout } from "~/store/auth-slice";
import { getError } from "~/utils/error";

export default function PendingPage() {
  const router = useRouter();

  const { component, openAlert } = useAlert();
  const { status } = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();

      router.replace("/login");
    } catch (error) {
      const err = getError(error, "Failed user logout.");

      openAlert({
        title: "Failed",
        description: err.message,
      });
    }
  };

  return (
    <PageLayout className="items-center justify-center gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-center text-4xl font-medium">Account Pending</h1>

        <span className="text-center">
          Your account hasn&apos;t been confirmed or hasn&apos;t been assigned to a role.
        </span>
      </div>

      <Button
        variant="destructive"
        loading={status === "fetching"}
        onClick={handleLogout}
      >
        Logout
      </Button>

      {component}
    </PageLayout>
  );
}
