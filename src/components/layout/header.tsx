"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, ChevronDown, Loader, LogOut } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useAlert } from "~/hooks/use-alert";
import { useNotifications } from "~/hooks/use-notifications";
import { cn } from "~/lib/utils";
import { useAppDispatch, useAppSelector } from "~/store";
import { logout } from "~/store/auth-slice";
import { getError } from "~/utils/error";
import { ButtonLink } from "../custom-ui/button-link";
import { Skeleton } from "../ui/skeleton";

interface HeaderProps {
  dashboard?: boolean;
}

function Header(props: HeaderProps) {
  const { dashboard } = props;

  const router = useRouter();

  const { component, openAlert } = useAlert();
  const { userData, status } = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();

  const { data: notifications, loading } = useNotifications({
    receiver: userData?.id,
    enabled: !!userData,
  });

  async function handleLogout() {
    if (!userData) return;

    try {
      let redirect = "/login";

      switch (userData.role) {
        case "admin": {
          redirect = "/admin/login";

          break;
        }

        case "coach": {
          redirect = "/coach/login";

          break;
        }

        default: {
          redirect = "/login";

          break;
        }
      }

      await dispatch(logout()).unwrap();

      router.replace(redirect);
    } catch (error) {
      const err = getError(error, "Failed user logout.");

      openAlert({
        title: "Failed",
        description: err.message,
      });
    }
  }

  return (
    <>
      <header className="border-b-flush-orange-500 fixed top-0 right-0 left-0 z-50 border-b-4 bg-violet-950 text-white">
        <div
          className={cn(
            "flex h-24 items-center justify-between gap-4",
            !dashboard && "container",
            dashboard && "px-4",
          )}
        >
          <div className="flex items-center gap-4">
            <Link className="shrink-0" href="/">
              <Image
                className="size-12"
                src="/images/logo.png"
                alt="logo"
                width={1600}
                height={1600}
              />
            </Link>

            <span className="hidden lg:inline">BISU - BALILIHAN CAMPUS</span>
          </div>

          <div className="flex items-center gap-8">
            {status !== "fetched" ? (
              <div className="flex items-center gap-2">
                <Skeleton className="h-12 w-12 rounded-full" />
                <Skeleton className="h-4 w-16" />
              </div>
            ) : userData ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger className="outline-none">
                    <Bell className="h-6 w-6" />
                  </DropdownMenuTrigger>

                  <DropdownMenuContent className="w-40">
                    {loading && (
                      <DropdownMenuItem>
                        <Loader className="h-4 w-4 animate-spin" />
                      </DropdownMenuItem>
                    )}

                    {!loading && notifications.length === 0 && (
                      <DropdownMenuItem>
                        <span>No notifications.</span>
                      </DropdownMenuItem>
                    )}

                    {!loading &&
                      notifications.map((n) => (
                        <DropdownMenuItem className="flex flex-col" key={n.id}>
                          <span>{n.title}</span>
                          <span className="text-sm text-gray-500">
                            {n.body}
                          </span>
                        </DropdownMenuItem>
                      ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger className="bg-flush-orange-500 flex items-center gap-2 rounded-md p-2 outline-none">
                    <Avatar>
                      <AvatarImage
                        src={userData.profile}
                        alt={userData.firstName}
                      />

                      <AvatarFallback>
                        {userData.firstName.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>

                    <span>{userData.firstName}</span>

                    <ChevronDown className="size-4" />
                  </DropdownMenuTrigger>

                  <DropdownMenuContent className="w-40">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>

                    <DropdownMenuSeparator />

                    {/* {userData.role !== "unassigned" && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href={`/${userData.role}`}>
                            <LayoutDashboard className="size-4" />
                            <span>Dashboard</span>
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )} */}

                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="size-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <ButtonLink variant="yellow" href="/login">
                LOGIN
              </ButtonLink>
            )}
          </div>
        </div>
      </header>

      {component}
    </>
  );
}

export { Header };
