import type { Session } from "next-auth";

export function getUserId(session: Session | null): string | null {
  const u = session?.user as { id?: string } | undefined;
  return u?.id ?? null;
}
