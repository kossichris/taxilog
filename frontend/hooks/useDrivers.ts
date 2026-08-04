import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export function useGetVehicleDrivers(vehicleId: string) {
  return useQuery({
    queryKey: ['drivers', vehicleId],
    queryFn: async () => {
      const response = await api.get(`/api/v1/drivers/vehicles/${vehicleId}`);
      return response.data;
    },
  });
}

export function useAddDriver(vehicleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (phone: string) => {
      const response = await api.post(`/api/v1/drivers/vehicles/${vehicleId}/add`, { phone });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers', vehicleId] });
    },
  });
}

export function useRemoveDriver(vehicleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (driverId: string) => {
      await api.delete(`/api/v1/drivers/vehicles/${vehicleId}/${driverId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers', vehicleId] });
    },
  });
}

export function useGetMyVehicles() {
  return useQuery({
    queryKey: ['my-vehicles'],
    queryFn: async () => {
      const response = await api.get('/api/v1/drivers/my-vehicles');
      return response.data;
    },
  });
}
