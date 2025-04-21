"use client";
import { useEffect, useState, useRef } from "react";
import ForceGraph3D from "react-force-graph-3d";
// Optional: Import THREE for advanced customization if needed
import * as THREE from 'three';

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
  // Position data for 3D space
  x?: number;
  y?: number;
  z?: number;
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

export default function ForceGraph3DComponent(): JSX.Element {
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
  const [nodeSize, setNodeSize] = useState(4); // Default node size
  const [linkWidth, setLinkWidth] = useState(1.2); // Default link width
  const [particleSpeed, setParticleSpeed] = useState(0.01); // Control particle speed
  const [graphCharge, setGraphCharge] = useState(-30); // Control node repulsion
  const [graphLinkDistance, setGraphLinkDistance] = useState(30); // Control link distance
  const [rotationSpeed, setRotationSpeed] = useState(0); // 3D specific - rotation speed
  const [showLabels, setShowLabels] = useState(true); // Control visibility of node labels
  const fgRef = useRef<any>(null); // Reference to control the ForceGraph object

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
                  ? Math.log(node.data.num_participants) * 1.2
                  : nodeSize
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

  // ===== CUSTOMIZATION: 3D Rotation Animation =====
  // Effect for constant rotation of the 3D graph
  useEffect(() => {
    if (!rotationSpeed || !fgRef.current) return;
    
    let angle = 0;
    // Store ref value in a variable to avoid issues with cleanup
    const fgRefCurrent = fgRef.current;
    
    const rotationInterval = setInterval(() => {
      if (!fgRefCurrent) return;
      
      angle += rotationSpeed;
      // Access the 3D camera and rotate it
      const camera = fgRefCurrent.camera();
      camera.position.x = Math.sin(angle) * 800;
      camera.position.z = Math.cos(angle) * 800;
      camera.lookAt(0, 0, 0);
    }, 30);
    
    return () => clearInterval(rotationInterval);
  }, [rotationSpeed]); // Remove fgRef.current from dependencies

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
  // Function to export graph data as JSON
  const exportGraph = () => {
    const dataStr = JSON.stringify(graphData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'graph-export.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // ===== CUSTOMIZATION: Capture Screenshot =====
  // 3D specific - capture current view
  const captureScreenshot = () => {
    if (!fgRef.current) return;
    
    // Get the canvas element
    const canvas = fgRef.current.renderer().domElement;
    
    // Convert canvas to data URL
    const imgData = canvas.toDataURL('image/png');
    
    // Create download link
    const link = document.createElement('a');
    link.download = 'biobank-graph-screenshot.png';
    link.href = imgData;
    link.click();
  };

  // ===== CUSTOMIZATION: 3D Custom Node Geometries =====
  // Custom 3D geometry for different node types
  const createNodeObject = (node: NodeObject) => {
    // Get the node size with a default fallback
    const size = node.size || nodeSize;
    
    // Different geometry based on node type
    let geometry;
    
    if (node.type === 'Field') {
      geometry = new THREE.SphereGeometry(size);
    } else if (node.type === 'Category') {
      geometry = new THREE.BoxGeometry(size*1.5, size*1.5, size*1.5);
    } else if (node.type === 'Root') {
      geometry = new THREE.OctahedronGeometry(size*2);
    } else if (node.type === 'Extract') {
      geometry = new THREE.TetrahedronGeometry(size*0.8);
    } else {
      geometry = new THREE.SphereGeometry(size*0.8);
    }
    
    // Create material with node color
    const material = new THREE.MeshLambertMaterial({
      color: node.color || '#999',
      transparent: true,
      opacity: 0.85
    });
    
    // Create the 3D mesh
    const mesh = new THREE.Mesh(geometry, material);
    
    // Add text sprite for label if showLabels is enabled
    if (showLabels) {
      const label = node.label || node.name || node.id;
      
      // Only add labels to fields and categories (to avoid clutter)
      if ((node.type === 'Field' || node.type === 'Category' || node.type === 'Root') && label) {
        const sprite = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: createTextTexture(label, isDarkMode ? '#ffffff' : '#000000'),
            sizeAttenuation: false
          })
        );
        
        // Position label below the node
        sprite.position.y = -size*1.5;
        // Scale label based on node importance
        const scale = node.type === 'Root' ? 8 : node.type === 'Category' ? 6 : 4;
        sprite.scale.set(scale, scale, 1);
        
        mesh.add(sprite);
      }
    }
    
    // Return the custom node object
    return mesh;
  };
  
  // Helper function to create text texture for labels
  const createTextTexture = (text: string, color: string): THREE.Texture => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) {
      return new THREE.Texture();
    }
    
    // Set canvas size proportional to text length
    const textLength = Math.min(text.length, 30);
    canvas.width = textLength * 8;
    canvas.height = 32;
    
    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set text properties
    context.font = '18px Arial, sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = color;
    
    // Draw text
    context.fillText(text, canvas.width / 2, canvas.height / 2);
    
    // Create texture from canvas
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    
    return texture;
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
          <button 
            onClick={captureScreenshot}
            className="px-2 py-1 text-xs bg-green-500 text-white rounded"
          >
            Screenshot
          </button>
          <div className="flex items-center">
            <input 
              type="checkbox" 
              checked={showFields} 
              onChange={e => setShowFields(e.target.checked)} 
              id="show-fields-3d" 
            />
            <label htmlFor="show-fields-3d" className="ml-1 text-xs">Fields</label>
          </div>
          <div className="flex items-center">
            <input 
              type="checkbox" 
              checked={showCategories} 
              onChange={e => setShowCategories(e.target.checked)} 
              id="show-categories-3d" 
            />
            <label htmlFor="show-categories-3d" className="ml-1 text-xs">Categories</label>
          </div>
          <div className="flex items-center">
            <input 
              type="checkbox" 
              checked={showExtracts} 
              onChange={e => setShowExtracts(e.target.checked)} 
              id="show-extracts-3d" 
            />
            <label htmlFor="show-extracts-3d" className="ml-1 text-xs">Extract IDs</label>
          </div>
          <div className="flex items-center">
            <input 
              type="checkbox" 
              checked={showLabels} 
              onChange={e => setShowLabels(e.target.checked)} 
              id="show-labels-3d" 
            />
            <label htmlFor="show-labels-3d" className="ml-1 text-xs">Show Labels</label>
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
          <div className="text-xs">Rotation Speed</div>
          <input 
            type="range" 
            min="0" 
            max="0.05" 
            step="0.001"
            value={rotationSpeed} 
            onChange={e => setRotationSpeed(parseFloat(e.target.value))} 
          />
        </div>
      </div>

      <ForceGraph3D
        ref={fgRef} // Reference to access the ForceGraph object
        graphData={getFilteredData()}
        width={dimensions.width}
        height={dimensions.height}
        
        // ===== CUSTOMIZATION: Background =====
        backgroundColor={isDarkMode ? "#111827" : "#ffffff"}
        
        // ===== CUSTOMIZATION: Node Appearance =====
        nodeRelSize={nodeSize}
        nodeVal={(node) => node.size || nodeSize}
        nodeLabel={(node: NodeObject) => {
          if (!node.data) return `${node.label || node.name || node.id} (${node.type})`;
          
          // Create detailed tooltip for field nodes
          if (node.type === "Field") {
            return `
              Field: ${node.label || node.name || node.id}
              ID: ${node.data.field_id || 'N/A'}
              Participants: ${node.data.num_participants?.toLocaleString() || 'N/A'}
              ${node.stats ? `Mean: ${node.stats.mean?.toFixed(4) || 'N/A'}` : ''}
              ${node.stats ? `Range: ${node.stats.min?.toFixed(2) || 'N/A'} - ${node.stats.max?.toFixed(2) || 'N/A'}` : ''}
            `;
          }
          
          return `${node.label || node.name || node.id} (${node.type})`;
        }}
        nodeAutoColorBy="type"
        // Custom THREE.js objects
        nodeThreeObject={createNodeObject}
        
        // ===== CUSTOMIZATION: Link Appearance =====
        linkWidth={(link) => link.width || linkWidth}
        linkDirectionalParticles={2}
        linkDirectionalParticleWidth={1.2}
        linkDirectionalParticleSpeed={() => particleSpeed}
        linkColor={(link) => link.color || (isDarkMode ? "rgba(100,100,255,0.4)" : "rgba(70,70,200,0.4)")}
        linkOpacity={0.8}
        
        // ===== CUSTOMIZATION: Physics =====
        // Removed physics properties that were causing issues
        
        // ===== CUSTOMIZATION: Interaction =====
        enableNodeDrag={true}
        enableNavigationControls={true}
        controlType="orbit" // 'fly' or 'orbit'
        
        // ===== CUSTOMIZATION: Events =====
        onNodeClick={(node: NodeObject) => {
          console.log("Node clicked:", node);
          
          // Focus/zoom on node
          if (fgRef.current) {
            fgRef.current.cameraPosition(
              { x: (node.x as number) || 0, y: (node.y as number) || 0, z: (node.z as number) || 0 }, // New position
              node, // Look at this node
              1000  // Transition duration in ms
            );
          }
          
          // If it's a field node, show more detailed info in console
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
        onNodeRightClick={(node: NodeObject) => {
          // Pin/unpin node
          node.fixed = !node.fixed;
          console.log(`Node ${node.fixed ? 'pinned' : 'unpinned'}: ${node.label || node.name || node.id}`);
        }}
        onBackgroundClick={() => {
          // Reset camera to default position
          if (fgRef.current) {
            fgRef.current.cameraPosition(
              { x: 0, y: 0, z: 500 }, // Default position
              { x: 0, y: 0, z: 0 }, // Look at center
              1000 // Duration in ms
            );
          }
        }}
      />
    </div>
  );
}