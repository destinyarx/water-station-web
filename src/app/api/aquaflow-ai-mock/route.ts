import { NextResponse } from 'next/server'

// Mock AquaFlow AI endpoint. Returns canned, business-shaped replies in the
// same contract a real Gemini-backed Supabase Edge Function will use, so the
// frontend can be built and swapped later with no change. Reply logic is ported
// from the design mockup's craftReply(). See docs/specs/011-aquaflow-ai-feature.

type Tone = 'green' | 'amber' | 'red' | 'brand'

interface AssistantReply {
  content: string
  cardType?: 'insight' | 'flag' | 'ranked'
  cardData?: unknown[]
}

/** Keyword-matched canned reply. Exported for the route handler test. */
export function craftReply(text: string): AssistantReply {
  const q = text.toLowerCase()

  if (q.includes('revenue') || q.includes('sales') || q.includes('income')) {
    return {
      content: "This month's revenue is ₱71,400 so far, up 8% over the same point last month.",
      cardType: 'insight',
      cardData: [
        { label: 'This month', value: '₱71,400', trend: '▲ 8% vs last month', trendTone: 'green' as Tone },
        { label: 'Avg. order', value: '₱212', trend: '▲ ₱9', trendTone: 'green' as Tone },
        { label: 'Orders', value: '337', trend: '▲ 21', trendTone: 'green' as Tone },
      ],
    }
  }

  if (q.includes('stock') || q.includes('inventory') || q.includes('low') || q.includes('caps')) {
    return {
      content: 'Here is what needs attention in inventory right now:',
      cardType: 'flag',
      cardData: [
        { title: '5-Gallon caps & seals', subtitle: '42 left · ~3 days of cover', badge: 'Reorder soon', badgeTone: 'amber' as Tone },
        { title: 'Empty returnable gallons', subtitle: '18 in rotation · below buffer', badge: 'Low', badgeTone: 'red' as Tone },
      ],
    }
  }

  if (q.includes('deliver')) {
    return {
      content: 'You have 6 deliveries scheduled today, 2 already in progress. All routes are on track — no delays reported.',
      cardType: 'insight',
      cardData: [
        { label: 'Scheduled today', value: '6', trend: 'On track', trendTone: 'brand' as Tone },
        { label: 'In progress', value: '2', trend: 'On route', trendTone: 'brand' as Tone },
        { label: 'This week', value: '34', trend: '▲ 4 vs last wk', trendTone: 'green' as Tone },
      ],
    }
  }

  if (q.includes('maintenance') || q.includes('equipment') || q.includes('filter')) {
    return {
      content: 'One unit needs attention soon — the rest are within schedule:',
      cardType: 'flag',
      cardData: [
        { title: 'RO Membrane — Main line', subtitle: 'Last serviced 87 days ago · due at 90', badge: 'Due soon', badgeTone: 'amber' as Tone },
        { title: 'Sediment filter — Line 2', subtitle: 'Serviced 12 days ago', badge: 'OK', badgeTone: 'green' as Tone },
      ],
    }
  }

  if (q.includes('expense') || q.includes('cost') || q.includes('spend')) {
    return {
      content: 'Your biggest expense categories this month are utilities and supplier restocking.',
      cardType: 'ranked',
      cardData: [
        { rank: 1, name: 'Electricity', value: '₱8,450', pct: '100%' },
        { rank: 2, name: 'Caps & seals', value: '₱4,200', pct: '50%' },
        { rank: 3, name: 'Fuel', value: '₱2,600', pct: '31%' },
      ],
    }
  }

  if (q.includes('customer')) {
    return {
      content: '3 regulars have gone quiet lately — worth a check-in:',
      cardType: 'flag',
      cardData: [
        { title: 'Riverside Apartments', subtitle: 'Last order 19 days ago', badge: 'Reach out', badgeTone: 'amber' as Tone },
        { title: 'Sunrise Café', subtitle: 'Last order 24 days ago', badge: 'Reach out', badgeTone: 'amber' as Tone },
      ],
    }
  }

  return {
    content:
      'I can help with sales, inventory, deliveries, maintenance, and expenses. Try asking things like "How\'s revenue trending?" or "What\'s low on stock?"',
  }
}

export async function POST(request: Request): Promise<Response> {
  let message = ''
  try {
    const body: unknown = await request.json()
    if (body && typeof body === 'object' && 'message' in body) {
      const m = (body as { message: unknown }).message
      if (typeof m === 'string') message = m
    }
  } catch {
    // ponytail: malformed body → treat as empty; falls through to help text.
  }

  // Artificial delay so the UI's typing indicator is exercised.
  await new Promise((resolve) => setTimeout(resolve, 700))

  return NextResponse.json(craftReply(message))
}
