# Graph Visualization Components

This document describes the graph visualization components implemented in the project.

## Overview

The project includes both 2D and 3D force-directed graph visualizations to display network data. These visualizations are implemented using the following React-specific libraries:

- `react-force-graph-3d` - For 3D graph visualization
- `react-force-graph-2d` - For 2D graph visualization
- `three.js` - For 3D rendering (used by react-force-graph-3d)

## Components

### ForceGraph3D Component

The 3D force graph component provides an interactive visualization of network data in three dimensions.

#### Features:
- Interactive 3D visualization with camera controls
- Node coloring based on node type
- Hover tooltips showing node information
- Click interactions for nodes
- Directional particles along links

#### Implementation:
```typescript
// ForceGraph3D.tsx
import { useEffect, useRef, useState } from "react";
import ForceGraph3D from "3d-force-graph";
import * as THREE from "three";

// Node and link type definitions
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
  // Component implementation...
}
```

### ForceGraph2D Component

The 2D force graph component provides a simpler, two-dimensional visualization of the same network data.

#### Features:
- Interactive 2D visualization
- Node coloring based on node type
- Hover tooltips showing node information
- Click interactions for nodes
- Directional particles along links

#### Implementation:
```typescript
// ForceGraph2D.tsx
import { useEffect, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";
import * as THREE from "three";

// Node and link type definitions
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

export default function ForceGraph2DComponent(): JSX.Element {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });

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
    <div className="w-full h-screen">
      <ForceGraph2D
        graphData={graphData}
        backgroundColor="#111827"
        nodeLabel={(node: NodeObject) => `${node.label || node.id} (${node.type})`}
        nodeAutoColorBy="type"
        linkDirectionalParticles={2}
        linkDirectionalParticleWidth={1.2}
        linkColor={() => "rgba(100,100,255,0.4)"}
        onNodeClick={(node: NodeObject) => {
          alert(`Clicked on: ${node.label}`);
        }}
      />
    </div>
  );
}
```

## Pages

### Dashboard

The dashboard page provides a unified interface with a toggle to switch between 2D and 3D visualizations.

```typescript
// dashboard.tsx
import { useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the graph components with SSR disabled
const ForceGraph3DComponent = dynamic(() => import("../components/ForceGraph3D"), { ssr: false });
const ForceGraph2DComponent = dynamic(() => import("../components/ForceGraph2D"), { ssr: false });

export default function Dashboard() {
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('3d');
  
  // Component implementation...
}
```

### Dedicated Pages

There are also dedicated pages for each visualization type:

- `/graph-2d` - Renders only the 2D graph visualization
- `/graph-3d` - Renders only the 3D graph visualization

## Data Format

The graph visualizations expect data in the following JSON format:

```json
{
  "nodes": [
    {
      "id": "node1",
      "label": "Node 1",
      "type": "Category"
    },
    // More nodes...
  ],
  "links": [
    {
      "source": "node1",
      "target": "node2",
      "relation": "connects to"
    },
    // More links...
  ]
}
```

## Styling

The graph visualizations use the following color scheme:

- Field nodes: `#facc15` (yellow)
- Category nodes: `#38bdf8` (blue)
- Root nodes: `#a855f7` (purple)
- Other nodes: `#999` (gray)
- Links: `rgba(100,100,255,0.4)` (semi-transparent blue) in dark mode, `rgba(70,70,200,0.4)` in light mode

### Responsive Design

The graph visualizations are fully responsive and will automatically adjust to:

1. The container size - filling the available space in the dashboard
2. The browser window size - resizing when the window is resized
3. The theme - using appropriate colors for dark and light modes

This is achieved through:

- Using refs to access the DOM elements and their dimensions
- Using ResizeObserver to detect container size changes
- Adding event listeners for window resize events
- Observing theme changes in the document
- Using relative positioning with minimum height to ensure proper sizing
- Setting appropriate width and height values dynamically through state

The graph components are designed to work within the dashboard's existing frame structure, which responds to the bottom of the browser window. The graph visualization inside responds in a similar way within this frame, ensuring a seamless and responsive user experience.

### Technical Implementation Notes

- The graph components use state to track dimensions rather than directly manipulating the DOM
- THREE.js is not explicitly imported in the components as it's already included in the force-graph libraries
- Width and height are passed as props to the ForceGraph components rather than calling methods on refs
- A minimum height of 500px ensures the graph is always visible, even in smaller containers

## Usage

To use the graph visualization in your application:

1. Import the desired component:
   ```typescript
   import dynamic from 'next/dynamic';
   const ForceGraph3DComponent = dynamic(() => import("../components/ForceGraph3D"), { ssr: false });
   ```

2. Use the component in your JSX:
   ```jsx
   <ForceGraph3DComponent />
   ```

3. To switch between 2D and 3D visualizations, use the dashboard component:
   ```jsx
   <Dashboard />
   ```

## Dashboard Integration

The graph visualization has been integrated into the existing dashboard component with a toggle switch to alternate between 2D and 3D views:

### Implementation Details

1. Both graph components are dynamically imported in the dashboard component:
   ```typescript
   // Dynamically import the graph components with SSR disabled
   const ForceGraph3DComponent = dynamic(() => import('../ForceGraph3D'), { ssr: false });
   const ForceGraph2DComponent = dynamic(() => import('../ForceGraph2D'), { ssr: false });
   ```

2. A state variable tracks the current view mode:
   ```typescript
   const [viewMode, setViewMode] = useState<'2d' | '3d'>('3d');
   
   // Toggle between 2D and 3D views
   const toggleView = () => {
     setViewMode(viewMode === '3d' ? '2d' : '3d');
   };
   ```

3. A toggle button is added to the dashboard header next to the theme switcher:
   ```jsx
   <button
     onClick={toggleView}
     className="flex h-8 w-8 items-center justify-center rounded-full
     bg-white/70 dark:bg-gray-800/70 shadow-md backdrop-blur transition-all duration-300
     hover:bg-white/90 dark:hover:bg-gray-900/90"
     aria-label="Toggle view mode"
   >
     {viewMode === '3d' ? (
       <LayoutGrid className="h-4 w-4 text-gray-800 dark:text-indigo-300 transition-all duration-500" />
     ) : (
       <Cube className="h-4 w-4 text-gray-800 dark:text-indigo-300 transition-all duration-500" />
     )}
   </button>
   ```

4. The appropriate component is conditionally rendered in the main content area:
   ```jsx
   <div className="w-full flex-grow border-2 border-gray-300 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-900 transition-colors mb-8">
     {viewMode === '3d' ? <ForceGraph3DComponent /> : <ForceGraph2DComponent />}
   </div>
   ```

### UI Integration

The toggle switch is styled to match the existing dashboard design, using the same visual language as the theme switcher:

- The toggle button uses the same rounded style and hover effects as the theme switcher
- The 2D view is represented by a grid icon (`<LayoutGrid />`)
- The 3D view is represented by a cube icon (`<Cube />`)
- The toggle is positioned next to the theme switcher in both desktop and mobile views
- The graph visualization is contained within the same bordered container that was previously used for the chart