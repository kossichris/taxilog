import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export function useGetVehicleExpenses(vehicleId: string) {
  return useQuery({
    queryKey: ['expenses', vehicleId],
    queryFn: async () => {
      const response = await api.get(`/api/v1/expenses/vehicles/${vehicleId}`);
      return response.data;
    },
  });
}

export function useCreateExpense(vehicleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      amount: number;
      description: string;
      category: string;
      date: Date;
    }) => {
      const response = await api.post(`/api/v1/expenses/vehicles/${vehicleId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', vehicleId] });
      queryClient.invalidateQueries({ queryKey: ['owner-total-expenses'] });
    },
  });
}

export function useGetOwnerExpenses() {
  return useQuery({
    queryKey: ['owner-expenses'],
    queryFn: async () => {
      const response = await api.get('/api/v1/expenses/owner/all');
      return response.data;
    },
  });
}

export function useGetOwnerTotalExpenses() {
  return useQuery({
    queryKey: ['owner-total-expenses'],
    queryFn: async () => {
      const response = await api.get('/api/v1/expenses/owner/total');
      return response.data.total;
    },
  });
}

export function useDeleteExpense(vehicleId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (expenseId: string) => {
      await api.delete(`/api/v1/expenses/${expenseId}`);
    },
    onSuccess: () => {
      if (vehicleId) {
        queryClient.invalidateQueries({ queryKey: ['expenses', vehicleId] });
      }
      queryClient.invalidateQueries({ queryKey: ['owner-total-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['owner-expenses'] });
    },
  });
}

export function useSignExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { expenseId: string; signature: string }) => {
      const response = await api.post(`/api/v1/expenses/${data.expenseId}/sign`, {
        signature: data.signature,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['driver-pending-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['owner-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['owner-total-expenses'] });
    },
  });
}

export function useValidateExpense(vehicleId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (expenseId: string) => {
      const response = await api.post(`/api/v1/expenses/${expenseId}/validate`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['owner-total-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['owner-expenses'] });
      if (vehicleId) {
        queryClient.invalidateQueries({ queryKey: ['expenses', vehicleId] });
      }
    },
  });
}

export function useRejectExpense(vehicleId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (expenseId: string) => {
      const response = await api.post(`/api/v1/expenses/${expenseId}/reject`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['owner-expenses'] });
      if (vehicleId) {
        queryClient.invalidateQueries({ queryKey: ['expenses', vehicleId] });
      }
    },
  });
}

export function useGetDriverPendingExpenses() {
  return useQuery({
    queryKey: ['driver-pending-expenses'],
    queryFn: async () => {
      const response = await api.get('/api/v1/expenses/driver/pending');
      return response.data;
    },
  });
}
