import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'

import { AquaflowAiPage } from '@/features/aquaflow-ai'
import { canAccessAquaflowAi } from '@/features/aquaflow-ai/aquaflow-ai.guards'

export const dynamic = 'force-dynamic'

// Owner-only route (ADR 0008). The nav hide is UX only; this server-side check
// is the real gate — a staff session guessing the URL is redirected away.
export default async function AiAssistant() {
  const { sessionClaims } = await auth()

  if (!canAccessAquaflowAi(sessionClaims)) {
    redirect('/dashboard')
  }

  return <AquaflowAiPage />
}
