# Frontend UI Documentation

## Dashboard Profile and Menu

The dashboard includes a user profile display and menu functionality that provides the following features:

### Profile Display
- Shows the user's profile picture if available from Supabase
- Falls back to displaying the user's initials in a colored avatar if no profile picture is available
- Displays the user's name and email in the mobile view

### Menu Functionality
- **Contact Us**: Navigates to the contact page using Next.js router
- **Logout**: Properly logs the user out of their Supabase session
- **Delete Account**: Securely deletes the user's profile and account data from Supabase

### Implementation Details

The profile and menu functionality is implemented in the `frontend/components/dashboard/single_page.tsx` component, which uses:

1. The `useAuth` hook (`frontend/hooks/useAuth.ts`) to:
   - Fetch and display the current user's profile information
   - Handle authentication state
   - Provide logout functionality
   - Securely delete user accounts

2. Supabase Edge Functions:
   - `delete-user.ts`: A serverless function that handles secure account deletion using Supabase admin privileges

### Required Environment Variables

For the profile and authentication features to work properly, the following environment variables must be set:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

For the account deletion functionality to work in production, the Supabase Edge Function must be deployed with:

```
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Usage Example

The profile menu is automatically included in the dashboard layout. No additional configuration is needed to use it.

```tsx
// Example of how the dashboard is used in pages
import Dashboard from '../components/dashboard/single_page';

const DashboardPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Dashboard />
    </div>
  );
};

export default DashboardPage;
```

## Form Components and UI Fixes

### Radio Buttons
Radio buttons are implemented in `frontend/components/auth/components/radio.tsx` and provide standard form radio button functionality with proper styling for both light and dark modes.

#### Dark Mode Styling
Radio buttons use the following Tailwind classes to ensure proper appearance in dark mode:
- `dark:border-gray-600` - Darker border in dark mode
- `dark:text-indigo-500` - Adjusted text color for dark mode
- `dark:focus:ring-indigo-500` - Focus ring color for dark mode
- `dark:bg-gray-800` - Background color for dark mode
- `dark:checked:bg-indigo-500` - Background color when checked in dark mode
- `appearance-none checked:appearance-auto` - Controls native appearance when checked

### Error Messages
Error messages are displayed in a consistent, accessible manner across the application. On the registration page (`frontend/pages/register.tsx`), error messages are centered and properly styled for both light and dark modes:

```tsx
{error && (
  <div className="rounded-md bg-red-50 dark:bg-red-900 p-4 mb-6 mx-auto max-w-md">
    <div className="flex">
      <div className="flex-shrink-0">
        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="ml-3">
        <h3 className="text-sm font-medium text-red-800 dark:text-red-200">{error}</h3>
      </div>
    </div>
  </div>
)}
```

Key styling features:
- `mx-auto max-w-md` - Centers the error message with a maximum width
- `dark:bg-red-900` - Dark mode background color
- `dark:text-red-200` - Dark mode text color for better contrast and readability

## 3D Force Graph Visualization

The dashboard now features a 3D force-directed graph visualization that displays network data in an interactive three-dimensional space. This visualization is implemented using the `three-forcegraph` library and Three.js.

### Implementation Details

The 3D Force Graph is implemented in two main components:

1. `frontend/components/ForceGraph3D.tsx`: The core visualization component that:
   - Renders a 3D force-directed graph
   - Loads graph data from JSON files
   - Provides interactive features like node highlighting and click events
   - Auto-colors nodes by their type
   - Displays node labels on hover

2. Integration in the dashboard (`frontend/components/dashboard/single_page.tsx`):
   - The component is dynamically imported with SSR disabled
   - Placed in the main content area of the dashboard
   - Sized to fill the available space with a minimum height

### Features

- **Interactive 3D Visualization**: Users can rotate, zoom, and pan the graph using mouse controls
- **Node Highlighting**: Nodes are highlighted on hover with labels showing node information
- **Visual Categorization**: Nodes are automatically colored by their type attribute
- **Animated Links**: Directional particles flow along links to indicate relationships
- **Click Interaction**: Clicking on nodes triggers an alert with the node's label

### Data Source

The visualization loads graph data from `/graph-data/graph_1000_nodes.json`, which contains nodes and links in the following format:

```json
{
  "nodes": [
    { "id": "node1", "label": "Node 1", "type": "type1" },
    ...
  ],
  "links": [
    { "source": "node1", "target": "node2" },
    ...
  ]
}
```

### Technical Implementation

The 3D Force Graph is implemented using the `3d-force-graph` library (version 1.72.3) along with Three.js. The implementation includes proper TypeScript type definitions for both libraries to ensure type safety.

#### Dependencies

```json
// In package.json
{
  "dependencies": {
    "three": "^0.160.0",
    "3d-force-graph": "^1.72.3"
  },
  "devDependencies": {
    "@types/three": "^0.160.0"
  }
}
```

#### Component Implementation

```typescript
// Import the libraries with proper type support
import ForceGraph3D from "3d-force-graph";
import * as THREE from "three"; // Uses @types/three for type definitions

// Define custom interfaces for the 3D Force Graph
interface NodeObject {
  id: string;
  label: string;
  type: string;
}

interface LinkObject {
  source: string;
  target: string;
}

// Define a custom interface for the ForceGraph3D instance
interface ForceGraph3DInstance {
  graphData: (data: { nodes: NodeObject[]; links: LinkObject[] }) => ForceGraph3DInstance;
  backgroundColor: (color: string) => ForceGraph3DInstance;
  nodeLabel: (callback: (node: NodeObject) => string) => ForceGraph3DInstance;
  nodeAutoColorBy: (field: string) => ForceGraph3DInstance;
  linkDirectionalParticles: (value: number) => ForceGraph3DInstance;
  linkDirectionalParticleWidth: (value: number) => ForceGraph3DInstance;
  linkColor: (callback: () => string) => ForceGraph3DInstance;
  onNodeClick: (callback: (node: NodeObject) => void) => ForceGraph3DInstance;
}

// Component implementation with proper TypeScript typing
export default function ForceGraph3DComponent() {
  // Use null as initial value for refs with custom types
  const containerRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<ForceGraph3DInstance | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize the 3D Force Graph with the correct API
    // Pass the container element directly to the constructor
    const Graph = new ForceGraph3D(containerRef.current)
      .backgroundColor("#f8fafc")
      .nodeLabel((node: any) => {
        // Cast to our custom type to access our properties
        const customNode = node as CustomNodeObject;
        return `${customNode.label} (${customNode.type})`;
      })
      .nodeAutoColorBy("type")
      .linkDirectionalParticles(1)
      .linkDirectionalParticleWidth(1)
      .linkColor(() => "rgba(100,100,255,0.4)")
      .onNodeClick((node: any) => {
        // Cast to our custom type to access our properties
        const customNode = node as CustomNodeObject;
        alert(`Clicked on: ${customNode.label}`);
      });

// Define types for type safety
type ForceGraph3DInstance = ReturnType<typeof ForceGraph3D>;
type NodeObject = {
  id: string;
  label: string;
  type: string;
};

// Initialize the graph in a useEffect hook
useEffect(() => {
  if (!containerRef.current) return;

  const Graph = ForceGraph3D()
    (containerRef.current)
    .backgroundColor("#f8fafc")
    .nodeLabel((node: NodeObject) => `${node.label} (${node.type})`)
    .nodeAutoColorBy("type")
    .linkDirectionalParticles(1)
    .linkDirectionalParticleWidth(1)
    .linkColor(() => "rgba(100,100,255,0.4)")
    .onNodeClick((node: NodeObject) => {
      alert(`Clicked on: ${node.label}`);
    });

  // Load data
  fetch("/graph-data/graph_1000_nodes.json")
    .then(res => res.json())
    .then(data => Graph.graphData(data));

  // Store the graph instance with proper type casting
  fgRef.current = Graph as ForceGraph3DInstance;

  // Store a reference to the container for cleanup
  const container = containerRef.current;
  
  // Proper cleanup that follows React hooks best practices
  return () => {
    if (container) {
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    }
  };
}, []);
```

### Responsive Design

The component is designed to be responsive and adapts to the dashboard container:
- Uses `h-full` and `w-full` to fill the available space
- Sets a minimum height of 500px to ensure visibility
- Maintains proper aspect ratio during window resizing