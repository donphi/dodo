import React from 'react';
import { Download, ZoomOut, FolderTree } from 'lucide-react';

interface TreeButtonsProps {
  onExport: () => void;
  onViewAll: () => void;
  onToggleExpandAll: () => void;
  isAllExpanded: boolean;
  className?: string;
}

export default function TreeButtons({ 
  onExport, 
  onViewAll, 
  onToggleExpandAll, 
  isAllExpanded,
  className = '' 
}: TreeButtonsProps): JSX.Element {
  return (
    <div className="flex flex-row gap-2">
      {/* View All Button - Desktop */}
      <button
        onClick={onViewAll}
        className={`hidden sm:inline-flex items-center gap-x-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${className}`}
      >
        <span>View All</span>
        <ZoomOut size={20} aria-hidden="true" />
      </button>

      {/* View All Button - Mobile */}
      <button
        onClick={onViewAll}
        className={`sm:hidden inline-flex items-center justify-center rounded-md bg-blue-600 p-2 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${className}`}
      >
        <span className="sr-only">View All</span>
        <ZoomOut size={20} aria-hidden="true" />
      </button>

      {/* Toggle Expand All Button - Desktop */}
      <button
        onClick={onToggleExpandAll}
        className={`hidden sm:inline-flex items-center gap-x-1 rounded-md ${isAllExpanded ? 'bg-green-600 hover:bg-green-500' : 'bg-purple-600 hover:bg-purple-500'} px-3 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 ${className}`}
      >
        <span>{isAllExpanded ? 'Collapse All' : 'Expand All'}</span>
        <FolderTree size={20} aria-hidden="true" />
      </button>

      {/* Toggle Expand All Button - Mobile */}
      <button
        onClick={onToggleExpandAll}
        className={`sm:hidden inline-flex items-center justify-center rounded-md ${isAllExpanded ? 'bg-green-600 hover:bg-green-500' : 'bg-purple-600 hover:bg-purple-500'} p-2 text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 ${className}`}
      >
        <span className="sr-only">{isAllExpanded ? 'Collapse All' : 'Expand All'}</span>
        <FolderTree size={20} aria-hidden="true" />
      </button>

      {/* Export Button - Desktop */}
      <button
        onClick={onExport}
        className={`hidden sm:inline-flex items-center gap-x-1 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${className}`}
      >
        <span>Download</span>
        <Download size={20} aria-hidden="true" />
      </button>

      {/* Export Button - Mobile */}
      <button
        onClick={onExport}
        className={`sm:hidden inline-flex items-center justify-center rounded-md bg-indigo-600 p-2 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${className}`}
      >
        <span className="sr-only">Download</span>
        <Download size={20} aria-hidden="true" />
      </button>
    </div>
  );
}