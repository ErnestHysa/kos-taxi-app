import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { acceptRideRequest, fetchAssignedRides, fetchPendingRides, updateRideStatus, RideDto } from '../api/rides'
import { RideStatus } from '../types/ride'

const rideQueryKeys = {
  base: ['rides'] as const,
  pending: () => [...rideQueryKeys.base, 'pending'] as const,
  assigned: () => [...rideQueryKeys.base, 'assigned'] as const,
}

export const usePendingRidesQuery = () =>
  useQuery<RideDto[]>({
    queryKey: rideQueryKeys.pending(),
    queryFn: () => fetchPendingRides(),
    refetchInterval: 10000,
    staleTime: 5000,
  })

export const useAssignedRidesQuery = (statuses?: RideStatus[]) =>
  useQuery<RideDto[]>({
    queryKey: [...rideQueryKeys.assigned(), statuses?.join(',') ?? 'all'],
    queryFn: () => fetchAssignedRides(statuses),
    staleTime: 5000,
  })

export const useAcceptRideMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (rideId: number) => acceptRideRequest(rideId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rideQueryKeys.pending() })
      queryClient.invalidateQueries({ queryKey: rideQueryKeys.assigned() })
    },
  })
}

export const useUpdateRideStatusMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ rideId, status }: { rideId: number; status: RideStatus }) =>
      updateRideStatus(rideId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rideQueryKeys.assigned() })
    },
  })
}

export const rideKeys = rideQueryKeys
