import type { Metadata } from 'next'

import { LegalPageShell, readLegalDoc } from '@/features/legal'

export const metadata: Metadata = {
  title: 'Privacy Policy · AquaFlow',
  description:
    'How AquaFlow collects, uses, and protects information for water refilling station businesses, aligned with the Data Privacy Act of 2012.',
}

export default async function PrivacyPolicyPage() {
  const source = await readLegalDoc('privacy-policy')
  return <LegalPageShell source={source} />
}
