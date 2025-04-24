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
  
  // Track current translation for panning
  const [translateX, setTranslateX] = useState<number>(0);
  const [translateY, setTranslateY] = useState<number>(0);
  
  // Track current zoom scale
  const [zoomScale, setZoomScale] = useState<number>(1);
  
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
    levelDistanceIncrement: 200,    
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
    
    // Apply CSS to force square aspect ratio
    if (containerRef.current) {
      containerRef.current.style.position = 'relative';
      containerRef.current.style.aspectRatio = '1 / 1';
      containerRef.current.style.width = '100%';
      containerRef.current.style.maxWidth = '100%';
      containerRef.current.style.margin = '0 auto';
      containerRef.current.style.overflow = 'hidden';
    }
    
    const updateDimensions = (): void => {
      if (!containerRef.current) return;
      
      try {
        // Get the container's parent width
        const parentWidth = containerRef.current.parentElement?.clientWidth || window.innerWidth;
        
        // Get the available width, accounting for any padding or margins
        const availableWidth = Math.max(parentWidth, 500); // Ensure minimum 500px, subtract margin/padding
        
        // Use the available width for both dimensions to maintain square aspect
        const size = availableWidth;
        
        // Set dimensions for the SVG
        setDimensions({ width: size, height: size });
        
        // Force the container to be exactly square
        if (containerRef.current) {
          containerRef.current.style.width = `${size}px`;
          containerRef.current.style.height = `${size}px`;
          containerRef.current.style.maxWidth = `${size}px`; // Set explicit maxWidth
          containerRef.current.style.maxHeight = `${size}px`; // Set explicit maxHeight
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

  // Zoom reference
  // Reference for zoom behavior to be persistent across renders
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  
  // Reference to store the g element for direct transformation
  const gRef = useRef<SVGGElement | null>(null);

  // New zoom functionality - properly centers the view
  const handleViewAll = useCallback((): void => {
    if (!svgRef.current || !zoomRef.current) return;
    
    const svg = d3.select(svgRef.current);
    
    // For a radial tree, we need to center at (0,0) in the SVG's coordinate system
    // This is the center of the root node in a radial layout
    const scale = 0.95; // Slightly zoomed out to show everything
    
    // Since our viewBox is [-width/2, -height/2, width, height],
    // we need to translate to (0,0) to center the tree, not width/2,height/2
    const translateX = 0;
    const translateY = 0;
    
    // Apply the transform with a smooth transition
    svg.transition()
      .duration(750)
      .call(
        zoomRef.current.transform,
        d3.zoomIdentity
          .translate(translateX, translateY)
          .scale(scale)
      )
      .on("end", () => {
        // Update React state after transition completes
        setTranslateX(translateX);
        setTranslateY(translateY);
        setZoomScale(scale);
      });
  }, [setTranslateX, setTranslateY, setZoomScale]);
  
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
    hierarchy.sort((a, b) => d3.ascending(a.data.name, b.data.name));
    
    // Calculate optimal radii for each level
    const maxAvailableRadius = Math.min(dimensions.width, dimensions.height) * 0.9;
    const levelRadii = calculateLevelRadii(hierarchy, maxAvailableRadius);
    
    // Create tree layout
    const tree = d3.tree<TreeNodeData>()
      .size([2 * Math.PI, 1])
      .separation((a, b) => {
        return (a.parent === b.parent ? 1 : 2) / (a.depth || 1);
      });
    
    // Apply tree layout
    const root = tree(hierarchy);
    
    // Apply calculated radii to nodes
    root.each(node => {
      const depth = node.depth || 0;
      node.y = levelRadii.get(depth) || 0;
    });
    
    // Apply custom node distribution
    distributeNodes(root);
    
    // Create the SVG element
    const svg = d3.create("svg")
      .attr("width", dimensions.width)
      .attr("height", dimensions.height)
      .attr("viewBox", [
        -dimensions.width / 2, 
        -dimensions.height / 2, 
        dimensions.width, 
        dimensions.height
      ])
      .attr("style", `max-width: 100%; font: ${config.fontSize}px sans-serif;`)
      .attr("class", isDarkMode ? "dark-theme" : "light-theme");
    
    // Create a root container group for panning and zooming
    const rootContainer = svg.append("g")
      .attr("class", "root-container");
      
    // Store the reference to the container element for direct manipulation
    gRef.current = rootContainer.node();
    
    // Set up proper D3 zoom behavior directly on the SVG
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.05, 20]) // Allow zoom range from 5% to 2000%
      .on("zoom", (event) => {
        // Only apply transform to the g element without updating state during active panning
        if (gRef.current) {
          d3.select(gRef.current).attr("transform", event.transform);
        }
      })
      .on("end", (event) => {
        // Update state only when zoom/pan interaction ends
        if (event.sourceEvent) { // Only update if triggered by user interaction, not programmatically
          setTranslateX(event.transform.x);
          setTranslateY(event.transform.y);
          setZoomScale(event.transform.k);
        }
      });

    // Store zoom in ref for reuse in handleViewAll
    zoomRef.current = zoom;

    // Apply zoom to SVG with the current transform
    svg.call(zoom)
      .on("dblclick.zoom", null) // Disable built-in double-click zoom
      .on("contextmenu", event => event.preventDefault())
      .call(
        zoom.transform,
        d3.zoomIdentity
          .translate(translateX, translateY)
          .scale(zoomScale)
      );
      
    // Replace with our custom double-click handler
    svg.on("dblclick", (event) => {
      // Prevent double-click from being handled by other listeners
      event.preventDefault();
      event.stopPropagation();
      
      svg.transition()
        .duration(750)
        .call(zoom.transform, d3.zoomIdentity);
        
      setTranslateX(0);
      setTranslateY(0);
      setZoomScale(1);
    });
      
    // Double-click to reset zoom and center view on root node
    svg.on("dblclick.zoom", (event) => {
      // Prevent double-click from being handled by other listeners
      event.preventDefault();
      event.stopPropagation();
      
      svg.transition()
        .duration(750)
        .call(zoom.transform, d3.zoomIdentity);
        
      setTranslateX(0);
      setTranslateY(0);
      setZoomScale(1);
    });
    
    // Add links between nodes
    rootContainer.append("g")
      .attr("fill", "none")
      .attr("stroke", isDarkMode ? "#666" : "#555")
      .attr("stroke-opacity", config.linkOpacity)
      .attr("stroke-width", config.linkWidth)
      .selectAll("path")
      .data(root.links())
      .join("path")
        .attr("class", "link")
        .attr("d", (d) => {
          // Source & target in polar coordinates
          const sa = d.source.x ?? 0;
          const sr = d.source.y ?? 0;
          const ta = d.target.x ?? 0;
          const tr = d.target.y ?? 0;

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
      .selectAll("g")
      .data(root.descendants())
      .join("g")
        .attr("class", (d) => {
          const isCategory = d.children && d.depth > 0;
          const isField = d.data && d.data.data && Object.keys(d.data.data || {}).length > 0;
          return `node ${isCategory ? 'category-node' : ''} ${isField ? 'field-node' : ''}`;
        })
        .attr("transform", (d) => {
          const x = d.x || 0;
          const y = d.y || 0;
          return `rotate(${(x * 180 / Math.PI - 90)}) translate(${y},0)`;
        })
        .style("cursor", (d) =>
          (d.children && d.depth > 0) || (d.data && d.data.data && Object.keys(d.data.data || {}).length > 0) ? "pointer" : "default")
        .style("pointer-events", (d) => { 
          return (d.children && d.depth > 0) || (d.data && d.data.data && Object.keys(d.data.data || {}).length > 0) ? "auto" : "none"; 
        })
        .on("click", (event, d) => {
          event.stopPropagation(); // Prevent event bubbling
          
          // Skip root node
          if (d.depth === 0) return;
          
          const path = getNodePath(d);
          const isFieldNode = d.data && d.data.data && Object.keys(d.data.data).length > 0 && (!d.children || d.children.length === 0);
          
          // Toggle expansion for category nodes
          if (!isFieldNode) {
            setExpandedBranches(prev => {
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
      .attr("fill", (d) => {
        if (d.depth === 0) return "#a855f7"; // Root - Purple
        if (d.data.data && d.data.data.field_id !== undefined) return "#facc15"; // Field - Yellow
        if (d.children) return "#38bdf8"; // Category - Blue
        return "#999"; // Other - Gray
      })
      .attr("r", config.nodeSize)
      .attr("class", "node-circle")
      .on("mouseover", function(event, d) {
        const parentElement = this.parentNode;
        
        if (d && d.children && d.depth > 0) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr("r", config.nodeSize * 1.5)
            .attr("fill-opacity", 0.8);
            
          d3.select(parentElement)
            .select("text")
            .transition()
            .duration(200)
            .attr("font-weight", "bold")
            .attr("fill", isDarkMode ? "#fff" : "#000");
        }
      })
      .on("mouseout", function(event, d) {
        const parentElement = this.parentNode;
        
        if (d && d.children && d.depth > 0) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr("r", config.nodeSize)
            .attr("fill-opacity", 1);
            
          d3.select(parentElement)
            .select("text")
            .transition()
            .duration(200)
            .attr("font-weight", "normal")
            .attr("fill", null);
        }
      });
    
    // Add expansion indicators
    node.filter((d) => Boolean(d.children) && typeof d.depth === 'number' && d.depth > 0)
      .append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", config.nodeSize / 2)
      .attr("fill", (d) => {
        const path = getNodePath(d);
        return expandedBranches.has(path) ? "#22c55e" : "white"; // Green if expanded, white if collapsed
      })
      .attr("class", "expand-indicator")
      .attr("stroke", "#38bdf8")
      .attr("stroke-width", 1);
    
    // Add plus/minus symbols
    node.filter((d) => Boolean(d.children) && typeof d.depth === 'number' && d.depth > 0)
      .append("svg")
      .attr("width", config.nodeSize * 2)
      .attr("height", config.nodeSize * 2)
      .attr("x", -config.nodeSize)
      .attr("y", -config.nodeSize)
      .attr("viewBox", "0 0 24 24")
      .html((d) => {
        const path = getNodePath(d);
        const isExpanded = expandedBranches.has(path);
        
        // Use SVG path data for Minus or Plus icons
        if (isExpanded) {
          // MinusCircle icon path data
          return '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12H9m3-7a9 9 0 1 0 0 18a9 9 0 0 0 0-18z"></path>';
        } else {
          // PlusCircle icon path data
          return '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v6m3-3H9m3-10a9 9 0 1 0 0 18a9 9 0 0 0 0-18z"></path>';
        }
      })
      .attr("fill", "none")
      .attr("stroke", "#000")
      .attr("stroke-width", "2")
      .attr("stroke-linecap", "round")
      .attr("stroke-linejoin", "round");
    
    // Add text labels with improved positioning
    if (config.showLabels) {
      node.append("text")
        .attr("dy", "0.31em")
        .attr("x", (d) => {
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
          const levelNodes = d.parent ? d.parent.children.length : 0;
          if (levelNodes > 15) {
            offset += 5;
          }
          if (levelNodes > 30) {
            offset += 5;
          }
          
          return angle < Math.PI === !d.children ? offset : -offset;
        })
        .attr("text-anchor", (d) => {
          const angle = d.x || 0;
          return angle < Math.PI === !d.children ? "start" : "end";
        })
        .attr("transform", (d) => {
          const angle = d.x || 0;
          return angle >= Math.PI ? "rotate(180)" : null;
        })
        .attr("font-size", `${config.fontSize}pt`)
        .text((d) => d.data.name)
        .attr("stroke", isDarkMode ? "#222" : "white")
        .attr("stroke-width", 3)
        .attr("paint-order", "stroke")
        .attr("fill", isDarkMode ? "white" : "black")
        .attr("class", (d) => {
          const depth = d.depth || 0;
          return `node-label depth-${depth}`;
        })
        .style("pointer-events", "all")
        .append("title")
        .text((d) => d.data.name);
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
    
    // Add highlight effects
    node.on("mouseover", (event, d) => {
      // Only process if not currently dragging
      if (event.defaultPrevented) return;
      
      const ancestors = getAncestors(d);
      const descendants = d.descendants();
      
      // Highlight ancestor nodes and path
      rootContainer.selectAll(".node-circle")
        .filter((p: any) => ancestors.includes(p))
        .transition()
        .duration(200)
        .attr("fill", "#4f46e5") // Indigo color
        .attr("r", config.nodeSize * 1.2);
      
      rootContainer.selectAll("text")
        .filter((p: any) => ancestors.includes(p))
        .transition()
        .duration(200)
        .attr("fill", "#4f46e5")
        .attr("font-weight", "bold");
      
      rootContainer.selectAll("path.link")
        .filter((p: d3.HierarchyLink<TreeNodeData>) => {
          return p.source && p.target && ancestors.includes(p.source) && ancestors.includes(p.target);
        })
        .transition()
        .duration(200)
        .attr("stroke", "#4f46e5")
        .attr("stroke-width", config.linkWidth * 2);
      
      // Highlight descendant nodes and paths
      rootContainer.selectAll(".node-circle")
        .filter((p: any) => descendants.includes(p) && p !== d)
        .transition()
        .duration(200)
        .attr("fill", "#4f46e5")
        .attr("r", config.nodeSize * 1.2);
      
      rootContainer.selectAll("text")
        .filter((p: any) => descendants.includes(p) && p !== d)
        .transition()
        .duration(200)
        .attr("fill", "#4f46e5")
        .attr("font-weight", "bold");
      
      rootContainer.selectAll("path.link")
        .filter((p: d3.HierarchyLink<TreeNodeData>) => {
          return p.source && p.target &&
                ((p.source === d && descendants.includes(p.target)) ||
                  (descendants.includes(p.source) && descendants.includes(p.target)));
        })
        .transition()
        .duration(200)
        .attr("stroke", "#4f46e5")
        .attr("stroke-width", config.linkWidth * 2);
    })
    .on("mouseout", () => {
      // Restore original styling
      rootContainer.selectAll(".node-circle")
        .transition()
        .duration(200)
        .attr("fill", (p: any) => {
          if (p && p.depth === 0) return "#a855f7"; // Root - Purple
          if (p && p.data && p.data.data && p.data.data.field_id !== undefined) return "#facc15"; // Field - Yellow
          if (p && p.children) return "#38bdf8"; // Category - Blue
          return "#999"; // Other - Gray
        })
        .attr("r", config.nodeSize);
      
      rootContainer.selectAll("text")
        .transition()
        .duration(200)
        .attr("fill", isDarkMode ? "white" : "black")
        .attr("font-weight", "normal");
      
      rootContainer.selectAll("path.link")
        .transition()
        .duration(200)
        .attr("stroke", isDarkMode ? "#666" : "#555")
        .attr("stroke-width", config.linkWidth);
    });
    
    // Improve cursor behavior for better panning feedback
    svg.style("cursor", "grab")
      .on("mousedown.cursor", function(event) { 
        // Only change cursor if it's a primary mouse button (left click)
        if (event.button === 0) {
          d3.select(this).style("cursor", "grabbing");
        }
      })
      .on("mouseup.cursor", function() { 
        d3.select(this).style("cursor", "grab"); 
      })
      .on("mouseleave.cursor", function() {
        d3.select(this).style("cursor", "grab");
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
    
    // Cleanup function
    return () => {
      if (currentSvgNode && currentContainer && currentContainer.contains(currentSvgNode)) {
        currentContainer.removeChild(currentSvgNode);
      }
    };
  }, [
    data, 
    dimensions, 
    isDarkMode, 
    loading, 
    error, 
    expandedBranches, 
    config, 
    translateX, 
    translateY,
    zoomScale,
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
      
      
      {/* Tree Buttons */}
      <div className="absolute top-2 right-2 z-50 p-2 bg-transparent dark:bg-transparent rounded shadow-sm">
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
          onClick={(e) => e.stopPropagation()}
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