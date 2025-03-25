"use client";

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Club, House, User2, Volleyball } from "lucide-react";

import { cn } from "~/lib/utils";
import { useAppSelector } from "~/store";
import { Loading } from "../custom-ui/loading";
import { SidebarLink } from "../custom-ui/sidebar-link";
import { Header } from "./header";

interface StudentLayoutProps {
  children?: ReactNode;
  className?: string;
}

function StudentLayout(props: StudentLayoutProps) {
  const { children, className } = props;

  const router = useRouter();
  const pathname = usePathname();

  const { userData, loading, status } = useAppSelector((state) => state.user);

  const isLoaded = loading === false && status === "fetched";

  useEffect(() => {
    if (isLoaded && userData) {
      if (userData.role === "unassigned" || userData.status === "pending")
        return router.replace("/pending");
      if (userData.role !== "student") router.replace(`/${userData.role}`);
    }
  }, [isLoaded, router, userData]);

  if (
    loading ||
    !isLoaded ||
    !userData ||
    (userData &&
      (userData.role !== "student" || userData.status !== "confirmed"))
  )
    return <Loading />;

  return (
    <div className="relative flex min-h-screen flex-col">
      <Header dashboard />

      <div className="fixed top-[calc(theme('spacing.24')+4px)] bottom-0 left-0 z-50 flex h-[calc(100vh-theme('spacing.24')-4px)] w-64 flex-col gap-2 overflow-auto bg-violet-950 p-4 text-white">
        <SidebarLink
          href="/student"
          icon={House}
          active={pathname === "/student"}
        >
          Home
        </SidebarLink>

        <SidebarLink
          href="/student/club"
          icon={Club}
          active={pathname.startsWith("/student/club")}
        >
          Clubs
        </SidebarLink>

        <SidebarLink
          href="/student/sport"
          icon={Volleyball}
          active={pathname.startsWith("/student/sport")}
        >
          Sports
        </SidebarLink>

        {/* <SidebarLink
          href="/student/messages"
          icon={MessageCircle}
          active={pathname.startsWith("/student/messages")}
        >
          Messages
        </SidebarLink> */}

        <SidebarLink
          href="/student/profile"
          icon={User2}
          active={pathname.startsWith("/student/profile")}
        >
          Profile
        </SidebarLink>
      </div>

      <main
        className={cn(
          "min-h mt-[calc(theme('spacing.24')+4px)] ml-64 flex min-h-[calc(100vh-theme('spacing.24')-4px)] flex-col",
          className,
        )}
      >
        {children}
      </main>
    </div>
  );
}

export { StudentLayout };
