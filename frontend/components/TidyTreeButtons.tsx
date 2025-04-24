import React from 'react';
import { Download } from 'lucide-react';

interface TidyTreeButtonsProps {
  onExport: () => void;
  className?: string;
}

/**
 * TidyTreeButtons - A simplified version of TreeButtons that only includes the export functionality
 * This component is specifically designed for the TidyTree visualization
 */
export default function TidyTreeButtons({ 
  onExport, 
  className = '' 
}: TidyTreeButtonsProps): React.ReactElement {
  return (
    <div className="flex flex-row">
      {/* Export Button - Desktop */}
      <button
        onClick={onExport}
        className="hidden sm:inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        <Download size={16} className="mr-1 text-white" aria-hidden="true" />
        <span>Download</span>
      </button>

      {/* Export Button - Mobile */}
      <button
        onClick={onExport}
        className="sm:hidden inline-flex items-center justify-center rounded-md bg-indigo-600 p-2 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        <span className="sr-only">Download</span>
        <Download size={16} className="text-white" aria-hidden="true" />
      </button>
    </div>
  );
}