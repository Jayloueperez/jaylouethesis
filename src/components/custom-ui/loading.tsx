"use client";

import Image from "next/image";
import { Loader } from "lucide-react";

function Loading() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 p-4">
      <Image
        className="h-40 w-40"
        src="/images/logo.png"
        alt="logo"
        width={1600}
        height={1600}
      />

      <div className="flex items-center gap-2">
        <Loader className="size-4 animate-spin" />

        <span>Loading...</span>
      </div>
    </div>
  );
}

export { Loading };
