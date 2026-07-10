import { readFile } from 'node:fs/promises'
import path from 'node:path'

export type LegalSlug = 'privacy-policy' | 'terms-and-conditions'

/** Reads a legal document's markdown from src/content/legal at request time.
 * Server-only (uses node:fs) — import from server components/pages only. */
export async function readLegalDoc(slug: LegalSlug): Promise<string> {
  const filePath = path.join(process.cwd(), 'src', 'content', 'legal', `${slug}.md`)
  return readFile(filePath, 'utf8')
}
