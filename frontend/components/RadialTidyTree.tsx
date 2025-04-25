"use client";

import TreeButtons from "./TreeButtons";
import React, { useEffect, useState, useRef, useCallback } from "react";
import * as d3 from "d3";
import { MinusCircle, PlusCircle } from 'lucide-react';

// Define interfaces for the tree data structure
interface TreeNodeDataField {
  field_id?: number;
  title?: string;
  instanced?: string;
  arrayed?: string;
  sexed?: string;
  debut?: string;
  version?: string;
  num_participants?: number;
  [key: string]: any; // For any other properties
}

interface TreeNodeData {
  name: string;
  data?: TreeNodeDataField;
  children?: TreeNodeData[];
}

// Interface for tooltip position
interface TooltipPosition {
  x: number;
  y: number;
}

// Configuration interface
interface VisualizationConfig {
  fontSize: number;
  nodeSize: number;
  linkOpacity: number;
  linkWidth: number;
  labelPadding: number;
  
  // Distance controls
  baseLevelDistance: number;
  levelDistanceIncrement: number;
  maxLevelDistance: number;
  
  // Node distribution controls
  minNodeSpacingAngle: number;
  maxNodeSpacingAngle: number;
  nodeSpacingScaleFactor: number;
  maxNodeSpreadAngle: number;

  // Layout controls
  showLabels: boolean;
  showCategories: boolean;
}

// Interface for tooltip data
interface TooltipData {
  name: string;
  data?: TreeNodeDataField;
}

// Interface for tree buttons props
interface TreeButtonsProps {
  onExport: () => void;
  onViewAll: () => void;
}

const RadialTidyTree: React.FC = () => {
  const [data, setData] = useState<TreeNodeData | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 928, height: 928 });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for the tooltip
  const [tooltipData, setTooltipData] = useState<TooltipData | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition>({ x: 0, y: 0 });
  
  // Track which branches are expanded
  const [expandedBranches, setExpandedBranches] = useState<Set<string>>(new Set<string>());
  const [expandedBranchesInitialized, setExpandedBranchesInitialized] = useState<boolean>(false);
  const [previousExpandedState, setPreviousExpandedState] = useState<string[] | null>(null);
  const [isAllExpanded, setIsAllExpanded] = useState<boolean>(false);
  
  const [config] = useState<VisualizationConfig>({
    fontSize: 8,
    nodeSize: 3.5,
    linkOpacity: 0.4,
    linkWidth: 1.5,
    labelPadding: 10,
    
    // Distance controls - reduced spacing to make the entire visualization more compact
    baseLevelDistance: 150,        
    levelDistanceIncrement: 250,    
    maxLevelDistance: Infinity,         
    
    // Node distribution controls
    minNodeSpacingAngle: 0.012,    
    maxNodeSpacingAngle: 0.06,     
    nodeSpacingScaleFactor: 0.2,   
    maxNodeSpreadAngle: 0.3,       
  
    // Layout controls
    showLabels: true,
    showCategories: true
  });
  
  // Helper to convert from polar to cartesian coordinates
  const polarToCartesian = (angle: number, radius: number): [number, number] => {
    const a = angle - Math.PI / 2; // Start at top (90°)
    return [radius * Math.cos(a), radius * Math.sin(a)];
  };
  
  // Helper function to build a path string for a node
  const getNodePath = (node: d3.HierarchyNode<TreeNodeData>): string => {
    const path: string[] = [];
    let current: d3.HierarchyNode<TreeNodeData> | null = node;
    while (current) {
      path.unshift(current.data.name);
      current = current.parent;
    }
    return path.join('/');
  };

  // Check for dark mode on component mount and when theme changes
  useEffect(() => {
    const checkDarkMode = (): void => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    // Initial check
    checkDarkMode();
    
    // Set up observer for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          checkDarkMode();
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    
    return () => observer.disconnect();
  }, []);

  // Handle container resizing
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Apply base CSS
    if (containerRef.current) {
      containerRef.current.style.position = 'relative';
      containerRef.current.style.width = '100%';
      containerRef.current.style.margin = '0 auto';
      containerRef.current.style.overflow = 'hidden';
    }
    
    // Breakpoint at which we switch from square to adaptive rectangle
    const BREAKPOINT_WIDTH = 768; // Medium screen breakpoint (adjust as needed)
    
    const updateDimensions = (): void => {
      if (!containerRef.current) return;
      
      try {
        // Get the container's parent width
        const parentWidth = containerRef.current.parentElement?.clientWidth || window.innerWidth;
        const parentHeight = containerRef.current.parentElement?.clientHeight || window.innerHeight;
        
        // Get the available width, accounting for any padding or margins
        const availableWidth = Math.max(parentWidth, 500); // Ensure minimum 500px
        
        // Determine if we're below the breakpoint
        const isBelowBreakpoint = availableWidth < BREAKPOINT_WIDTH;
        
        if (isBelowBreakpoint) {
          // Below breakpoint: Fill the available frame completely (adaptive rectangle)
          // Remove aspect ratio constraint
          containerRef.current.style.aspectRatio = 'auto';
          
          // Set dimensions based on parent container
          const width = availableWidth;
          const height = parentHeight || width * 0.75; // Default to 3:4 ratio if height not available
          
          setDimensions({ width, height });
          
          // Apply dimensions to container
          if (containerRef.current) {
            containerRef.current.style.width = `${width}px`;
            containerRef.current.style.height = `${height}px`;
            containerRef.current.style.maxWidth = `${width}px`;
            // Allow height to be flexible
            containerRef.current.style.maxHeight = 'none';
          }
        } else {
          // Above breakpoint: Maintain square aspect ratio
          containerRef.current.style.aspectRatio = '1 / 1';
          
          // Use the available width for both dimensions to maintain square aspect
          const size = availableWidth;
          
          // Set dimensions for the SVG
          setDimensions({ width: size, height: size });
          
          // Force the container to be exactly square
          if (containerRef.current) {
            containerRef.current.style.width = `${size}px`;
            containerRef.current.style.height = `${size}px`;
            containerRef.current.style.maxWidth = `${size}px`;
            containerRef.current.style.maxHeight = `${size}px`;
          }
        }
      } catch (e) {
        console.warn("Error measuring container dimensions:", e);
        setDimensions({ width: 928, height: 928 });
      }
    };
    
    // Initial dimensions update
    updateDimensions();
    
    // Store a reference to the current container for cleanup
    const currentContainer = containerRef.current;
    
    // Set up resize observer for container size changes
    const resizeObserver = new ResizeObserver(() => {
      // Call updateDimensions without requestAnimationFrame for immediate response
      updateDimensions();
    });
    
    resizeObserver.observe(currentContainer);
    
    // Handle window resize events
    const handleResize = () => {
      updateDimensions();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      if (currentContainer) {
        resizeObserver.unobserve(currentContainer);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const updateTheme = useCallback((isDark: boolean): void => {
    if (!svgRef.current) return;
    
    // Update SVG class without recreating it
    const svg = d3.select(svgRef.current);
    svg.attr("class", isDark ? "dark-theme" : "light-theme");
    
    // Update node colors
    svg.selectAll(".node-circle")
      .attr("fill", function(d: any) {
        if (d.depth === 0) return "#4f46e5"; // Root - Indigo
        if (d.data.data && d.data.data.field_id !== undefined) return isDark ? "#F5E100" : "#E6D300"; // Field - Yellow
        if (d.children) return isDark ? "#00F583" : "#00D975"; // Category - Green
        return isDark ? "#69635C" : "#d8dbe2"; // Other - Gray
      });
    
    // Update text color
    svg.selectAll("text")
      .attr("fill", isDark ? "white" : "black")
      .attr("stroke", isDark ? null : "white")
      .attr("stroke-width", isDark ? null : 3)
      .attr("paint-order", isDark ? null : "stroke");
    
    // Update links
    svg.selectAll("path.link")
      .attr("stroke", isDark ? "#666" : "#555");
  }, []);
  
  // Then modify your dark mode effect to use this function instead of rebuilding the SVG
  useEffect(() => {
    const checkDarkMode = (): void => {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
      
      // If SVG exists, update its theme
      if (svgRef.current) {
        updateTheme(isDark);
      }
    };
    
    // Initial check
    checkDarkMode();
    
    // Set up observer for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          checkDarkMode();
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    
    return () => observer.disconnect();
  }, [updateTheme]);


  // Zoom reference
  // Reference for zoom behavior to be persistent across renders
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  
  // Reference to store the g element for direct transformation
  const gRef = useRef<SVGGElement | null>(null);
  // Store value
  const currentTransformRef = useRef<d3.ZoomTransform>(d3.zoomIdentity);
  // Improved zoom functionality that fits the entire visualization
  const handleViewAll = useCallback((): void => {
    if (!svgRef.current || !zoomRef.current || !gRef.current) return;
    
    // Get SVG and container elements
    const svg = d3.select(svgRef.current);
    const g = d3.select(gRef.current);
    
    // Reset the transform to identity to measure the true bounds
    g.attr("transform", "");
    
    // Get the bounding box of all content in the g element
    const bounds = gRef.current.getBBox();
    
    // Calculate the scale and translation needed to fit the entire content
    const containerWidth = dimensions.width;
    const containerHeight = dimensions.height;
    
    // Add padding (10% on each side)
    const padding = 0.2; // Reverted back to original value
    const paddedWidth = bounds.width * (1 + padding);
    const paddedHeight = bounds.height * (1 + padding);
    
    // Calculate scale to fit the entire content with padding
    const scaleX = containerWidth / paddedWidth;
    const scaleY = containerHeight / paddedHeight;
    const scale = Math.min(scaleX, scaleY);
    
    // Use (0,0) as the target center point for the radial layout's origin
    const targetCenterX = 0;
    const targetCenterY = 0;

    // Apply the transform with transition
    svg.transition()
      .duration(750)
      .call(
        zoomRef.current.transform,
        d3.zoomIdentity
          .translate(containerWidth / 2, containerHeight / 2) // Move origin to SVG center
          .scale(scale)                                      // Scale around SVG center
          .translate(-targetCenterX, -targetCenterY)         // Move the layout's origin (0,0) to the SVG center
      );
  }, [dimensions]);
  
  // New expand/collapse all functionality
  const handleToggleExpandAll = useCallback((): void => {
    if (isAllExpanded) {
      // If everything is expanded, revert to previous state
      if (previousExpandedState) {
        setExpandedBranches(new Set(previousExpandedState));
      } else {
        // If no previous state, just collapse everything
        setExpandedBranches(new Set());
      }
      setIsAllExpanded(false);
    } else {
      // Save current state before expanding all
      setPreviousExpandedState([...expandedBranches]);
      
      // Expand all branches
      const allBranches = new Set<string>();
      
      // Helper function to collect all paths
      const collectAllPaths = (node: TreeNodeData, path: string[] = []): void => {
        if (!node) return;
        
        const currentPath = [...path, node.name];
        const currentPathStr = currentPath.join('/');
        
        // Don't add the root path
        if (currentPath.length > 1) {
          allBranches.add(currentPathStr);
        }
        
        // Recurse to children
        if (node.children) {
          node.children.forEach(child => {
            collectAllPaths(child, currentPath);
          });
        }
      };
      
      // Start from the root
      if (data) {
        collectAllPaths(data);
        setExpandedBranches(allBranches);
        setIsAllExpanded(true);
      }
    }
  }, [data, expandedBranches, isAllExpanded, previousExpandedState]);

  // Load data from the UK Biobank JSON file
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
        
        // Initialize only category nodes as expanded by default
        if (!expandedBranchesInitialized) {
          const initialExpanded = new Set<string>();
          
          const collectCategoryPaths = (node: TreeNodeData, path: string[] = []): void => {
            const currentPath = [...path, node.name];
            const currentPathStr = currentPath.join('/');
            
            // Only add category nodes (not field nodes)
            const isFieldNode = node.data && node.data.field_id !== undefined;
            
            if (!isFieldNode) {
              // Only expand if it doesn't have field node children
              const hasFieldChildren = node.children && 
                node.children.some(child => 
                  child.data && child.data.field_id !== undefined
                );
              
              if (!hasFieldChildren) {
                initialExpanded.add(currentPathStr);
              }
            }
            
            // Recurse into category children
            if (node.children) {
              node.children.forEach(child => {
                const isChildFieldNode = child.data && child.data.field_id !== undefined;
                if (!isChildFieldNode) {
                  collectCategoryPaths(child, currentPath);
                }
              });
            }
          };
          
          collectCategoryPaths(fetchedData);
          setExpandedBranches(initialExpanded);
          setExpandedBranchesInitialized(true);
        }
        
        setLoading(false);
      })
      .catch(error => {
        console.error("Error loading data:", error);
        setError(error instanceof Error ? error.message : "Failed to load data");
        setLoading(false);
      });
  }, [expandedBranchesInitialized]);

  // Filter data based on expanded branches
  const filterData = useCallback((node: TreeNodeData | null, path: string[] = []): TreeNodeData | null => {
    if (!node) return null;
    
    // Create a new node to avoid mutating the original
    const newNode = { ...node };
    const currentPath = [...path, node.name];
    const currentPathStr = currentPath.join('/');
    
    // Check if this is a field node
    const isFieldNode = node.data && node.data.field_id !== undefined;
    
    // Skip field nodes unless their parent is expanded
    if (isFieldNode) {
      const parentPath = currentPath.slice(0, -1).join('/');
      if (!expandedBranches.has(parentPath)) {
        return null;
      }
    }
    
    // Handle children based on expansion state
    if (node.children && node.children.length > 0) {
      // If branch is collapsed, remove children
      if (currentPath.length > 1 && !expandedBranches.has(currentPathStr)) {
        delete newNode.children;
        return newNode;
      }
      
      // Filter children
      const filteredChildren = node.children
        .map(child => {
          const isChildFieldNode = child.data && child.data.field_id !== undefined;
          
          // Include field children only if parent is expanded
          if (isChildFieldNode) {
            return expandedBranches.has(currentPathStr) ? child : null;
          }
          
          // Skip category nodes if showCategories is false
          const isChildCategory = child.children && child.children.length > 0;
          if (isChildCategory && !config.showCategories) return null;
          
          // Recursively filter
          return filterData(child, currentPath);
        })
        .filter((child): child is TreeNodeData => child !== null);
      
      // Update children or remove if empty
      if (filteredChildren.length > 0) {
        newNode.children = filteredChildren;
      } else {
        delete newNode.children;
      }
    }
    
    return newNode;
  }, [expandedBranches, config.showCategories]);

  const calculateLevelRadii = useCallback((
    hierarchy: d3.HierarchyNode<TreeNodeData>,
    availableRadius: number
  ): Map<number, number> => {
    const levelRadii = new Map<number, number>();
    
    // Group all nodes by level
    const nodesByLevel = new Map<number, d3.HierarchyNode<TreeNodeData>[]>();
    
    // First pass: collect all nodes by level
    hierarchy.each(node => {
      const depth = node.depth || 0;
      if (!nodesByLevel.has(depth)) {
        nodesByLevel.set(depth, []);
      }
      nodesByLevel.get(depth)?.push(node);
    });
    
    // Calculate exact pixel width needed for each node label
    const getNodeWidth = (text: string): number => {
      // Precise width calculation based on font size
      const charWidth = config.fontSize * 0.6; // Average width per character
      const textWidth = text.length * charWidth;
      
      // Add padding for the node circle
      const nodeCircleWidth = config.nodeSize * 2;
      const minSpacing = 100; // Significantly increased minimum pixel spacing between nodes (was 15)
      
      return textWidth + nodeCircleWidth + minSpacing;
    };
    
    // Calculate exact minimum angle needed to fit a node at given radius
    const getMinAngle = (nodeWidth: number, radius: number): number => {
      // Arc length = radius × angle
      // Therefore: angle = arc length / radius
      return nodeWidth / radius;
    };
    
    // Root is always at center
    levelRadii.set(0, 0);
    
    // Use original config values for initial radius calculation
    let currentRadius = config.baseLevelDistance;
    levelRadii.set(1, currentRadius);
    
    // Initial minimum radii for other levels using original config values
    for (let level = 2; level <= (hierarchy.height || 0); level++) {
      // Incorporate config.levelDistanceIncrement as requested
      currentRadius += config.levelDistanceIncrement + (level * 5);
      // Respect the maxLevelDistance configuration
      currentRadius = Math.min(currentRadius, config.maxLevelDistance);
      levelRadii.set(level, currentRadius);
    }
    
    // Iterative refinement - may take multiple passes
    for (let iteration = 0; iteration < 10; iteration++) {
      let adjustmentMade = false;
      
      // Process each level (starting from level 2 to preserve level 1 radius)
      for (let level = 1; level <= (hierarchy.height || 0); level++) {
        const nodesAtLevel = nodesByLevel.get(level) || [];
        if (nodesAtLevel.length === 0) continue;
        
        let currentRadius = levelRadii.get(level) || 0;
        
        // Group nodes by parent
        const nodesByParent = new Map<d3.HierarchyNode<TreeNodeData>, d3.HierarchyNode<TreeNodeData>[]>();
        nodesAtLevel.forEach(node => {
          if (!node.parent) return;
          
          if (!nodesByParent.has(node.parent)) {
            nodesByParent.set(node.parent, []);
          }
          nodesByParent.get(node.parent)?.push(node);
        });
        
        // For each parent, calculate the exact angle needed for its children
        nodesByParent.forEach((children, parent) => {
          if (children.length <= 1) return; // Single child has no spacing issues
          
          // Calculate total pixel width needed for all children
          const totalPixelWidth = children.reduce((sum, node) => 
            sum + getNodeWidth(node.data.name), 0);
          
          // Calculate exact angle needed at current radius
          const exactAngleNeeded = getMinAngle(totalPixelWidth, currentRadius);
          
          // Calculate angle allocation for this parent
          const parentCount = nodesByLevel.get(level - 1)?.length || 1;
          const baseAngle = (2 * Math.PI) / parentCount;
          
          // Adjust based on child proportion
          const childProportion = children.length / nodesAtLevel.length;
          let allocatedAngle = baseAngle * Math.sqrt(childProportion);
          
          // Ensure minimum angle for readability with additional spacing
          allocatedAngle = Math.max(allocatedAngle, exactAngleNeeded * 2); // Increased from 1.2 to 1.3 for even more space
          
          // Calculate minimum radius needed for these children at this angle
          const minRequiredRadius = totalPixelWidth / allocatedAngle;
          
          // Check if we need to increase the radius (skip level 1 adjustment on first iteration)
          if (minRequiredRadius > currentRadius && !(level === 1 && iteration === 0)) {
            // Apply safety factor based on node types
            const hasFieldNodes = children.some(node => 
              node.data.data && node.data.data.field_id !== undefined);
            const hasCategoryNodes = children.some(node => 
              node.children && node.children.length > 0);
            
            // Extra safety for mixed node types
            const safetyFactor = 1.5 + // ↑ bump base safety from 1.2 to 1.5
               (hasFieldNodes && hasCategoryNodes ? 0.25 : 0) + 
               (level >= 4 ? 0.10 * (level - 3) : 0);
            
            currentRadius = minRequiredRadius * safetyFactor;
            adjustmentMade = true;
            
            console.log(`Level ${level} - Parent "${parent.data.name}" with ${children.length} children: ` +
              `Required ${minRequiredRadius.toFixed(1)} radius for ${totalPixelWidth.toFixed(1)}px ` +
              `within ${allocatedAngle.toFixed(3)} radians, exactAngle=${exactAngleNeeded.toFixed(3)}`);
          }
        });
        
        // Update level radius if increased (always preserve level 1 on first iteration)
        if (currentRadius > (levelRadii.get(level) || 0) && !(level === 1 && iteration === 0)) {
          // Enforce maxLevelDistance
          currentRadius = Math.min(currentRadius, config.maxLevelDistance);
          levelRadii.set(level, currentRadius);
          console.log(`Level ${level} - Iteration ${iteration}: Radius increased to ${currentRadius.toFixed(1)}`);
        }
      }
      
      // Ensure minimum separation between levels
      for (let level = 2; level <= (hierarchy.height || 0); level++) {
        const currentRadius = levelRadii.get(level) || 0;
        const prevRadius = levelRadii.get(level - 1) || 0;
        
        // Minimum required separation increases with depth - using config.levelDistanceIncrement
        const minSeparation = config.levelDistanceIncrement + (level * 10); // Using levelDistanceIncrement as base

        if (currentRadius - prevRadius < minSeparation) {
          const newRadius = prevRadius + minSeparation;
          levelRadii.set(level, newRadius);
          adjustmentMade = true;
          
          console.log(`Level ${level} - Enforcing minimum separation: ${prevRadius.toFixed(1)} -> ${newRadius.toFixed(1)}`);
        }
      }
      
      // Exit early if no adjustments were made
      if (!adjustmentMade) {
        console.log(`No adjustments needed in iteration ${iteration}, stopping refinement`);
        break;
      }
    }
    
    // Special handling for mixed levels with field nodes
    for (let level = 1; level <= (hierarchy.height || 0); level++) {
      const nodes = nodesByLevel.get(level) || [];
      
      // Check for levels with both field and category nodes
      const fieldNodes = nodes.filter(node => node.data.data && node.data.data.field_id !== undefined);
      const categoryNodes = nodes.filter(node => node.children && node.children.length > 0);
      
      if (fieldNodes.length > 0 && categoryNodes.length > 0) {
        // Calculate number of parents with field nodes
        const parentsWithFieldNodes = new Set();
        fieldNodes.forEach(node => {
          if (node.parent) parentsWithFieldNodes.add(node.parent);
        });
        
        // Mixed level with multiple parents - add extra space
        if (parentsWithFieldNodes.size > 1) {
          const currentRadius = levelRadii.get(level) || 0;
          const mixedBoost = 1.0 + Math.min(0.3, parentsWithFieldNodes.size * 0.08); // Further increased boost
          const newRadius = currentRadius * mixedBoost;
          
          levelRadii.set(level, newRadius);
          console.log(`Level ${level} - Mixed level with ${parentsWithFieldNodes.size} parents having field nodes: ` + 
            `Radius boosted ${currentRadius.toFixed(1)} -> ${newRadius.toFixed(1)}`);
        }
      }
    }
    
    // Ensure minimum radii for each level, especially level 1
    // This is important as it directly affects label spacing
    for (let level = 1; level <= (hierarchy.height || 0); level++) {
      const prevLevelRadius = levelRadii.get(level - 1) || 0;
      const currentRadius = levelRadii.get(level) || 0;
      
      // If current level's radius isn't at least 150px more than previous level
      if (currentRadius <= prevLevelRadius + 150) {
        const newRadius = prevLevelRadius + 150; // Force minimum 150px difference
        levelRadii.set(level, newRadius);
        console.log(`FIXED BACKWARD MOVEMENT: Level ${level} radius adjusted from ${currentRadius} to ${newRadius}`);
      }
    }

    const level4Radius = levelRadii.get(4) || 0;
    const level5Radius = levelRadii.get(5) || 0;
    if (level5Radius - level4Radius < 300) { // Ensure at least 100px separation
      levelRadii.set(5, level4Radius + 300);
      console.log(`Enforcing minimum separation between levels 4 and 5`);
    }

    

    const base3 = levelRadii.get(3) ?? 0;
    // Fixed extra gap per level beyond 3
    const step = 500;

    [4, 5, 6].forEach(lvl => {
      const cur = levelRadii.get(lvl) ?? 0;
      // desired = radius_of_level3 + (lvl - 3) * step
      const desired = base3 + (lvl - 3) * step;
      if (cur < desired) {
        levelRadii.set(lvl, desired);
        console.log(`Level ${lvl}: bumped to ${desired}px (was ${cur.toFixed(1)})`);
      }
    });

    // Special handling for level 3 with massive node counts
    const level3Nodes = nodesByLevel.get(3) || [];
    const level3NodeCount = level3Nodes.length;
    const level3Radius = levelRadii.get(3) || 0;

    // If we have an unusually high number of nodes at level 3
    if (level3NodeCount > 600) {
      // Calculate a scaling factor that increases with node count
      // Start scaling at 100 nodes, max out at 1000+ nodes
      const nodeCountFactor = Math.min(1, (level3NodeCount - 100) / 900);
      
      // Apply a progressive scale: 1.0 (no change) up to 2.5x for extreme cases
      const scaleFactor = 1 + (1.5 * nodeCountFactor);
      
      // Apply the scaling, but only if it would increase the radius
      const scaledRadius = level3Radius * scaleFactor;
      if (scaledRadius > level3Radius) {
        levelRadii.set(3, scaledRadius);
        console.log(`Level 3 has ${level3NodeCount} nodes - applied scaling factor ${scaleFactor.toFixed(2)} to radius: ${level3Radius.toFixed(1)} → ${scaledRadius.toFixed(1)}`);
        
        // Also adjust level 4+ proportionally if they exist
        for (let lvl = 4; lvl <= (hierarchy.height || 0); lvl++) {
          const currentRadius = levelRadii.get(lvl) || 0;
          if (currentRadius > 0) {
            const adjustedRadius = currentRadius + (scaledRadius - level3Radius);
            levelRadii.set(lvl, adjustedRadius);
            console.log(`Level ${lvl}: radius adjusted to maintain spacing: ${currentRadius.toFixed(1)} → ${adjustedRadius.toFixed(1)}`);
          }
        }
      }
    }

    return levelRadii;
  }, [config.fontSize, config.nodeSize, config.labelPadding, config.baseLevelDistance, config.levelDistanceIncrement]);
  
  // Enhanced node distribution function with better angle allocation and overlap prevention
  const distributeNodes = useCallback((
    hierarchy: d3.HierarchyNode<TreeNodeData>
  ): void => {
    // Step 1: Calculate subtree sizes and node statistics for each node
    const calculateSubtreeSize = (node: d3.HierarchyNode<TreeNodeData>): number => {
      if (!node.children || node.children.length === 0) {
        return 1; // Leaf nodes count as 1
      }
      // Sum up sizes of all children
      return node.children.reduce((sum, child) => sum + calculateSubtreeSize(child), 0);
    };
    
    // Pre-calculate global statistics for better angle distribution
    const totalNodes = hierarchy.descendants().length;
    const maxDepth = hierarchy.height || 0;
    const nodesByLevel = new Map<number, number>();
    
    hierarchy.each(node => {
      const depth = node.depth || 0;
      nodesByLevel.set(depth, (nodesByLevel.get(depth) || 0) + 1);
    });
    
    // Add subtreeSize property to d3.HierarchyNode type for TypeScript
    type ExtendedHierarchyNode = d3.HierarchyNode<TreeNodeData> & {
      subtreeSize?: number;
      x?: number;
      childAngle?: number; // Store space needed per child
      maxChildrenInSubtree?: number; // Store max children in any node's subtree
    };
    
    // Calculate and annotate each node with its subtree size and max children
    hierarchy.each((node: ExtendedHierarchyNode) => {
      node.subtreeSize = calculateSubtreeSize(node as d3.HierarchyNode<TreeNodeData>);
      
      // Calculate max direct children in subtree
      const calculateMaxChildren = (n: d3.HierarchyNode<TreeNodeData>): number => {
        if (!n.children || n.children.length === 0) return 0;
        
        const directChildren = n.children.length;
        const maxInSubtree = Math.max(...n.children.map(calculateMaxChildren));
        
        return Math.max(directChildren, maxInSubtree);
      };
      
      node.maxChildrenInSubtree = calculateMaxChildren(node as d3.HierarchyNode<TreeNodeData>);
    });
    
    // Set root at top position (90 degrees = π/2 radians)
    (hierarchy as ExtendedHierarchyNode).x = Math.PI / 2;
    
    // Step 3: Improved distribution algorithm with multiple passes
    const distributeChildrenRecursively = (
      node: ExtendedHierarchyNode,
      startAngle: number,
      endAngle: number
    ): void => {
      if (!node.children || node.children.length === 0) return;
    
      // ← capture the ORIGINAL slot
      const originalStart = startAngle;
      const originalEnd = endAngle;
      let angleRange = endAngle - startAngle;
    
      // Sort children alphabetically for consistent ordering
      node.children.sort((a, b) => a.data.name.localeCompare(b.data.name));
    
      // Get node depth for consistent spacing calculations
      const depth = node.depth || 0;
      const childCount = node.children.length;
      const nodesAtLevel = nodesByLevel.get(depth + 1) || 1;
    
      // Calculate minimum angle per child based on depth
      let minAnglePerChild: number;
      if (depth >= 6) {
        minAnglePerChild = 0.01;
      } else if (depth >= 4) {
        minAnglePerChild = 0.015;
      } else if (depth >= 2) {
        minAnglePerChild = 0.02;
      } else {
        minAnglePerChild = 0.03;
      }
    
      // Calculate minimum total angle needed for all children
      const minAngleNeeded = childCount * minAnglePerChild;
    
      // For levels with many children, calculate an adjusted angle range
      if (childCount > 10) {
        // Calculate adaptive max angle based on depth and child count
        let maxAngleMultiplier: number;
        if (depth <= 1) {
          maxAngleMultiplier = 0.8;
        } else if (depth <= 3) {
          maxAngleMultiplier = 0.5;
        } else if (depth <= 5) {
          maxAngleMultiplier = 0.3;
        } else {
          maxAngleMultiplier = 0.2;
        }
    
        // Adjust by node count
        const adjustedMultiplier = maxAngleMultiplier * Math.min(1, 30 / childCount);
        const maxAngle = Math.PI * adjustedMultiplier;
    
        // Center the angle range around the parent's angle
        const parentAngle = node.x || 0;
        const midAngle = parentAngle;
    
        // Final angle range is the minimum of current range or max allowed
        const adjustedAngleRange = Math.min(angleRange, maxAngle);
    
        // Center the range around the parent node
        const originalStartAngle = startAngle;
        const originalEndAngle = endAngle;
        startAngle = midAngle - adjustedAngleRange / 2;
        endAngle = midAngle + adjustedAngleRange / 2;
    
        // MINIMAL FIX: Prevent reversals by checking if direction would change
        const originalDirection = originalEndAngle > originalStartAngle;
        const newDirection = endAngle > startAngle;
        if (originalDirection !== newDirection) {
          const rangeSize = Math.abs(endAngle - startAngle);
          if (originalDirection) {
            startAngle = midAngle;
            endAngle = midAngle + rangeSize;
          } else {
            endAngle = midAngle;
            startAngle = midAngle - rangeSize;
          }
        }
    
        // Recompute angleRange after adjustments
        angleRange = endAngle - startAngle;
    
        // ← clamp back inside the parent’s slot
        startAngle = Math.max(startAngle, originalStart);
        endAngle = Math.min(endAngle, originalEnd);
        angleRange = endAngle - startAngle;
      }
    
      // Ensure we have at least the minimum angle needed
      if (angleRange < minAngleNeeded) {
        const expansion = minAngleNeeded / angleRange;
        const midAngle = (startAngle + endAngle) / 2;
        angleRange = minAngleNeeded;
        startAngle = midAngle - angleRange / 2;
        endAngle = midAngle + angleRange / 2;
    
        console.log(
          `Expanded angle range for node at depth ${depth} with ${childCount} children by factor ${expansion.toFixed(2)}`
        );
    
        // ← clamp again
        startAngle = Math.max(startAngle, originalStart);
        endAngle = Math.min(endAngle, originalEnd);
        angleRange = endAngle - startAngle;
      }
    
      // Decide on distribution strategy based on depth and child count
      const useUniformDistribution =
        (depth >= 3 && childCount > 5) ||
        depth >= 5 ||
        childCount > 15;
    
      // Store the angle per child for debugging
      node.childAngle = angleRange / childCount;
    
      if (useUniformDistribution) {
        const uniformAngle = angleRange / childCount;
        const jitterFactor = uniformAngle * 0.05;
    
        (node.children as ExtendedHierarchyNode[]).forEach((child, index) => {
          const randomOffset = (Math.random() - 0.5) * jitterFactor;
          child.x = startAngle + (index + 0.5) * uniformAngle + randomOffset;
    
          const childStartAngle = startAngle + index * uniformAngle;
          const childEndAngle = childStartAngle + uniformAngle;
    
          distributeChildrenRecursively(child, childStartAngle, childEndAngle);
        });
      } else {
        let currentAngle = startAngle;
        const totalSubtreeSize = node.children.reduce(
          (sum, child) => sum + (child.subtreeSize || 1),
          0
        );
    
        (node.children as ExtendedHierarchyNode[]).forEach((child) => {
          const childProportion = (child.subtreeSize || 1) / totalSubtreeSize;
          const childAngleRange = angleRange * childProportion;
    
          child.x = currentAngle + childAngleRange / 2;
    
          distributeChildrenRecursively(
            child,
            currentAngle,
            currentAngle + childAngleRange
          );
    
          currentAngle += childAngleRange;
        });
      }
    
      // Apply multiple passes of minimum spacing
      for (let pass = 0; pass < 6; pass++) {
        applyMinimumSpacing(
          node.children as ExtendedHierarchyNode[],
          node.x,
          depth
        );
      }
    };
    
    // Enhanced minimum spacing application with multiple passes
    const applyMinimumSpacing = (nodes: ExtendedHierarchyNode[], parentAngle?: number, depth?: number): void => {
      if (!nodes || nodes.length <= 1) return;
      
      // Sort by angle
      nodes.sort((a, b) => (a.x || 0) - (b.x || 0));
      
      // Define minimum spacing based on depth with consistent values
      const nodeDepth = depth || 0;
      
      // Adaptive minimum spacing based on node count and depth
      let minSpacing;
      if (nodeDepth >= 6) {
        minSpacing = 0.01; // Very tight for deepest levels
      } else if (nodeDepth >= 4) {
        minSpacing = 0.015; // Tight for deep levels  
      } else if (nodeDepth >= 2) {
        minSpacing = 0.02; // Medium for middle levels
      } else {
        minSpacing = 0.03; // Wider for top levels
      }
      
      // Adjust for node count - more nodes need tighter packing
      const nodeCount = nodes.length;
      if (nodeCount > 20) {
        minSpacing *= 0.7; // Reduce spacing for many nodes
      } else if (nodeCount > 10) {
        minSpacing *= 0.85; // Slightly reduce spacing
      }
      
      // First pass: check and fix minimum spacing between adjacent nodes
      let hasAdjusted = false;
      for (let i = 0; i < nodes.length - 1; i++) {
        const current = nodes[i];
        const next = nodes[i + 1];
        
        let diff = (next.x || 0) - (current.x || 0);
        if (diff < 0) diff += 2 * Math.PI;
        
        if (diff < minSpacing) {
          hasAdjusted = true;
          // Push the next node away to maintain minimum spacing
          next.x = ((current.x || 0) + minSpacing) % (2 * Math.PI);
        }
      }
      
      // If adjustments were made, recenter around parent
      if (hasAdjusted && parentAngle !== undefined) {
        // Calculate current average angle
        const avgAngle = nodes.reduce((sum, node) => sum + (node.x || 0), 0) / nodes.length;
        
        // Calculate shift to recenter
        let shift = parentAngle - avgAngle;
        
        // Normalize to [-π, π]
        if (shift > Math.PI) shift -= 2 * Math.PI;
        if (shift < -Math.PI) shift += 2 * Math.PI;
        
        // Apply limited shift to all children
        const maxShift = Math.PI / 8;
        const limitedShift = Math.sign(shift) * Math.min(Math.abs(shift), maxShift);
        
        nodes.forEach(node => {
          if (node.x !== undefined) {
            node.x = (node.x + limitedShift) % (2 * Math.PI);
            if (node.x < 0) node.x += 2 * Math.PI;
          }
        });
      }
      
      // Second pass to verify minimum spacing is maintained after recentering
      for (let i = 0; i < nodes.length - 1; i++) {
        const current = nodes[i];
        const next = nodes[i + 1];
        
        let diff = (next.x || 0) - (current.x || 0);
        if (diff < 0) diff += 2 * Math.PI;
        
        if (diff < minSpacing) {
          // If still too close, enforce minimum spacing again
          next.x = ((current.x || 0) + minSpacing) % (2 * Math.PI);
        }
      }
      
      // Special handling for circular wrap-around
      // Check spacing between last and first node
      if (nodes.length > 1) {
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        
        let diff = ((first.x || 0) + 2 * Math.PI) - (last.x || 0);
        if (diff > Math.PI) diff = 2 * Math.PI - diff;
        
        if (diff < minSpacing) {
          // Adjust positions to maintain minimum spacing
          const adjustment = (minSpacing - diff) / 2;
          
          // Move first node clockwise and last node counter-clockwise
          if (first.x !== undefined) {
            first.x = (first.x + adjustment) % (2 * Math.PI);
          }
          
          if (last.x !== undefined) {
            last.x = (last.x - adjustment) % (2 * Math.PI);
            if (last.x < 0) last.x += 2 * Math.PI;
          }
        }
      }
    };
    
    // Add global validation pass
    const validateLayout = (root: ExtendedHierarchyNode): void => {
      // Group nodes by level
      const nodesByLevel = new Map<number, ExtendedHierarchyNode[]>();
      
      root.each((node: ExtendedHierarchyNode) => {
        const depth = node.depth || 0;
        if (!nodesByLevel.has(depth)) {
          nodesByLevel.set(depth, []);
        }
        nodesByLevel.get(depth)?.push(node);
      });
      
      // Check for overlaps at each level and log statistics
      nodesByLevel.forEach((nodes, level) => {
        if (nodes.length <= 1) return;
        
        // Count potential overlaps
        let overlaps = 0;
        const minAngle = level >= 6 ? 0.01 : level >= 4 ? 0.015 : level >= 2 ? 0.02 : 0.03;
        
        nodes.sort((a, b) => (a.x || 0) - (b.x || 0));
        
        for (let i = 0; i < nodes.length - 1; i++) {
          const current = nodes[i];
          const next = nodes[i + 1];
          
          let diff = (next.x || 0) - (current.x || 0);
          if (diff < 0) diff += 2 * Math.PI;
          
          if (diff < minAngle) {
            overlaps++;
          }
        }
        
        console.log(`Level ${level}: ${nodes.length} nodes, ${overlaps} potential overlaps`);
        
        // Apply spacing correction for levels with overlaps
        if (overlaps > 0 && level > 0) {
          console.log(`Applying extra spacing correction to level ${level}`);
          
          // Group nodes by parent
          const nodesByParent = new Map<ExtendedHierarchyNode, ExtendedHierarchyNode[]>();
          
          nodes.forEach(node => {
            if (!node.parent) return;
            
            if (!nodesByParent.has(node.parent)) {
              nodesByParent.set(node.parent, []);
            }
            nodesByParent.get(node.parent)?.push(node);
          });
          
          // Apply spacing to each parent's children group
          nodesByParent.forEach((children, parent) => {
            if (children.length > 1) {
              applyMinimumSpacing(children, parent.x, level);
            }
          });
        }
      });
    
      // ─── GLOBAL DE-OVERLAP PASS ─────────────────────────────────────────────
      for (let pass = 0; pass < 5; pass++) {
        nodesByLevel.forEach((nodes, level) => {
            if (nodes.length < 2) return;
        nodes.sort((a, b) => (a.x! - b.x!));
        const minAng = (level >= 6 ? 0.01
                      : level >= 4 ? 0.015
                      : level >= 2 ? 0.02
                      : 0.03) * 1.2;
        for (let i = 0; i < nodes.length; i++) {
          const curr = nodes[i];
          const next = nodes[(i + 1) % nodes.length];
          let diff = (next.x! - curr.x!);
          if (i === nodes.length - 1) diff += 2 * Math.PI;
          if (diff < minAng) next.x = (curr.x! + minAng) % (2 * Math.PI);
          }
        }
      )};
    }
    // Start distribution from the root
    distributeChildrenRecursively(hierarchy as ExtendedHierarchyNode, 0, 2 * Math.PI);
    
    // Final validation pass to ensure consistency
    validateLayout(hierarchy as ExtendedHierarchyNode);
    

  }, [polarToCartesian, config]); 

  // Create the visualization
  useEffect(() => {
    if (!data || loading || error) return;
    
    // Capture current transform before removing old SVG
    const savedTransform = currentTransformRef.current;
    
    // Clear existing SVG
    if (containerRef.current) {
      const existingSvg = containerRef.current.querySelector('svg');
      if (existingSvg) {
        existingSvg.remove();
      }
    }
    
    // Filter data and create hierarchy
    const filteredData = filterData(data);
    if (!filteredData) return;
    
    // Create hierarchy for D3
    const hierarchy = d3.hierarchy(filteredData);
    
    // Sort nodes for consistent rendering
    hierarchy.sort((a: d3.HierarchyNode<TreeNodeData>, b: d3.HierarchyNode<TreeNodeData>) => d3.ascending(a.data.name, b.data.name));
    
    // Calculate optimal radii for each level
    const maxAvailableRadius = Math.min(dimensions.width, dimensions.height) * 0.9;
    const levelRadii = calculateLevelRadii(hierarchy, maxAvailableRadius);
    
    // Create tree layout
    const tree = d3.tree<TreeNodeData>()
      .size([2 * Math.PI, 1])
      .separation((a: d3.HierarchyPointNode<TreeNodeData>, b: d3.HierarchyPointNode<TreeNodeData>) => {
        // Use HierarchyPointNode for separation as it deals with layout positions
        return (a.parent === b.parent ? 1 : 2) / (a.depth || 1);
      });
    
    // Apply tree layout
    const root = tree(hierarchy); // root is d3.HierarchyPointNode<TreeNodeData>
    
    // Apply calculated radii to nodes
    root.each((node: d3.HierarchyPointNode<TreeNodeData>) => {
      const depth = node.depth || 0;
      node.y = levelRadii.get(depth) || 0;
    });
    
    // Apply custom node distribution
    distributeNodes(root);
    
    // Create the SVG element with a simple viewBox
    const svg = d3.create("svg")
      .attr("width", dimensions.width)
      .attr("height", dimensions.height)
      .attr("viewBox", [0, 0, dimensions.width, dimensions.height])
      .attr("style", `max-width: 100%; font: ${config.fontSize}px sans-serif;`)
      .attr("class", isDarkMode ? "dark-theme" : "light-theme");
    
    // Create a root container group for panning and zooming
    const rootContainer = svg.append("g")
      .attr("class", "root-container");
      
    // Store the reference to the container element for direct manipulation
    gRef.current = rootContainer.node();
    
    // Set up proper D3 zoom behavior directly on the SVG
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.05, 10])
      .on("zoom", (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        if (gRef.current) {
          d3.select(gRef.current).attr("transform", event.transform.toString()); // Use toString() for safety
          // Store current transform
          currentTransformRef.current = event.transform;
        }
      });

    zoomRef.current = zoom;

    // Initialize SVG with zoom
    svg.call(zoom as any)
      .on("dblclick.zoom", null)
      .on("contextmenu", (event: MouseEvent) => event.preventDefault());

      // Replace the double-click handler section (around line 687-706)
      // with this code that properly handles double-click

      // Replace with our custom double-click handler
      svg.on("dblclick", (event: MouseEvent) => {
        // Prevent double-click from being handled by other listeners
        event.preventDefault();
        event.stopPropagation();
        
        // Calculate the center of the SVG
        const centerX = dimensions.width / 2;
        const centerY = dimensions.height / 2;
        
        // Reset to identity transform with proper scaling from center
        svg.transition()
          .duration(750)
          .call(
            (zoom.transform as any),
            d3.zoomIdentity
              .translate(centerX, centerY)  // Center the visualization
              .scale(1)                     // Reset scale to 1
          );
      });

    // Disable built-in double-click zoom
    svg.on("dblclick.zoom", null);
    
    // Add links between nodes
    rootContainer.append("g")
      .attr("fill", "none")
      .attr("stroke", isDarkMode ? "#666" : "#555")
      .attr("stroke-opacity", config.linkOpacity)
      .attr("stroke-width", config.linkWidth)
      .selectAll("path")
      .data(root.links()) // root.links() provides HierarchyLink<TreeNodeData>[]
      .join("path")
        .attr("class", "link")
        .attr("d", (d: d3.HierarchyLink<TreeNodeData>) => {
          // Source & target are HierarchyPointNode<TreeNodeData>
          const sourceNode = d.source as d3.HierarchyPointNode<TreeNodeData>;
          const targetNode = d.target as d3.HierarchyPointNode<TreeNodeData>;
          const sa = sourceNode.x ?? 0;
          const sr = sourceNode.y ?? 0;
          const ta = targetNode.x ?? 0;
          const tr = targetNode.y ?? 0;

          // Convert to Cartesian coordinates
          const [sx, sy] = polarToCartesian(sa, sr);
          const [tx, ty] = polarToCartesian(ta, tr);

          // Create smooth curve
          let diff = ta - sa;
          if (diff > Math.PI) diff -= 2 * Math.PI;
          if (diff < -Math.PI) diff += 2 * Math.PI;

          const factor = Math.min(0.3, Math.abs(diff) / Math.PI);
          const midAngle = sa + diff / 2;
          const ctrlR = Math.max(sr, tr) * (1 + factor * 0.1);
          const [cx, cy] = polarToCartesian(midAngle, ctrlR);

          return `M${sx},${sy} Q${cx},${cy} ${tx},${ty}`;
        });
    
    // Create node groups
    const node = rootContainer.append("g")
      .selectAll<SVGGElement, d3.HierarchyPointNode<TreeNodeData>>("g") // Specify types for selection
      .data(root.descendants())
      .join("g")
        .attr("class", (d: d3.HierarchyPointNode<TreeNodeData>) => {
          const isCategory = d.children && d.depth > 0;
          const isField = d.data && d.data.data && Object.keys(d.data.data || {}).length > 0;
          return `node ${isCategory ? 'category-node' : ''} ${isField ? 'field-node' : ''}`;
        })
        .attr("transform", (d: d3.HierarchyPointNode<TreeNodeData>) => {
          const x = d.x || 0;
          const y = d.y || 0;
          return `rotate(${(x * 180 / Math.PI - 90)}) translate(${y},0)`;
        })
        .style("cursor", (d: d3.HierarchyPointNode<TreeNodeData>) =>
          (d.children && d.depth > 0) || (d.data && d.data.data && Object.keys(d.data.data || {}).length > 0) ? "pointer" : "default")
        .style("pointer-events", (d: d3.HierarchyPointNode<TreeNodeData>) => {
          return (d.children && d.depth > 0) || (d.data && d.data.data && Object.keys(d.data.data || {}).length > 0) ? "auto" : "none";
        })
        .on("click", (event: MouseEvent, d: d3.HierarchyPointNode<TreeNodeData>) => {
          event.stopPropagation(); // Prevent event bubbling

          // Skip root node
          if (d.depth === 0) return;
          
          const path = getNodePath(d);
          const isFieldNode = d.data && d.data.data && Object.keys(d.data.data).length > 0 && (!d.children || d.children.length === 0);
          
          // Toggle expansion for category nodes
          if (!isFieldNode) {
            setExpandedBranches((prev: Set<string>) => {
              const next = new Set(prev);
              if (next.has(path)) {
                next.delete(path);
                console.log(`Collapsed branch: ${path}`);
              } else {
                next.add(path);
                console.log(`Expanded branch: ${path}`);
              }
              return next;
            });
          }
          
          // Show tooltip for field nodes
          if (isFieldNode) {
            setTooltipData(d.data);
            
            if (svgRef.current) {
              // Calculate position for tooltip
              const svgElement = svgRef.current;
              const ctm = svgElement.getScreenCTM();
              
              if (ctm) {
                const svgPoint = svgElement.createSVGPoint();
                const angle = d.x || 0;
                const radius = d.y || 0;
                
                // Convert to cartesian coordinates
                svgPoint.x = Math.cos(angle - Math.PI/2) * radius;
                svgPoint.y = Math.sin(angle - Math.PI/2) * radius;
                
                // Apply transformation
                const transformedPoint = svgPoint.matrixTransform(ctm);
                
                // Convert to container space
                const containerRect = containerRef.current?.getBoundingClientRect();
                if (containerRef.current && containerRect) {
                  const relativeX = transformedPoint.x - containerRect.left + (containerRef.current.scrollLeft || 0);
                  const relativeY = transformedPoint.y - containerRect.top + (containerRef.current.scrollTop || 0);
                  
                  setTooltipPosition({
                    x: relativeX + 20,
                    y: relativeY
                  });
                }
              }
            }
          }
        });
    
    // Add circles for nodes
    node.append("circle")
      .attr("fill", (d: d3.HierarchyPointNode<TreeNodeData>) => {
        if (d.depth === 0) return "#4f46e5"; // Root - Indigo
        if (d.data.data && d.data.data.field_id !== undefined) return isDarkMode ? "#F5E100" : "#E6D300"; // Field - Yellow (dark/light)
        if (d.children) return isDarkMode ? "#00F583" : "#00D975"; // Category - Green (dark/light)
        return isDarkMode ? "#69635C" : "#d8dbe2"; // Other - Gray (dark/light)
      })
      .attr("r", config.nodeSize)
      .attr("class", "node-circle")
      .on("mouseover", function(this: SVGCircleElement, event: MouseEvent, d: d3.HierarchyPointNode<TreeNodeData>) { // Type 'this'
        const parentElement = this.parentNode as Element | null;

        // Apply to all nodes, not just category nodes with children
        d3.select(this) // 'this' is now correctly typed
          .transition()
          .duration(200)
          .attr("r", config.nodeSize * 1.2) // Increase size by 1.2x
          .attr("fill", "#4f46e5"); // Indigo color
          
        if (parentElement) {
          d3.select(parentElement as Element)
            .select("text")
            .transition()
            .duration(200)
            .attr("font-weight", "bold")
            .attr("fill", "#4f46e5"); // Indigo color
        }
      })
      .on("mouseout", function(this: SVGCircleElement, event: MouseEvent, d: d3.HierarchyPointNode<TreeNodeData>) { // Type 'this'
        const parentElement = this.parentNode as Element | null;

        // Apply to all nodes, not just category nodes with children
        d3.select(this) // 'this' is now correctly typed
          .transition()
          .duration(200)
          .attr("r", config.nodeSize)
          .attr("fill", function(datum: unknown) {
            // Type assertion to convert the unknown datum to our expected type
            const d = datum as d3.HierarchyNode<TreeNodeData>;
            if (d.depth === 0) return "#4f46e5"; // Root - Indigo
            if (d.data.data && d.data.data.field_id !== undefined) return isDarkMode ? "#F5E100" : "#E6D300"; // Field - Yellow (dark/light)
            if (d.children) return isDarkMode ? "#00F583" : "#00D975"; // Category - Green (dark/light)
            return isDarkMode ? "#69635C" : "#d8dbe2"; // Other - Gray (dark/light)
          });
          
        if (parentElement) {
          d3.select(parentElement as Element)
            .select("text")
            .transition()
            .duration(200)
            .attr("font-weight", "normal")
            .attr("fill", isDarkMode ? "white" : "black");
        }
      });
    
    // No expansion indicators or plus/minus symbols - keeping parent nodes simple
    
    // Add text labels with improved positioning
    if (config.showLabels) {
      node.append("text")
        .attr("dy", "0.31em")
        .attr("x", (d: d3.HierarchyPointNode<TreeNodeData>) => {
          const angle = d.x || 0;
          const depth = d.depth || 0;

          // Increase label padding for outer rings to reduce overlap
          const basePadding = config.labelPadding + config.nodeSize;
          let offset = basePadding;
          
          // Progressively increase padding for deeper levels
          if (depth > 2) {
            // Add 4px of extra padding per level after level 2
            offset = basePadding + ((depth - 2) * 4);
          }
          
          // Even more padding for levels with many nodes
          const levelNodes = d.parent && d.parent.children ? d.parent.children.length : 0;
          if (levelNodes > 15) {
            offset += 5;
          }
          if (levelNodes > 30) {
            offset += 5;
          }
          
          return angle < Math.PI === !d.children ? offset : -offset;
        })
        .attr("text-anchor", (d: d3.HierarchyPointNode<TreeNodeData>) => {
          const angle = d.x || 0;
          return angle < Math.PI === !d.children ? "start" : "end";
        })
        .attr("transform", (d: d3.HierarchyPointNode<TreeNodeData>) => {
          const angle = d.x || 0;
          return angle >= Math.PI ? "rotate(180)" : null;
        })
        .attr("font-size", `${config.fontSize}pt`)
        .text((d: d3.HierarchyPointNode<TreeNodeData>) => d.data.name)
        .attr("stroke", isDarkMode ? null : "white")
        .attr("stroke-width", isDarkMode ? null : 3)
        .attr("paint-order", isDarkMode ? null : "stroke")
        .attr("fill", isDarkMode ? "white" : "black")
        .attr("class", (d: d3.HierarchyPointNode<TreeNodeData>) => {
          const depth = d.depth || 0;
          return `node-label depth-${depth}`;
        })
        .style("pointer-events", "all")
        .append("title") // Title element for native browser tooltips
        .text((d: d3.HierarchyPointNode<TreeNodeData>) => d.data.name);
    }

    // Helper to get node ancestors
    const getAncestors = (node: d3.HierarchyNode<TreeNodeData>): d3.HierarchyNode<TreeNodeData>[] => {
      const ancestors: d3.HierarchyNode<TreeNodeData>[] = [];
      let current: d3.HierarchyNode<TreeNodeData> | null = node;
      while (current) {
        ancestors.unshift(current);
        current = current.parent;
      }
      return ancestors;
    };
    
    // Add highlight effects with stroke on hover
    node.on("mouseover", (event: MouseEvent, d: d3.HierarchyPointNode<TreeNodeData>) => {
      // Only process if not currently dragging
      if (event.defaultPrevented) return;

      const ancestors = getAncestors(d);
      const descendants = d.descendants();
      
      // Highlight ancestor nodes and path
      rootContainer.selectAll<SVGCircleElement, d3.HierarchyPointNode<TreeNodeData>>(".node-circle")
        .filter((p: d3.HierarchyPointNode<TreeNodeData>) => ancestors.includes(p))
        .transition()
        .duration(200)
        .attr("fill", "#4f46e5") // Indigo color
        .attr("r", config.nodeSize * 1.8);
        
      // No need to add strokes to expand indicators

      rootContainer.selectAll<SVGTextElement, d3.HierarchyPointNode<TreeNodeData>>("text")
        .filter((p: d3.HierarchyPointNode<TreeNodeData>) => ancestors.includes(p))
        .transition()
        .duration(200)
        .attr("fill", "#4f46e5")
        .attr("font-weight", "bold");
      
      rootContainer.selectAll<SVGPathElement, d3.HierarchyLink<TreeNodeData>>("path.link")
        .filter((p: d3.HierarchyLink<TreeNodeData>) => {
          // Ensure source and target are HierarchyPointNode before checking includes
          const sourceNode = p.source as d3.HierarchyPointNode<TreeNodeData>;
          const targetNode = p.target as d3.HierarchyPointNode<TreeNodeData>;
          return ancestors.includes(sourceNode) && ancestors.includes(targetNode);
        })
        .transition()
        .duration(200)
        .attr("stroke", "#4f46e5")
        .attr("stroke-width", config.linkWidth * 2);
      
      // Highlight descendant nodes and paths
      rootContainer.selectAll<SVGCircleElement, d3.HierarchyPointNode<TreeNodeData>>(".node-circle")
        .filter((p: d3.HierarchyPointNode<TreeNodeData>) => descendants.includes(p) && p !== d)
        .transition()
        .duration(200)
        .attr("fill", "#4f46e5")
        .attr("r", config.nodeSize * 1.8);
      
      rootContainer.selectAll<SVGTextElement, d3.HierarchyPointNode<TreeNodeData>>("text")
        .filter((p: d3.HierarchyPointNode<TreeNodeData>) => descendants.includes(p) && p !== d)
        .transition()
        .duration(200)
        .attr("fill", "#4f46e5")
        .attr("font-weight", "bold");
      
      rootContainer.selectAll<SVGPathElement, d3.HierarchyLink<TreeNodeData>>("path.link")
        .filter((p: d3.HierarchyLink<TreeNodeData>) => {
          const sourceNode = p.source as d3.HierarchyPointNode<TreeNodeData>;
          const targetNode = p.target as d3.HierarchyPointNode<TreeNodeData>;
          return (sourceNode === d && descendants.includes(targetNode)) ||
                 (descendants.includes(sourceNode) && descendants.includes(targetNode));
        })
        .transition()
        .duration(200)
        .attr("stroke", "#4f46e5")
        .attr("stroke-width", config.linkWidth * 2);
    })
    .on("mouseout", () => {
      // Restore original styling
      rootContainer.selectAll<SVGCircleElement, d3.HierarchyPointNode<TreeNodeData>>(".node-circle")
        .transition()
        .duration(200)
        .attr("fill", (p: d3.HierarchyPointNode<TreeNodeData>) => {
          if (p.depth === 0) return "#4f46e5"; // Root - Indigo
          if (p.data.data && p.data.data.field_id !== undefined) return isDarkMode ? "#F5E100" : "#E6D300"; // Field - Yellow (dark/light)
          if (p.children) return isDarkMode ? "#00F583" : "#00D975"; // Category - Green (dark/light)
          return isDarkMode ? "#69635C" : "#d8dbe2"; // Other - Gray (dark/light)
        })
        .attr("r", config.nodeSize);

      rootContainer.selectAll<SVGTextElement, unknown>("text") // Use unknown for data type if not needed
        .transition()
        .duration(200)
        .attr("fill", isDarkMode ? "white" : "black")
        .attr("font-weight", "normal");

      rootContainer.selectAll<SVGPathElement, unknown>("path.link") // Use unknown for data type if not needed
        .transition()
        .duration(200)
        .attr("stroke", isDarkMode ? "#666" : "#555")
        .attr("stroke-width", config.linkWidth);
    });
    
    // Improve cursor behavior for better panning feedback
    svg.style("cursor", "grab")
      .on("mousedown.cursor", function(event: MouseEvent) {
        // Only change cursor if it's a primary mouse button (left click)
        if (event.button === 0) {
          d3.select(this as SVGSVGElement).style("cursor", "grabbing");
        }
      })
      .on("mouseup.cursor", function() {
        d3.select(this as SVGSVGElement).style("cursor", "grab");
      })
      .on("mouseleave.cursor", function() {
        d3.select(this as SVGSVGElement).style("cursor", "grab");
      });

    // Append to container and store references
    const currentContainer = containerRef.current;
    let currentSvgNode: SVGSVGElement | null = null;
    
    if (currentContainer) {
      if (svgRef.current && currentContainer.contains(svgRef.current)) {
        currentContainer.removeChild(svgRef.current);
      }
      
      const svgNode = svg.node();
      if (svgNode) {
        currentContainer.appendChild(svgNode);
        svgRef.current = svgNode;
        currentSvgNode = svgNode;
      }
    }

    // Restore the saved transform after SVG creation and zoom setup
    if (gRef.current && zoomRef.current) {
      // Check if savedTransform is not the initial identity transform
      // Apply saved transform if it exists and is not identity, otherwise apply a default centered view
      if (savedTransform && (savedTransform.k !== 1 || savedTransform.x !== 0 || savedTransform.y !== 0)) {
         svg.call(zoomRef.current.transform, savedTransform);
         // Ensure the ref is updated if we applied the saved one
         currentTransformRef.current = savedTransform;
      } else {
        // Apply a default centered view on initial load or if transform was identity
        const bounds = gRef.current.getBBox();
        const parentWidth = dimensions.width;
        const parentHeight = dimensions.height;
        // No scale calculation - always use scale of 1.0
        const translateX = parentWidth / 2 - (bounds.x + bounds.width / 2);
        const translateY = parentHeight / 2 - (bounds.y + bounds.height / 2);
        const initialTransform = d3.zoomIdentity.translate(translateX, translateY);

        svg.call(zoomRef.current.transform, initialTransform);
        currentTransformRef.current = initialTransform; // Store the calculated initial transform
      }
    }
    
    // Cleanup function
    return () => {
      if (currentSvgNode && currentContainer && currentContainer.contains(currentSvgNode)) {
        currentContainer.removeChild(currentSvgNode);
      }
    };
  }, [
    data,
    dimensions,
    loading, 
    error, 
    expandedBranches, 
    config,
    filterData,
    calculateLevelRadii,
    distributeNodes,
    polarToCartesian,
    getNodePath
  ]);
  
  // Close tooltip handler
  const closeTooltip = useCallback((): void => {
    setTooltipData(null);
  }, []);
  
  // Handle container clicks
  const handleContainerClick = useCallback((event: React.MouseEvent): void => {
    if (event.target === event.currentTarget) {
      closeTooltip();
    }
  }, [closeTooltip]);
  
  // Export SVG function
  const exportSVG = useCallback((): void => {
    if (!svgRef.current) return;
    
    const svgClone = svgRef.current.cloneNode(true) as SVGSVGElement;
    
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .dark-theme { background-color: #1e293b; }
      .light-theme { background-color: #ffffff; }
      text { font-family: sans-serif; font-size: ${config.fontSize}px; }
    `;
    svgClone.insertBefore(styleElement, svgClone.firstChild);
    
    const svgData = new XMLSerializer().serializeToString(svgClone);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = 'radial-tidy-tree.svg';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    URL.revokeObjectURL(svgUrl);
  }, [config.fontSize]);

  return (
    <div className="relative w-full h-full">
      <div
        ref={containerRef}
        className="w-full" // Remove h-full to let the explicit height control
        style={{
          position: 'relative',
          minHeight: '500px',
          // Remove fixed height
          width: '100%', // Explicitly set width to 100%
          margin: '0 auto',
          overflow: 'hidden'
        }}
        onClick={handleContainerClick}
      >
        {/* Loading indicator */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-800/80 z-50">
            <div className="text-lg font-medium">Loading UK Biobank data...</div>
          </div>
        )}
        
        {/* Error message */}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 dark:bg-gray-800/90 z-50 p-4">
            <div className="text-lg font-medium text-red-500 mb-2">Error loading data</div>
            <div className="text-sm text-gray-700 dark:text-gray-300 mb-4">{error}</div>
          </div>
        )}
      </div>
      
      {/* Tree Buttons */}
      <div className="absolute top-2 right-2 z-40 p-2 bg-transparent dark:bg-transparent rounded shadow-sm">
        <TreeButtons
          onExport={exportSVG}
          onViewAll={handleViewAll}
        />
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
            transform: 'translate(0, -50%)'
          }}
          onClick={(e: React.MouseEvent) => e.stopPropagation()} // Type the event 'e'
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
            {tooltipData.data?.field_id !== undefined && (
              <div><span className="font-semibold">Field ID:</span> {tooltipData.data.field_id}</div>
            )}
            {tooltipData.data?.title && (
              <div><span className="font-semibold">Title:</span> {tooltipData.data.title}</div>
            )}
            {tooltipData.data?.num_participants !== undefined && (
              <div><span className="font-semibold">Participants:</span> {tooltipData.data.num_participants.toLocaleString()}</div>
            )}
            {tooltipData.data?.instanced !== undefined && (
              <div><span className="font-semibold">Instanced:</span> {tooltipData.data.instanced}</div>
            )}
            {tooltipData.data?.arrayed !== undefined && (
              <div><span className="font-semibold">Arrayed:</span> {tooltipData.data.arrayed}</div>
            )}
            {tooltipData.data?.sexed !== undefined && (
              <div><span className="font-semibold">Sexed:</span> {tooltipData.data.sexed}</div>
            )}
            {tooltipData.data?.debut && (
              <div><span className="font-semibold">Debut:</span> {tooltipData.data.debut}</div>
            )}
            {tooltipData.data?.version && (
              <div><span className="font-semibold">Version:</span> {tooltipData.data.version}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default RadialTidyTree;