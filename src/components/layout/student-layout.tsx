"use client";

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Drama, House, User2, Volleyball } from "lucide-react";

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
      if (userData.status === "pending") return router.replace("/pending");
      if (userData.role !== "student") router.replace(`/${userData.role}`);
    }
  }, [isLoaded, router, userData]);

  useEffect(() => {
    if (isLoaded && userData && !hasData) {
      router.replace("/student/info");
    }
  }, [isLoaded, hasData, router, userData]);

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
          "fixed top-[calc(theme('spacing.24')+4px)] bottom-0 left-0 z-50 flex h-[calc(100vh-theme('spacing.24')-4px)] w-20 flex-col gap-2 overflow-auto bg-violet-950 p-2 text-white lg:w-64 lg:p-4",
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
          href="/student/culture-and-arts"
          icon={Drama}
          active={pathname.startsWith("/student/culture-and-arts")}
        >
          Culture & Arts
        </SidebarLink>

        <SidebarLink
          href="/student/sports"
          icon={Volleyball}
          active={pathname.startsWith("/student/sports")}
        >
          Sports
        </SidebarLink>

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
          "mt-[calc(theme('spacing.24')+4px)] ml-20 flex min-h-[calc(100vh-theme('spacing.24')-4px)] flex-col lg:ml-64",
          className,
          sidebarHidden && "ml-0 lg:ml-0",
        )}
      >
        {children}
      </main>
    </div>
  );
}

export { StudentLayout };
