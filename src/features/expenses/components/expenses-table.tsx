import { CalendarDays, CreditCard, ReceiptText, Tag } from 'lucide-react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { pesoFormatter } from '../expenses.summary'
import type { Expense } from '../expenses.types'
import { ExpenseRowActions } from './expense-row-actions'

interface ExpensesTableProps {
  expenses: Expense[]
}

export function ExpensesTable({ expenses }: ExpensesTableProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-[#dcecff] bg-white/95 shadow-[0_16px_44px_rgba(0,48,73,0.06)]">
      <div className="border-b border-[#dcecff] bg-[#eef7ff]/70 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-white text-[#00b4d8] shadow-sm">
            <ReceiptText className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-heading text-lg font-semibold text-[#001d34]">
              Expense ledger
            </h2>
            <p className="text-sm text-[#2a4b6a]">
              Active operating costs for the current station.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 p-3 md:hidden">
        {expenses.map((expense) => (
          <ExpenseMobileCard key={expense.id} expense={expense} />
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <Table>
          <TableHeader>
            <TableRow className="border-[#dcecff] bg-white hover:bg-white">
              <TableHead className="px-5 py-4 text-xs font-bold uppercase tracking-[0.12em] text-[#6d797e]">
                Expense
              </TableHead>
              <TableHead className="px-5 py-4 text-xs font-bold uppercase tracking-[0.12em] text-[#6d797e]">
                Category
              </TableHead>
              <TableHead className="px-5 py-4 text-xs font-bold uppercase tracking-[0.12em] text-[#6d797e]">
                Payment
              </TableHead>
              <TableHead className="px-5 py-4 text-xs font-bold uppercase tracking-[0.12em] text-[#6d797e]">
                Date
              </TableHead>
              <TableHead className="px-5 py-4 text-right text-xs font-bold uppercase tracking-[0.12em] text-[#6d797e]">
                Amount
              </TableHead>
              <TableHead className="px-5 py-4 text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense) => (
              <TableRow
                key={expense.id}
                className="border-[#e5f1ff] transition-colors hover:bg-[#eef7ff]/70"
              >
                <TableCell className="px-5 py-4">
                  <div>
                    <p className="font-semibold text-[#001d34]">
                      {expense.name}
                    </p>
                    <p className="text-xs text-[#2a4b6a]">
                      {expense.referencesNumber ?? 'No reference saved'}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="px-5 py-4">
                  <ExpenseBadge icon={Tag}>{expense.categoryLabel}</ExpenseBadge>
                </TableCell>
                <TableCell className="px-5 py-4">
                  <ExpenseBadge icon={CreditCard}>
                    {expense.paymentMethodLabel}
                  </ExpenseBadge>
                </TableCell>
                <TableCell className="px-5 py-4 text-sm text-[#2a4b6a]">
                  {formatDate(expense.dateIncurred)}
                </TableCell>
                <TableCell className="px-5 py-4 text-right font-semibold tabular-nums text-[#001d34]">
                  {pesoFormatter.format(expense.amount)}
                </TableCell>
                <TableCell className="px-5 py-4 text-right">
                  <ExpenseRowActions expense={expense} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function ExpenseMobileCard({ expense }: { expense: Expense }) {
  return (
    <article className="rounded-2xl border border-[#dcecff] bg-white p-4 shadow-[0_10px_24px_rgba(0,48,73,0.05)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-heading text-base font-semibold text-[#001d34]">
            {expense.name}
          </h3>
          <p className="text-xs text-[#2a4b6a]">
            {expense.referencesNumber ?? 'No reference saved'}
          </p>
        </div>
        <p className="font-semibold tabular-nums text-[#001d34]">
          {pesoFormatter.format(expense.amount)}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <ExpenseBadge icon={Tag}>{expense.categoryLabel}</ExpenseBadge>
        <ExpenseBadge icon={CreditCard}>{expense.paymentMethodLabel}</ExpenseBadge>
        <ExpenseBadge icon={CalendarDays}>
          {formatDate(expense.dateIncurred)}
        </ExpenseBadge>
      </div>

      <div className="mt-4 border-t border-[#e5f1ff] pt-3">
        <ExpenseRowActions expense={expense} />
      </div>
    </article>
  )
}

type ExpenseBadgeProps = {
  icon: typeof Tag
  children: string
}

function ExpenseBadge({ icon: Icon, children }: ExpenseBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#00f5d4]/15 px-2.5 py-1 text-xs font-bold text-[#005144]">
      <Icon className="size-3.5" aria-hidden="true" />
      {children}
    </span>
  )
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
}
