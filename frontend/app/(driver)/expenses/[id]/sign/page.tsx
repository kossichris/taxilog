'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useGetDriverPendingExpenses, useSignExpense } from '@/hooks/useExpenses';
import SignaturePad from '@/components/SignaturePad';

const CATEGORY_LABELS: Record<string, { label: string; icon: string }> = {
  FUEL: { label: 'Carburant', icon: '⛽' },
  MAINTENANCE: { label: 'Maintenance', icon: '🔧' },
  INSURANCE: { label: 'Assurance', icon: '🛡️' },
  TOLL: { label: 'Péage', icon: '🛣️' },
  PARKING: { label: 'Parking', icon: '🅿️' },
  OTHER: { label: 'Autre', icon: '📌' },
};

export default function SignExpensePage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: expenses } = useGetDriverPendingExpenses();
  const [signature, setSignature] = useState('');
  const [error, setError] = useState('');
  const signMutation = useSignExpense();

  const expense = expenses?.find((e: any) => e.id === id);
  const category = expense ? CATEGORY_LABELS[expense.category] || CATEGORY_LABELS.OTHER : null;

  const handleSign = async () => {
    setError('');

    if (!signature) {
      setError('Veuillez signer avant de valider');
      return;
    }

    try {
      await signMutation.mutateAsync({
        expenseId: id as string,
        signature,
      });
      router.push('/expenses');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la signature');
    }
  };

  if (!expense) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Dépense non trouvée</p>
      </div>
    );
  }

  return (
    <div>
      {/* Back button */}
      <div className="mb-6">
        <Link href="/expenses" className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-medium transition">
          <ArrowLeft size={20} />
          Retour aux dépenses
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-50 via-orange-50 to-red-50 border-b border-red-200 p-6 sm:p-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">Signer la dépense</h1>
          <p className="text-gray-600">Veuillez signer pour confirmer cette dépense</p>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* Expense Details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 font-medium mb-1">Catégorie</p>
              <p className="font-semibold text-gray-800">{category?.label}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 font-medium mb-1">Montant</p>
              <p className="font-bold text-red-600">{expense.amount} F</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 font-medium mb-1">Date</p>
              <p className="font-semibold text-gray-800">
                {new Date(expense.date).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 font-medium mb-1">Véhicule</p>
              <p className="font-semibold text-gray-800">{expense.vehicle.plate}</p>
            </div>
          </div>

          {expense.description && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700">
                <strong>Description:</strong> {expense.description}
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
              className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
              <CheckCircle size={20} />
              {signMutation.isPending ? 'Signature en cours...' : 'Confirmer et signer'}
            </button>
            <Link
              href="/expenses"
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
