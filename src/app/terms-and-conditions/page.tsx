import type { Metadata } from 'next'

import { LegalPageShell, readLegalDoc } from '@/features/legal'

export const metadata: Metadata = {
  title: 'Terms and Conditions · AquaFlow',
  description:
    'The terms governing use of AquaFlow, the Water Refilling Station Management System, under the laws of the Philippines.',
}

export default async function TermsAndConditionsPage() {
  const source = await readLegalDoc('terms-and-conditions')
  return <LegalPageShell source={source} />
}
