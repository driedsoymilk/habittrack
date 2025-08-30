"use client";
import { signIn, signOut } from "next-auth/react";

export default function AuthButtons({ userName }: { userName?: string | null }) {
  return (
    <div className="flex items-center gap-3">
      {userName ? (
        <>
          <span className="text-white/90 text-sm">Hi, {userName}</span>
          <button onClick={() => signOut()} className="rounded-lg px-3 py-2 text-sm border text-white hover:bg-white/10">Sign out</button>
        </>
      ) : (
        <button onClick={() => signIn("credentials")} className="rounded-lg px-3 py-2 text-sm border text-white hover:bg-white/10">Continue</button>
      )}
    </div>
  );
}
