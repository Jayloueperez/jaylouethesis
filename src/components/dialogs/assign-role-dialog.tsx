"use client";

import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { UserRoleSchema } from "~/schema/data-base";
import { Button } from "../ui/button";

interface AssignRoleDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onRoleSelect?: (role: Exclude<UserRoleSchema, "unassigned">) => void;
}

function AssignRoleDialog(props: AssignRoleDialogProps) {
  const { open, onOpenChange, onRoleSelect } = props;

  const [loading, setLoading] = useState<Exclude<
    UserRoleSchema,
    "unassigned"
  > | null>(null);

  async function handleRoleSelect(role: Exclude<UserRoleSchema, "unassigned">) {
    if (!onRoleSelect) return;

    setLoading(role);

    await onRoleSelect(role);

    setLoading(null);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Role</DialogTitle>
          <DialogDescription>
            Select role to be assigned to selected user.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <Button
            variant="blue"
            onClick={() => handleRoleSelect("admin")}
            loading={loading === "admin"}
            disabled={!!(loading && loading !== "admin")}
          >
            Admin
          </Button>
          <Button
            variant="yellow"
            onClick={() => handleRoleSelect("coach")}
            loading={loading === "coach"}
            disabled={!!(loading && loading !== "coach")}
          >
            Coach
          </Button>
          <Button
            variant="outline"
            onClick={() => handleRoleSelect("student")}
            loading={loading === "student"}
            disabled={!!(loading && loading !== "student")}
          >
            Student
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { AssignRoleDialog };
