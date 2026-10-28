import { ToastProvider } from "@/components/ui";
import { requireUser } from "@/lib/auth/session";
import { PortalShell } from "./PortalShell";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <ToastProvider>
      <PortalShell user={user}>{children}</PortalShell>
    </ToastProvider>
  );
}