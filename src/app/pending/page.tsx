"use client";

import { useRouter } from "next/navigation";

import { Loading } from "~/components/custom-ui/loading";
import { PageLayout } from "~/components/layout/page-layout";
import { Button } from "~/components/ui/button";
import { useAlert } from "~/hooks/use-alert";
import { useAppDispatch, useAppSelector } from "~/store";
import { logout } from "~/store/auth-slice";
import { getError } from "~/utils/error";

export default function PendingPage() {
  const router = useRouter();

  const { component, openAlert } = useAlert();
  const { userData, status } = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();

  async function handleLogout() {
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
  }

  // useEffect(() => {
  //   if (userData && userData.role !== "unassigned")
  //     router.replace(`/${userData.role}`);
  // }, [userData, router]);

  if (!userData) return <Loading />;

  return (
    <PageLayout className="items-center justify-center gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-center text-3xl font-medium">Account Pending</h1>

        <span className="text-center">
          Your account hasn&apos;t been assigned to a role yet.
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
