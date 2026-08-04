'use client';

import Link from 'next/link';
import { DollarSign, Clock } from 'lucide-react';
import { useGetPendingRevenues } from '@/hooks/useRevenues';

export default function DriverRevenuesPage() {
  const { data: revenues, isLoading, error } = useGetPendingRevenues();

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
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

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-amber-600 p-3 rounded-lg">
          <DollarSign size={28} className="text-white" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Recettes à signer</h1>
      </div>

      {!revenues || revenues.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-8 sm:p-12 text-center border border-gray-200">
          <div className="w-16 h-16 bg-amber-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <DollarSign size={32} className="text-amber-600" />
          </div>
          <p className="text-gray-500 text-lg">Aucune recette à signer pour le moment</p>
        </div>
      ) : (
        <div className="space-y-4">
          {revenues.map((revenue) => (
            <Link
              key={revenue.id}
              href={`/revenues/${revenue.id}/sign`}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white rounded-lg p-6 border border-gray-200 hover:border-amber-300 hover:shadow-lg transition"
            >
              <div className="flex-1 mb-4 sm:mb-0">
                <div className="flex items-center gap-3 mb-2">
                  <p className="font-semibold text-gray-800">{revenue.vehicle.plate}</p>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-700">
                    <Clock size={14} />
                    En attente
                  </span>
                </div>
                <p className="text-sm text-gray-600">{revenue.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {revenue.vehicle.brand} {revenue.vehicle.model}
                </p>
              </div>
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="text-right">
                  <p className="text-2xl font-bold text-amber-600">{revenue.amount}</p>
                  <p className="text-xs text-gray-500">F</p>
                </div>
                <div className="text-amber-600 text-2xl">→</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
