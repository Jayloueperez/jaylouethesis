"use client";

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Drama,
  Home,
  ListTodo,
  Megaphone,
  Users,
  UsersRound,
  Volleyball,
} from "lucide-react";

import { cn } from "~/lib/utils";
import { useAppSelector } from "~/store";
import { Loading } from "../custom-ui/loading";
import { SidebarLink } from "../custom-ui/sidebar-link";
import { Header } from "./header";

interface AdminLayoutProps {
  children?: ReactNode;
  className?: string;
}

function AdminLayout(props: AdminLayoutProps) {
  const { children, className } = props;

  const router = useRouter();
  const pathname = usePathname();

  const { userData, loading, status } = useAppSelector((state) => state.user);

  const isLoaded = loading === false && status === "fetched";

  useEffect(() => {
    if (isLoaded && userData) {
      if (userData.status === "pending") return router.replace("/pending");
      if (userData.role !== "admin") router.replace(`/${userData.role}`);
    }
  }, [isLoaded, router, userData]);

  if (
    loading ||
    !isLoaded ||
    !userData ||
    (userData && (userData.role !== "admin" || userData.status !== "confirmed"))
  )
    return <Loading />;

  return (
    <div className="relative flex min-h-screen flex-col">
      <Header dashboard />

      <div className="fixed top-[calc(theme('spacing.24')+4px)] bottom-0 left-0 z-50 flex h-[calc(100vh-theme('spacing.24')-4px)] w-20 flex-col gap-2 overflow-auto bg-violet-950 p-2 text-white lg:w-64 lg:p-4">
        <SidebarLink href="/admin" icon={Home} active={pathname === "/admin"}>
          Home
        </SidebarLink>

        <SidebarLink
          href="/admin/announcements"
          icon={Megaphone}
          active={pathname.startsWith("/admin/announcements")}
        >
          Announcements
        </SidebarLink>

        <SidebarLink
          href="/admin/culture-and-arts"
          icon={Drama}
          active={pathname.startsWith("/admin/culture-and-arts")}
        >
          Culture & Arts
        </SidebarLink>

        <SidebarLink
          href="/admin/sports"
          icon={Volleyball}
          active={pathname.startsWith("/admin/sports")}
        >
          Sports
        </SidebarLink>

        <SidebarLink
          href="/admin/coaches"
          icon={Users}
          active={pathname.startsWith("/admin/coaches")}
        >
          Coaches
        </SidebarLink>

        <SidebarLink
          href="/admin/students"
          icon={UsersRound}
          active={pathname.startsWith("/admin/students")}
        >
          Students
        </SidebarLink>

        <SidebarLink
          href="/admin/applications"
          icon={ListTodo}
          active={pathname.startsWith("/admin/applications")}
        >
          Applicants
        </SidebarLink>

        {/* <SidebarLink
          href="/admin/messages"
          icon={MessageCircle}
          active={pathname.startsWith("/admin/messages")}
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

export { AdminLayout };
