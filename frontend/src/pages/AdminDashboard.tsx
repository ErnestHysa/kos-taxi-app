import React, { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, BarChart3, CalendarClock, Car, CreditCard, Loader2, MapPin, Phone, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { fetchAdminOverview, type AdminOverviewResponse } from '../api/admin'
import { normaliseError } from '../api/rides'
import { PaymentStatusBadge } from '../components/Payments'

const rideStatuses = ['all', 'pending', 'accepted', 'in_progress', 'completed', 'cancelled'] as const
const paymentStatuses = ['all', 'requires_payment_method', 'processing', 'succeeded', 'payment_failed', 'canceled', 'unpaid'] as const

const formatDateTime = (value: string | null) => (value ? new Date(value).toLocaleString() : '—')

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'EUR' }).format(amount)

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [filters, setFilters] = useState({ ride_status: 'all', payment_status: 'all', driver_id: 0 })
  const [overview, setOverview] = useState<AdminOverviewResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await fetchAdminOverview(filters)
        setOverview(data)
      } catch (err) {
        setError(normaliseError(err))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [filters])

  const drivers = overview?.drivers ?? []
  const rides = overview?.rides ?? []
  const payments = overview?.payments ?? []
  const totals = overview?.totals

  const selectedDriver = useMemo(
    () => (filters.driver_id ? drivers.find((driver) => driver.id === filters.driver_id) ?? null : null),
    [drivers, filters.driver_id],
  )

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur sticky top-0 z-40">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4" /> Back to booking
          </button>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-gradient-to-br from-emerald-400 via-cyan-500 to-blue-600 p-3 shadow-lg">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-white/70">Internal analytics</p>
              <h1 className="text-2xl font-black">Operations dashboard</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-6 py-8">
        <section className="grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <h2 className="text-lg font-bold uppercase tracking-widest text-white/70">Filters</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="flex flex-col gap-2 text-sm font-semibold text-white/80">
              Ride status
              <select
                value={filters.ride_status}
                onChange={(event) => setFilters((prev) => ({ ...prev, ride_status: event.target.value }))}
                className="rounded-xl border border-white/20 bg-black/40 px-3 py-2 text-white focus:border-white/60 focus:outline-none"
              >
                {rideStatuses.map((status) => (
                  <option key={status} value={status} className="bg-slate-900 text-white">
                    {status.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm font-semibold text-white/80">
              Payment status
              <select
                value={filters.payment_status}
                onChange={(event) => setFilters((prev) => ({ ...prev, payment_status: event.target.value }))}
                className="rounded-xl border border-white/20 bg-black/40 px-3 py-2 text-white focus:border-white/60 focus:outline-none"
              >
                {paymentStatuses.map((status) => (
                  <option key={status} value={status} className="bg-slate-900 text-white">
                    {status.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm font-semibold text-white/80">
              Driver
              <select
                value={filters.driver_id}
                onChange={(event) => setFilters((prev) => ({ ...prev, driver_id: Number(event.target.value) }))}
                className="rounded-xl border border-white/20 bg-black/40 px-3 py-2 text-white focus:border-white/60 focus:outline-none"
              >
                <option value={0} className="bg-slate-900 text-white">
                  All drivers
                </option>
                {drivers.map((driver) => (
                  <option key={driver.id} value={driver.id} className="bg-slate-900 text-white">
                    {driver.name}
                  </option>
                ))}
              </select>
            </label>

            {selectedDriver && (
              <div className="flex flex-col gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm font-semibold text-white/80">
                <div className="flex items-center gap-2 text-emerald-200">
                  <Car className="h-4 w-4" /> Active driver
                </div>
                <p className="text-base font-bold text-white">{selectedDriver.name}</p>
                <div className="flex items-center gap-2 text-xs uppercase tracking-widest">
                  <Phone className="h-3 w-3" /> {selectedDriver.phone}
                </div>
                <div className="text-xs text-white/60">{selectedDriver.vehicle_model} · {selectedDriver.vehicle_plate}</div>
              </div>
            )}
          </div>
        </section>

        {loading ? (
          <div className="flex items-center justify-center rounded-3xl border border-white/10 bg-white/5 p-12 backdrop-blur-xl">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-rose-400/40 bg-rose-500/10 p-6 text-rose-100">
            {error}
          </div>
        ) : (
          <>
            <section className="grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl md:grid-cols-3">
              <StatCard title="Total rides" value={totals?.rides_total ?? 0} icon={<Car className="h-5 w-5" />} />
              <StatCard title="Completed rides" value={totals?.rides_completed ?? 0} icon={<CalendarClock className="h-5 w-5" />} />
              <StatCard title="Revenue" value={formatCurrency(totals?.revenue_eur ?? 0)} icon={<CreditCard className="h-5 w-5" />} highlight />
              <StatCard title="Pending rides" value={totals?.rides_pending ?? 0} icon={<Loader2 className="h-5 w-5" />} subtle />
              <StatCard title="Drivers" value={totals?.drivers_total ?? 0} icon={<User className="h-5 w-5" />} subtle />
              <StatCard title="Payments succeeded" value={totals?.payments_succeeded ?? 0} icon={<PaymentStatusBadge status="succeeded" />} subtle />
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <DashboardTable
                title="Recent rides"
                description="Monitor the most recent ride activity, status changes, and payment states."
                emptyLabel="No rides match the selected filters."
              >
                <table className="min-w-full divide-y divide-white/10">
                  <thead>
                    <tr className="text-xs uppercase tracking-widest text-white/60">
                      <th className="px-3 py-3 text-left">Ride</th>
                      <th className="px-3 py-3 text-left">Pickup</th>
                      <th className="px-3 py-3 text-left">Drop-off</th>
                      <th className="px-3 py-3 text-left">Scheduled</th>
                      <th className="px-3 py-3 text-left">Status</th>
                      <th className="px-3 py-3 text-left">Payment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {rides.map((ride) => (
                      <tr key={ride.id} className="hover:bg-white/5">
                        <td className="px-3 py-3">
                          <div className="font-semibold">#{ride.id}</div>
                          <div className="text-xs text-white/60">{ride.rider_name ?? 'Walk-in'}</div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2 text-white/80">
                            <MapPin className="h-3 w-3" /> {ride.pickup_address}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-white/80">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3" /> {ride.dest_address}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-white/70">{formatDateTime(ride.scheduled_time)}</td>
                        <td className="px-3 py-3 text-white/80">
                          <PaymentStatusBadge status={ride.status} />
                        </td>
                        <td className="px-3 py-3 text-white/80">
                          <PaymentStatusBadge status={ride.payment?.status ?? ride.payment_status ?? 'pending'} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </DashboardTable>

              <DashboardTable
                title="Payments"
                description="Review recent payment intents and their outcomes."
                emptyLabel="No payments for the selected filters."
              >
                <table className="min-w-full divide-y divide-white/10">
                  <thead>
                    <tr className="text-xs uppercase tracking-widest text-white/60">
                      <th className="px-3 py-3 text-left">Payment</th>
                      <th className="px-3 py-3 text-left">Ride</th>
                      <th className="px-3 py-3 text-left">Amount</th>
                      <th className="px-3 py-3 text-left">Status</th>
                      <th className="px-3 py-3 text-left">Updated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {payments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-white/5">
                        <td className="px-3 py-3">
                          <div className="font-semibold">{payment.payment_intent_id}</div>
                          <div className="text-xs text-white/60">{payment.customer_email ?? payment.customer_phone ?? '—'}</div>
                        </td>
                        <td className="px-3 py-3">#{payment.ride_id}</td>
                        <td className="px-3 py-3">{formatCurrency(payment.amount / 100)}</td>
                        <td className="px-3 py-3">
                          <PaymentStatusBadge status={payment.status} />
                        </td>
                        <td className="px-3 py-3 text-white/60">{formatDateTime(payment.updated_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </DashboardTable>
            </section>
          </>
        )}
      </main>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: number | string
  icon: React.ReactNode
  highlight?: boolean
  subtle?: boolean
}

const StatCard = ({ title, value, icon, highlight = false, subtle = false }: StatCardProps) => {
  return (
    <div
      className={`flex flex-col gap-3 rounded-2xl border p-4 shadow-inner transition ${
        highlight
          ? 'border-emerald-400/40 bg-emerald-500/10'
          : subtle
            ? 'border-white/10 bg-white/5'
            : 'border-cyan-400/30 bg-cyan-500/10'
      }`}
    >
      <div className="flex items-center justify-between text-sm font-semibold uppercase tracking-widest text-white/70">
        {title}
        <span className="text-white/80">{icon}</span>
      </div>
      <div className="text-3xl font-black text-white">{value}</div>
    </div>
  )
}

interface DashboardTableProps {
  title: string
  description: string
  emptyLabel: string
  children: React.ReactNode
}

const DashboardTable = ({ title, description, emptyLabel, children }: DashboardTableProps) => {
  const isEmpty = React.Children.count(children) === 0
  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
      <div>
        <h3 className="text-lg font-bold text-white">{title}</h3>
        <p className="text-xs font-semibold uppercase tracking-widest text-white/60">{description}</p>
      </div>
      <div className="overflow-hidden rounded-2xl border border-white/10">
        {isEmpty ? (
          <div className="p-6 text-center text-sm font-semibold text-white/60">{emptyLabel}</div>
        ) : (
          <div className="overflow-x-auto">{children}</div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
