"use client";

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Club, Home, ListTodo, Megaphone, Volleyball } from "lucide-react";

import { cn } from "~/lib/utils";
import { useAppSelector } from "~/store";
import { Loading } from "../custom-ui/loading";
import { SidebarLink } from "../custom-ui/sidebar-link";
import { Header } from "./header";

interface TeacherLayoutProps {
  children?: ReactNode;
  className?: string;
}

function TeacherLayout(props: TeacherLayoutProps) {
  const { children, className } = props;

  const router = useRouter();
  const pathname = usePathname();

  const { userData, loading, status } = useAppSelector((state) => state.user);

  const isLoaded = loading === false && status === "fetched";

  useEffect(() => {
    if (isLoaded && userData) {
      if (userData.role === "unassigned" || userData.status === "pending")
        return router.replace("/pending");
      if (userData.role !== "teacher") router.replace(`/${userData.role}`);
    }
  }, [isLoaded, router, userData]);

  if (
    loading ||
    !isLoaded ||
    !userData ||
    (userData &&
      (userData.role !== "teacher" || userData.status !== "confirmed"))
  )
    return <Loading />;

  return (
    <div className="relative flex min-h-screen flex-col">
      <Header dashboard />

      <div className="fixed top-[calc(theme('spacing.24')+4px)] bottom-0 left-0 z-50 flex h-[calc(100vh-theme('spacing.24')-4px)] w-64 flex-col gap-2 overflow-auto bg-violet-950 p-4 text-white">
        <SidebarLink
          href="/teacher"
          icon={Home}
          active={pathname === "/teacher"}
        >
          Home
        </SidebarLink>

        <SidebarLink
          href="/teacher/announcements"
          icon={Megaphone}
          active={pathname.startsWith("/teacher/announcements")}
        >
          Announcements
        </SidebarLink>

        <SidebarLink
          href="/teacher/club"
          icon={Club}
          active={pathname.startsWith("/teacher/club")}
        >
          Clubs
        </SidebarLink>

        <SidebarLink
          href="/teacher/sport"
          icon={Volleyball}
          active={pathname.startsWith("/teacher/sport")}
        >
          Sports
        </SidebarLink>

        <SidebarLink
          href="/teacher/applications"
          icon={ListTodo}
          active={pathname.startsWith("/teacher/applications")}
        >
          Applications
        </SidebarLink>

        {/* <SidebarLink
          href="/teacher/messages"
          icon={MessageCircle}
          active={pathname.startsWith("/teacher/messages")}
        >
          Messages
        </SidebarLink> */}
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

export { TeacherLayout };
