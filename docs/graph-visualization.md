# Graph Visualization Components

This document describes the graph visualization components implemented in the project.

## Overview

The project currently focuses on hierarchical tree visualizations to display network data. The available visualizations are:

- Tidy Tree - A hierarchical tree layout that organizes nodes in a clean, structured format
- Radial Tidy Tree - A circular hierarchical layout with the root node at the center

> **Note:** 2D and 3D force-directed graph visualizations and Sunburst visualization are temporarily disabled and will be re-enabled in a future update.

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

### Graph Page

The graph page provides a unified interface with options to switch between different visualization types. Currently, only Tidy Tree and Radial Tidy Tree visualizations are available.

```typescript
// graph.tsx
import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import VisualizationHeader from "../components/VisualizationHeader";

// Dynamically import all graph components with SSR disabled
const TidyTreeComponent = dynamic(() => import("../components/TidyTree"), { ssr: false });
const RadialTidyTreeComponent = dynamic(() => import("../components/RadialTidyTree"), { ssr: false });

export default function GraphPage(): React.ReactElement {
  // Default view is set to 'tidy'
  const [viewMode, setViewMode] = useState<'tidy' | 'radial'>('tidy');
  
  // Component implementation...
}
```

### Visualization Selection

The visualization can be selected from the VisualizationHeader component:

1. Click the "View Options" button in the header
2. Select either "Tidy Tree" or "Radial Tidy Tree" from the dropdown menu

By default, the Tidy Tree visualization is loaded when the page is first accessed.

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

The graph visualization has been integrated into the existing dashboard component with a dropdown menu to select between different visualization types:

### Implementation Details

1. Tree visualization components are dynamically imported in the graph page:
   ```typescript
   // Dynamically import the graph components with SSR disabled
   const TidyTreeComponent = dynamic(() => import("../components/TidyTree"), { ssr: false });
   const RadialTidyTreeComponent = dynamic(() => import("../components/RadialTidyTree"), { ssr: false });
   ```

2. A state variable tracks the current view mode:
   ```typescript
   // Default view is set to 'tidy'
   const [viewMode, setViewMode] = useState<'tidy' | 'radial'>('tidy');
   ```

3. The VisualizationHeader component provides a dropdown menu for selecting visualization types:
   ```jsx
   <VisualizationHeader currentView={viewMode} onViewChange={handleViewChange} />
   ```

4. The appropriate component is conditionally rendered based on the selected view mode:
   ```jsx
   <div
     ref={graphRef}
     className="flex-grow w-full h-full"
     style={{ minHeight: '500px', height: 'calc(100vh - 100px)', overflow: 'auto' }}
   >
     {renderVisualization()}
   </div>
   ```

### UI Integration

The visualization header is designed to provide a seamless user experience:

- The header displays the current visualization type with an appropriate icon
- The dropdown menu shows available visualization options (currently Tidy Tree and Radial Tidy Tree)
- Each option includes a descriptive name and icon for easy identification
- The visualization is contained within a responsive container that adjusts to the browser window size
- The default visualization is Tidy Tree, which loads automatically when the page is accessed