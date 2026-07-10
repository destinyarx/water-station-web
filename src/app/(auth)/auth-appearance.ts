import type { ComponentProps } from 'react'
import type { SignIn } from '@clerk/nextjs'

type ClerkAppearance = NonNullable<ComponentProps<typeof SignIn>['appearance']>

/** Clerk `<SignIn>`/`<SignUp>` appearance keyed to the AquaFlow theme. Clerk renders
 * its widget in its own shadow-free scope, so it can't read our `--lp-*` tokens via
 * CSS — we pass concrete values from the design token table (globals.css) per theme. */
export function authAppearance(isDark: boolean): ClerkAppearance {
  return {
    variables: isDark
      ? {
          colorPrimary: '#5cb8f6',
          colorBackground: '#0f2433',
          colorText: '#eaf4fb',
          colorTextSecondary: '#9db6c8',
          colorInputBackground: '#13293a',
          colorInputText: '#eaf4fb',
          colorNeutral: '#eaf4fb',
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
