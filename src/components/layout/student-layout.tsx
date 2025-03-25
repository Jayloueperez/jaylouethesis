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
  sidebarHidden?: boolean;
}

function StudentLayout(props: StudentLayoutProps) {
  const { children, className, sidebarHidden = false } = props;

  const router = useRouter();
  const pathname = usePathname();

  const { userData, loading, status } = useAppSelector((state) => state.user);

  const isLoaded = loading === false && status === "fetched";
  const hasData = !!(
    userData &&
    userData.gender &&
    userData.contact &&
    userData.address &&
    userData.age &&
    userData.course &&
    userData.year &&
    userData.section
  );

  useEffect(() => {
    if (isLoaded && userData) {
      if (userData.role === "unassigned" || userData.status === "pending")
        return router.replace("/pending");
      if (userData.role !== "student") router.replace(`/${userData.role}`);
    }
  }, [isLoaded, router, userData]);

  useEffect(() => {
    if (isLoaded && userData && !hasData) {
      router.replace("/student/info");
    }
  }, [isLoaded]);

  if (
    loading ||
    !isLoaded ||
    !userData ||
    (userData &&
      (userData.role !== "student" || userData.status !== "confirmed")) ||
    (!pathname.startsWith("/student/info") && !hasData)
  )
    return <Loading />;

  return (
    <div className="relative flex min-h-screen flex-col">
      <Header dashboard />

      <div
        className={cn(
          "fixed top-[calc(theme('spacing.24')+4px)] bottom-0 left-0 z-50 flex h-[calc(100vh-theme('spacing.24')-4px)] w-64 flex-col gap-2 overflow-auto bg-violet-950 p-4 text-white",
          sidebarHidden && "hidden",
        )}
      >
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
          sidebarHidden && "ml-0",
        )}
      >
        {children}
      </main>
    </div>
  );
}

export { StudentLayout };
