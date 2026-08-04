'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage = 20,
}: PaginationProps) {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) pages.push('...');

      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex flex-col items-center gap-4 mt-6">
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          aria-label="Précédent"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex gap-1">
          {getPageNumbers().map((page, idx) => (
            <button
              key={idx}
              onClick={() => typeof page === 'number' && onPageChange(page)}
              disabled={page === '...' || page === currentPage}
              className={`
                px-3 py-2 rounded-lg text-sm font-medium transition
                ${page === currentPage
                  ? 'bg-amber-600 text-white'
                  : page === '...'
                  ? 'cursor-default text-gray-400'
                  : 'border border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          aria-label="Suivant"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="text-sm text-gray-600">
        {totalItems !== undefined && (
          <>
            Page {currentPage} de {totalPages} ({totalItems} items)
          </>
        )}
      </div>
    </div>
  );
}
