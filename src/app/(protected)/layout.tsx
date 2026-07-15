import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

import { AppShell } from '@/components/layout/app-shell'
import { isRegistered } from '@/features/registration/registration.guards'
import { REGISTRATION_REDIRECT_PATH } from '@/features/registration/registration.constants'
import { NotificationsProvider } from '@/features/notifications'

export default async function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId, sessionClaims } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  if (!isRegistered(sessionClaims)) {
    redirect(REGISTRATION_REDIRECT_PATH)
  }

  return (
    <NotificationsProvider>
      <AppShell>{children}</AppShell>
    </NotificationsProvider>
  )
}
