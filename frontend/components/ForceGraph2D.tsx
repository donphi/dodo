"use client";
import { useEffect, useState, useRef } from "react";
import ForceGraph2D from "react-force-graph-2d";
// Optional: Import THREE for advanced customization if needed
// import * as THREE from 'three';

// ===== CUSTOMIZATION: Node Types =====
// Define additional node types and their properties here
type NodeObject = {
  id: string;
  label?: string;
  type: string;
  color?: string;
  // === NODE SIZE ===
  // Add size?: number; to control individual node sizes
  // === NODE STATS ===
  // Add stats?: { mean: number, std_dev: number, min: number, max: number, deciles: number[] };
  // for displaying detailed metrics in tooltips
};

// ===== CUSTOMIZATION: Link Types =====
// Customize link properties here
type LinkObject = {
  source: string;
  target: string;
  relation?: string;
  // === LINK WIDTH ===
  // Add width?: number; to control individual link widths
  // === LINK COLOR ===
  // Add color?: string; to control individual link colors
};

type GraphData = {
  nodes: NodeObject[];
  links: LinkObject[];
};

export default function ForceGraph2DComponent(): JSX.Element {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [isDarkMode, setIsDarkMode] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  
  // ===== CUSTOMIZATION: Add State Variables =====
  // const [showFields, setShowFields] = useState(true); // For toggling node types
  // const [showCategories, setShowCategories] = useState(true); // For toggling node types
  // const [showRoots, setShowRoots] = useState(true); // For toggling node types
  // const [nodeSize, setNodeSize] = useState(6); // Default node size
  // const [linkWidth, setLinkWidth] = useState(1.2); // Default link width
  // const [particleSpeed, setParticleSpeed] = useState(0.01); // Control particle speed
  // const [graphCharge, setGraphCharge] = useState(-30); // Control node repulsion
  // const [graphLinkDistance, setGraphLinkDistance] = useState(30); // Control link distance

  // Check for dark mode on component mount and when theme changes
  useEffect(() => {
    // Initial check
    setIsDarkMode(document.documentElement.classList.contains('dark'));
    // Set up observer for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDarkMode(document.documentElement.classList.contains('dark'));
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  // Effect to handle resize and ensure the graph fills the container
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateDimensions = () => {
      if (!containerRef.current) return;
      
      // Direct parent is often the container we want to fill
      const parentElement = containerRef.current.parentElement;
      
      // Get current container dimensions
      let width = containerRef.current.clientWidth || 0;
      let height = 0;
      
      // Try to get height from parent if available
      if (parentElement) {
        const computedStyle = window.getComputedStyle(parentElement);
        const parentHeight = parentElement.clientHeight;
        
        // Account for parent's padding and border for accurate sizing
        const paddingTop = parseFloat(computedStyle.paddingTop) || 0;
        const paddingBottom = parseFloat(computedStyle.paddingBottom) || 0;
        const borderTop = parseFloat(computedStyle.borderTopWidth) || 0;
        const borderBottom = parseFloat(computedStyle.borderBottomWidth) || 0;
        
        height = parentHeight - paddingTop - paddingBottom - borderTop - borderBottom;
      }
      
      // If we couldn't get height from parent, try container itself
      if (!height || height < 50) {
        height = containerRef.current.clientHeight || 0;
      }
      
      // Use fallback values only if really necessary
      width = width || 800;
      height = height || 600;
      
      // Set minimum height to prevent tiny graphs
      height = Math.max(height, 500);
      
      setDimensions({ width, height });
    };
    
    // Initial dimensions - slight delay to ensure DOM is fully rendered
    setTimeout(updateDimensions, 1);
    
    // Set up resize observer to detect container size changes
    const resizeObserver = new ResizeObserver(() => {
      // Add small delay to ensure accurate measurements after resize
      setTimeout(updateDimensions, 1);
    });
    resizeObserver.observe(containerRef.current);
    
    // Also handle window resize
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
      window.removeEventListener('resize', updateDimensions);
    };
  }, [containerRef.current]);

  useEffect(() => {
    // ===== CUSTOMIZATION: Data Source =====
    // Change the path to your JSON file here
    fetch("/graph-data/graph_1000_nodes.json")
      .then(res => res.json())
      .then((data: GraphData) => {
        // ===== CUSTOMIZATION: Node Coloring =====
        // Modify these colors as needed
        data.nodes.forEach(n => {
          n.color = n.type === "Field" ? "#facc15" :  // Yellow for Field
                    n.type === "Category" ? "#38bdf8" :  // Blue for Category
                    n.type === "Root" ? "#a855f7" : "#999";  // Purple for Root, Gray for others
        });
        setGraphData(data);
      });
  }, []);

  // ===== CUSTOMIZATION: Node Filtering Function =====
  // Uncomment and modify to implement node filtering
  // const getFilteredData = () => {
  //   return {
  //     nodes: graphData.nodes.filter(node => 
  //       (node.type === "Field" && showFields) || 
  //       (node.type === "Category" && showCategories) || 
  //       (node.type === "Root" && showRoots)
  //     ),
  //     links: graphData.links.filter(link => {
  //       const sourceNode = graphData.nodes.find(n => n.id === link.source);
  //       const targetNode = graphData.nodes.find(n => n.id === link.target);
  //       return (
  //         (sourceNode && targetNode) &&
  //         ((sourceNode.type === "Field" && showFields) || 
  //          (sourceNode.type === "Category" && showCategories) || 
  //          (sourceNode.type === "Root" && showRoots)) &&
  //         ((targetNode.type === "Field" && showFields) || 
  //          (targetNode.type === "Category" && showCategories) || 
  //          (targetNode.type === "Root" && showRoots))
  //       );
  //     })
  //   };
  // };

  // ===== CUSTOMIZATION: Export Function =====
  // Uncomment to enable graph export functionality
  // const exportGraph = () => {
  //   const dataStr = JSON.stringify(graphData, null, 2);
  //   const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  //   const exportFileDefaultName = 'graph-export.json';
  //   const linkElement = document.createElement('a');
  //   linkElement.setAttribute('href', dataUri);
  //   linkElement.setAttribute('download', exportFileDefaultName);
  //   linkElement.click();
  // };

  // ===== CUSTOMIZATION: Custom Node Component =====
  // Uncomment to use custom node rendering
  // const paintNode = (node: NodeObject, ctx: CanvasRenderingContext2D, globalScale: number) => {
  //   const size = node.size || nodeSize;
  //   const fontSize = 12/globalScale;
  //   const textWidth = ctx.measureText(node.label || node.id).width;
  //   const bckgDimensions = [textWidth + 2, fontSize].map(n => n + fontSize * 0.2);
  //   
  //   // Draw node circle
  //   ctx.beginPath();
  //   ctx.fillStyle = node.color || '#999';
  //   ctx.arc(node.x || 0, node.y || 0, size, 0, 2 * Math.PI, false);
  //   ctx.fill();
  //
  //   // Draw node label if scale is sufficient
  //   if (globalScale >= 0.6) {
  //     ctx.fillStyle = isDarkMode ? '#ffffff' : '#000000';
  //     ctx.textAlign = 'center';
  //     ctx.textBaseline = 'middle';
  //     ctx.font = `${fontSize}px Sans-Serif`;
  //     ctx.fillText(node.label || node.id, node.x || 0, (node.y || 0) + size + fontSize);
  //   }
  //   
  //   return true; // Skip default rendering
  // };

  // ===== CUSTOMIZATION: Custom Tooltip Component =====
  // Uncomment for advanced tooltip display including node stats
  // const handleNodeHover = (node: NodeObject | null) => {
  //   if (!node || !node.stats) return;
  //   
  //   // Create or update tooltip
  //   let tooltip = document.getElementById('node-tooltip');
  //   if (!tooltip) {
  //     tooltip = document.createElement('div');
  //     tooltip.id = 'node-tooltip';
  //     tooltip.style.position = 'absolute';
  //     tooltip.style.padding = '10px';
  //     tooltip.style.borderRadius = '4px';
  //     tooltip.style.fontSize = '12px';
  //     tooltip.style.zIndex = '10';
  //     tooltip.style.pointerEvents = 'none';
  //     tooltip.style.transition = 'opacity 0.3s';
  //     document.body.appendChild(tooltip);
  //   }
  //   
  //   if (node) {
  //     const stats = node.stats;
  //     tooltip.innerHTML = `
  //       <div><strong>${node.label || node.id}</strong> (${node.type})</div>
  //       <div>Mean: ${stats.mean.toFixed(2)}</div>
  //       <div>StdDev: ${stats.std_dev.toFixed(2)}</div>
  //       <div>Min: ${stats.min} | Max: ${stats.max}</div>
  //     `;
  //     tooltip.style.backgroundColor = isDarkMode ? '#1e293b' : '#f8fafc';
  //     tooltip.style.color = isDarkMode ? '#f8fafc' : '#1e293b';
  //     tooltip.style.boxShadow = isDarkMode ? '0 0 15px rgba(0,0,0,0.5)' : '0 0 15px rgba(0,0,0,0.2)';
  //     tooltip.style.opacity = '1';
  //     
  //     // Position tooltip near mouse
  //     const x = (node.x || 0) + dimensions.width / 2;
  //     const y = (node.y || 0) + dimensions.height / 2;
  //     tooltip.style.left = `${x + 15}px`;
  //     tooltip.style.top = `${y - 15}px`;
  //   } else {
  //     tooltip.style.opacity = '0';
  //   }
  // };

  return (
    <div ref={containerRef} className="w-full h-full" style={{ position: 'relative', minHeight: '500px' }}>
      {/* ===== CUSTOMIZATION: Control Panel UI ===== */}
      {/* Uncomment to add control buttons, sliders, etc. */}
      {/* <div className="absolute top-2 right-2 z-10 p-2 bg-white/80 dark:bg-gray-800/80 rounded shadow">
        <div className="flex flex-col gap-2">
          <button 
            onClick={exportGraph}
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded"
          >
            Export Graph
          </button>
          <div className="flex items-center">
            <input 
              type="checkbox" 
              checked={showFields} 
              onChange={e => setShowFields(e.target.checked)} 
              id="show-fields" 
            />
            <label htmlFor="show-fields" className="ml-1 text-xs">Fields</label>
          </div>
          <div className="flex items-center">
            <input 
              type="checkbox" 
              checked={showCategories} 
              onChange={e => setShowCategories(e.target.checked)} 
              id="show-categories" 
            />
            <label htmlFor="show-categories" className="ml-1 text-xs">Categories</label>
          </div>
          <div className="flex items-center">
            <input 
              type="checkbox" 
              checked={showRoots} 
              onChange={e => setShowRoots(e.target.checked)} 
              id="show-roots" 
            />
            <label htmlFor="show-roots" className="ml-1 text-xs">Roots</label>
          </div>
          <div className="text-xs">Node Size</div>
          <input 
            type="range" 
            min="1" 
            max="20" 
            value={nodeSize} 
            onChange={e => setNodeSize(parseInt(e.target.value))} 
          />
        </div>
      </div> */}

      <ForceGraph2D
        graphData={graphData}
        // ===== CUSTOMIZATION: Filtered Data =====
        // Replace graphData with getFilteredData() to enable filtering
        // graphData={getFilteredData()}
        width={dimensions.width}
        height={dimensions.height}
        
        // ===== CUSTOMIZATION: Background =====
        backgroundColor={isDarkMode ? "#111827" : "#ffffff"}
        
        // ===== CUSTOMIZATION: Node Appearance =====
        // Control default node size
        // nodeRelSize={nodeSize}
        // nodeVal={node => node.size || nodeSize}
        // nodeCanvasObject={paintNode} // Custom node rendering
        nodeLabel={(node: NodeObject) => `${node.label || node.id} (${node.type})`}
        nodeAutoColorBy="type"
        
        // ===== CUSTOMIZATION: Link Appearance =====
        // Control link thickness
        // linkWidth={link => link.width || linkWidth}
        linkDirectionalParticles={2}
        linkDirectionalParticleWidth={1.2}
        // Control particle speed (0-1, lower is faster)
        // linkDirectionalParticleSpeed={d => particleSpeed}
        linkColor={() => isDarkMode ? "rgba(100,100,255,0.4)" : "rgba(70,70,200,0.4)"}
        
        // ===== CUSTOMIZATION: Physics =====
        // Control node repulsion (negative values repel)
        // chargeStrength={graphCharge}
        // linkDistance={graphLinkDistance}
        
        // ===== CUSTOMIZATION: Interaction =====
        // Enable node dragging (true by default)
        // nodeFixed={node => node.fixed === true}
        // enableNodeDrag={true}
        // Control zoom behavior
        // enableZoomPanInteraction={true}
        // minZoom={0.1}
        // maxZoom={10}
        
        // ===== CUSTOMIZATION: Events =====
        onNodeClick={(node: NodeObject) => {
          alert(`Clicked on: ${node.label}`);
          // ===== CUSTOMIZATION: Advanced Node Click =====
          // Toggle node.fixed when clicking to pin/unpin:
          // node.fixed = !node.fixed;
        }}
        // onNodeHover={handleNodeHover} // For custom tooltips
        // onLinkClick={(link) => { 
        //   console.log('Clicked link:', link);
        // }}
        // onBackgroundClick={() => {
        //   // Reset any selected nodes, etc.
        // }}
      />
    </div>
  );
}