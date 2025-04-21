"use client";
import { useEffect, useState, useRef } from "react";
import ForceGraph2D from "react-force-graph-2d";
// Optional: Import THREE for advanced customization if needed
// import * as THREE from 'three';

// ===== CUSTOMIZATION: Node Types =====
// Define additional node types and their properties here
type NodeObject = {
  id: string;
  name?: string;
  label?: string;
  type: string;
  color?: string;
  data?: any; // To store the biobank data
  // === NODE SIZE ===
  size?: number; // to control individual node sizes
  // === NODE STATS ===
  stats?: { 
    mean: number, 
    std_dev: number, 
    min: number, 
    max: number, 
    deciles: number[] 
  };
  // Position data
  x?: number;
  y?: number;
  // Flag for fixed position
  fixed?: boolean;
};

// ===== CUSTOMIZATION: Link Types =====
// Customize link properties here
type LinkObject = {
  source: string | NodeObject;
  target: string | NodeObject;
  relation?: string;
  // === LINK WIDTH ===
  width?: number; // to control individual link widths
  // === LINK COLOR ===
  color?: string; // to control individual link colors
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // ===== CUSTOMIZATION: Add State Variables =====
  const [showFields, setShowFields] = useState(true); // For toggling node types
  const [showCategories, setShowCategories] = useState(true); // For toggling node types
  const [showExtracts, setShowExtracts] = useState(false); // For toggling extract nodes
  const [nodeSize, setNodeSize] = useState(6); // Default node size
  const [linkWidth, setLinkWidth] = useState(1.2); // Default link width
  const [particleSpeed, setParticleSpeed] = useState(0.01); // Control particle speed
  const [graphCharge, setGraphCharge] = useState(-120); // Control node repulsion (increased for better spacing)
  const [graphLinkDistance, setGraphLinkDistance] = useState(40); // Control link distance (increased for better spacing)

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
    
    // Store ref value in a variable to avoid issues with cleanup
    const currentRef = containerRef.current;
    resizeObserver.observe(currentRef);
    
    // Also handle window resize
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      if (currentRef) {
        resizeObserver.unobserve(currentRef);
      }
      window.removeEventListener('resize', updateDimensions);
    };
  }, []); // Empty dependency array

  useEffect(() => {
    // ===== CUSTOMIZATION: Data Source =====
    // Reset state for new data loading
    setLoading(true);
    setError(null);
    
    // Change the path to your JSON file here - using the UK Biobank features JSON
    fetch("/graph-data/uk_biobank_features.json")
      .then(res => {
        if (!res.ok) {
          throw new Error(`Failed to fetch data: ${res.status} ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        // Convert hierarchical tree structure to graph format
        const nodes: NodeObject[] = [];
        const links: LinkObject[] = [];
        let nodeId = 0;
        
        // Function to recursively process the tree
        const processNode = (node: any, parentId: string | null = null, depth = 0) => {
          const currentId = `node-${nodeId++}`;
          
          // Determine node type based on structure
          let nodeType;
          
          if (depth === 0) {
            nodeType = "Root";
          } else if (node.data) {
            nodeType = "Field";
          } else if (node.children) {
            nodeType = "Category";
          } else if (parentId && parentId.startsWith("extract-")) {
            nodeType = "Extract";
          } else {
            nodeType = "Other";
          }
          
          // Create node object
          const nodeObj: NodeObject = {
            id: currentId,
            name: node.name,
            label: node.name,
            type: nodeType,
            // Size based on participants if available
            size: node.data?.num_participants 
                  ? Math.log(node.data.num_participants) * 1.5 
                  : nodeSize,
            // Fix the root node in the center
            ...(depth === 0 ? { fx: 0, fy: 0 } : {})
          };
          
          // Add data if available
          if (node.data) {
            nodeObj.data = node.data;
            
            // Add statistics if available
            if (node.data.stat_mean) {
              nodeObj.stats = {
                mean: node.data.stat_mean,
                std_dev: node.data.stat_std_dev || 0,
                min: node.data.stat_minimum || 0,
                max: node.data.stat_maximum || 0,
                deciles: [
                  node.data.stat_decile_1,
                  node.data.stat_decile_2,
                  node.data.stat_decile_3,
                  node.data.stat_decile_4,
                  node.data.stat_decile_5 || 0, // This might not exist in your data
                  node.data.stat_decile_6,
                  node.data.stat_decile_7,
                  node.data.stat_decile_8,
                  node.data.stat_decile_9
                ].filter(d => d !== undefined)
              };
            }
          }
          
          nodes.push(nodeObj);
          
          // Create link to parent if it exists
          if (parentId !== null) {
            links.push({
              source: parentId,
              target: currentId,
              relation: "parent-child"
            });
          }
          
          // Process children
          if (node.children && Array.isArray(node.children)) {
            node.children.forEach((child: any) => {
              processNode(child, currentId, depth + 1);
            });
          }
          
          // Process extract_id arrays for field nodes
          if (node.data && node.data.extract_id && Array.isArray(node.data.extract_id)) {
            if (showExtracts) {
              node.data.extract_id.forEach((extractId: string, index: number) => {
                const extractNodeId = `extract-${nodeId++}`;
                nodes.push({
                  id: extractNodeId,
                  name: extractId,
                  label: extractId,
                  type: "Extract",
                  size: nodeSize * 0.75 // Smaller than regular nodes
                });
                
                links.push({
                  source: currentId,
                  target: extractNodeId,
                  relation: "extract"
                });
              });
            }
          }
          
          return currentId;
        };
        
        // Start processing from the root
        processNode(data);
        
        // Assign colors by node type
        nodes.forEach(n => {
          n.color = n.type === "Field" ? "#facc15" :  // Yellow for Field
                    n.type === "Category" ? "#38bdf8" :  // Blue for Category
                    n.type === "Root" ? "#a855f7" :  // Purple for Root
                    n.type === "Extract" ? "#10b981" : // Green for Extract
                    "#999";  // Gray for others
        });
        
        setGraphData({ nodes, links });
        setLoading(false);
      })
      .catch(error => {
        console.error("Error loading the UK Biobank data:", error);
        setError(error.message || "Failed to load data");
        setLoading(false);
      });
  }, [showExtracts, nodeSize]); // Re-run when showExtracts or nodeSize changes to update the graph

  // ===== CUSTOMIZATION: Node Filtering Function =====
  // Function to filter nodes based on type
  const getFilteredData = (): GraphData => {
    return {
      nodes: graphData.nodes.filter(node => 
        (node.type === "Field" && showFields) || 
        (node.type === "Category" && showCategories) || 
        (node.type === "Root" || 
         (node.type === "Extract" && showExtracts)
        )
      ),
      links: graphData.links.filter(link => {
        const sourceNode = graphData.nodes.find(n => n.id === (typeof link.source === 'object' ? (link.source as NodeObject).id : link.source));
        const targetNode = graphData.nodes.find(n => n.id === (typeof link.target === 'object' ? (link.target as NodeObject).id : link.target));
        
        if (!sourceNode || !targetNode) return false;
        
        return (
          ((sourceNode.type === "Field" && showFields) || 
           (sourceNode.type === "Category" && showCategories) || 
           (sourceNode.type === "Root") ||
           (sourceNode.type === "Extract" && showExtracts)) &&
          ((targetNode.type === "Field" && showFields) || 
           (targetNode.type === "Category" && showCategories) || 
           (targetNode.type === "Root") ||
           (targetNode.type === "Extract" && showExtracts))
        );
      })
    };
  };

  // ===== CUSTOMIZATION: Export Function =====
  // Uncomment to enable graph export functionality
  const exportGraph = () => {
    const dataStr = JSON.stringify(graphData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'graph-export.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // ===== CUSTOMIZATION: Custom Node Component =====
  // Custom node rendering function
  const paintNode = (node: NodeObject, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const size = node.size || nodeSize;
    const fontSize = 12/globalScale;
    const label = node.label || node.name || node.id;
    const textWidth = ctx.measureText(label).width;
    const bckgDimensions = [textWidth + 2, fontSize].map(n => n + fontSize * 0.2);
    
    // Draw node circle
    ctx.beginPath();
    ctx.fillStyle = node.color || '#999';
    ctx.arc((node.x as number) || 0, (node.y as number) || 0, size, 0, 2 * Math.PI, false);
    ctx.fill();

    // Draw node label if scale is sufficient
    if (globalScale >= 0.6) {
      ctx.fillStyle = isDarkMode ? '#ffffff' : '#000000';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `${fontSize}px Sans-Serif`;
      ctx.fillText(label, (node.x as number) || 0, ((node.y as number) || 0) + size + fontSize);
    }
    
    return true; // Skip default rendering
  };

  // ===== CUSTOMIZATION: Custom Tooltip Component =====
  // Function to handle node hover and show detailed tooltip
  const handleNodeHover = (node: NodeObject | null) => {
    if (!node) {
      // Hide tooltip
      const tooltip = document.getElementById('node-tooltip');
      if (tooltip) {
        tooltip.style.opacity = '0';
      }
      return;
    }
    
    // Create or update tooltip
    let tooltip = document.getElementById('node-tooltip');
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.id = 'node-tooltip';
      tooltip.style.position = 'absolute';
      tooltip.style.padding = '10px';
      tooltip.style.borderRadius = '4px';
      tooltip.style.fontSize = '12px';
      tooltip.style.zIndex = '10';
      tooltip.style.pointerEvents = 'none';
      tooltip.style.transition = 'opacity 0.3s';
      document.body.appendChild(tooltip);
    }
    
    const label = node.label || node.name || node.id;
    
    // Create tooltip content based on node type
    let tooltipHTML = `<div><strong>${label}</strong> (${node.type})</div>`;
    
    if (node.type === "Field" && node.data) {
      // Add field details
      tooltipHTML += `
        <div>Field ID: ${node.data.field_id || 'N/A'}</div>
        <div>Title: ${node.data.title || 'N/A'}</div>
        <div>Participants: ${node.data.num_participants?.toLocaleString() || 'N/A'}</div>
      `;
      
      // Add statistics if available
      if (node.stats) {
        tooltipHTML += `
          <hr style="margin: 5px 0; border-color: ${isDarkMode ? '#666' : '#ddd'}" />
          <div>Mean: ${node.stats.mean?.toFixed(4) || 'N/A'}</div>
          <div>StdDev: ${node.stats.std_dev?.toFixed(4) || 'N/A'}</div>
          <div>Range: ${node.stats.min?.toFixed(2) || 'N/A'} - ${node.stats.max?.toFixed(2) || 'N/A'}</div>
        `;
      }
    } else if (node.type === "Category") {
      // Add category information
      tooltipHTML += `<div>Parent category</div>`;
    } else if (node.type === "Extract") {
      // Add extract information
      tooltipHTML += `<div>Data extract identifier</div>`;
    }
    
    tooltip.innerHTML = tooltipHTML;
    tooltip.style.backgroundColor = isDarkMode ? '#1e293b' : '#f8fafc';
    tooltip.style.color = isDarkMode ? '#f8fafc' : '#1e293b';
    tooltip.style.boxShadow = isDarkMode ? '0 0 15px rgba(0,0,0,0.5)' : '0 0 15px rgba(0,0,0,0.2)';
    tooltip.style.opacity = '1';
    
    // Position tooltip near mouse
    const x = ((node.x as number) || 0) + dimensions.width / 2;
    const y = ((node.y as number) || 0) + dimensions.height / 2;
    tooltip.style.left = `${x + 15}px`;
    tooltip.style.top = `${y - 15}px`;
  };

  return (
    <div ref={containerRef} className="w-full h-full" style={{ position: 'relative', minHeight: '500px' }}>
      {/* Loading and error states */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-800/80 z-50">
          <div className="text-lg font-medium">Loading UK Biobank data...</div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 dark:bg-gray-800/90 z-50 p-4">
          <div className="text-lg font-medium text-red-500 mb-2">Error loading data</div>
          <div className="text-sm text-gray-700 dark:text-gray-300 mb-4">{error}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400 max-w-md text-center">
            Make sure the JSON file exists at /graph-data/uk_biobank_features.json
            or update the path in the component.
          </div>
        </div>
      )}
      
      {/* ===== CUSTOMIZATION: Control Panel UI ===== */}
      <div className="absolute top-2 right-2 z-10 p-2 bg-white/80 dark:bg-gray-800/80 rounded shadow">
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
              checked={showExtracts} 
              onChange={e => setShowExtracts(e.target.checked)} 
              id="show-extracts" 
            />
            <label htmlFor="show-extracts" className="ml-1 text-xs">Extract IDs</label>
          </div>
          <div className="text-xs">Node Size</div>
          <input 
            type="range" 
            min="1" 
            max="20" 
            value={nodeSize} 
            onChange={e => setNodeSize(parseInt(e.target.value))} 
          />
          <div className="text-xs">Link Distance</div>
          <input 
            type="range" 
            min="10" 
            max="100" 
            value={graphLinkDistance} 
            onChange={e => setGraphLinkDistance(parseInt(e.target.value))} 
          />
        </div>
      </div>

      <ForceGraph2D
        graphData={getFilteredData()}
        width={dimensions.width}
        height={dimensions.height}
        
        // ===== CUSTOMIZATION: Background =====
        backgroundColor={isDarkMode ? "#111827" : "#ffffff"}
        
        // ===== CUSTOMIZATION: Node Appearance =====
        nodeRelSize={nodeSize}
        nodeVal={(node) => node.size || nodeSize}
        nodeCanvasObject={paintNode} // Custom node rendering
        nodeLabel={() => ''} // We use custom tooltip instead
        
        // ===== CUSTOMIZATION: Link Appearance =====
        linkWidth={(link) => link.width || linkWidth}
        linkDirectionalParticles={3}
        linkDirectionalParticleWidth={1.5}
        linkDirectionalParticleSpeed={() => particleSpeed}
        linkColor={(link) => link.color || (isDarkMode ? "rgba(100,100,255,0.4)" : "rgba(70,70,200,0.4)")}
        linkCurvature={0.5} // Increased curvature to prevent edge overlap
        
        // ===== CUSTOMIZATION: Physics =====
        // Using only parameters that are definitely supported in the library
        cooldownTime={15000}
        
        // ===== CUSTOMIZATION: Interaction =====
        enableNodeDrag={true}
        enableZoomInteraction={true}
        enablePanInteraction={true}
        minZoom={0.1}
        maxZoom={10}
        
        // ===== CUSTOMIZATION: Events =====
        onNodeHover={handleNodeHover}
        onNodeClick={(node: NodeObject) => {
          console.log("Node clicked:", node);
          // Toggle fixed status to pin/unpin
          node.fixed = !node.fixed;
          
          // Set appropriate fields in tooltip
          handleNodeHover(node);
          
          // If it's a field node, could show more detailed info
          if (node.type === "Field" && node.data) {
            const fieldDetails = {
              fieldId: node.data.field_id,
              title: node.data.title,
              instanced: node.data.instanced,
              arrayed: node.data.arrayed,
              sexed: node.data.sexed,
              debut: node.data.debut,
              version: node.data.version,
              participants: node.data.num_participants,
              stats: {
                mean: node.data.stat_mean,
                stdDev: node.data.stat_std_dev,
                min: node.data.stat_minimum,
                max: node.data.stat_maximum,
                deciles: {
                  "10%": node.data.stat_decile_1,
                  "20%": node.data.stat_decile_2,
                  "30%": node.data.stat_decile_3,
                  "40%": node.data.stat_decile_4,
                  "60%": node.data.stat_decile_6,
                  "70%": node.data.stat_decile_7,
                  "80%": node.data.stat_decile_8,
                  "90%": node.data.stat_decile_9
                }
              },
              extracts: node.data.extract_id
            };
            console.log("Field details:", fieldDetails);
          }
        }}
        onLinkClick={(link: LinkObject) => { 
          console.log('Clicked link:', link);
        }}
        onBackgroundClick={() => {
          // Hide tooltip
          const tooltip = document.getElementById('node-tooltip');
          if (tooltip) {
            tooltip.style.opacity = '0';
          }
        }}
      />
    </div>
  );
}