import { FormEvent, useMemo, useState } from 'react'
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js'
import { Loader2 } from 'lucide-react'

import { fetchPaymentForRide } from '../../api/payments'
import type { PaymentSummary } from '../../types/payment'

interface StripeCheckoutFormProps {
  clientSecret: string
  publishableKey: string
  rideId: number
  amount: number
  currency: string
  onPaymentUpdate?: (payment: PaymentSummary, status: string) => void
  onError?: (message: string) => void
}

const StripeCheckoutInner = ({
  rideId,
  amount,
  currency,
  onPaymentUpdate,
  onError,
}: Omit<StripeCheckoutFormProps, 'clientSecret' | 'publishableKey'>) => {
  const stripe = useStripe()
  const elements = useElements()
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const formattedAmount = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
  }).format(amount / 100)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!stripe || !elements) {
      return
    }
    setSubmitting(true)
    setMessage(null)

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    })

    if (error) {
      const description = error.message ?? 'Payment failed. Please try again.'
      setMessage(description)
      onError?.(description)
      setSubmitting(false)
      return
    }

    if (paymentIntent) {
      try {
        const latest = await fetchPaymentForRide(rideId)
        if (latest.payment) {
          onPaymentUpdate?.(latest.payment, latest.payment_status)
        }
        setMessage(`Payment ${paymentIntent.status}`)
      } catch (refreshError) {
        const description =
          refreshError instanceof Error ? refreshError.message : 'Payment completed but failed to refresh status.'
        setMessage(description)
        onError?.(description)
      }
    }

    setSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement options={{ layout: 'tabs' }} />
      <button
        type="submit"
        disabled={submitting}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black shadow-lg transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Confirming payment…
          </>
        ) : (
          <>Pay {formattedAmount}</>
        )}
      </button>
      {message && <p className="text-center text-sm font-semibold text-white/80">{message}</p>}
    </form>
  )
}

export const StripeCheckoutForm = ({
  clientSecret,
  publishableKey,
  ...rest
}: StripeCheckoutFormProps) => {
  const stripePromise = useMemo(() => loadStripe(publishableKey), [publishableKey])

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'night',
      variables: {
        colorPrimary: '#4ade80',
        colorBackground: '#0f172a',
        colorText: '#f8fafc',
      },
    },
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <StripeCheckoutInner {...rest} />
    </Elements>
  )
}

export default StripeCheckoutForm
