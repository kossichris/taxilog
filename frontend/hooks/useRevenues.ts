import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export function useGetOwnerRevenues() {
  return useQuery({
    queryKey: ['owner-revenues'],
    queryFn: async () => {
      const response = await api.get('/api/v1/revenues/owner/all');
      return response.data;
    },
  });
}

export function useGetOwnerTotalRevenues() {
  return useQuery({
    queryKey: ['owner-total-revenues'],
    queryFn: async () => {
      const response = await api.get('/api/v1/revenues/owner/total');
      return response.data.total;
    },
  });
}

export function useGetVehicleRevenues(vehicleId: string) {
  return useQuery({
    queryKey: ['revenues', vehicleId],
    queryFn: async () => {
      const response = await api.get(`/api/v1/revenues/vehicles/${vehicleId}`);
      return response.data;
    },
  });
}

export function useCreateRevenue(vehicleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      driverId: string;
      amount: number;
      description: string;
      date: Date;
    }) => {
      const response = await api.post(`/api/v1/revenues/vehicles/${vehicleId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['revenues', vehicleId] });
    },
  });
}

export function useGetPendingRevenues() {
  return useQuery({
    queryKey: ['pending-revenues'],
    queryFn: async () => {
      const response = await api.get('/api/v1/revenues/pending');
      return response.data;
    },
  });
}

export function useGetMyRevenues() {
  return useQuery({
    queryKey: ['my-revenues'],
    queryFn: async () => {
      const response = await api.get('/api/v1/revenues/my-revenues');
      return response.data;
    },
  });
}

export function useSignRevenue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { revenueId: string; signature: string }) => {
      const response = await api.patch(`/api/v1/revenues/${data.revenueId}/sign`, {
        signature: data.signature,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-revenues'] });
      queryClient.invalidateQueries({ queryKey: ['my-revenues'] });
    },
  });
}

export function useValidateRevenue(vehicleId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (revenueId: string) => {
      const response = await api.patch(`/api/v1/revenues/${revenueId}/validate`);
      return response.data;
    },
    onSuccess: () => {
      if (vehicleId) {
        queryClient.invalidateQueries({ queryKey: ['revenues', vehicleId] });
      }
    },
  });
}

export function useDeleteRevenue(vehicleId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (revenueId: string) => {
      await api.delete(`/api/v1/revenues/${revenueId}`);
    },
    onSuccess: () => {
      if (vehicleId) {
        queryClient.invalidateQueries({ queryKey: ['revenues', vehicleId] });
      }
    },
  });
}
