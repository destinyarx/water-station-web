import type { Expense } from '../expenses.types'
import { pesoFormatter } from '../expenses.summary'
import { paymentMethods } from '../expenses.constants'
import { getCategoryMeta, getPaymentMeta } from '../expenses.ui-meta'
import { ExpenseRowActions } from './expense-row-actions'

interface ExpensesTableProps {
  expenses: Expense[]
}

function fmtDate(iso: string): string {
  return new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
    .format(new Date(`${iso}T00:00:00`))
}

const TH_STYLE: React.CSSProperties = {
  textAlign: 'left',
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  color: 'var(--app-text-faint)',
  padding: '12px 22px',
  whiteSpace: 'nowrap',
}

export function ExpensesTable({ expenses }: ExpensesTableProps) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '820px' }}>
        <thead>
          <tr style={{ background: 'var(--app-surface-3)' }}>
            <th style={TH_STYLE}>Expense</th>
            <th style={{ ...TH_STYLE, padding: '12px 16px' }}>Category</th>
            <th style={{ ...TH_STYLE, padding: '12px 16px' }}>Date incurred</th>
            <th style={{ ...TH_STYLE, padding: '12px 16px' }}>Payment</th>
            <th style={{ ...TH_STYLE, padding: '12px 16px', textAlign: 'right' }}>Amount</th>
            <th style={{ width: '56px', padding: '12px 22px' }} />
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => {
            const cat = getCategoryMeta(expense.category)
            const pay = getPaymentMeta(expense.paymentMethod)
            const payLabel = expense.paymentMethod === 'other'
              ? (expense.paymentMethodOther ?? 'Other')
              : (paymentMethods.find((p) => p.value === expense.paymentMethod)?.name ?? expense.paymentMethod)

            return (
              <tr
                key={expense.id}
                style={{ borderTop: '1px solid var(--app-border)' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--app-row-hover)' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '' }}
              >
                <td style={{ padding: '13px 22px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--app-text)' }}>{expense.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--app-text-faint)', marginTop: '2px' }}>Added {fmtDate(expense.createdAt.slice(0, 10))}</div>
                </td>
                <td style={{ padding: '13px 16px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', fontSize: '12.5px', fontWeight: 600, padding: '5px 11px', borderRadius: '999px', background: cat.bg, color: cat.text }}>
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: cat.dot, flexShrink: 0 }} />
                    {expense.categoryLabel}
                  </span>
                </td>
                <td style={{ padding: '13px 16px', fontSize: '13.5px', color: 'var(--app-text-muted)' }}>
                  {fmtDate(expense.dateIncurred)}
                </td>
                <td style={{ padding: '13px 16px' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--app-text-muted)' }}>
                    <span style={{ width: '24px', height: '24px', borderRadius: '7px', background: pay.bg, color: pay.color, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800 }}>{pay.initial}</span>
                    {payLabel}
                  </div>
                </td>
                <td style={{ padding: '13px 16px', textAlign: 'right' }}>
                  <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--app-text)' }}>{pesoFormatter.format(expense.amount)}</span>
                </td>
                <td style={{ padding: '13px 22px' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <ExpenseRowActions expense={expense} />
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
