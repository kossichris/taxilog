'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DollarSign, Banknote, TrendingUp, Car, Plus, FileText, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useGetOwnerTotalRevenues, useExportOwnerReport } from '@/hooks/useRevenues';
import { useGetOwnerTotalExpenses } from '@/hooks/useExpenses';
import { useGetVehicles } from '@/hooks/useVehicles';
import { formatNumber } from '@/lib/formatNumber';
import ExportModal from '@/components/ExportModal';

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const { data: totalRevenues = 0 } = useGetOwnerTotalRevenues();
  const { data: totalExpenses = 0 } = useGetOwnerTotalExpenses();
  const vehiclesHook = useGetVehicles();
  const { data: vehicles = [] } = vehiclesHook;
  const exportReport = useExportOwnerReport();
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const handleExport = async (format: 'pdf' | 'excel') => {
    setIsExporting(true);
    try {
      await exportReport(format);
      setIsExportModalOpen(false);
    } catch (err) {
      alert('Erreur lors de l\'export');
    } finally {
      setIsExporting(false);
    }
  };

  const netProfit = totalRevenues - totalExpenses;

  const stats = [
    {
      label: 'Total Recettes',
      value: `${formatNumber(totalRevenues)} F`,
      icon: DollarSign,
      color: 'emerald',
      bgColor: 'emerald-50',
      borderColor: 'emerald-200',
    },
    {
      label: 'Total Dépenses',
      value: `${formatNumber(totalExpenses)} F`,
      icon: Banknote,
      color: 'red',
      bgColor: 'red-50',
      borderColor: 'red-200',
    },
    {
      label: 'Bénéfice Net',
      value: `${formatNumber(netProfit)} F`,
      icon: TrendingUp,
      color: netProfit >= 0 ? 'amber' : 'red',
      bgColor: netProfit >= 0 ? 'amber-50' : 'red-50',
      borderColor: netProfit >= 0 ? 'amber-200' : 'red-200',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 rounded-lg border border-amber-200 p-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-2">Bienvenue, {user?.name} 👋</h1>
        <p className="text-gray-600 text-lg">Vue d'ensemble de vos véhicules et finances</p>
      </div>

      {/* Report Button */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setIsExportModalOpen(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg transition text-sm"
        >
          <FileText size={16} />
          Rapport complet
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const colorClasses = {
            emerald: 'text-emerald-600',
            red: 'text-red-600',
            amber: 'text-amber-600',
          };
          const bgClasses = {
            emerald: 'bg-emerald-100',
            red: 'bg-red-100',
            amber: 'bg-amber-100',
          };

          return (
            <div key={stat.label} className={`bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-md transition`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                  <p className={`text-3xl font-bold ${colorClasses[stat.color as keyof typeof colorClasses]} mt-2`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`${bgClasses[stat.color as keyof typeof bgClasses]} p-3 rounded-lg`}>
                  <Icon size={24} className={colorClasses[stat.color as keyof typeof colorClasses]} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Vehicles Section */}
      {isHydrated && (
      <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-amber-600 p-3 rounded-lg">
              <Car size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Vos véhicules</h2>
              <p className="text-sm text-gray-600">Gérez votre flotte</p>
            </div>
          </div>
          <Link
            href="/vehicles/new"
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            <Plus size={18} />
            Ajouter
          </Link>
        </div>

        <div className="p-8">
          {vehicles.length === 0 ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Car size={32} className="text-amber-600" />
              </div>
              <p className="text-gray-500 text-lg mb-6">Aucun véhicule enregistré</p>
              <p className="text-gray-400 text-sm mb-6">Commencez par ajouter votre premier véhicule pour suivre vos recettes et dépenses</p>
              <Link
                href="/vehicles/new"
                className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-6 rounded-lg transition"
              >
                <Plus size={20} />
                Créer un véhicule
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((vehicle) => (
                <Link
                  key={vehicle.id}
                  href={`/vehicles/${vehicle.id}`}
                  className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-6 hover:shadow-md hover:border-amber-300 transition group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">{vehicle.brand} {vehicle.model}</p>
                      <p className="text-xl font-bold text-amber-600 mt-1">{vehicle.plate}</p>
                    </div>
                    <ArrowRight size={20} className="text-amber-600 group-hover:translate-x-1 transition" />
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Recettes:</span>
                      <span className="font-semibold text-emerald-600">{formatNumber(vehicle.revenues || 0)} F</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dépenses:</span>
                      <span className="font-semibold text-red-600">{formatNumber(vehicle.expenses || 0)} F</span>
                    </div>
                    <div className="flex justify-between border-t border-amber-200 pt-2 mt-2">
                      <span className="text-gray-600 font-medium">Bénéfice:</span>
                      <span className="font-bold text-amber-600">{formatNumber((vehicle.revenues || 0) - (vehicle.expenses || 0))} F</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      )}

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExport}
        isLoading={isExporting}
      />
    </div>
  );
}
