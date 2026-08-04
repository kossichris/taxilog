'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { DollarSign, ArrowLeft, Plus, Check, Clock, X, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { useGetVehicleRevenues, useValidateRevenue, useDeleteRevenue, useSignRevenue, useRejectRevenue } from '@/hooks/useRevenues';
import ConfirmModal from '@/components/ConfirmModal';

export default function RevenuesPage() {
  const { id } = useParams();
  const { data: revenues, isLoading, error } = useGetVehicleRevenues(id as string);
  const validateMutation = useValidateRevenue(id as string);
  const deleteMutation = useDeleteRevenue(id as string);
  const signMutation = useSignRevenue();
  const rejectMutation = useRejectRevenue(id as string);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRevenueId, setSelectedRevenueId] = useState<string | null>(null);
  const [filterMonth, setFilterMonth] = useState<string>('');

  const filteredRevenues = revenues?.filter((revenue) => {
    if (!filterMonth) return true;
    const revenueDate = new Date(revenue.date);
    const [year, month] = filterMonth.split('-');
    return (
      revenueDate.getFullYear().toString() === year &&
      (revenueDate.getMonth() + 1).toString().padStart(2, '0') === month
    );
  }) || [];

  const totalByMonth = filteredRevenues
    .reduce((sum, r) => sum + parseFloat(r.amount.toString()), 0);

  const validatedByMonth = filteredRevenues
    .filter(r => r.status === 'VALIDATED')
    .reduce((sum, r) => sum + parseFloat(r.amount.toString()), 0);

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

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        <p className="mt-2 text-gray-600">Chargement des recettes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        Erreur lors du chargement des recettes
      </div>
    );
  }

  const handleSign = async (revenueId: string) => {
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
        await signMutation.mutateAsync({ revenueId, signature });
      }
    } catch (err) {
      alert('Erreur lors de la signature');
    }
  };

  const handleValidate = async (revenueId: string) => {
    try {
      await validateMutation.mutateAsync(revenueId);
    } catch (err) {
      alert('Erreur lors de la validation');
    }
  };

  const handleReject = async (revenueId: string) => {
    try {
      await rejectMutation.mutateAsync(revenueId);
    } catch (err) {
      alert('Erreur lors du rejet');
    }
  };

  const handleDeleteClick = (revenueId: string) => {
    setSelectedRevenueId(revenueId);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedRevenueId) return;
    try {
      await deleteMutation.mutateAsync(selectedRevenueId);
      setIsModalOpen(false);
      setSelectedRevenueId(null);
    } catch (err) {
      alert('Erreur lors de la suppression');
    }
  };

  const handleCancelDelete = () => {
    setIsModalOpen(false);
    setSelectedRevenueId(null);
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
        <div className="bg-gradient-to-r from-emerald-50 via-green-50 to-emerald-50 border-b border-emerald-200 p-6 sm:p-8 flex items-center justify-between">
          <div className="flex items-start gap-4">
            <div className="bg-emerald-600 p-4 rounded-lg">
              <DollarSign size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-emerald-600">Recettes</h1>
            </div>
          </div>
          <Link
            href={`/vehicles/${id}/revenues/new`}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            <Plus size={18} />
            Ajouter
          </Link>
        </div>

        {/* Filter & Total */}
        {revenues && (
          <div className="px-6 sm:px-8 py-4 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Filtrer par mois:</label>
              <input
                type="month"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
              {filterMonth && (
                <button
                  onClick={() => setFilterMonth('')}
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Réinitialiser
                </button>
              )}
            </div>
            {filteredRevenues.length > 0 && (
              <div className="flex gap-6 text-sm font-medium">
                <div>
                  <span className="text-gray-600">Total: </span>
                  <span className="text-lg font-bold text-emerald-600">{totalByMonth.toFixed(2)} F</span>
                </div>
                {validatedByMonth > 0 && (
                  <div>
                    <span className="text-gray-600">Validé: </span>
                    <span className="text-lg font-bold text-green-600">{validatedByMonth.toFixed(2)} F</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6 sm:p-8">
          {!filteredRevenues || filteredRevenues.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <DollarSign size={32} className="text-emerald-600" />
              </div>
              <p className="text-gray-500 text-lg mb-6">Aucune recette enregistrée</p>
              <Link
                href={`/vehicles/${id}/revenues/new`}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition"
              >
                <Plus size={20} />
                Créer une recette
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRevenues.map((revenue) => (
                <div key={revenue.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-emerald-300 transition">
                  <div className="flex-1 mb-4 sm:mb-0">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-semibold text-gray-800">{revenue.driver.name}</p>
                      {getStatusBadge(revenue.status)}
                    </div>
                    <p className="text-sm text-gray-600">{revenue.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(revenue.date).toLocaleDateString('fr-FR')}
                      {revenue.signed_at && ` • Signé le ${new Date(revenue.signed_at).toLocaleDateString('fr-FR')}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 w-full">
                    <p className="text-lg font-bold text-emerald-600">{revenue.amount} F</p>
                    <div className="flex items-center gap-1 ml-auto">
                      {revenue.status === 'PENDING' && (
                        <button
                          onClick={() => handleSign(revenue.id)}
                          disabled={signMutation.isPending}
                          className="text-amber-600 hover:bg-amber-50 p-1.5 rounded transition disabled:text-gray-400"
                          title="Signer cette recette"
                        >
                          <Check size={18} />
                        </button>
                      )}
                      {revenue.status === 'SIGNED' && (
                        <>
                          <button
                            onClick={() => handleValidate(revenue.id)}
                            disabled={validateMutation.isPending}
                            className="text-emerald-600 hover:bg-emerald-50 p-1.5 rounded transition disabled:text-gray-400"
                            title="Valider cette recette"
                          >
                            <CheckCircle2 size={18} />
                          </button>
                          <button
                            onClick={() => handleReject(revenue.id)}
                            disabled={rejectMutation.isPending}
                            className="text-orange-600 hover:bg-orange-50 p-1.5 rounded transition disabled:text-gray-400"
                            title="Rejeter cette recette"
                          >
                            <XCircle size={18} />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDeleteClick(revenue.id)}
                        disabled={deleteMutation.isPending}
                        className="text-red-600 hover:bg-red-50 p-1.5 rounded transition disabled:text-gray-400"
                        title="Supprimer cette recette"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={isModalOpen}
        title="Supprimer la recette"
        message="Êtes-vous sûr de vouloir supprimer cette recette ?"
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
