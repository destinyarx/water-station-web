import { AppShell } from "@/components/layout/app-shell"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppShell>
            {children}
        </AppShell>
      </body>
    </html>
  )
}