'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import { useAddDriver } from '@/hooks/useDrivers';

export default function AddDriverPage() {
  const { id } = useParams();
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const addMutation = useAddDriver(id as string);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!phone) {
      setError('Veuillez entrer un numéro de téléphone');
      return;
    }

    try {
      await addMutation.mutateAsync(phone);
      router.push(`/vehicles/${id}/drivers`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'ajout du driver');
    }
  };

  return (
    <div>
      {/* Back button */}
      <div className="mb-6">
        <Link href={`/vehicles/${id}/drivers`} className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 font-medium transition">
          <ArrowLeft size={20} />
          Retour aux drivers
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100 max-w-md mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 p-8">
          <div className="flex items-start gap-4 mb-4">
            <div className="bg-amber-600 p-3 rounded-lg">
              <Plus size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-amber-600">Ajouter un driver</h1>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Numéro de téléphone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+2250701020304"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-gray-900 placeholder-gray-500"
              required
            />
            <p className="text-xs text-gray-500 mt-2">Entrez le numéro du driver à ajouter</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={addMutation.isPending}
            className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            {addMutation.isPending ? 'Ajout en cours...' : 'Ajouter le driver'}
          </button>
        </form>
      </div>
    </div>
  );
}
