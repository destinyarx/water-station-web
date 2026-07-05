import type { ReadyMadePrompt } from './aquaflow-ai.types'

export const AI_CONVERSATIONS_TABLE = 'ai_conversations'
export const AI_MESSAGES_TABLE = 'ai_messages'

export const AI_CONVERSATION_COLUMNS =
  'id, org_id, created_by, title, created_at, updated_at'
export const AI_MESSAGE_COLUMNS =
  'id, conversation_id, role, content, display_text, card_type, card_data, created_at'

/**
 * Most-recent messages sent to the assistant as context. Bounds request
 * size/cost once real AI is wired up; the full history stays readable in the
 * UI (fetch-time cap only, no row pruning). See ADR / PRD 011.
 */
export const AI_CONTEXT_MESSAGE_LIMIT = 20

export const DEFAULT_CONVERSATION_TITLE = 'New chat'

/**
 * Endpoint the frontend posts to for an assistant reply. Defaults to the local
 * mock route; a future spec swaps this env var for the real Supabase Edge
 * Function URL with no code change.
 */
export const AI_ENDPOINT_URL =
  process.env.NEXT_PUBLIC_SUPABASE_EDGE_AQUAFLOW_AI_URL ?? '/api/aquaflow-ai-mock'

export const AI_CONVERSATIONS_LOAD_ERROR = 'Unable to load conversations. Please try again.'
export const AI_MESSAGES_LOAD_ERROR = 'Unable to load messages. Please try again.'
export const AI_CONVERSATION_SAVE_ERROR = 'Unable to start a conversation. Please try again.'
export const AI_CONVERSATION_DELETE_ERROR = 'Unable to delete conversation. Please try again.'
export const AI_MESSAGE_SAVE_ERROR = 'Unable to save message. Please try again.'
export const AI_REPLY_ERROR = 'The assistant is unavailable right now. Please try again.'

/**
 * Ready-made prompts: short display title + a long, prompt-engineered body sent
 * to the assistant. Static business content, not user data — no table.
 * Keywords in each body line up with the mock endpoint's canned responses.
 */
export const READY_MADE_PROMPTS: ReadyMadePrompt[] = [
  {
    key: 'sales',
    title: 'Analyze my sales',
    tone: 'brand',
    prompt:
      'Analyze this water refilling station\'s revenue and sales performance for the current month. Compare it to the same point last month, break down the trend, average order value, and order count, and call out anything unusual. Keep the summary owner-friendly and highlight the single most important takeaway first.',
  },
  {
    key: 'stock',
    title: 'Check low stock',
    tone: 'amber',
    prompt:
      'Review the station\'s stock-tracked inventory (bottled water, 5-gallon caps and seals, returnable gallons, accessories) and flag every item that is low or needs reordering soon. For each flagged item show how many units remain, roughly how many days of cover that represents, and how urgent the reorder is.',
  },
  {
    key: 'deliveries',
    title: "Today's deliveries",
    tone: 'brand',
    prompt:
      'Summarize the delivery picture for today: how many deliveries are scheduled, how many are already in progress, and whether any routes are delayed or at risk. Add a short comparison to this week\'s volume so the owner knows if today is busier or quieter than usual.',
  },
  {
    key: 'maintenance',
    title: 'Equipment health',
    tone: 'amber',
    prompt:
      'Report on the maintenance status of the station\'s equipment (RO membranes, sediment filters, pumps, dispensers). Flag any unit that is overdue or due soon based on its service interval, and confirm which units are within schedule. Order the list by urgency.',
  },
  {
    key: 'expenses',
    title: 'Biggest expenses',
    tone: 'red',
    prompt:
      'Rank this station\'s biggest expense categories for the current month (utilities, supplier restocking, fuel, repairs, and so on). Show each category\'s amount and its share relative to the largest, and note anything that looks higher than expected for a small water refilling business.',
  },
  {
    key: 'customers',
    title: 'Quiet customers',
    tone: 'amber',
    prompt:
      'Identify regular customers who have gone quiet — those whose most recent order is unusually far in the past relative to their normal ordering rhythm. For each, show how long since their last order and suggest which ones are worth a proactive check-in.',
  },
]
