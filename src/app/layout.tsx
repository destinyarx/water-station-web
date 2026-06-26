import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import { Providers } from './providers'
import './globals.css'

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'AquaFlow - Water Refilling Station Management',
  description:
    'Manage customers, delivery schedules, sales, expenses, and machine maintenance in one simple dashboard built for water refilling businesses.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={poppins.variable} suppressHydrationWarning>
      <head>
        <script
          // Apply the saved theme before first paint so dark mode never flashes.
          dangerouslySetInnerHTML={{
            __html:
              "try{if(localStorage.getItem('aqua-theme')==='dark')document.documentElement.classList.add('dark')}catch(e){}",
          }}
        />
      </head>
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
