import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface Vehicle {
  id: string;
  owner_id: string;
  plate: string;
  brand: string;
  model: string;
  color: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export const useGetVehicles = () => {
  return useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const { data } = await api.get<Vehicle[]>('/api/v1/vehicles');
      return data;
    },
  });
};

export const useGetVehicle = (id: string) => {
  return useQuery({
    queryKey: ['vehicle', id],
    queryFn: async () => {
      const { data } = await api.get<Vehicle>(`/api/v1/vehicles/${id}`);
      return data;
    },
  });
};

export const useCreateVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<Vehicle, 'id' | 'owner_id' | 'active' | 'created_at' | 'updated_at'>) => {
      const { data: response } = await api.post<Vehicle>('/api/v1/vehicles', data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
};

export const useUpdateVehicle = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Omit<Vehicle, 'id' | 'owner_id' | 'plate' | 'active' | 'created_at' | 'updated_at'>>) => {
      const { data: response } = await api.patch<Vehicle>(`/api/v1/vehicles/${id}`, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['vehicle', id] });
    },
  });
};

export const useDeleteVehicle = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await api.delete(`/api/v1/vehicles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
};
