'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Banknote, ArrowLeft, Plus, Trash2, Check, Clock, X, CheckCircle2, XCircle } from 'lucide-react';
import { useGetVehicleExpenses, useDeleteExpense, useSignExpense, useValidateExpense, useRejectExpense } from '@/hooks/useExpenses';
import ConfirmModal from '@/components/ConfirmModal';

const CATEGORY_LABELS: Record<string, { label: string; icon: string }> = {
  FUEL: { label: 'Carburant', icon: '⛽' },
  MAINTENANCE: { label: 'Maintenance', icon: '🔧' },
  INSURANCE: { label: 'Assurance', icon: '🛡️' },
  TOLL: { label: 'Péage', icon: '🛣️' },
  PARKING: { label: 'Parking', icon: '🅿️' },
  OTHER: { label: 'Autre', icon: '📌' },
};

export default function ExpensesPage() {
  const { id } = useParams();
  const { data: expenses, isLoading, error } = useGetVehicleExpenses(id as string);
  const deleteMutation = useDeleteExpense(id as string);
  const signMutation = useSignExpense();
  const validateMutation = useValidateExpense(id as string);
  const rejectMutation = useRejectExpense(id as string);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null);
  const [filterMonth, setFilterMonth] = useState<string>('');

  const filteredExpenses = expenses?.filter((expense) => {
    if (!filterMonth) return true;
    const expenseDate = new Date(expense.date);
    const [year, month] = filterMonth.split('-');
    return (
      expenseDate.getFullYear().toString() === year &&
      (expenseDate.getMonth() + 1).toString().padStart(2, '0') === month
    );
  }) || [];

  const totalByMonth = filteredExpenses
    .reduce((sum, e) => sum + parseFloat(e.amount.toString()), 0);

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'En attente', icon: Clock },
      SIGNED: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Signé', icon: Check },
      VALIDATED: { bg: 'bg-green-100', text: 'text-green-700', label: 'Validé', icon: Check },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejeté', icon: X },
    };
    const badge = badges[status as keyof typeof badges] || badges.PENDING;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${badge.bg} ${badge.text}`}>
        <Icon size={14} />
        {badge.label}
      </span>
    );
  };

  const handleSign = async (expenseId: string) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 150;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#333';
        ctx.font = '20px Arial';
        ctx.fillText('Signé par owner', 50, 50);
        const signature = canvas.toDataURL('image/png');
        await signMutation.mutateAsync({ expenseId, signature });
      }
    } catch (err) {
      alert('Erreur lors de la signature');
    }
  };

  const handleValidate = async (expenseId: string) => {
    try {
      await validateMutation.mutateAsync(expenseId);
    } catch (err) {
      alert('Erreur lors de la validation');
    }
  };

  const handleReject = async (expenseId: string) => {
    try {
      await rejectMutation.mutateAsync(expenseId);
    } catch (err) {
      alert('Erreur lors du rejet');
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
        <p className="mt-2 text-gray-600">Chargement des dépenses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        Erreur lors du chargement des dépenses
      </div>
    );
  }

  const handleDeleteClick = (expenseId: string) => {
    setSelectedExpenseId(expenseId);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedExpenseId) return;
    try {
      await deleteMutation.mutateAsync(selectedExpenseId);
      setIsModalOpen(false);
      setSelectedExpenseId(null);
    } catch (err) {
      alert('Erreur lors de la suppression');
    }
  };

  const handleCancelDelete = () => {
    setIsModalOpen(false);
    setSelectedExpenseId(null);
  };

  return (
    <div>
      {/* Back button */}
      <div className="mb-6">
        <Link href={`/vehicles/${id}`} className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 font-medium transition">
          <ArrowLeft size={20} />
          Retour aux détails
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-50 via-orange-50 to-red-50 border-b border-red-200 p-6 sm:p-8 flex items-center justify-between">
          <div className="flex items-start gap-4">
            <div className="bg-red-600 p-4 rounded-lg">
              <Banknote size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-red-600">Dépenses</h1>
            </div>
          </div>
          <Link
            href={`/vehicles/${id}/expenses/new`}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            <Plus size={18} />
            Ajouter
          </Link>
        </div>

        {/* Filter & Total */}
        {expenses && (
          <div className="px-6 sm:px-8 py-4 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gray-50">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Filtrer par mois:</label>
              <input
                type="month"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              />
              {filterMonth && (
                <button
                  onClick={() => setFilterMonth('')}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Réinitialiser
                </button>
              )}
            </div>
            {filteredExpenses.length > 0 && (
              <div className="text-lg font-bold text-red-600">
                Total: {totalByMonth.toFixed(2)} F
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6 sm:p-8">
          {!filteredExpenses || filteredExpenses.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Banknote size={32} className="text-red-600" />
              </div>
              <p className="text-gray-500 text-lg mb-6">Aucune dépense enregistrée</p>
              <Link
                href={`/vehicles/${id}/expenses/new`}
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition"
              >
                <Plus size={20} />
                Créer une dépense
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredExpenses.map((expense) => {
                const category = CATEGORY_LABELS[expense.category] || CATEGORY_LABELS.OTHER;
                return (
                  <div key={expense.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-red-300 transition">
                    <div className="flex-1 mb-4 sm:mb-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{category.icon}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-800">{category.label}</p>
                            {getStatusBadge(expense.status)}
                          </div>
                          <p className="text-xs text-gray-500">
                            {new Date(expense.date).toLocaleDateString('fr-FR')}
                            {expense.signed_at && ` • Signé le ${new Date(expense.signed_at).toLocaleDateString('fr-FR')}`}
                          </p>
                        </div>
                      </div>
                      {expense.description && (
                        <p className="text-sm text-gray-600 ml-11">{expense.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 w-full">
                      <p className="text-lg font-bold text-red-600">{expense.amount} F</p>
                      <div className="flex items-center gap-1 ml-auto">
                        {expense.status === 'PENDING' && (
                          <button
                            onClick={() => handleSign(expense.id)}
                            disabled={signMutation.isPending}
                            className="text-amber-600 hover:bg-amber-50 p-1.5 rounded transition disabled:text-gray-400"
                            title="Signer cette dépense"
                          >
                            <Check size={18} />
                          </button>
                        )}
                        {expense.status === 'SIGNED' && (
                          <>
                            <button
                              onClick={() => handleValidate(expense.id)}
                              disabled={validateMutation.isPending}
                              className="text-emerald-600 hover:bg-emerald-50 p-1.5 rounded transition disabled:text-gray-400"
                              title="Valider cette dépense"
                            >
                              <CheckCircle2 size={18} />
                            </button>
                            <button
                              onClick={() => handleReject(expense.id)}
                              disabled={rejectMutation.isPending}
                              className="text-orange-600 hover:bg-orange-50 p-1.5 rounded transition disabled:text-gray-400"
                              title="Rejeter cette dépense"
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDeleteClick(expense.id)}
                          disabled={deleteMutation.isPending}
                          className="text-red-600 hover:bg-red-50 p-1.5 rounded transition disabled:text-gray-400"
                          title="Supprimer cette dépense"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={isModalOpen}
        title="Supprimer la dépense"
        message="Êtes-vous sûr de vouloir supprimer cette dépense ?"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isLoading={deleteMutation.isPending}
        confirmText="Supprimer"
        cancelText="Annuler"
        isDangerous={true}
      />
    </div>
  );
}
