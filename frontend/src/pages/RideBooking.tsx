import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Car, CreditCard, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'

import RiderView, { type RiderBookingResult } from '../components/RideBooking/RiderView'
import { PaymentStatusBadge, StripeCheckoutForm } from '../components/Payments'
import type { PaymentSummary } from '../types/payment'
import { fetchStripeConfig } from '../api/payments'

const RideBooking = () => {
  const navigate = useNavigate()
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [bookingResult, setBookingResult] = useState<RiderBookingResult | null>(null)
  const [stripePublishableKey, setStripePublishableKey] = useState<string | null>(null)
  const [payment, setPayment] = useState<PaymentSummary | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null)

  useEffect(() => {
    fetchStripeConfig()
      .then((config) => {
        if (config.publishableKey) {
          setStripePublishableKey((current) => current ?? config.publishableKey)
        }
      })
      .catch(() => null)
  }, [])

  const handleSubmitting = () => {
    setStatus('submitting')
    setErrorMessage(null)
  }

  const handleRideCreated = (result: RiderBookingResult) => {
    setBookingResult(result)
    setPayment(result.payment ?? null)
    setStripePublishableKey((current) => result.publishable_key ?? current)
    setPaymentStatus(result.payment?.status ?? null)
    setStatus('success')
    setErrorMessage(result.payment_error ?? null)
  }

  const handleError = (message: string) => {
    setErrorMessage(message)
    setStatus('error')
    setBookingResult(null)
    setPayment(null)
    setPaymentStatus(null)
  }

  const bookingSummary = bookingResult?.estimate
  const rideDetails = bookingResult?.ride
  const scheduledDisplay = rideDetails?.scheduled_time
    ? new Date(rideDetails.scheduled_time).toLocaleString()
    : 'To be confirmed'
  const passengerLabel = rideDetails ? (rideDetails.passenger_count === 1 ? 'passenger' : 'passengers') : 'passengers'

  const paymentPlaceholder = payment && 'placeholder' in payment && payment.placeholder
  const canRenderStripeCheckout = useMemo(() => {
    if (!payment || paymentPlaceholder) return false
    if (!stripePublishableKey) return false
    if (!payment.client_secret) return false
    return true
  }, [payment, paymentPlaceholder, stripePublishableKey])

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-700 animate-gradient-xy"></div>

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 bg-pink-400/30 rounded-full blur-3xl"
          animate={{
            x: [0, -50, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-yellow-400/30 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, -50, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <header className="relative z-50 bg-black/20 backdrop-blur-2xl border-b-2 border-white/20 shadow-2xl sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <motion.button
                onClick={() => navigate('/')}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/20"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="w-6 h-6 text-white" />
              </motion.button>

              <div className="flex items-center gap-3">
                <motion.div className="relative" whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }}>
                  <div className="absolute inset-0 bg-yellow-400 rounded-2xl blur-xl opacity-60"></div>
                  <div className="relative bg-gradient-to-br from-yellow-400 via-orange-400 to-red-500 p-3 rounded-2xl shadow-2xl">
                    <Car className="w-7 h-7 text-white" />
                  </div>
                </motion.div>
                <div>
                  <h1 className="text-2xl font-black text-white drop-shadow-lg flex items-center gap-2">
                    Kos Taxi
                    <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                  </h1>
                  <p className="text-sm text-white/80 font-bold">Book Your Ride</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto py-8 px-4 space-y-6">
        {status !== 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-white/20 bg-black/30 p-6 text-white shadow-lg backdrop-blur-xl"
          >
            {status === 'success' && bookingSummary && rideDetails ? (
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-widest text-emerald-200/80">Ride confirmed</p>
                  <h2 className="text-2xl font-black">
                    {rideDetails.pickup_address} → {rideDetails.dropoff_address}
                  </h2>
                  <p className="text-white/70 font-semibold">
                    Scheduled for {scheduledDisplay} · {rideDetails.passenger_count} {passengerLabel}
                  </p>
                  {paymentStatus && (
                    <div className="mt-3">
                      <PaymentStatusBadge status={paymentStatus} />
                    </div>
                  )}
                </div>
                <div className="grid gap-2 text-sm font-semibold text-white/80">
                  <p>Distance · {bookingSummary.distanceKm.toFixed(1)} km</p>
                  <p>Duration · {bookingSummary.durationMinutes} minutes</p>
                  <p>Estimate · €{bookingSummary.fare.toFixed(2)}</p>
                </div>
              </div>
            ) : status === 'submitting' ? (
              <div className="flex items-center gap-3 text-sm font-semibold text-white/80">
                <Sparkles className="h-5 w-5" />
                <span>Locking in your ride details…</span>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-sm font-semibold">
                <AlertCircle className="h-5 w-5 text-yellow-300" />
                <span>{errorMessage ?? 'We were unable to create the ride. Please try again.'}</span>
              </div>
            )}

            {payment && (
              <div className="mt-4 flex flex-col gap-3 text-sm font-semibold text-white/80">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                  <span>
                    {paymentPlaceholder
                      ? 'Payment placeholder created until Stripe credentials are configured.'
                      : `Stripe payment intent ${payment.payment_intent_id} ready.`}
                  </span>
                </div>
                {!paymentPlaceholder && payment.amount_eur && (
                  <span>
                    Amount due · €{payment.amount_eur.toFixed(2)} ({payment.currency.toUpperCase()})
                  </span>
                )}
                {payment.last_error && (
                  <span className="text-rose-200">{payment.last_error}</span>
                )}
              </div>
            )}

            {errorMessage && (
              <div className="mt-4 flex items-center gap-3 text-sm font-semibold text-yellow-200">
                <AlertCircle className="h-5 w-5" />
                <span>{errorMessage}</span>
              </div>
            )}
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <RiderView onSubmitting={handleSubmitting} onRideCreated={handleRideCreated} onError={handleError} />
        </motion.div>

        {canRenderStripeCheckout && rideDetails && payment && payment.client_secret && stripePublishableKey && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="rounded-3xl border border-emerald-400/20 bg-emerald-500/10 p-6 text-white shadow-lg backdrop-blur-xl"
          >
            <h3 className="text-xl font-black mb-4 flex items-center gap-3">
              <CreditCard className="h-5 w-5" /> Complete your payment
            </h3>
            <StripeCheckoutForm
              clientSecret={payment.client_secret}
              publishableKey={stripePublishableKey}
              rideId={rideDetails.id}
              amount={payment.amount}
              currency={payment.currency}
              onPaymentUpdate={(latestPayment, status) => {
                setPayment(latestPayment)
                setPaymentStatus(status)
              }}
              onError={(message) => setErrorMessage(message)}
            />
          </motion.div>
        )}

        {paymentPlaceholder && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="rounded-3xl border border-yellow-300/30 bg-yellow-400/10 p-6 text-white shadow-lg backdrop-blur-xl"
          >
            <div className="flex items-start gap-3 text-sm font-semibold">
              <AlertCircle className="h-5 w-5 text-yellow-200" />
              <span>
                Stripe credentials are not configured yet. We created a placeholder payment intent so you can finish payment once the integration is fully enabled.
              </span>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-lg backdrop-blur-xl"
        >
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-white/20 p-3 text-black">
              <CreditCard className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black">Secure payments powered by Stripe</h3>
              <p className="text-sm font-semibold text-white/70">
                A payment intent is generated for every ride so you can seamlessly complete checkout after your driver confirms availability.
              </p>
              <p className="text-xs font-semibold text-white/50">
                Payments are confirmed without leaving the page using Stripe Elements. Your card data never touches our servers.
              </p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}

export default RideBooking
