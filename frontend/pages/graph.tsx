import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import VisualizationHeader from "../components/VisualizationHeader";

// Dynamically import all graph components with SSR disabled
const ForceGraph3DComponent = dynamic(() => import("../components/ForceGraph3D"), { ssr: false });
const ForceGraph2DComponent = dynamic(() => import("../components/ForceGraph2D"), { ssr: false });
const TidyTreeComponent = dynamic(() => import("../components/TidyTree"), { ssr: false });
const RadialTidyTreeComponent = dynamic(() => import("../components/RadialTidyTree"), { ssr: false });

export default function GraphPage(): React.ReactElement {
  const router = useRouter();
  const graphRef = useRef<HTMLDivElement>(null);
  
  // Get the initial view mode from URL query parameter or default to 'tidy'
  const [viewMode, setViewMode] = useState<'2d' | '3d' | 'tidy' | 'radial'>('tidy');
  
  // Set the initial view mode based on URL query parameter
  useEffect(() => {
    const { view } = router.query;
    if (view === '2d' || view === '3d' || view === 'tidy' || view === 'radial') {
      setViewMode(view as '2d' | '3d' | 'tidy' | 'radial');
    }
  }, [router.query]);
  
  // Handle view changes from the VisualizationHeader
  const handleViewChange = (view: string) => {
    console.log("Graph page received view change:", view);
    console.log("Current viewMode before change:", viewMode);
    
    switch (view) {
      // Commented out for now - will be added back later
      // case '2d':
      //   setViewMode('2d');
      //   // Update URL without full page reload
      //   router.push(`/graph?view=2d`, undefined, { shallow: true });
      //   break;
      // case '3d':
      //   setViewMode('3d');
      //   router.push(`/graph?view=3d`, undefined, { shallow: true });
      //   break;
      case 'tidy':
        setViewMode('tidy');
        router.push(`/graph?view=tidy`, undefined, { shallow: true });
        break;
      case 'radial':
        console.log("Setting viewMode to radial");
        setViewMode('radial');
        router.push(`/graph?view=radial`, undefined, { shallow: true });
        break;
      // case 'sunburst':
      //   // Not implemented yet, stay on current page
      //   break;
      default:
        // Default to tidy view
        setViewMode('tidy');
        router.push(`/graph?view=tidy`, undefined, { shallow: true });
        break;
    }
    
    // Log after state update (note: this will log before the state actually updates due to React's asynchronous state updates)
    console.log("viewMode after setViewMode call:", viewMode);
    
    // Add a timeout to check the viewMode after the state has been updated
    setTimeout(() => {
      console.log("viewMode after timeout:", viewMode);
    }, 100);
  };
  
  // Export functionality for all visualization types
  const handleExport = () => {
    // Find the appropriate export function based on the current view
    const svgElement = graphRef.current?.querySelector('svg');
    
    if (!svgElement) {
      console.error('No SVG element found to export');
      return;
    }
    
    // Create a clone of the SVG to modify for export
    const svgClone = svgElement.cloneNode(true) as SVGSVGElement;
    
    // Add inline styles for proper rendering outside of the app
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .dark-theme { background-color: #1e293b; }
      .light-theme { background-color: #ffffff; }
      text { font-family: sans-serif; font-size: 10px; }
    `;
    svgClone.insertBefore(styleElement, svgClone.firstChild);
    
    // Convert SVG to a data URL
    const svgData = new XMLSerializer().serializeToString(svgClone);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    
    // Create download link
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `${viewMode}-visualization.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    // Clean up
    URL.revokeObjectURL(svgUrl);
  };
  
  // Render the appropriate component based on viewMode
  const renderVisualization = () => {
    console.log("renderVisualization called with viewMode:", viewMode);
    
    switch (viewMode) {
      // Commented out for now - will be added back later
      // case '2d':
      //   console.log("Rendering ForceGraph2DComponent");
      //   return <ForceGraph2DComponent />;
      // case '3d':
      //   console.log("Rendering ForceGraph3DComponent");
      //   return <ForceGraph3DComponent />;
      case 'radial':
        console.log("Rendering RadialTidyTreeComponent");
        return <RadialTidyTreeComponent />;
      case 'tidy':
      default:
        console.log("Rendering TidyTreeComponent (default)");
        return <TidyTreeComponent />;
    }
  };
  
  return (
    <main className="flex flex-col w-full h-screen overflow-hidden">
      <VisualizationHeader currentView={viewMode} onViewChange={handleViewChange} />
      
      <div
        ref={graphRef}
        className="flex-grow w-full h-full"
        style={{ minHeight: '500px', height: 'calc(100vh - 100px)', overflow: 'auto' }}
      >
        {renderVisualization()}
      </div>
    </main>
  );
}