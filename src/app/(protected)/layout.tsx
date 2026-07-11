import { AppShell } from "@/components/layout/app-shell"
import { NotificationsProvider } from "@/features/notifications"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <NotificationsProvider>
      <AppShell>
        {children}
      </AppShell>
    </NotificationsProvider>
  )
}