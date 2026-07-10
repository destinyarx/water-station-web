'use client'

import { SignUp } from '@clerk/nextjs'

import { useTheme } from '@/stores/use-theme'
import { authAppearance } from '../../auth-appearance'

export default function SignUpPage() {
  const isDark = useTheme()
  return <SignUp appearance={authAppearance(isDark)} />
}
