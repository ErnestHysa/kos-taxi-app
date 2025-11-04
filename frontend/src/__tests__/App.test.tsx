import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { ProtectedRoute } from '../App'
import type { Driver } from '../types/driver'

vi.mock('../state/auth', () => ({
  useDriverProfileQuery: vi.fn(),
}))

const { useDriverProfileQuery } = await import('../state/auth')

type DriverQueryResult = {
  data?: Driver | null
  isLoading: boolean
  isError: boolean
}

const mockedUseDriverProfileQuery =
  useDriverProfileQuery as unknown as vi.Mock<DriverQueryResult, []>

const renderWithRouter = () =>
  render(
    <MemoryRouter initialEntries={['/driver/dashboard']}>
      <Routes>
        <Route path="/driver/login" element={<div>Driver Login Page</div>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/driver/dashboard" element={<div>Driver Dashboard</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )

describe('ProtectedRoute', () => {
  it('renders a loading placeholder while the driver profile loads', () => {
    mockedUseDriverProfileQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    })

    renderWithRouter()

    expect(screen.getByText(/loading driver profile/i)).toBeInTheDocument()
  })

  it('redirects to the login page when no driver profile is available', () => {
    mockedUseDriverProfileQuery.mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
    })

    renderWithRouter()

    expect(screen.getByText('Driver Login Page')).toBeInTheDocument()
  })

  it('renders the protected dashboard content when the driver is authenticated', () => {
    mockedUseDriverProfileQuery.mockReturnValue({
      data: {
        id: 1,
        name: 'Captain Driver',
        email: 'driver@example.com',
        phone: '+30123456789',
        vehicle_model: 'Kos Cruiser',
        vehicle_plate: 'KOS-1234',
        is_available: true,
        current_lat: null,
        current_lon: null,
        created_at: null,
        updated_at: null,
        last_login_at: null,
      } satisfies Driver,
      isLoading: false,
      isError: false,
    })

    renderWithRouter()

    expect(screen.getByText('Driver Dashboard')).toBeInTheDocument()
  })
})
