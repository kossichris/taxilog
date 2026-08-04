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
  revenues?: number;
  expenses?: number;
}

export const useGetVehicles = () => {
  return useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const { data: vehicles } = await api.get<Vehicle[]>('/api/v1/vehicles');

      // Load revenue and expense totals for each vehicle
      const vehiclesWithTotals = await Promise.all(
        vehicles.map(async (vehicle) => {
          try {
            const revenuesRes = await api.get(`/api/v1/revenues/vehicles/${vehicle.id}`);
            const expensesRes = await api.get(`/api/v1/expenses/vehicles/${vehicle.id}`);

            // API returns array directly, not wrapped in { data }
            const revenuesList = Array.isArray(revenuesRes.data) ? revenuesRes.data : [];
            const expensesList = Array.isArray(expensesRes.data) ? expensesRes.data : [];

            const revenues = revenuesList.reduce((sum: number, r: any) => {
              return sum + parseFloat(r.amount?.toString() || '0');
            }, 0);

            const expenses = expensesList.reduce((sum: number, e: any) => {
              return sum + parseFloat(e.amount?.toString() || '0');
            }, 0);

            return { ...vehicle, revenues, expenses };
          } catch (error) {
            // If API calls fail, return vehicle without totals
            console.error(`Error loading totals for vehicle ${vehicle.id}:`, error);
            return { ...vehicle, revenues: 0, expenses: 0 };
          }
        })
      );

      return vehiclesWithTotals;
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
