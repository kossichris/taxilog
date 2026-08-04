'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Car, ArrowLeft, Edit2, Trash2, TrendingUp, DollarSign, Banknote, Users } from 'lucide-react';
import { useGetVehicle, useDeleteVehicle } from '@/hooks/useVehicles';
import { useGetVehicleRevenues } from '@/hooks/useRevenues';
import { useGetVehicleExpenses } from '@/hooks/useExpenses';
import ConfirmModal from '@/components/ConfirmModal';

export default function VehicleDetailPage() {
  const { id } = useParams();
  const { data: vehicle, isLoading, error } = useGetVehicle(id as string);
  const { data: revenues = [] } = useGetVehicleRevenues(id as string);
  const { data: expenses = [] } = useGetVehicleExpenses(id as string);
  const deleteMutation = useDeleteVehicle(id as string);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const totals = useMemo(() => {
    const totalRevenues = (revenues || [])
      .reduce((sum, r) => sum + parseFloat(r.amount.toString()), 0);
    const totalExpenses = (expenses || [])
      .reduce((sum, e) => sum + parseFloat(e.amount.toString()), 0);
    return {
      revenues: totalRevenues,
      expenses: totalExpenses,
      net: totalRevenues - totalExpenses,
    };
  }, [revenues, expenses]);

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

  const handleDeleteClick = () => {
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteMutation.mutateAsync();
      window.location.href = '/vehicles';
    } catch (err) {
      alert('Erreur lors de la suppression');
    }
  };

  const handleCancelDelete = () => {
    setIsModalOpen(false);
  };

  return (
    <div>
      {/* Back button */}
      <div className="mb-6">
        <Link href="/vehicles" className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 font-medium transition">
          <ArrowLeft size={20} />
          Retour aux véhicules
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100">
        {/* Hero header */}
        <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-b border-amber-200 p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="bg-amber-600 p-4 rounded-lg">
              <Car size={32} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500 font-medium mb-1">Immatriculation</p>
              <h1 className="text-3xl sm:text-4xl font-bold text-amber-600">{vehicle.plate}</h1>
              <p className="text-base text-gray-600 mt-2">{vehicle.brand} {vehicle.model}</p>
            </div>
          </div>
        </div>

        {/* Details grid */}
        <div className="p-6 sm:p-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 font-medium mb-1">Marque</p>
              <p className="text-lg font-bold text-gray-800">{vehicle.brand}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 font-medium mb-1">Modèle</p>
              <p className="text-lg font-bold text-gray-800">{vehicle.model}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 font-medium mb-1">Couleur</p>
              <p className="text-lg font-bold text-gray-800">{vehicle.color}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 font-medium mb-1">Créé le</p>
              <p className="text-lg font-bold text-gray-800">
                {new Date(vehicle.created_at).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>

          {/* Totals Section */}
          <div className="mt-6 grid grid-cols-3 gap-8">
            <div>
              <p className="text-sm text-gray-500 mb-2">Recettes</p>
              <p className="text-3xl font-bold text-gray-800">{totals.revenues.toFixed(2)}</p>
              <p className="text-xs text-gray-400">F</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">Dépenses</p>
              <p className="text-3xl font-bold text-gray-800">{totals.expenses.toFixed(2)}</p>
              <p className="text-xs text-gray-400">F</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">Bénéfice Net</p>
              <p className={`text-3xl font-bold ${totals.net >= 0 ? 'text-gray-800' : 'text-red-600'}`}>{totals.net.toFixed(2)}</p>
              <p className="text-xs text-gray-400">F</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-gray-200">
          <div className="flex flex-wrap gap-0 bg-gray-50">
            <Link
              href={`/vehicles/${vehicle.id}`}
              className="flex-1 px-4 py-4 flex items-center justify-center gap-2 text-center border-b-3 border-amber-600 text-amber-600 font-semibold hover:bg-amber-50 transition"
            >
              <TrendingUp size={18} />
              <span>Détails</span>
            </Link>
            <Link
              href={`/vehicles/${vehicle.id}/drivers`}
              className="flex-1 px-4 py-4 flex items-center justify-center gap-2 text-center border-b-3 border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition"
            >
              <Users size={18} />
              <span>Drivers</span>
            </Link>
            <Link
              href={`/vehicles/${vehicle.id}/revenues`}
              className="flex-1 px-4 py-4 flex items-center justify-center gap-2 text-center border-b-3 border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition"
            >
              <DollarSign size={18} />
              <span>Recettes</span>
            </Link>
            <Link
              href={`/vehicles/${vehicle.id}/expenses`}
              className="flex-1 px-4 py-4 flex items-center justify-center gap-2 text-center border-b-3 border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition"
            >
              <Banknote size={18} />
              <span>Dépenses</span>
            </Link>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 sm:p-8 border-t border-gray-200 flex gap-2">
          <Link
            href={`/vehicles/${vehicle.id}/edit`}
            className="flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-4 rounded-lg transition text-sm"
          >
            <Edit2 size={16} />
            Éditer
          </Link>
          <button
            onClick={handleDeleteClick}
            disabled={deleteMutation.isPending}
            className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold py-2 px-4 rounded-lg transition text-sm"
          >
            <Trash2 size={16} />
            {deleteMutation.isPending ? 'Suppression...' : 'Désactiver'}
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={isModalOpen}
        title="Désactiver le véhicule"
        message="Êtes-vous sûr de vouloir désactiver ce véhicule ?"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isLoading={deleteMutation.isPending}
        confirmText="Désactiver"
        cancelText="Annuler"
        isDangerous={true}
      />
    </div>
  );
}
