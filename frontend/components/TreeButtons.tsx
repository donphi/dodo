import React from 'react';
import { Download, ZoomOut } from 'lucide-react';

interface TreeButtonsProps {
  onExport: () => void;
  onViewAll: () => void;
  className?: string;
}

export default function TreeButtons({ 
  onExport, 
  onViewAll,
  className = '' 
}: TreeButtonsProps): JSX.Element {
  return (
    <div className="flex flex-row gap-2">
      {/* View All Button - Desktop */}
      <button
        onClick={onViewAll}
        className="hidden sm:inline-flex items-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700 dark:hover:bg-gray-700"
      >
        <ZoomOut size={16} className="mr-1" aria-hidden="true" />
        <span>View All</span>
      </button>

      {/* View All Button - Mobile */}
      <button
        onClick={onViewAll}
        className="sm:hidden inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700 dark:hover:bg-gray-700"
      >
        <span className="sr-only">View All</span>
        <ZoomOut size={16} aria-hidden="true" />
      </button>

      {/* Export Button - Desktop */}
      <button
        onClick={onExport}
        className="hidden sm:inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        <Download size={16} className="mr-1" aria-hidden="true" />
        <span>Download</span>
      </button>

      {/* Export Button - Mobile */}
      <button
        onClick={onExport}
        className="sm:hidden inline-flex items-center justify-center rounded-md bg-indigo-600 p-2 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        <span className="sr-only">Download</span>
        <Download size={16} aria-hidden="true" />
      </button>
    </div>
  );
}