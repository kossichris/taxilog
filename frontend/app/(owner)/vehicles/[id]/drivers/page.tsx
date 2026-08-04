'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Users, ArrowLeft, Trash2, Plus } from 'lucide-react';
import { useGetVehicleDrivers, useRemoveDriver } from '@/hooks/useDrivers';
import ConfirmModal from '@/components/ConfirmModal';

export default function VehicleDriversPage() {
  const { id } = useParams();
  const { data: drivers, isLoading, error } = useGetVehicleDrivers(id as string);
  const removeMutation = useRemoveDriver(id as string);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
        <p className="mt-2 text-gray-600">Chargement des drivers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        Erreur lors du chargement des drivers
      </div>
    );
  }

  const handleRemoveClick = (driverId: string) => {
    setSelectedDriverId(driverId);
    setIsModalOpen(true);
  };

  const handleConfirmRemove = async () => {
    if (!selectedDriverId) return;
    try {
      await removeMutation.mutateAsync(selectedDriverId);
      setIsModalOpen(false);
      setSelectedDriverId(null);
    } catch (err) {
      alert('Erreur lors de la suppression');
    }
  };

  const handleCancelRemove = () => {
    setIsModalOpen(false);
    setSelectedDriverId(null);
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
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 p-4 sm:p-6 flex items-center justify-between">
          <div className="flex items-start gap-3">
            <div className="bg-amber-600 p-2 rounded-lg">
              <Users size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-amber-600">Drivers</h1>
            </div>
          </div>
          <Link
            href={`/vehicles/${id}/drivers/new`}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-3 rounded-lg transition text-sm"
          >
            <Plus size={16} />
            Ajouter
          </Link>
        </div>

        {/* Drivers list */}
        <div className="p-4 sm:p-6">
          {!drivers || drivers.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-14 h-14 bg-amber-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Users size={24} className="text-amber-600" />
              </div>
              <p className="text-gray-500 mb-4">Aucun driver assigné</p>
              <Link
                href={`/vehicles/${id}/drivers/new`}
                className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-4 rounded-lg transition text-sm"
              >
                <Plus size={18} />
                Ajouter un driver
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {drivers.map((driver: any) => (
                <div key={driver.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border border-gray-200 hover:border-amber-300 transition">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{driver.user.name}</p>
                    <p className="text-sm text-gray-500">{driver.user.phone}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveClick(driver.id)}
                    disabled={removeMutation.isPending}
                    className="text-red-600 hover:bg-red-50 p-2 rounded transition disabled:text-gray-400"
                    title="Retirer ce driver"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={isModalOpen}
        title="Retirer le driver"
        message="Êtes-vous sûr de vouloir retirer ce driver du véhicule ?"
        onConfirm={handleConfirmRemove}
        onCancel={handleCancelRemove}
        isLoading={removeMutation.isPending}
        confirmText="Retirer"
        cancelText="Annuler"
        isDangerous={true}
      />
    </div>
  );
}
