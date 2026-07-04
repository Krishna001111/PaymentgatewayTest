"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/admin/login" })}
      className="rounded px-2 py-1 text-xs text-slate-400 hover:bg-slate-800 hover:text-white"
    >
      Sign out
    </button>
  );
}
