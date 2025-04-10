"use client";

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Drama, Home, ListTodo, Megaphone, Volleyball } from "lucide-react";

import { cn } from "~/lib/utils";
import { useAppSelector } from "~/store";
import { Loading } from "../custom-ui/loading";
import { SidebarLink } from "../custom-ui/sidebar-link";
import { Header } from "./header";

interface FacultyLayoutProps {
  children?: ReactNode;
  className?: string;
}

function FacultyLayout(props: FacultyLayoutProps) {
  const { children, className } = props;

  const router = useRouter();
  const pathname = usePathname();

  const { userData, loading, status } = useAppSelector((state) => state.user);

  const isLoaded = loading === false && status === "fetched";

  useEffect(() => {
    if (isLoaded && userData) {
      if (userData.status === "pending") return router.replace("/pending");
      if (userData.role !== "faculty") router.replace(`/${userData.role}`);
    }
  }, [isLoaded, router, userData]);

  if (
    loading ||
    !isLoaded ||
    !userData ||
    (userData &&
      (userData.role !== "faculty" || userData.status !== "confirmed"))
  )
    return <Loading />;

  return (
    <div className="relative flex min-h-screen flex-col">
      <Header dashboard />

      <div className="fixed top-[calc(theme('spacing.24')+4px)] bottom-0 left-0 z-50 flex h-[calc(100vh-theme('spacing.24')-4px)] w-64 flex-col gap-2 overflow-auto bg-violet-950 p-4 text-white">
        <SidebarLink
          href="/faculty"
          icon={Home}
          active={pathname === "/faculty"}
        >
          Home
        </SidebarLink>

        <SidebarLink
          href="/faculty/announcements"
          icon={Megaphone}
          active={pathname.startsWith("/faculty/announcements")}
        >
          Announcements
        </SidebarLink>

        <SidebarLink
          href="/faculty/culture-and-arts"
          icon={Drama}
          active={pathname.startsWith("/faculty/culture-and-arts")}
        >
          Culture & Arts
        </SidebarLink>

        <SidebarLink
          href="/faculty/sports"
          icon={Volleyball}
          active={pathname.startsWith("/faculty/sports")}
        >
          Sports
        </SidebarLink>

        <SidebarLink
          href="/faculty/applications"
          icon={ListTodo}
          active={pathname.startsWith("/faculty/applications")}
        >
          Applications
        </SidebarLink>

        {/* <SidebarLink
          href="/faculty/messages"
          icon={MessageCircle}
          active={pathname.startsWith("/faculty/messages")}
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

export { FacultyLayout };
