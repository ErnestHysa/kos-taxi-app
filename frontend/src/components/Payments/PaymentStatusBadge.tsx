import { cn } from '../../lib/utils'

type PaymentStatus = 'requires_payment_method' | 'requires_confirmation' | 'processing' | 'succeeded' | 'canceled' | 'payment_failed' | string

interface PaymentStatusBadgeProps {
  status?: PaymentStatus | null
}

const STATUS_STYLES: Record<string, string> = {
  succeeded: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/40',
  processing: 'bg-blue-500/15 text-blue-200 border-blue-400/40',
  requires_payment_method: 'bg-amber-500/15 text-amber-200 border-amber-400/40',
  requires_confirmation: 'bg-amber-500/15 text-amber-200 border-amber-400/40',
  payment_failed: 'bg-rose-500/15 text-rose-200 border-rose-400/40',
  canceled: 'bg-slate-500/15 text-slate-200 border-slate-400/40',
}

export const PaymentStatusBadge = ({ status }: PaymentStatusBadgeProps) => {
  if (!status) {
    return null
  }
  const normalised = status.toLowerCase()
  const styles = STATUS_STYLES[normalised] ?? 'bg-slate-500/15 text-slate-200 border-slate-400/40'

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide',
        styles,
      )}
    >
      {normalised.replace(/_/g, ' ')}
    </span>
  )
}

export default PaymentStatusBadge
