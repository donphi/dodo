import { useEffect, useState, useRef, useCallback } from "react";
import * as d3 from "d3";

// Define types for our tree data structure
type TreeNodeData = {
  name: string;
  data?: {
    field_id?: number | string;
    title?: string;
    num_participants?: number;
    extract_id?: string[];
    [key: string]: any; // For other properties
  };
  children?: TreeNodeData[];
  size?: number;
};

// Use type instead of interface to avoid issues with recursive types
type TreeNode = d3.HierarchyNode<TreeNodeData>;

export default function ForceGraph2D() {
  const [data, setData] = useState<TreeNodeData | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for the tooltip
  const [tooltipData, setTooltipData] = useState<TreeNodeData | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  
  // Configuration parameters with good defaults for healthcare data
  const nodeMinSize = 3;
  const nodeMaxSize = 10;
  const linkOpacity = 0.6;
  const linkWidth = 1;
  const chargeStrength = -120;
  const centerForce = 0.1;
  const collideStrength = 0.7;
  const linkDistance = 60;

  // Check for dark mode
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
    
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

  // Load data
  useEffect(() => {
    setLoading(true);
    setError(null);
    
    fetch("/graph-data/uk_biobank_features.json")
      .then(res => {
        if (!res.ok) {
          throw new Error(`Failed to fetch data: ${res.status} ${res.statusText}`);
        }
        return res.json();
      })
      .then((fetchedData: TreeNodeData) => {
        setData(fetchedData);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error loading data:", error);
        setError(error.message || "Failed to load data");
        setLoading(false);
      });
  }, []);

  // Prepare data for visualization
  const prepareGraphData = useCallback((rootNode: TreeNodeData) => {
    // Process the data to extract nodes and links
    const nodes: {
      id: string;
      name: string;
      color: string;
      size: number;
      type: string;
      data?: any;
    }[] = [];
    
    const links: {
      source: string;
      target: string;
      value: number;
    }[] = [];
    
    // Helper function to recursively process nodes
    const processNode = (node: TreeNodeData, parentId: string | null = null) => {
      // Create a unique ID - ensure it's a string
      const nodeId = node.data?.field_id?.toString() || `node-${nodes.length}`;
      
      // Determine node type
      let nodeType = 'default';
      let nodeColor = '#94a3b8'; // Default gray
      
      if (parentId === null) {
        nodeType = 'root';
        nodeColor = '#a855f7'; // Purple for root
      } else if (node.data?.field_id) {
        nodeType = 'field';
        nodeColor = '#facc15'; // Yellow for field nodes
      } else if (node.children && node.children.length > 0) {
        nodeType = 'category';
        nodeColor = '#38bdf8'; // Blue for category nodes
      }
      
      // Calculate node size based on number of participants (if available)
      // or number of children (for categories) with safety checks
      let nodeSize = nodeMinSize;
      
      if (node.data?.num_participants) {
        // Parse and validate num_participants to ensure it's a number
        let participants = 0;
        
        if (typeof node.data.num_participants === 'number') {
          participants = node.data.num_participants;
        } else if (typeof node.data.num_participants === 'string') {
          // Try to parse the string as a number
          participants = parseInt(node.data.num_participants, 10);
          
          // If parsing failed, use default size
          if (isNaN(participants)) {
            participants = 0;
          }
        }
        
        // Only apply sqrt scaling if we have a valid positive number
        if (participants > 0) {
          nodeSize = Math.sqrt(participants) / 50;
          // Clamp to reasonable range
          nodeSize = Math.max(nodeMinSize, Math.min(nodeMaxSize, nodeSize));
        }
      } else if (node.children) {
        // For category nodes, size based on number of children
        nodeSize = Math.min(nodeMaxSize, nodeMinSize + node.children.length / 10);
      }
      
      // Final safety check to ensure nodeSize is a valid number
      if (isNaN(nodeSize) || nodeSize <= 0) {
        nodeSize = nodeMinSize;
      }
      
      // Add node to nodes array
      nodes.push({
        id: nodeId,
        name: node.name,
        color: nodeColor,
        size: nodeSize,
        type: nodeType,
        data: node.data
      });
      
      // Add link to parent if not root
      if (parentId !== null) {
        links.push({
          source: parentId,
          target: nodeId,
          value: 1
        });
      }
      
      // Process children recursively
      if (node.children && node.children.length > 0) {
        node.children.forEach(child => {
          processNode(child, nodeId);
        });
      }
    };
    
    // Start processing from root
    processNode(rootNode);
    
    return { nodes, links };
  }, [nodeMinSize, nodeMaxSize]);

  // Create and update visualization
  useEffect(() => {
    if (!data || loading || error || !containerRef.current) return;
    
    // Clear any existing SVG
    if (containerRef.current) {
      const existingSvg = containerRef.current.querySelector('svg');
      if (existingSvg) {
        existingSvg.remove();
      }
    }

    // Get container dimensions
    const width = containerRef.current.clientWidth || 1000;
    const height = containerRef.current.clientHeight || 800;
    
    // Prepare data for force layout
    const { nodes, links } = prepareGraphData(data);
    
    // Double-check that all nodes have valid sizes
    nodes.forEach(node => {
      if (isNaN(node.size) || node.size <= 0) {
        console.warn(`Invalid size for node ${node.id}: ${node.size}. Setting to default.`);
        node.size = nodeMinSize;
      }
    });
    
    // Create SVG element
    const svg = d3.create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto;")
      .attr("class", isDarkMode ? "dark-theme" : "light-theme");
    
    // Create zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 5])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });
    
    svg.call(zoom as any);
    
    // Create a group for all elements
    const g = svg.append("g");
    
    // Initialize at a slightly zoomed out view centered on the visualization
    svg.call(
      zoom.transform,
      d3.zoomIdentity.translate(width / 2, height / 2).scale(0.8)
    );
    
    // Create the force simulation
    const simulation = d3.forceSimulation(nodes as any)
      .force("link", d3.forceLink(links)
        .id((d: any) => d.id)
        .distance(linkDistance)
        .strength(0.6))
      .force("charge", d3.forceManyBody().strength(chargeStrength))
      .force("center", d3.forceCenter(0, 0).strength(centerForce))
      .force("collide", d3.forceCollide().radius((d: any) => d.size * 2).strength(collideStrength))
      .force("x", d3.forceX().strength(0.05))
      .force("y", d3.forceY().strength(0.05));
    
    // Create links
    const link = g.append("g")
      .attr("stroke", isDarkMode ? "#475569" : "#94a3b8")
      .attr("stroke-opacity", linkOpacity)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", linkWidth);
    
    // Create a gradient for node strokes
    const defs = svg.append("defs");
    
    // Add a subtle radial gradient for each node type
    const createGradient = (id: string, color: string) => {
      const gradient = defs.append("radialGradient")
        .attr("id", id)
        .attr("cx", "50%")
        .attr("cy", "50%")
        .attr("r", "50%")
        .attr("fx", "50%")
        .attr("fy", "50%");
      
      gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", color);
      
      gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", d3.color(color)?.darker(0.8) as any);
      
      return id;
    };
    
    // Create gradients for different node types
    createGradient("node-root-gradient", "#a855f7");  // Purple gradient for root
    createGradient("node-field-gradient", "#facc15"); // Yellow gradient for fields
    createGradient("node-category-gradient", "#38bdf8"); // Blue gradient for categories
    
    // Create node group for better organization of elements
    const nodeGroup = g.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .attr("class", (d: any) => `node node-${d.type}`)
      .call(drag(simulation) as any);
    
    // Create node circles with appropriate styling, with safety checks for each node
    nodeGroup.append("circle")
      .attr("r", (d: any) => {
        // Extra safety check
        if (isNaN(d.size) || d.size <= 0) {
          console.warn(`Circle with invalid size: ${d.id}, ${d.size}`);
          return nodeMinSize;
        }
        return d.size;
      })
      .attr("fill", (d: any) => {
        if (d.type === 'root') return "url(#node-root-gradient)";
        if (d.type === 'field') return "url(#node-field-gradient)";
        if (d.type === 'category') return "url(#node-category-gradient)";
        return d.color;
      })
      .attr("stroke", (d: any) => {
        const color = d3.color(d.color);
        return color ? color.darker(0.5) : "#000";
      })
      .attr("stroke-width", 1)
      .style("cursor", "pointer")
      .on("click", function(event, d: any) {
        event.stopPropagation();
        
        // Skip if it's the root node
        if (d.type === 'root') return;
        
        // Show field data in tooltip for field nodes
        if (d.type === 'field' && d.data) {
          setTooltipData({
            name: d.name,
            data: d.data
          });
          
          // Position the tooltip near the node
          const nodePosition = d3.pointer(event, containerRef.current!);
          setTooltipPosition({
            x: nodePosition[0] + 15,
            y: nodePosition[1]
          });
        }
      });
    
    // Add labels for important nodes
    nodeGroup.append("text")
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .attr("font-size", (d: any) => {
        // Safety check for node size
        const size = isNaN(d.size) || d.size <= 0 ? nodeMinSize : d.size;
        return Math.max(8, Math.min(size * 0.8, 12));
      })
      .attr("opacity", (d: any) => {
        // Safety check for node size 
        const size = isNaN(d.size) || d.size <= 0 ? nodeMinSize : d.size;
        
        // Show labels for root, categories, and larger field nodes
        if (d.type === 'root') return 1;
        if (d.type === 'category') return 1;
        if (d.type === 'field' && size > nodeMinSize + 1) return 0.8;
        return 0; // Hide labels for small nodes to reduce visual clutter
      })
      .attr("pointer-events", "none")
      .attr("fill", isDarkMode ? "#f8fafc" : "#1e293b")
      .attr("stroke", isDarkMode ? "#1e1e1e" : "#ffffff")
      .attr("stroke-width", 0.3)
      .attr("paint-order", "stroke")
      .text((d: any) => {
        // Truncate long names
        const name = d.name;
        // Safety check for node size
        const size = isNaN(d.size) || d.size <= 0 ? nodeMinSize : d.size;
        const maxLength = d.type === 'root' ? 30 : Math.floor(size * 2);
        return name.length > maxLength ? name.substring(0, maxLength - 3) + "..." : name;
      })
      .each(function(d: any) {
        // For non-root nodes, add dynamic positioning to avoid overlaps
        if (d.type !== 'root') {
          const textElement = d3.select(this);
          // Safety check - some browsers might not support this method
          try {
            const textWidth = (this as SVGTextElement).getComputedTextLength();
            // Safety check for node size
            const size = isNaN(d.size) || d.size <= 0 ? nodeMinSize : d.size;
            
            // If text is wider than node, position it next to node instead
            if (textWidth > size * 2) {
              textElement
                .attr("text-anchor", "start")
                .attr("x", size + 5)
                .attr("opacity", 0); // Start hidden, show on hover
            }
          } catch (e) {
            // Fallback if getComputedTextLength fails
            textElement
              .attr("opacity", 0.6);
          }
        }
      });
    
    // Add hover effects for nodes
    nodeGroup
      .on("mouseover", function(event, d: any) {
        // Highlight the node
        d3.select(this).select("circle")
          .transition()
          .duration(200)
          .attr("r", (d: any) => {
            // Safety check
            const size = isNaN(d.size) || d.size <= 0 ? nodeMinSize : d.size;
            return size * 1.2;
          })
          .attr("stroke-width", 2);
        
        // Always show the text label on hover
        d3.select(this).select("text")
          .transition()
          .duration(200)
          .attr("opacity", 1);
        
        // Highlight connected links and nodes
        link.transition()
          .duration(200)
          .attr("stroke-opacity", (l: any) => {
            return (l.source.id === d.id || l.target.id === d.id) ? 0.9 : 0.1;
          })
          .attr("stroke-width", (l: any) => {
            return (l.source.id === d.id || l.target.id === d.id) ? 2 : linkWidth;
          })
          .attr("stroke", (l: any) => {
            return (l.source.id === d.id || l.target.id === d.id) ? "#4f46e5" : (isDarkMode ? "#475569" : "#94a3b8");
          });
        
        // Highlight connected nodes
        nodeGroup.transition()
          .duration(200)
          .style("opacity", (o: any) => {
            // Check if this node is connected to the hovered node
            const isConnected = links.some(link => 
              (link.source === d.id && link.target === o.id) || 
              (link.target === d.id && link.source === o.id)
            );
            
            return isConnected || o.id === d.id ? 1 : 0.3;
          });
      })
      .on("mouseout", function() {
        // Restore node appearance
        nodeGroup.transition()
          .duration(200)
          .style("opacity", 1);
        
        d3.select(this).select("circle")
          .transition()
          .duration(200)
          .attr("r", (d: any) => {
            // Safety check
            return isNaN(d.size) || d.size <= 0 ? nodeMinSize : d.size;
          })
          .attr("stroke-width", 1);
        
        // Restore text visibility based on original rules
        nodeGroup.select("text")
          .transition()
          .duration(200)
          .attr("opacity", (d: any) => {
            // Safety check
            const size = isNaN(d.size) || d.size <= 0 ? nodeMinSize : d.size;
            
            if (d.type === 'root') return 1;
            if (d.type === 'category') return 1;
            if (d.type === 'field' && size > nodeMinSize + 1) return 0.8;
            return 0;
          });
        
        // Restore all links
        link.transition()
          .duration(200)
          .attr("stroke-opacity", linkOpacity)
          .attr("stroke-width", linkWidth)
          .attr("stroke", isDarkMode ? "#475569" : "#94a3b8");
      });
    
    // Add drag behavior for nodes
    function drag(simulation: d3.Simulation<any, undefined>) {
      function dragstarted(event: any) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }
      
      function dragged(event: any) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }
      
      function dragended(event: any) {
        if (!event.active) simulation.alphaTarget(0);
        // Keep nodes fixed where user drops them for better stability
        // event.subject.fx = null;
        // event.subject.fy = null;
      }
      
      return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }
    
    // Update positions on simulation tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);
      
      nodeGroup.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
      
      // Update tooltip position if it's visible
      if (tooltipData && tooltipData.data?.field_id) {
        const matchingNode = nodes.find(n => n.data?.field_id === tooltipData.data?.field_id);
        if (matchingNode && 'x' in matchingNode && 'y' in matchingNode) {
          const nodeX = (matchingNode as any).x;
          const nodeY = (matchingNode as any).y;
          
          // Safety check for NaN position values
          if (!isNaN(nodeX) && !isNaN(nodeY)) {
            setTooltipPosition({
              x: nodeX + width/2 + 20,
              y: nodeY + height/2
            });
          }
        }
      }
    });
    
    // Gradually cool down the simulation
    setTimeout(() => {
      simulation.alpha(0.1).alphaDecay(0.02);
    }, 2000);
    
    // Add a background rect for uniform click handling
    const backgroundRect = svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "transparent")
      .style("cursor", "default")
      .on("click", () => {
        // Close tooltip when clicking background
        setTooltipData(null);
      });
    
    // Insert behind other elements
    backgroundRect.lower();
    
    // Attach to DOM
    containerRef.current.appendChild(svg.node()!);
    svgRef.current = svg.node();
    
    // Clean up on unmount
    return () => {
      simulation.stop();
      if (svgRef.current && containerRef.current?.contains(svgRef.current)) {
        containerRef.current.removeChild(svgRef.current);
      }
    };
  }, [data, loading, error, isDarkMode, prepareGraphData, chargeStrength, centerForce, collideStrength, linkDistance, linkOpacity, linkWidth]);

  // Close tooltip on container click
  const closeTooltip = () => {
    setTooltipData(null);
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative bg-white dark:bg-gray-900"
      style={{ height: "100%" }}
      onClick={closeTooltip}
    >
      {/* Loading state */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-800/80 z-50">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-300">Loading biobank data...</div>
          </div>
        </div>
      )}
      
      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 dark:bg-gray-800/90 z-50 p-4">
          <div className="text-lg font-medium text-red-500 mb-2">Error loading data</div>
          <div className="text-sm text-gray-700 dark:text-gray-300 mb-4">{error}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400 max-w-md text-center">
            Make sure the JSON file exists at /graph-data/uk_biobank_features.json
          </div>
        </div>
      )}
      
      {/* Field Data Tooltip */}
      {tooltipData && tooltipData.data && (
        <div
          className="absolute bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            maxWidth: '300px',
            transform: 'translate(0, -50%)',
            pointerEvents: 'auto'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">{tooltipData.name}</h3>
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeTooltip();
              }}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>
          
          <div className="text-xs space-y-1 text-gray-700 dark:text-gray-300">
            {tooltipData.data.field_id !== undefined && (
              <div><span className="font-semibold">Field ID:</span> {tooltipData.data.field_id}</div>
            )}
            {tooltipData.data.title && (
              <div><span className="font-semibold">Title:</span> {tooltipData.data.title}</div>
            )}
            {tooltipData.data.instanced !== undefined && (
              <div><span className="font-semibold">Instanced:</span> {tooltipData.data.instanced}</div>
            )}
            {tooltipData.data.arrayed !== undefined && (
              <div><span className="font-semibold">Arrayed:</span> {tooltipData.data.arrayed}</div>
            )}
            {tooltipData.data.sexed !== undefined && (
              <div><span className="font-semibold">Sexed:</span> {tooltipData.data.sexed}</div>
            )}
            {tooltipData.data.debut && (
              <div><span className="font-semibold">Debut:</span> {tooltipData.data.debut}</div>
            )}
            {tooltipData.data.version && (
              <div><span className="font-semibold">Version:</span> {tooltipData.data.version}</div>
            )}
            {tooltipData.data.num_participants !== undefined && (
              <div><span className="font-semibold">Participants:</span> {tooltipData.data.num_participants.toLocaleString()}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}