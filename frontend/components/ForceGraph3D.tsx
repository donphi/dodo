"use client";
import { useEffect, useState, useRef } from "react";
import ForceGraph3D from "react-force-graph-3d";
// Remove THREE import as it's already included in force-graph

type NodeObject = {
  id: string;
  label?: string;
  type: string;
  color?: string;
};

type LinkObject = {
  source: string;
  target: string;
  relation?: string;
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
      if (containerRef.current) {
        const width = containerRef.current.clientWidth || 800;
        const height = containerRef.current.clientHeight || 600;
        
        setDimensions({ width, height });
      }
    };
    
    // Initial dimensions
    updateDimensions();
    
    // Set up resize observer to detect container size changes
    const resizeObserver = new ResizeObserver(updateDimensions);
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
    // Load graph data from JSON file
    fetch("/graph-data/graph_1000_nodes.json")
      .then(res => res.json())
      .then((data: GraphData) => {
        // Add colors based on node type
        data.nodes.forEach(n => {
          n.color = n.type === "Field" ? "#facc15" :
                     n.type === "Category" ? "#38bdf8" :
                     n.type === "Root" ? "#a855f7" : "#999";
        });
        setGraphData(data);
      });
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full" style={{ position: 'relative', minHeight: '500px' }}>
      <ForceGraph3D
        graphData={graphData}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor={isDarkMode ? "#111827" : "#ffffff"}
        nodeLabel={(node: NodeObject) => `${node.label || node.id} (${node.type})`}
        nodeAutoColorBy="type"
        linkDirectionalParticles={2}
        linkDirectionalParticleWidth={1.2}
        linkColor={() => isDarkMode ? "rgba(100,100,255,0.4)" : "rgba(70,70,200,0.4)"}
        onNodeClick={(node: NodeObject) => {
          alert(`Clicked on: ${node.label}`);
        }}
      />
    </div>
  );
}