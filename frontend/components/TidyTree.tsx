"use client";
import React, { useEffect, useState, useRef, MouseEvent } from "react";
import * as d3 from "d3";
import TidyTreeButtons from "./TidyTreeButtons"; // Import our custom TidyTreeButtons component

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

export default function TidyTree() {
  const [data, setData] = useState<TreeNodeData | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 928, height: 600 });
  const [treeHeight, setTreeHeight] = useState(600); // Start with a reasonable height
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for the tooltip
  const [tooltipData, setTooltipData] = useState<TreeNodeData | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0, translateX: 0, translateY: 0 });
  
  // Configuration options - MODIFIED: increased node size and decreased link opacity slightly
  const [nodeSize, setNodeSize] = useState(3.5);
  const [showLabels, setShowLabels] = useState(true);
  const [linkOpacity, setLinkOpacity] = useState(0.36);
  const [linkWidth, setLinkWidth] = useState(1.5);
  const [showCategories, setShowCategories] = useState(true);
  // Track which branches are expanded (showing their fields)
  // Initialize with an empty set - we'll populate it when data loads
  const [expandedBranches, setExpandedBranches] = useState<Set<string>>(new Set());
  
  // Flag to track if we've initialized the expanded branches
  const [expandedBranchesInitialized, setExpandedBranchesInitialized] = useState(false);

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
      width = width || 928;
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
  }, []);

  // Load data and create the tree visualization
  useEffect(() => {
    // Reset state for new data loading
    setLoading(true);
    setError(null);
    
    // Fetch the UK Biobank features JSON
    fetch("/graph-data/uk_biobank_features.json")
      .then(res => {
        if (!res.ok) {
          throw new Error(`Failed to fetch data: ${res.status} ${res.statusText}`);
        }
        return res.json();
      })
      .then((fetchedData: TreeNodeData) => {
        setData(fetchedData);
        
        // Initialize only category nodes (blue nodes) as expanded by default
        // Field ID nodes (yellow nodes) will be completely hidden until a category is clicked
        if (!expandedBranchesInitialized) {
          const allPaths = new Set<string>();
          
          // Helper function to collect ONLY category paths and exclude ALL field nodes
          const collectCategoryPaths = (node: TreeNodeData, path: string[] = []): void => {
            const currentPath = [...path, node.name];
            const currentPathStr = currentPath.join('/');
            
            // Check if this is a field node
            const isFieldNode = node.data &&
                               node.data.field_id !== undefined;
            
            // Only add this path to the set if it's not a field node
            // AND if it doesn't have any field nodes as direct children
            if (!isFieldNode) {
              // Check if this node has any field nodes as direct children
              const hasFieldNodeChildren = node.children && 
                                          node.children.some(child => 
                                            child.data && 
                                            child.data.field_id !== undefined);
              
              // Only add to expandedBranches if it doesn't have field node children
              // This will prevent the parent categories of field nodes from being expanded
              if (!hasFieldNodeChildren) {
                allPaths.add(currentPathStr);
              }
            }
            
            // Process children if they exist
            if (node.children && node.children.length > 0) {
              node.children.forEach(child => {
                // Only recurse into category nodes, not field nodes
                // Field nodes have data with field_id
                const isFieldNode = child.data &&
                                   child.data.field_id !== undefined;
                
                // Only process category nodes (blue nodes)
                // Skip field nodes (yellow nodes) completely
                if (!isFieldNode) {
                  collectCategoryPaths(child, currentPath);
                }
                // Do NOT add field nodes to expanded branches
              });
            }
          };
          
          // Start collecting paths from the root
          collectCategoryPaths(fetchedData);
          
          // Update the expanded branches state
          setExpandedBranches(allPaths);
          setExpandedBranchesInitialized(true);
        }
        
        setLoading(false);
      })
      .catch(error => {
        console.error("Error loading the UK Biobank data:", error);
        setError(error.message || "Failed to load data");
        setLoading(false);
      });
  }, [expandedBranchesInitialized]);

  // Create and update the tree visualization when data or dimensions change
  useEffect(() => {
    if (!data || loading || error) return;
    
    // Clear any existing SVG
    if (containerRef.current) {
      const existingSvg = containerRef.current.querySelector('svg');
      if (existingSvg) {
        existingSvg.remove();
      }
    }

    // Filter the data based on expandedBranches and showCategories
    const filterData = (node: TreeNodeData, path: string[] = []): TreeNodeData | null => {
      if (!node) return null;
      
      // Create a new node to avoid mutating the original
      const newNode: TreeNodeData = { ...node };
      const currentPath = [...path, node.name];
      const currentPathStr = currentPath.join('/');
      
      // Check if this is a field node (yellow node)
      const isFieldNode = node.data && node.data.field_id !== undefined;
      
      // IMMEDIATELY return null for field nodes unless their direct parent is expanded
      // This is the most aggressive way to ensure NO yellow nodes appear initially
      if (isFieldNode) {
        const parentPath = currentPath.slice(0, -1).join('/');
        if (!expandedBranches.has(parentPath)) {
          return null;
        }
      }
      
      // Filter children if they exist
      if (node.children && node.children.length > 0) {
        // Check if this branch is collapsed (not expanded)
        // Skip processing children if this branch is collapsed, unless it's the root node
        if (currentPath.length > 1 && !expandedBranches.has(currentPathStr)) {
          // This branch is collapsed, don't include any children
          delete newNode.children;
          return newNode;
        }
        
        // First, aggressively filter out all field nodes
        // Only keep field nodes if their direct parent path is expanded
        const filteredChildren = node.children
          .map(child => {
            // Check if this child is a field node
            const isChildFieldNode = child.data && child.data.field_id !== undefined;
            
            // For field nodes, ONLY include them if their direct parent is expanded
            if (isChildFieldNode) {
              // This is the key check - only show field nodes if their direct parent is expanded
              return expandedBranches.has(currentPathStr) ? child : null;
            }
            
            // For category nodes, check if showCategories is true
            const isChildCategory = child.children && child.children.length > 0;
            if (isChildCategory && !showCategories) return null;
            
            // Recursively filter this child's children
            return filterData(child, currentPath);
          })
          .filter(Boolean) as TreeNodeData[]; // Remove null entries
        
        // Only set children if there are any after filtering
        if (filteredChildren.length > 0) {
          newNode.children = filteredChildren;
        } else {
          delete newNode.children;
        }
      }
      
      return newNode;
    };
    
    // Apply the filter
    const filteredData = filterData(data);
    if (!filteredData) return;

    // Create the tree layout
    const width = dimensions.width;
    
    // Create a hierarchy from the data
    const root = d3.hierarchy(filteredData);
    
    // Compute the tree height; this approach will allow the height of the
    // SVG to scale according to the breadth (width) of the tree layout.
    const dx = 10;
    const dy = width / (root.height + 1);
    
    // Create a tree layout with appropriate horizontal spacing
    const tree = d3.tree<TreeNodeData>().nodeSize([dx, dy * 0.9]); // Reduce horizontal spacing for a more compact view
    
    // Sort the tree and apply the layout
    root.sort((a, b) => d3.ascending(a.data.name, b.data.name));
    tree(root);
    
    // Compute the extent of the tree. Note that x and y are swapped here
    // because in the tree layout, x is the breadth, but when displayed, the
    // tree extends right rather than down.
    let x0 = Infinity;
    let x1 = -x0;
    root.each(d => {
      // Ensure d.x is a number before comparison
      const nodeX = typeof d.x === 'number' ? d.x : 0;
      if (nodeX > x1) x1 = nodeX;
      if (nodeX < x0) x0 = nodeX;
    });
    
    // Compute the adjusted height of the tree based on the actual visible nodes
    // Calculate the exact height needed for the current tree structure
    const calculatedTreeHeight = x1 - x0 + dx * 4; // Add some padding (dx * 4) but no minimum
    
    // Update the tree height state
    setTreeHeight(calculatedTreeHeight);
    
    // Create the SVG element - make it tall enough to show the entire tree
    const svg = d3.create("svg")
      .attr("width", width)
      .attr("height", calculatedTreeHeight)
      .attr("viewBox", [-dy / 3, x0 - dx, width, calculatedTreeHeight])
      .attr("style", "max-width: 100%; font: 10px sans-serif;")
      .attr("class", isDarkMode ? "dark-theme" : "light-theme");
    
    // Add links between nodes
    const link = svg.append("g")
      .attr("fill", "none")
      .attr("stroke", isDarkMode ? "#666" : "#555")
      .attr("stroke-opacity", linkOpacity)
      .attr("stroke-width", linkWidth)
      .selectAll("path")
      .data(root.links())
      .join("path")
        .attr("class", "link") // Add class for easier selection
        .attr("d", d3.linkHorizontal<d3.HierarchyLink<TreeNodeData>, d3.HierarchyNode<TreeNodeData>>()
          .x(d => typeof d.y === 'number' ? d.y : 0) // Ensure y is always a number
          .y(d => typeof d.x === 'number' ? d.x : 0)); // Ensure x is always a number
    
    // Add nodes
    const node = svg.append("g")
      .attr("stroke-linejoin", "round")
      .attr("stroke-width", 3)
      .selectAll("g")
      .data(root.descendants())
      .join("g")
        .attr("transform", d => `translate(${typeof d.y === 'number' ? d.y : 0},${typeof d.x === 'number' ? d.x : 0})`);
    
    // Helper function to build path for a node
    const getNodePath = (node: any): string => {
      const path: string[] = [];
      let current = node;
      while (current) {
        path.unshift(current.data.name);
        current = current.parent;
      }
      return path.join('/');
    };

    // Create a group for each node to hold both circle and potential indicator
    const nodeGroup = node.append("g")
      .attr("class", d => {
        const isCategory = d.children && d.depth > 0;
        const isField = d.data.data && Object.keys(d.data.data).length > 0;
        return `node ${isCategory ? 'category-node' : ''} ${isField ? 'field-node' : ''}`;
      })
      .style("cursor", d => (d.children && d.depth > 0) || (d.data.data && Object.keys(d.data.data).length > 0) ? "pointer" : "default")
      .on("click", (event, d) => {
        event.stopPropagation(); // Prevent event bubbling
        
        // Handle clicks on any node except root
        if (d.depth > 0) {
          const path = getNodePath(d);
          const isFieldNode = d.data.data && Object.keys(d.data.data).length > 0 && (!d.children || d.children.length === 0);
          
          // Only toggle expansion for category nodes, not field nodes
          if (!isFieldNode) {
            // Log the current state for debugging
            console.log("Clicked path:", path);
            console.log("Current expanded branches:", Array.from(expandedBranches));
            console.log("Is currently expanded:", expandedBranches.has(path));
            
            // Toggle this branch's expanded state
            setExpandedBranches(prev => {
              const next = new Set(prev);
              if (next.has(path)) {
                console.log("Removing path:", path);
                next.delete(path);
              } else {
                console.log("Adding path:", path);
                next.add(path);
              }
              return next;
            });
            
            // Force an immediate recalculation of the tree height
            // This will ensure the container height updates right after clicking
            setTimeout(() => {
              if (svgRef.current) {
                // Get the current SVG's bounding box
                const bbox = svgRef.current.getBBox();
                // Calculate a more accurate height based on the actual content
                const newHeight = bbox.height + 50; // Add some padding
                console.log("Recalculated tree height after click:", newHeight);
                setTreeHeight(newHeight);
              }
            }, 50); // Small delay to allow the DOM to update
          }
          
          // For field nodes with data, show details
          if (isFieldNode) {
            // Show field statistics in a tooltip
            console.log("Field clicked:", d.data.name, d.data.data);
            
            // Set tooltip data first
            setTooltipData(d.data);
            
            // Calculate position for tooltip relative to the SVG
            const nodeX = typeof d.y === 'number' ? d.y : 0;
            const nodeY = typeof d.x === 'number' ? d.x : 0;
            
            // Get SVG's CTM (Current Transformation Matrix)
            if (svgRef.current) {
              // Get the SVG element and its bounding client rect
              const svgElement = svgRef.current;
              const svgRect = svgElement.getBoundingClientRect();
              
              // Get the CTM that converts from SVG space to screen space
              const ctm = svgElement.getScreenCTM();
              
              if (ctm) {
                // Convert node position from SVG space to screen space
                const svgPoint = svgElement.createSVGPoint();
                svgPoint.x = nodeX;
                svgPoint.y = nodeY;
                
                // Apply the current transformation
                const transformedPoint = svgPoint.matrixTransform(ctm);
                
                // Convert from screen space to container space
                const containerRect = containerRef.current?.getBoundingClientRect();
                if (containerRef.current && containerRect) {
                  const { scrollLeft, scrollTop } = containerRef.current;
                  const relativeX = transformedPoint.x - containerRect.left + scrollLeft;
                  const relativeY = transformedPoint.y - containerRect.top + scrollTop;
                  
                  // Set the tooltip position in container space
                  setTooltipPosition({
                    x: relativeX + 20, // Add some offset to position right of the node
                    y: relativeY,
                    translateX: 0, // Not needed when using CTM
                    translateY: 0  // Not needed when using CTM
                  });
                }
              }
            }
            
            // After a short delay to allow the tooltip to render, ensure it's visible in the viewport
            setTimeout(() => {
              const tooltipElement = document.querySelector('.field-tooltip') as HTMLElement;
              if (tooltipElement && containerRef.current) {
                const containerRect = containerRef.current.getBoundingClientRect();
                const tooltipRect = tooltipElement.getBoundingClientRect();
                
                // Check if tooltip is outside the visible area
                if (tooltipRect.right > containerRect.right) {
                  // Scroll to make the tooltip visible
                  containerRef.current.scrollLeft += (tooltipRect.right - containerRect.right + 20);
                }
                
                if (tooltipRect.bottom > containerRect.bottom) {
                  // Adjust vertical position if needed
                  containerRef.current.scrollTop += (tooltipRect.bottom - containerRect.bottom + 20);
                }
              }
            }, 50);
          }
        }  
      });
    // Add circles for nodes
    nodeGroup.append("circle")
      .attr("fill", d => {
        // Determine node type
        if (d.depth === 0) return "#4f46e5"; // Root - Indigo
        if (d.data.data) return isDarkMode ? "#F5E100" : "#E6D300"; // Field - Yellow (dark/light)
        if (d.children) return isDarkMode ? "#00F583" : "#00D975"; // Category - Green (dark/light)
        return isDarkMode ? "#69635C" : "#d8dbe2"; // Other - Gray (dark/light)
      })
      .attr("r", nodeSize)
      .attr("class", "node-circle")
      .on("mouseover", function() {
        // Only add hover effect to category nodes
        // Cast parentNode to Element to satisfy TypeScript
        const parentElement = this.parentNode as Element;
        const d = d3.select(parentElement).datum() as any;
        
        // Apply to all nodes, not just category nodes with children
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", nodeSize * 1.2) // Increase size by 1.2x
          .attr("fill", "#4f46e5"); // Indigo color to match path highlighting
          
        // Highlight the node text
        d3.select(parentElement)
          .select("text")
          .transition()
          .duration(200)
          .attr("font-weight", "bold")
          .attr("fill", "#4f46e5"); // Indigo color to match path highlighting
      })
      .on("mouseout", function() {
        // Restore original size
        // Cast parentNode to Element to satisfy TypeScript
        const parentElement = this.parentNode as Element;
        const d = d3.select(parentElement).datum() as any;
        
        // Apply to all nodes, not just category nodes with children
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", nodeSize)
          .attr("fill", d => {
            if (d.depth === 0) return "#4f46e5"; // Root - Indigo
            if (d.data.data) return isDarkMode ? "#F5E100" : "#E6D300"; // Field - Yellow (dark/light)
            if (d.children) return isDarkMode ? "#00F583" : "#00D975"; // Category - Green (dark/light)
            return isDarkMode ? "#69635C" : "#d8dbe2"; // Other - Gray (dark/light)
          });
          
        // Restore text
        d3.select(parentElement)
          .select("text")
          .transition()
          .duration(200)
          .attr("font-weight", "normal")
          .attr("fill", isDarkMode ? "white" : "black");
      });
    

    // Function to get all ancestors of a node
    const getAncestors = (node: any): any[] => {
      const ancestors = [];
      let current = node;
      while (current) {
        ancestors.unshift(current);
        current = current.parent;
      }
      return ancestors;
    };
    
    // Add mouseover/mouseout effects to highlight path to root
    nodeGroup.on("mouseover", (event, d) => {
      // Get all ancestors of this node
      const ancestors = getAncestors(d);
      
      // Get all descendants of this node
      const descendants = d.descendants();
      
      // Highlight the path to root
      svg.selectAll(".node-circle")
        .filter(p => ancestors.includes(p))
        .transition()
        .duration(200)
        .attr("fill", "#4f46e5") // Indigo color - ensure consistent color
        .attr("r", nodeSize * 1.2);
      
      // Highlight the text labels for ancestors
      svg.selectAll("text")
        .filter(p => ancestors.includes(p))
        .transition()
        .duration(200)
        .attr("fill", "#4f46e5") // Indigo color
        .attr("font-weight", "bold");
      
      // Highlight the links to ancestors
      svg.selectAll("path.link")
        .filter((p: any) => {
          // Check if this link is part of the path to root
          return p.source && p.target && ancestors.includes(p.source) && ancestors.includes(p.target);
        })
        .transition()
        .duration(200)
        .attr("stroke", "#4f46e5") // Indigo color
        .attr("stroke-width", linkWidth * 2);
      
      // Highlight downward nodes
      svg.selectAll(".node-circle")
        .filter(p => descendants.includes(p as d3.HierarchyNode<TreeNodeData>) && p !== d)
        .transition()
        .duration(200)
        .attr("fill", "#4f46e5") // Indigo color
        .attr("r", nodeSize * 1.2);
      
      // Highlight the text labels for descendants
      svg.selectAll("text")
        .filter(p => descendants.includes(p as d3.HierarchyNode<TreeNodeData>) && p !== d)
        .transition()
        .duration(200)
        .attr("fill", "#4f46e5") // Indigo color
        .attr("font-weight", "bold");
      
      // Highlight the links to descendants
      svg.selectAll("path.link")
        .filter((p: any) => {
          // Check if this link connects to a descendant
          return p.source && p.target &&
                 ((p.source === d && descendants.includes(p.target)) ||
                  (descendants.includes(p.source) && descendants.includes(p.target)));
        })
        .transition()
        .duration(200)
        .attr("stroke", "#4f46e5") // Indigo color
        .attr("stroke-width", linkWidth * 2);
    })
    .on("mouseout", (event, d) => {
      // Restore original colors for ALL elements
      svg.selectAll(".node-circle")
        .transition()
        .duration(200)
        .attr("fill", (p: any) => {
          if (p && p.depth === 0) return "#4f46e5"; // Root - Indigo
          if (p && p.data && p.data.data) return isDarkMode ? "#F5E100" : "#E6D300"; // Field - Yellow (dark/light)
          if (p && p.children) return isDarkMode ? "#00F583" : "#00D975"; // Category - Green (dark/light)
          return isDarkMode ? "#69635C" : "#d8dbe2"; // Other - Gray (dark/light)
        })
        .attr("r", nodeSize);
      
      // Restore text labels
      svg.selectAll("text")
        .transition()
        .duration(200)
        .attr("fill", isDarkMode ? "white" : "black") // Respect dark mode setting
        .attr("font-weight", "normal");
      
      // Restore links
      svg.selectAll("path.link")
        .transition()
        .duration(200)
        .attr("stroke", isDarkMode ? "#666" : "#555")
        .attr("stroke-width", linkWidth);
    });
    
    // Control pointer events to ensure both dragging and clicking work
    svg.selectAll(".node-circle, .expand-indicator")
    .style("pointer-events", "none");

    // Make sure nodeGroups remain clickable
    nodeGroup.style("pointer-events", "visible");

    // Remove the separate event handlers for text labels since they're now part of the nodeGroup
    
    // Add text labels to the nodeGroup instead of node
    if (showLabels) {
      nodeGroup.append("text")
        .attr("dy", "0.31em")
        .attr("x", d => d.children ? -6 : 6)
        .attr("text-anchor", d => d.children ? "end" : "start")
        .text(d => d.data.name)
        .attr("stroke", isDarkMode ? "#222" : "white")
        .attr("paint-order", "stroke")
        .attr("fill", isDarkMode ? "white" : "black")
        .attr("class", "node-label")
        .style("cursor", "pointer")
        .style("pointer-events", "all"); // Ensure text is clickable
    }
    
    // Add panning functionality (drag to move) but no zoom
    // We'll use a simple approach that tracks the total translation
    let translateX = 0;
    let translateY = 0;
    
    // Create a more robust drag handler that applies to the entire SVG
    const drag = d3.drag<Element, unknown>()
    .on("start", function() {
      d3.select(this).style("cursor", "grabbing");
    })
    .on("drag", function(event) {
      // Update the total translation
      translateX += event.dx;
      translateY += event.dy;
      
      // Apply the translation to the root container
      rootContainer.attr("transform", `translate(${translateX}, ${translateY})`);
      
      // If tooltip is open, update its position based on the new CTM
      if (tooltipData && svgRef.current && containerRef.current) {
        const svgElement = svgRef.current;
        const ctm = svgElement.getScreenCTM();
        
        if (ctm) {
          // We need to find the node that corresponds to the currently displayed tooltip
          // First, let's get all field nodes
          const fieldNodes = svgElement.querySelectorAll('.field-node');
          // We'll use any here to bypass TypeScript's type checking
          // This is necessary because d3's typing doesn't match the actual runtime behavior
          let matchingNode: any = null;
          
          // Look through each node to find the one that matches our tooltipData
          fieldNodes.forEach(fieldNode => {
            // Use any to bypass type checking
            const nodeData = d3.select(fieldNode).datum() as any;
            // Check if the data exists and matches what we're looking for
            if (nodeData && nodeData.data && nodeData.data.name === tooltipData.name) {
              matchingNode = nodeData;
            }
          });
          
          // If we found the matching node, update the tooltip position
          if (matchingNode) {
            // Access x and y directly, with fallbacks to 0
            const nodeX = matchingNode.y || 0;
            const nodeY = matchingNode.x || 0;
            
            // Convert node position from SVG space to screen space
            const svgPoint = svgElement.createSVGPoint();
            svgPoint.x = nodeX;
            svgPoint.y = nodeY;
            
            // Apply the current transformation
            const transformedPoint = svgPoint.matrixTransform(ctm);
            
            // Convert from screen space to container space
            const containerRect = containerRef.current.getBoundingClientRect();
            const relativeX = transformedPoint.x - containerRect.left + containerRef.current.scrollLeft;
            const relativeY = transformedPoint.y - containerRect.top + containerRef.current.scrollTop;
            
            // Update the tooltip position
            setTooltipPosition({
              x: relativeX + 20,
              y: relativeY,
              translateX: 0,
              translateY: 0
            });
          }
        }
      }
    })
    .on("end", function() {
      d3.select(this).style("cursor", "grab");
    });
    
    // Create a root container group to hold everything
    const rootContainer = svg.append("g")
      .attr("class", "root-container");
    
    // Move the existing groups into the root container
    // First, detach them from the SVG
    const linkGroupEl = svg.select("g").remove();
    const nodeGroupEl = svg.select("g").remove();
    
    // Then append them to the root container
    rootContainer.append(() => linkGroupEl.node());
    rootContainer.append(() => nodeGroupEl.node());
    
    // Apply drag behavior to the entire SVG
    svg.call(drag as any);
    svg.style("cursor", "grab");
    
    // Append the SVG to the container
    if (containerRef.current) {
      // Clear any existing SVG before appending the new one
      if (svgRef.current && containerRef.current.contains(svgRef.current)) {
        containerRef.current.removeChild(svgRef.current);
      }
      containerRef.current.appendChild(svg.node()!);
      svgRef.current = svg.node();
      
      // Update the container height to match the SVG height
      containerRef.current.style.height = `${calculatedTreeHeight}px`;
      
      // Also set maxHeight to ensure proper scrolling behavior
      containerRef.current.style.maxHeight = `${calculatedTreeHeight}px`;
      
      // Update the tree height state
      setTreeHeight(calculatedTreeHeight);
      
      // After a short delay, calculate the actual height based on the rendered SVG
      setTimeout(() => {
        if (svgRef.current) {
          const bbox = svgRef.current.getBBox();
          const actualHeight = bbox.height + 50; // Add some padding
          console.log("Actual tree height after initial render:", actualHeight);
          
          // Only update if the actual height is significantly different
          if (Math.abs(actualHeight - calculatedTreeHeight) > 100) {
            setTreeHeight(actualHeight);
            containerRef.current!.style.height = `${actualHeight}px`;
            containerRef.current!.style.maxHeight = `${actualHeight}px`;
          }
        }
      }, 100);
    }
    
    // Store current refs for cleanup to avoid React hooks exhaustive deps warning
    const currentSvgRef = svgRef.current;
    const currentContainerRef = containerRef.current;
    
    // Cleanup function
    return () => {
      if (currentSvgRef && currentContainerRef?.contains(currentSvgRef)) {
        currentContainerRef.removeChild(currentSvgRef);
      }
    };
  }, [data, dimensions, isDarkMode, loading, error, expandedBranches, expandedBranchesInitialized, showCategories, nodeSize, linkOpacity, linkWidth, showLabels, tooltipData]);
  
  // Effect to update parent container when tree height changes
  useEffect(() => {
    if (containerRef.current && treeHeight > 0) {
      // Set the container height and max-height to match the tree height
      containerRef.current.style.height = `${treeHeight}px`;
      containerRef.current.style.maxHeight = `${treeHeight}px`;
      
      // Log the height for debugging
      console.log("Tree height updated to:", treeHeight);
    }
  }, [treeHeight]); // Removed tooltipData as it's not used in this effect

  // Function to close the tooltip
  const closeTooltip = () => {
    setTooltipData(null);
  };
  
  // Handle clicks outside the tooltip to close it
  const handleContainerClick = (event: MouseEvent<HTMLDivElement>) => {
    // Only close if clicking on the container itself, not on a node or the tooltip
    if (event.target === event.currentTarget) {
      closeTooltip();
    }
  };

  // Export function to save the tree as SVG
  const exportSVG = () => {
    if (!svgRef.current) return;
    
    // Create a clone of the SVG to modify for export
    const svgClone = svgRef.current.cloneNode(true) as SVGSVGElement;
    
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
    downloadLink.download = 'tidy-tree.svg';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    // Clean up
    URL.revokeObjectURL(svgUrl);
  };

  return (
    <div className="relative w-full h-full">
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{
          position: 'relative',
          minHeight: '500px',
          height: `${treeHeight}px`,
          maxHeight: `${treeHeight}px`,
          overflow: 'auto',
          transition: 'height 0.3s ease-in-out' // Smooth transition when height changes
        }}
        onClick={handleContainerClick}
      >
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
      </div>
      
      {/* TidyTree Buttons - Using our custom TidyTreeButtons component */}
      <div className="absolute top-2 right-2 z-50 p-2 bg-transparent dark:bg-transparent rounded shadow-sm">
        <TidyTreeButtons onExport={exportSVG} />
      </div>
      
      {/* Field Data Tooltip */}
      {tooltipData && tooltipData.data && (
        <div
          className="field-tooltip absolute bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
          style={{
            position: 'absolute',
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            maxWidth: '300px',
            transform: 'translate(0, -50%)' // Center vertically relative to the node
          }}
          onClick={(e: MouseEvent<HTMLDivElement>) => e.stopPropagation()} // Prevent clicks from closing the tooltip
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-sm">{tooltipData.name}</h3>
            <button
              onClick={closeTooltip}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>
          
          <div className="text-xs space-y-1">
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