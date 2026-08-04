'use client';

import { FormEvent, useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useGetVehicle, useUpdateVehicle } from '@/hooks/useVehicles';

export default function EditVehiclePage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: vehicle, isLoading, error } = useGetVehicle(id as string);
  const updateMutation = useUpdateVehicle(id as string);

  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [color, setColor] = useState('');
  const [updateError, setUpdateError] = useState('');

  useEffect(() => {
    if (vehicle) {
      setBrand(vehicle.brand);
      setModel(vehicle.model);
      setColor(vehicle.color);
    }
  }, [vehicle]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setUpdateError('');

    try {
      await updateMutation.mutateAsync({
        brand,
        model,
        color,
      });
      router.push(`/vehicles/${id}`);
    } catch (err: any) {
      setUpdateError(err.response?.data?.message || 'Erreur lors de la mise à jour');
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
        <p className="mt-2 text-gray-600">Chargement...</p>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        Véhicule introuvable
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <Link href={`/vehicles/${vehicle.id}`} className="text-amber-600 hover:underline">
          ← Retour au détail
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold mb-2">Éditer un véhicule</h1>
        <p className="text-gray-600 mb-8">Immatriculation : <span className="font-bold text-amber-600">{vehicle.plate}</span></p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Marque
            </label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Modèle
            </label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Couleur
            </label>
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-gray-900"
              required
            />
          </div>

          {updateError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {updateError}
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white font-semibold py-3 px-4 rounded-lg transition"
            >
              {updateMutation.isPending ? 'Mise à jour...' : 'Mettre à jour'}
            </button>
            <Link
              href={`/vehicles/${vehicle.id}`}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-lg transition text-center"
            >
              Annuler
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
