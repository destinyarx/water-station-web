'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const FAQS = [
  {
    question: 'Is this built specifically for water refilling stations?',
    answer:
      'Yes, every feature maps to real refilling-station operations.',
  },
  {
    question: 'Can I track unpaid orders and customer balances?',
    answer: 'Yes, see paid/pending status per customer instantly.',
  },
  {
    question: 'Does it work on my phone?',
    answer: 'Yes, fully responsive on any device.',
  },
  {
    question: 'Can I schedule recurring deliveries?',
    answer:
      'Yes, daily and recurring schedules for households, offices, and businesses.',
  },
  {
    question: 'Will it remind me about machine maintenance?',
    answer: 'Yes, set cleaning, filter, and repair reminders.',
  },
  {
    question: 'Do I need technical skills to use it?',
    answer: "No, it's designed to be simple for small business owners.",
  },
]

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number>(0)

  return (
    <section id="faq" className="scroll-mt-20 bg-fog">
      <div className="mx-auto max-w-3xl px-6 py-16 lg:py-24">
        <h2 className="text-center font-outfit text-[2rem] font-bold tracking-[-0.02em] text-aqua-deep">
          Frequently asked questions.
        </h2>

        <div className="mt-10 space-y-3">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index
            return (
              <div
                key={faq.question}
                className="overflow-hidden rounded-[1.5rem] bg-cloud shadow-[0_8px_30px_rgba(79,181,232,0.07)]"
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="font-outfit text-base font-bold text-aqua-deep">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={cn(
                      'size-5 shrink-0 text-aqua-mid transition-transform duration-300',
                      isOpen && 'rotate-180',
                    )}
                  />
                </button>
                <div
                  className={cn(
                    'grid transition-all duration-300 ease-out',
                    isOpen
                      ? 'grid-rows-[1fr] opacity-100'
                      : 'grid-rows-[0fr] opacity-0',
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-4 text-sm leading-[1.65] text-slate">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
