"use client";

import Link from "next/link";
import { format, parse } from "date-fns";

import { UserSchema } from "~/schema/data-client";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button, ButtonProps } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Separator } from "../ui/separator";

interface ViewProfileDialogProps extends ButtonProps {
  user: UserSchema;
}

function ViewProfileDialog({
  user,
  children,
  ...props
}: ViewProfileDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="yellow" {...props}>
          {children}
        </Button>
      </DialogTrigger>

      <DialogContent className="md:max-w-xs">
        <DialogHeader>
          <DialogTitle>{user.firstName}&apos;s Profile</DialogTitle>

          <DialogDescription>
            Viewing a {user.role}&apos;s profile
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-center">
            <Avatar className="size-32">
              <AvatarImage src={user.profile} alt={user.email} />
              <AvatarFallback>
                {user.firstName.substring(0, 1).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          <table>
            <tbody>
              <tr>
                <td className="pr-2 text-right font-medium">Name:</td>
                <td>
                  {user.firstName}{" "}
                  {user.middleInitial ? `${user.middleInitial}.` : ""}{" "}
                  {user.surname}
                </td>
              </tr>
              <tr>
                <td className="pr-2 text-right font-medium">Birthdate:</td>
                <td>
                  {user.birthdate
                    ? format(
                        parse(user.birthdate, "yyyy-MM-dd", new Date()),
                        "MMM dd, yyyy",
                      )
                    : ""}
                </td>
              </tr>
              <tr>
                <td className="pr-2 text-right font-medium">Age:</td>
                <td>{user.age}</td>
              </tr>
              <tr>
                <td className="pr-2 text-right font-medium">Course:</td>
                <td>{user.course}</td>
              </tr>
              <tr>
                <td className="pr-2 text-right font-medium">Year:</td>
                <td>{user.year}</td>
              </tr>
              <tr>
                <td className="pr-2 text-right font-medium">Section:</td>
                <td>{user.section}</td>
              </tr>
            </tbody>
          </table>

          <Separator />

          <div className="flex flex-col gap-4">
            <span>Attachments:</span>

            <div className="flex flex-wrap items-center gap-2">
              {user.attachments.map((a, i) => (
                <Link
                  className="rounded-full border border-gray-300 px-2 py-1 text-xs"
                  key={`attachment-${i}`}
                  href={a}
                  target="_blank"
                >
                  {a}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { ViewProfileDialog };
