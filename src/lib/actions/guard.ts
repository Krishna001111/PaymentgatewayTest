import { getSession } from "@/lib/auth";

export async function requireAdmin() {
  const session = await getSession();
  if (!session?.user) throw new Error("Unauthorized");
  return session;
}
