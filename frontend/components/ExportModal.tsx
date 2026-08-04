'use client';

import { useState } from 'react';
import { FileText, Table2, X } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: 'pdf' | 'excel') => Promise<void>;
  isLoading?: boolean;
}

export default function ExportModal({
  isOpen,
  onClose,
  onExport,
  isLoading = false,
}: ExportModalProps) {
  const [error, setError] = useState('');

  const handleExport = async (format: 'pdf' | 'excel') => {
    setError('');
    try {
      await onExport(format);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'export');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-800">Exporter les données</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={24} />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-6">
          Choisissez un format pour télécharger vos données
        </p>

        {/* Options */}
        <div className="space-y-3 mb-6">
          <button
            onClick={() => handleExport('pdf')}
            disabled={isLoading}
            className="w-full flex items-center gap-4 p-4 border-2 border-emerald-200 rounded-lg hover:bg-emerald-50 transition disabled:opacity-50"
          >
            <FileText size={24} className="text-emerald-600" />
            <div className="text-left">
              <p className="font-semibold text-gray-800">PDF</p>
              <p className="text-xs text-gray-500">Rapport formaté</p>
            </div>
          </button>

          <button
            onClick={() => handleExport('excel')}
            disabled={isLoading}
            className="w-full flex items-center gap-4 p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition disabled:opacity-50"
          >
            <Table2 size={24} className="text-blue-600" />
            <div className="text-left">
              <p className="font-semibold text-gray-800">Excel</p>
              <p className="text-xs text-gray-500">Données tabulaires</p>
            </div>
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm mb-6">
            {error}
          </div>
        )}

        {/* Cancel Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="w-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 text-gray-700 font-semibold py-2 px-4 rounded-lg transition"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}
