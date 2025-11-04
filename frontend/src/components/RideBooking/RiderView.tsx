import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarClock, Mail, MapPin, Phone, StickyNote, User, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  rideBookingSchema,
  type RideBookingFormValues,
  sanitiseNotes,
  isFutureDateTime,
  parseDateTimeInput,
} from '../../utils/validators';
import {
  type CreateRideResponse,
  type PaymentIntentResponse,
  type RideEstimateResponse,
  useCreatePaymentIntent,
  useCreateRide,
  useRideEstimate,
} from '../../api/rides';
import { cn } from '../../lib/utils';

export interface RiderViewProps {
  onSubmitting?: () => void;
  onRideCreated: (result: RiderBookingResult) => void;
  onError: (message: string) => void;
}

export interface RiderBookingResult extends CreateRideResponse {
  paymentIntent?: PaymentIntentResponse | null;
  paymentError?: string | null;
}

const minutesFromNow = (minutes: number): Date => {
  const now = new Date();
  now.setMinutes(now.getMinutes() + minutes);
  return now;
};

const toDateTimeLocalValue = (date: Date): string => {
  const pad = (value: number) => value.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const computeDefaultScheduledAt = () => toDateTimeLocalValue(minutesFromNow(20));

const labelStyles = 'text-xs font-semibold uppercase tracking-wide text-white/70 flex items-center gap-2';
const inputStyles =
  'w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-white/60 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/60 backdrop-blur-sm transition-all';
const errorStyles = 'mt-1 text-xs font-semibold text-yellow-300';

const RiderView = ({ onSubmitting, onRideCreated, onError }: RiderViewProps) => {
  const [quote, setQuote] = useState<RideEstimateResponse | null>(null);

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
  });

  const { estimateRide, loading: estimating } = useRideEstimate();
  const { createRide, loading: creating } = useCreateRide();
  const { createPaymentIntent, loading: creatingIntent } = useCreatePaymentIntent();

  const submitRide = handleSubmit(async (values) => {
    onSubmitting?.();
    try {
      const scheduledTime = parseDateTimeInput(values.scheduledAt);
      if (!scheduledTime || !isFutureDateTime(values.scheduledAt)) {
        throw new Error('Please select a pickup time in the near future.');
      }

      const estimatePayload = {
        pickupAddress: values.pickupAddress,
        dropoffAddress: values.dropoffAddress,
        scheduledTime: scheduledTime.toISOString(),
        passengerCount: values.passengerCount,
      };

      const estimate = await estimateRide(estimatePayload);

      const rideResponse = await createRide({
        ...estimatePayload,
        riderName: values.riderName,
        riderEmail: values.riderEmail,
        riderPhone: values.riderPhone,
        notes: sanitiseNotes(values.notes),
      });

      setQuote(estimate);

      let paymentIntent: PaymentIntentResponse | null = null;
      let paymentError: string | null = null;

      try {
        paymentIntent = await createPaymentIntent(rideResponse.ride.id);
      } catch (intentError) {
        paymentError = intentError instanceof Error ? intentError.message : 'Unable to create payment intent.';
      }

      reset({
        riderName: values.riderName,
        riderEmail: values.riderEmail,
        riderPhone: values.riderPhone,
        pickupAddress: '',
        dropoffAddress: '',
        scheduledAt: computeDefaultScheduledAt(),
        passengerCount: values.passengerCount,
        notes: '',
      });

      onRideCreated({ ...rideResponse, paymentIntent, paymentError });
    } catch (error) {
      setQuote(null);
      const message = error instanceof Error ? error.message : 'Unable to book ride. Please try again.';
      onError(message);
    }
  });

  const totalLoading = estimating || creating || creatingIntent || isSubmitting;

  const scheduledAtValue = watch('scheduledAt');
  const formattedPickupTime = useMemo(() => {
    const parsed = parseDateTimeInput(scheduledAtValue ?? '');
    return parsed ? parsed.toLocaleString() : 'Select a pickup time';
  }, [scheduledAtValue]);

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
                step={1}
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
                Pickup location
              </label>
              <input
                id="pickupAddress"
                type="text"
                placeholder="Kos International Airport"
                className={inputStyles}
                {...register('pickupAddress')}
              />
              {errors.pickupAddress && <p className={errorStyles}>{errors.pickupAddress.message}</p>}
            </div>

            <div className="space-y-2">
              <label className={labelStyles} htmlFor="dropoffAddress">
                <MapPin className="h-4 w-4 rotate-180" />
                Drop-off location
              </label>
              <input
                id="dropoffAddress"
                type="text"
                placeholder="Kos Old Town"
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
              <input
                id="scheduledAt"
                type="datetime-local"
                min={computeDefaultScheduledAt()}
                className={inputStyles}
                {...register('scheduledAt')}
              />
              {errors.scheduledAt && <p className={errorStyles}>{errors.scheduledAt.message}</p>}
              <p className="text-xs font-semibold text-white/60">Scheduled for: {formattedPickupTime}</p>
            </div>

            <div className="space-y-2">
              <label className={labelStyles} htmlFor="notes">
                <StickyNote className="h-4 w-4" />
                Notes (optional)
              </label>
              <textarea
                id="notes"
                rows={4}
                placeholder="Flight number, luggage details, or any special request"
                className={cn(inputStyles, 'min-h-[120px] resize-none')}
                {...register('notes')}
              />
              {errors.notes && <p className={errorStyles}>{errors.notes.message}</p>}
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border border-white/20 bg-white/5 p-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-white/60">Realtime estimate</p>
                <p className="text-lg font-semibold text-white/80">
                  {quote
                    ? `Approximately ${quote.distanceKm.toFixed(1)} km • ${quote.durationMinutes} minutes • €${quote.fare.toFixed(2)}`
                    : 'Enter your details and submit to see the fare estimate.'}
                </p>
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 px-6 py-3 text-lg font-black text-black shadow-lg transition hover:from-yellow-300 hover:to-pink-400 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={totalLoading}
              >
                {totalLoading ? 'Booking ride…' : 'Book ride'}
              </button>
            </div>
            <p className="text-xs font-semibold text-white/50">
              We will reserve your ride immediately. Payment is processed securely via Stripe once a driver accepts the request.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RiderView;
