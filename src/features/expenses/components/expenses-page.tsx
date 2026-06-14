'use client'

import { useMemo, useState } from 'react'
import { Droplets, ReceiptText, Search, WalletCards } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { expenseCategories, paymentMethods } from '../expenses.constants'
import {
  createExpenseSummary,
  filterExpenses,
  pesoFormatter,
} from '../expenses.summary'
import type { Expense, ExpenseCategory, PaymentMethod } from '../expenses.types'
import { useExpenses } from '../hooks/use-expenses'
import { CreateExpenseDialog } from './create-expense-dialog'
import { ExpensesTable } from './expenses-table'

const EMPTY_EXPENSES: Expense[] = []

export function ExpensesPage() {
  const { data: expenses, isPending, isError, error } = useExpenses()
  const expenseList = expenses ?? EMPTY_EXPENSES
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | 'all'>(
    'all',
  )
  const [paymentFilter, setPaymentFilter] = useState<PaymentMethod | 'all'>(
    'all',
  )
  const [dateFilter, setDateFilter] = useState('')

  const filteredExpenses = useMemo(
    () =>
      filterExpenses(expenseList, {
        search: searchQuery,
        category: categoryFilter,
        paymentMethod: paymentFilter,
        date: dateFilter,
      }),
    [categoryFilter, dateFilter, expenseList, paymentFilter, searchQuery],
  )

  const summary = useMemo(
    () => createExpenseSummary(expenseList),
    [expenseList],
  )

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <header className="overflow-hidden rounded-3xl border border-[#dcecff] bg-white shadow-[0_16px_44px_rgba(0,48,73,0.08)]">
        <div className="relative p-6 sm:p-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_0%,rgba(0,180,216,0.18),transparent_30%),radial-gradient(circle_at_92%_20%,rgba(0,245,212,0.16),transparent_28%)]" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#bdefff] bg-[#eef7ff]/80 px-3 py-1 text-sm font-semibold text-[#00677d]">
                <Droplets className="size-4" aria-hidden="true" />
                Station operating costs
              </div>
              <div>
                <h1 className="font-heading text-3xl font-semibold tracking-tight text-[#001d34] sm:text-4xl">
                  Expenses
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-6 text-[#2a4b6a] sm:text-base">
                  Track water station spending across utilities, supplies,
                  maintenance, labor, fees, and daily operating costs.
                </p>
              </div>
            </div>
            <CreateExpenseDialog />
          </div>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ExpenseMetricCard
          label="Total Expenses"
          value={pesoFormatter.format(summary.totalExpenses)}
          description="Active operating costs"
        />
        <ExpenseMetricCard
          label="This Month"
          value={pesoFormatter.format(summary.thisMonth)}
          description="Current calendar month"
        />
        <ExpenseMetricCard
          label="Largest Category"
          value={summary.largestCategoryLabel}
          description="Highest total spend"
        />
        <ExpenseMetricCard
          label="Recent Count"
          value={String(summary.recentExpenseCount)}
          description="Expenses from the last 7 days"
        />
      </div>

      <div className="rounded-3xl border border-[#dcecff] bg-white/90 p-4 shadow-[0_16px_44px_rgba(0,48,73,0.06)] backdrop-blur-xl sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_180px_180px_160px_auto] lg:items-center">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#6d797e]"
              aria-hidden="true"
            />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search name, notes, or reference"
              className="h-11 rounded-xl border-[#dcecff] bg-[#eef7ff]/70 pl-9 text-[#001d34] placeholder:text-[#6d797e] focus-visible:border-[#00b4d8] focus-visible:ring-[#00b4d8]/20"
              aria-label="Search expenses"
            />
          </div>

          <FilterSelect
            ariaLabel="Filter by category"
            value={categoryFilter}
            onChange={(value) =>
              setCategoryFilter(value as ExpenseCategory | 'all')
            }
          >
            <option value="all">All categories</option>
            {expenseCategories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.name}
              </option>
            ))}
          </FilterSelect>

          <FilterSelect
            ariaLabel="Filter by payment method"
            value={paymentFilter}
            onChange={(value) =>
              setPaymentFilter(value as PaymentMethod | 'all')
            }
          >
            <option value="all">All payments</option>
            {paymentMethods.map((method) => (
              <option key={method.value} value={method.value}>
                {method.name}
              </option>
            ))}
          </FilterSelect>

          <Input
            type="date"
            value={dateFilter}
            onChange={(event) => setDateFilter(event.target.value)}
            aria-label="Filter by expense date"
            className="h-11 rounded-xl border-[#dcecff] bg-[#eef7ff]/70 text-[#001d34] focus-visible:border-[#00b4d8] focus-visible:ring-[#00b4d8]/20"
          />

          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setSearchQuery('')
              setCategoryFilter('all')
              setPaymentFilter('all')
              setDateFilter('')
            }}
            className="rounded-xl border border-[#dcecff] bg-white text-[#2a4b6a] hover:bg-[#eef7ff] hover:text-[#00414f]"
          >
            Clear
          </Button>
        </div>
      </div>

      {isPending ? (
        <ExpensesLoadingState />
      ) : isError ? (
        <div
          role="alert"
          className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700"
        >
          {error.message}
        </div>
      ) : expenseList.length === 0 ? (
        <ExpensesEmptyState />
      ) : filteredExpenses.length === 0 ? (
        <ExpensesNoResultsState />
      ) : (
        <ExpensesTable expenses={filteredExpenses} />
      )}
    </section>
  )
}

interface ExpenseMetricCardProps {
  label: string
  value: string
  description: string
}

function ExpenseMetricCard({ label, value, description }: ExpenseMetricCardProps) {
  return (
    <article className="rounded-2xl border border-[#dcecff] bg-white/85 p-5 shadow-[0_12px_32px_rgba(0,48,73,0.06)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#2a4b6a]">{label}</p>
          <p className="mt-2 truncate font-heading text-2xl font-semibold tabular-nums text-[#001d34]">
            {value}
          </p>
        </div>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[#e8fbff] text-[#00b4d8]">
          <WalletCards className="size-5" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 text-sm leading-5 text-[#2a4b6a]">{description}</p>
    </article>
  )
}

interface FilterSelectProps {
  ariaLabel: string
  value: string
  onChange: (value: string) => void
  children: React.ReactNode
}

function FilterSelect({
  ariaLabel,
  value,
  onChange,
  children,
}: FilterSelectProps) {
  return (
    <select
      aria-label={ariaLabel}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={cn(
        'h-11 rounded-xl border border-[#dcecff] bg-[#eef7ff]/70 px-3 text-sm text-[#001d34] outline-none transition-[color,box-shadow]',
        'focus:border-[#00b4d8] focus:ring-4 focus:ring-[#00b4d8]/20',
      )}
    >
      {children}
    </select>
  )
}

function ExpensesLoadingState() {
  return (
    <div className="rounded-3xl border border-[#dcecff] bg-white/90 p-4 shadow-[0_16px_44px_rgba(0,48,73,0.06)]">
      <div className="space-y-3">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="grid gap-3 rounded-2xl bg-[#eef7ff]/70 p-4 md:grid-cols-[1.4fr_1fr_1fr_0.8fr_0.8fr_auto]"
          >
            <div className="h-10 animate-pulse rounded-xl bg-white" />
            <div className="h-10 animate-pulse rounded-xl bg-white" />
            <div className="h-10 animate-pulse rounded-xl bg-white" />
            <div className="h-10 animate-pulse rounded-xl bg-white" />
            <div className="h-10 animate-pulse rounded-xl bg-white" />
            <div className="h-10 animate-pulse rounded-xl bg-white md:w-28" />
          </div>
        ))}
      </div>
    </div>
  )
}

function ExpensesEmptyState() {
  return (
    <div className="rounded-3xl border border-dashed border-[#9adff1] bg-[#eef7ff]/70 p-10 text-center">
      <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-white text-[#00b4d8] shadow-[0_12px_32px_rgba(0,48,73,0.08)]">
        <ReceiptText className="size-7" aria-hidden="true" />
      </div>
      <h2 className="mt-4 font-heading text-xl font-semibold text-[#001d34]">
        No expenses recorded yet
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#2a4b6a]">
        Start tracking your water station operating costs by adding your first
        expense.
      </p>
    </div>
  )
}

function ExpensesNoResultsState() {
  return (
    <div className="rounded-3xl border border-[#dcecff] bg-white p-8 text-center">
      <h2 className="font-heading text-lg font-semibold text-[#001d34]">
        No matching expenses
      </h2>
      <p className="mt-2 text-sm text-[#2a4b6a]">
        Try a different name, reference number, category, payment method, or
        date.
      </p>
    </div>
  )
}
