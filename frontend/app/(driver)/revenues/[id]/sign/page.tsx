'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useGetPendingRevenues, useSignRevenue } from '@/hooks/useRevenues';
import SignaturePad from '@/components/SignaturePad';

export default function SignRevenuePage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: revenues } = useGetPendingRevenues();
  const [signature, setSignature] = useState('');
  const [error, setError] = useState('');
  const signMutation = useSignRevenue();

  const revenue = revenues?.find((r: any) => r.id === id);

  const handleSign = async () => {
    setError('');

    if (!signature) {
      setError('Veuillez signer avant de valider');
      return;
    }

    try {
      await signMutation.mutateAsync({
        revenueId: id as string,
        signature,
      });
      router.push('/revenues');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la signature');
    }
  };

  if (!revenue) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Recette non trouvée</p>
      </div>
    );
  }

  return (
    <div>
      {/* Back button */}
      <div className="mb-6">
        <Link href="/revenues" className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 font-medium transition">
          <ArrowLeft size={20} />
          Retour aux recettes
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-b border-amber-200 p-6 sm:p-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">Signer la recette</h1>
          <p className="text-gray-600">Veuillez signer pour confirmer cette recette</p>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* Revenue Details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 font-medium mb-1">Véhicule</p>
              <p className="font-semibold text-gray-800">{revenue.vehicle.plate}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 font-medium mb-1">Montant</p>
              <p className="font-bold text-amber-600">{revenue.amount} F</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 font-medium mb-1">Date</p>
              <p className="font-semibold text-gray-800">
                {new Date(revenue.date).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 font-medium mb-1">Marque</p>
              <p className="font-semibold text-gray-800">{revenue.vehicle.brand}</p>
            </div>
          </div>

          {revenue.description && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700">
                <strong>Description:</strong> {revenue.description}
              </p>
            </div>
          )}

          {/* Signature Pad */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-4">Votre signature</p>
            <SignaturePad onSignatureChange={setSignature} />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={handleSign}
              disabled={signMutation.isPending || !signature}
              className="flex-1 flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
              <CheckCircle size={20} />
              {signMutation.isPending ? 'Signature en cours...' : 'Confirmer et signer'}
            </button>
            <Link
              href="/revenues"
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg transition text-center"
            >
              Annuler
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
