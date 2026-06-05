import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { AUTH_COOKIE, verifyToken } from "@/lib/auth";
import ShellChrome from "@/components/shell/ShellChrome";

// State B — authenticated shell. Server-side auth guard (defense in depth
// alongside middleware.ts).
export default async function ShellLayout({ children }: { children: React.ReactNode }) {
  const jar = await cookies();
  const token = jar.get(AUTH_COOKIE)?.value ?? "";
  const session = await verifyToken(token);
  if (!session) redirect("/login");

  const email =
    (typeof session.email === "string" && session.email) ||
    (typeof session.sub === "string" && session.sub) ||
    null;

  return <ShellChrome user={{ email }}>{children}</ShellChrome>;
}
