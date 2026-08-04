'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCreateVehicle } from '@/hooks/useVehicles';

export default function NewVehiclePage() {
  const router = useRouter();
  const createMutation = useCreateVehicle();

  const [plate, setPlate] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [color, setColor] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await createMutation.mutateAsync({
        plate: plate.toUpperCase(),
        brand,
        model,
        color,
      });
      router.push('/vehicles');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création du véhicule');
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <Link href="/vehicles" className="text-amber-600 hover:underline">
          ← Retour aux véhicules
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold mb-8">Ajouter un véhicule</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Immatriculation
            </label>
            <input
              type="text"
              value={plate}
              onChange={(e) => setPlate(e.target.value.toUpperCase())}
              placeholder="AA-123-BB"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-gray-900 placeholder-gray-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Format: lettres majuscules et chiffres</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Marque
            </label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Toyota"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-gray-900 placeholder-gray-500"
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
              placeholder="Corolla"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-gray-900 placeholder-gray-500"
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
              placeholder="Blanc"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-gray-900 placeholder-gray-500"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white font-semibold py-3 px-4 rounded-lg transition"
            >
              {createMutation.isPending ? 'Création...' : 'Créer le véhicule'}
            </button>
            <Link
              href="/vehicles"
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
