'use client'

import { SignIn } from '@clerk/nextjs'

import { useTheme } from '@/stores/use-theme'
import { authAppearance } from '../../auth-appearance'

export default function SignInPage() {
  const isDark = useTheme()
  return <SignIn appearance={authAppearance(isDark)} />
}
