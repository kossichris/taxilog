'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { DollarSign, ArrowLeft, Plus, Check, Clock, X, Trash2, CheckCircle2, XCircle, Download } from 'lucide-react';
import { useGetVehicleRevenuesPaginated, useValidateRevenue, useDeleteRevenue, useSignRevenue, useRejectRevenue, useExportRevenues } from '@/hooks/useRevenues';
import { formatNumber } from '@/lib/formatNumber';
import Pagination from '@/components/Pagination';
import ConfirmModal from '@/components/ConfirmModal';
import ExportModal from '@/components/ExportModal';

export default function RevenuesPage() {
  const { id } = useParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [filterMonth, setFilterMonth] = useState<string>('');
  const { data: paginatedData, isLoading, error } = useGetVehicleRevenuesPaginated(id as string, currentPage);
  const validateMutation = useValidateRevenue(id as string);
  const deleteMutation = useDeleteRevenue(id as string);
  const signMutation = useSignRevenue();
  const rejectMutation = useRejectRevenue(id as string);
  const exportRevenues = useExportRevenues(id as string);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedRevenueId, setSelectedRevenueId] = useState<string | null>(null);

  const revenues = paginatedData?.data || [];
  const totalItems = paginatedData?.total || 0;
  const totalPages = paginatedData?.pages || 1;

  const filteredRevenues = revenues.filter((revenue) => {
    if (!filterMonth) return true;
    const revenueDate = new Date(revenue.date);
    const [year, month] = filterMonth.split('-');
    return (
      revenueDate.getFullYear().toString() === year &&
      (revenueDate.getMonth() + 1).toString().padStart(2, '0') === month
    );
  });

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

  const handleDelete = async (revenueId: string) => {
    try {
      await deleteMutation.mutateAsync(revenueId);
    } catch (err) {
      alert('Erreur lors de la suppression');
    }
    setIsModalOpen(false);
  };

  const handleExport = async (format: 'pdf' | 'excel') => {
    setIsExporting(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1))
        .toISOString()
        .split('T')[0];
      await exportRevenues(format, lastMonth, today);
      setIsExportModalOpen(false);
    } catch (err) {
      alert('Erreur lors de l\'export');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div>
      <Link href={`/vehicles/${id}`} className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-6">
        <ArrowLeft size={20} />
        Retour au véhicule
      </Link>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Recettes</h1>
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg text-sm"
          >
            <Download size={16} />
            Exporter
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Total</label>
            <p className="text-2xl font-bold text-gray-800">{formatNumber(totalByMonth)} F</p>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Validé</label>
            <p className="text-2xl font-bold text-green-600">{formatNumber(validatedByMonth)} F</p>
          </div>
        </div>

        <select
          value={filterMonth}
          onChange={(e) => {
            setFilterMonth(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="">Tous les mois</option>
          {Array.from({ length: 12 }, (_, i) => {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const value = date.toISOString().split('T')[0].slice(0, 7);
            const label = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
            return (
              <option key={value} value={value}>
                {label}
              </option>
            );
          })}
        </select>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredRevenues.length === 0 ? (
          <div className="p-6 text-center text-gray-600">Aucune recette trouvée</div>
        ) : (
          <div className="divide-y">
            {filteredRevenues.map((revenue) => (
              <div key={revenue.id} className="p-4 hover:bg-gray-50 flex justify-between items-center">
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{revenue.driver?.name || 'N/A'}</p>
                  <p className="text-sm text-gray-600">{new Date(revenue.date).toLocaleDateString('fr-FR')}</p>
                  {getStatusBadge(revenue.status)}
                </div>
                <div className="text-right mr-4">
                  <p className="font-bold text-gray-800">{formatNumber(parseFloat(revenue.amount.toString()))} F</p>
                </div>
                <div className="flex gap-2">
                  {revenue.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleSign(revenue.id)}
                        className="p-2 hover:bg-blue-100 rounded"
                        title="Signer"
                      >
                        <Check size={18} className="text-blue-600" />
                      </button>
                    </>
                  )}
                  {revenue.status === 'SIGNED' && (
                    <>
                      <button
                        onClick={() => handleValidate(revenue.id)}
                        className="p-2 hover:bg-green-100 rounded"
                        title="Valider"
                      >
                        <CheckCircle2 size={18} className="text-green-600" />
                      </button>
                      <button
                        onClick={() => handleReject(revenue.id)}
                        className="p-2 hover:bg-red-100 rounded"
                        title="Rejeter"
                      >
                        <XCircle size={18} className="text-red-600" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => {
                      setSelectedRevenueId(revenue.id);
                      setIsModalOpen(true);
                    }}
                    className="p-2 hover:bg-red-100 rounded"
                    title="Supprimer"
                  >
                    <Trash2 size={18} className="text-red-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={20}
        onPageChange={setCurrentPage}
      />

      <ConfirmModal
        isOpen={isModalOpen}
        title="Supprimer la recette"
        message="Êtes-vous sûr de vouloir supprimer cette recette ?"
        onConfirm={() => {
          if (selectedRevenueId) {
            handleDelete(selectedRevenueId);
          }
        }}
        onCancel={() => setIsModalOpen(false)}
        confirmText="Supprimer"
        cancelText="Annuler"
        isDangerous={true}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExport}
        isLoading={isExporting}
      />
    </div>
  );
}
