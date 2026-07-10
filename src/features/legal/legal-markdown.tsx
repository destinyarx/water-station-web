import type { ComponentPropsWithoutRef } from 'react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

/** Renders trusted legal markdown (authored by us, not user input) with the
 * landing-page token palette so the pages match the marketing site. */
export function LegalMarkdown({ source }: { source: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: (props) => (
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-(--lp-text)" {...props} />
        ),
        h2: (props) => (
          <h2 className="mt-10 mb-3 text-xl font-bold text-(--lp-text)" {...props} />
        ),
        h3: (props) => (
          <h3 className="mt-6 mb-2 text-base font-semibold text-(--lp-text)" {...props} />
        ),
        p: (props) => (
          <p className="my-3 text-[15px] leading-7 text-(--lp-text-soft)" {...props} />
        ),
        ul: (props) => (
          <ul className="my-3 list-disc space-y-1.5 pl-6 text-[15px] leading-7 text-(--lp-text-soft)" {...props} />
        ),
        ol: (props) => (
          <ol className="my-3 list-decimal space-y-1.5 pl-6 text-[15px] leading-7 text-(--lp-text-soft)" {...props} />
        ),
        li: (props) => <li className="pl-1" {...props} />,
        strong: (props) => <strong className="font-semibold text-(--lp-text)" {...props} />,
        hr: (props) => <hr className="my-8 border-(--lp-border)" {...props} />,
        a: ({ href = '', ...props }: ComponentPropsWithoutRef<'a'>) => {
          const className = 'font-medium text-(--lp-brand-text) underline underline-offset-2 hover:opacity-80'
          if (href.startsWith('/')) {
            return <Link href={href} className={className} {...props} />
          }
          return <a href={href} className={className} {...props} />
        },
      }}
    >
      {source}
    </ReactMarkdown>
  )
}
