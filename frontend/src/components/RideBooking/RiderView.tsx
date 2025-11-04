import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarClock, Mail, MapPin, Phone, StickyNote, User, Users } from 'lucide-react'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import {
  rideBookingSchema,
  type RideBookingFormValues,
  sanitiseNotes,
  isFutureDateTime,
  parseDateTimeInput,
} from '../../utils/validators'
import {
  type CreateRideResponse,
  useCreateRide,
  useRideEstimate,
} from '../../api/rides'
import { cn } from '../../lib/utils'

export interface RiderViewProps {
  onSubmitting?: () => void
  onRideCreated: (result: RiderBookingResult) => void
  onError: (message: string) => void
}

export type RiderBookingResult = CreateRideResponse

const minutesFromNow = (minutes: number): Date => {
  const now = new Date()
  now.setMinutes(now.getMinutes() + minutes)
  return now
}

const toDateTimeLocalValue = (date: Date): string => {
  const pad = (value: number) => value.toString().padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const computeDefaultScheduledAt = () => toDateTimeLocalValue(minutesFromNow(20))

const labelStyles = 'text-xs font-semibold uppercase tracking-wide text-white/70 flex items-center gap-2'
const inputStyles =
  'w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-white/60 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/60 backdrop-blur-sm transition-all'
const errorStyles = 'mt-1 text-xs font-semibold text-yellow-300'

const RiderView = ({ onSubmitting, onRideCreated, onError }: RiderViewProps) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RideBookingFormValues>({
    resolver: zodResolver(rideBookingSchema),
    defaultValues: {
      riderName: '',
      riderEmail: '',
      riderPhone: '',
      pickupAddress: '',
      dropoffAddress: '',
      scheduledAt: computeDefaultScheduledAt(),
      passengerCount: 1,
      notes: '',
    },
  })

  const { estimateRide, loading: estimating } = useRideEstimate()
  const { createRide, loading: creating } = useCreateRide()

  const submitRide = handleSubmit(async (values) => {
    onSubmitting?.()
    try {
      const scheduledTime = parseDateTimeInput(values.scheduledAt)
      if (!scheduledTime || !isFutureDateTime(values.scheduledAt)) {
        throw new Error('Please select a pickup time in the near future.')
      }

      const estimatePayload = {
        pickupAddress: values.pickupAddress,
        dropoffAddress: values.dropoffAddress,
        scheduledTime: scheduledTime.toISOString(),
        passengerCount: values.passengerCount,
      }

      await estimateRide(estimatePayload)

      const rideResponse = await createRide({
        ...estimatePayload,
        riderName: values.riderName,
        riderEmail: values.riderEmail,
        riderPhone: values.riderPhone,
        notes: sanitiseNotes(values.notes),
      })

      reset({
        riderName: values.riderName,
        riderEmail: values.riderEmail,
        riderPhone: values.riderPhone,
        pickupAddress: '',
        dropoffAddress: '',
        scheduledAt: computeDefaultScheduledAt(),
        passengerCount: values.passengerCount,
        notes: '',
      })

      onRideCreated(rideResponse)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to book ride. Please try again.'
      onError(message)
    }
  })

  const totalLoading = estimating || creating || isSubmitting

  const scheduledAtValue = watch('scheduledAt')
  const formattedPickupTime = useMemo(() => {
    const parsed = parseDateTimeInput(scheduledAtValue ?? '')
    return parsed ? parsed.toLocaleString() : 'Select a pickup time'
  }, [scheduledAtValue])

  return (
    <div className="relative">
      <div className="absolute inset-0 -z-10 rounded-3xl bg-black/20 backdrop-blur-xl" />
      <div className="relative grid gap-10 rounded-3xl border border-white/20 bg-white/10 p-10 text-white shadow-2xl">
        <div className="space-y-3">
          <h2 className="text-3xl font-black tracking-tight">Plan your next ride</h2>
          <p className="text-white/70 text-lg font-semibold">
            Share your pickup and drop-off details. We will match you with the best driver available.
          </p>
        </div>

        <form onSubmit={submitRide} className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className={labelStyles} htmlFor="riderName">
                <User className="h-4 w-4" />
                Rider name
              </label>
              <input
                id="riderName"
                type="text"
                autoComplete="name"
                placeholder="Alexandra Papadopoulos"
                className={inputStyles}
                {...register('riderName')}
              />
              {errors.riderName && <p className={errorStyles}>{errors.riderName.message}</p>}
            </div>

            <div className="space-y-2">
              <label className={labelStyles} htmlFor="riderPhone">
                <Phone className="h-4 w-4" />
                Contact phone
              </label>
              <input
                id="riderPhone"
                type="tel"
                autoComplete="tel"
                placeholder="+30 69 1234 5678"
                className={inputStyles}
                {...register('riderPhone')}
              />
              {errors.riderPhone && <p className={errorStyles}>{errors.riderPhone.message}</p>}
            </div>

            <div className="space-y-2">
              <label className={labelStyles} htmlFor="riderEmail">
                <Mail className="h-4 w-4" />
                Email address
              </label>
              <input
                id="riderEmail"
                type="email"
                autoComplete="email"
                placeholder="alexandra@kostaxi.com"
                className={inputStyles}
                {...register('riderEmail')}
              />
              {errors.riderEmail && <p className={errorStyles}>{errors.riderEmail.message}</p>}
            </div>

            <div className="space-y-2">
              <label className={labelStyles} htmlFor="passengerCount">
                <Users className="h-4 w-4" />
                Passengers
              </label>
              <input
                id="passengerCount"
                type="number"
                min={1}
                max={6}
                className={inputStyles}
                {...register('passengerCount', { valueAsNumber: true })}
              />
              {errors.passengerCount && <p className={errorStyles}>{errors.passengerCount.message}</p>}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className={labelStyles} htmlFor="pickupAddress">
                <MapPin className="h-4 w-4" />
                Pickup address
              </label>
              <input
                id="pickupAddress"
                type="text"
                placeholder="Kos Airport (KGS)"
                className={inputStyles}
                {...register('pickupAddress')}
              />
              {errors.pickupAddress && <p className={errorStyles}>{errors.pickupAddress.message}</p>}
            </div>

            <div className="space-y-2">
              <label className={labelStyles} htmlFor="dropoffAddress">
                <MapPin className="h-4 w-4" />
                Drop-off address
              </label>
              <input
                id="dropoffAddress"
                type="text"
                placeholder="Kos Town Harbour"
                className={inputStyles}
                {...register('dropoffAddress')}
              />
              {errors.dropoffAddress && <p className={errorStyles}>{errors.dropoffAddress.message}</p>}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className={labelStyles} htmlFor="scheduledAt">
                <CalendarClock className="h-4 w-4" />
                Pickup time
              </label>
              <input id="scheduledAt" type="datetime-local" className={inputStyles} {...register('scheduledAt')} />
              {errors.scheduledAt && <p className={errorStyles}>{errors.scheduledAt.message}</p>}
              <p className="text-xs font-semibold text-white/60">{formattedPickupTime}</p>
            </div>

            <div className="space-y-2">
              <label className={labelStyles} htmlFor="notes">
                <StickyNote className="h-4 w-4" />
                Notes for your driver
              </label>
              <textarea
                id="notes"
                rows={3}
                placeholder="Any special requests or luggage details?"
                className={`${inputStyles} min-h-[120px]`}
                {...register('notes')}
              />
              {errors.notes && <p className={errorStyles}>{errors.notes.message}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={totalLoading}
            className={cn(
              'inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-black uppercase tracking-widest text-black shadow-lg transition-all hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black',
              totalLoading && 'opacity-70',
            )}
          >
            {totalLoading ? 'Booking...' : 'Book ride'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default RiderView
