'use client';

import { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  isLoading = false,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  isDangerous = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="text-gray-500 hover:text-gray-700 disabled:text-gray-300"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          <p className="text-gray-600">{message}</p>
        </div>

        <div className="flex gap-3 p-4 border-t border-gray-200">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-500 transition"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-2 text-white font-medium rounded-lg transition ${
              isDangerous
                ? 'bg-red-600 hover:bg-red-700 disabled:bg-red-400'
                : 'bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400'
            }`}
          >
            {isLoading ? 'En cours...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
