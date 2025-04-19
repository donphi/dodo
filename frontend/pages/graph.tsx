import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

// Dynamically import the graph components with SSR disabled
const ForceGraph3DComponent = dynamic(() => import("../components/ForceGraph3D"), { ssr: false });
const ForceGraph2DComponent = dynamic(() => import("../components/ForceGraph2D"), { ssr: false });

const GraphPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('3d');

  const toggleView = () => {
    setViewMode(viewMode === '3d' ? '2d' : '3d');
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header with view toggle and navigation links */}
      <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold">Graph Visualization</h1>
          <nav className="flex space-x-4">
            <Link href="/dashboard" className="hover:text-blue-300 transition-colors">
              Dashboard
            </Link>
            <Link href="/graph-2d" className="hover:text-blue-300 transition-colors">
              2D Only
            </Link>
            <Link href="/graph-3d" className="hover:text-blue-300 transition-colors">
              3D Only
            </Link>
          </nav>
        </div>
        <button
          onClick={toggleView}
          className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition-colors"
        >
          Switch to {viewMode === '3d' ? '2D' : '3D'} View
        </button>
      </header>

      {/* Main content - render the appropriate component based on viewMode */}
      <div className="flex-grow w-full">
        {viewMode === '3d' ? <ForceGraph3DComponent /> : <ForceGraph2DComponent />}
      </div>
    </div>
  );
};

export default GraphPage;