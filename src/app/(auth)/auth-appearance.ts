import type { ComponentProps } from 'react'
import type { SignIn } from '@clerk/nextjs'
import { dark } from '@clerk/themes'

type ClerkAppearance = NonNullable<ComponentProps<typeof SignIn>['appearance']>

/** Clerk `<SignIn>`/`<SignUp>` appearance keyed to the AquaFlow theme. In dark mode we
 * layer on Clerk's official `dark` baseTheme (properly tuned contrast) and only override
 * the brand accent, instead of hand-rolling dark variables that render too dim. */
export function authAppearance(isDark: boolean): ClerkAppearance {
  return {
    baseTheme: isDark ? dark : undefined,
    variables: isDark
      ? {
          colorPrimary: '#5cb8f6',
          borderRadius: '12px',
        }
      : {
          colorPrimary: '#0a6cc4',
          colorBackground: '#ffffff',
          colorText: '#0c2a3e',
          colorTextSecondary: '#42647d',
          colorInputBackground: '#f3faff',
          colorInputText: '#0c2a3e',
          borderRadius: '12px',
        },
    elements: {
      cardBox: { boxShadow: '0 30px 70px rgba(14,108,196,0.18)' },
    },
  }
}
