"use client";

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Drama,
  Home,
  ListTodo,
  Megaphone,
  NotebookPen,
  Volleyball,
} from "lucide-react";

import { cn } from "~/lib/utils";
import { useAppSelector } from "~/store";
import { Loading } from "../custom-ui/loading";
import { SidebarLink } from "../custom-ui/sidebar-link";
import { Header } from "./header";

interface CoachLayoutProps {
  children?: ReactNode;
  className?: string;
}

function CoachLayout(props: CoachLayoutProps) {
  const { children, className } = props;

  const router = useRouter();
  const pathname = usePathname();

  const { userData, loading, status } = useAppSelector((state) => state.user);

  const isLoaded = loading === false && status === "fetched";

  useEffect(() => {
    if (isLoaded && userData) {
      if (userData.status === "pending") return router.replace("/pending");
      if (userData.role !== "coach") router.replace(`/${userData.role}`);
    }
  }, [isLoaded, router, userData]);

  if (
    loading ||
    !isLoaded ||
    !userData ||
    (userData && (userData.role !== "coach" || userData.status !== "confirmed"))
  )
    return <Loading />;

  return (
    <div className="relative flex min-h-screen flex-col">
      <Header dashboard />

      <div className="fixed top-[calc(theme('spacing.24')+4px)] bottom-0 left-0 z-50 flex h-[calc(100vh-theme('spacing.24')-4px)] w-20 flex-col gap-2 overflow-auto bg-violet-950 p-2 text-white lg:w-64 lg:p-4">
        <SidebarLink href="/coach" icon={Home} active={pathname === "/coach"}>
          Home
        </SidebarLink>

        <SidebarLink
          href="/coach/announcements"
          icon={Megaphone}
          active={pathname.startsWith("/coach/announcements")}
        >
          Announcements
        </SidebarLink>

        <SidebarLink
          href="/coach/culture-and-arts"
          icon={Drama}
          active={pathname.startsWith("/coach/culture-and-arts")}
        >
          Culture & Arts
        </SidebarLink>

        <SidebarLink
          href="/coach/sports"
          icon={Volleyball}
          active={pathname.startsWith("/coach/sports")}
        >
          Sports
        </SidebarLink>

        <SidebarLink
          href="/coach/applications"
          icon={ListTodo}
          active={pathname.startsWith("/coach/applications")}
        >
          Applicants
        </SidebarLink>

        <SidebarLink
          href="/coach/assigned-roles"
          icon={NotebookPen}
          active={pathname.startsWith("/coach/assigned-roles")}
        >
          Assigned Roles
        </SidebarLink>

        {/* <SidebarLink
          href="/coach/messages"
          icon={MessageCircle}
          active={pathname.startsWith("/coach/messages")}
        >
          Messages
        </SidebarLink> */}
      </div>

      <main
        className={cn(
          "mt-[calc(theme('spacing.24')+4px)] ml-20 flex min-h-[calc(100vh-theme('spacing.24')-4px)] flex-col lg:ml-64",
          className,
        )}
      >
        {children}
      </main>
    </div>
  );
}

export { CoachLayout };
