# Radial Tidy Tree Visualization

This document describes the Radial Tidy Tree visualization component added to the UK Biobank data visualization dashboard.

## Overview

The Radial Tidy Tree visualization provides a circular hierarchical layout for the UK Biobank features data. Unlike the standard Tidy Tree, the Radial Tidy Tree organizes nodes in a circular pattern, with the root node at the center and child nodes radiating outward. This layout is particularly effective for visualizing large hierarchical datasets in a compact space.

## Implementation Details

### Components

- **RadialTidyTree.tsx**: The main component that renders the radial tree visualization using D3.js
- **TreeButtons.tsx**: A reusable button component that provides export and view all functionality
- **Integration with dashboard**: The component is integrated into the dashboard's view options alongside the existing 2D, 3D, and Tidy Tree visualizations

### Data Structure

The Radial Tidy Tree visualization uses the same hierarchical JSON data structure as the other visualizations:

```json
{
  "name": "UKB",
  "children": [
    {
      "name": "Category 1",
      "children": [
        {
          "name": "Field 1: Description",
          "data": {
            "field_id": 123,
            "title": "Description",
            "num_participants": 500000,
            // Other field data
          }
        },
        // More fields
      ]
    },
    // More categories
  ]
}
```

### Features

- **Radial Layout**: Displays the data in a circular tree structure with the root node at the center
- **Collapsible/Expandable Nodes**: Nodes can be expanded or collapsed by clicking on them
  - Only category nodes (blue nodes) are visible by default
  - Field ID nodes (yellow nodes) are completely hidden until a category node is clicked
  - Users can click on category nodes to reveal field nodes
- **Interactive Controls**: Includes controls for:
  - Node size adjustment
  - Link opacity and width customization
  - Showing/hiding labels
  - Filtering by node type (fields, categories)
- **Zoom and Pan**: Supports zooming and panning for exploring large trees
- **Dark/Light Mode Support**: Automatically adapts to the application's theme
- **Export Capability**: Allows exporting the visualization as an SVG file using the TreeButtons component
- **View All Functionality**: Provides a button to reset the view to show the entire tree
- **Tooltips**: Displays detailed information about nodes on click
- **Visual Indicators**: Small indicators show whether a node is expanded or collapsed

## Usage

The Radial Tidy Tree visualization can be accessed from the dashboard by:

1. Clicking the "View Options" button in the header
2. Selecting "Radial Tree" from the dropdown menu

The visualization is also directly accessible via the `/graph-radial` route or by clicking the "Radial Tree" link in the main graph navigation.

## Technical Implementation

The Radial Tidy Tree component uses D3.js's radial tree layout algorithm to position nodes. Key aspects of the implementation include:

- Direct D3.js integration (not using a wrapper library)
- SVG-based rendering for high-quality visualization
- Advanced link path generation that ensures nodes sit correctly along edges
  - Custom Bezier curve calculations for parent-child links that follow the natural radial layout
  - Angle-aware control points that adjust based on the angle difference between nodes
  - Specialized handling for different types of connections (parent-child vs other links)
- Dynamic resizing to fit the container
  - Maintains a square aspect ratio on larger screens for optimal visualization
  - Transitions to a responsive rectangular layout on smaller screens (below 768px)
  - Automatically adapts to fill the available frame completely in both modes
- Efficient data filtering to handle large datasets
- Tooltip information on click for detailed node information
- Automatic theme detection and adaptation
- Responsive design that works across different screen sizes
- TreeButtons component for export and view all functionality
  - Export button allows saving the visualization as an SVG file
  - View All button resets the zoom and pan to show the entire tree

## Future Enhancements

Potential future enhancements for the Radial Tidy Tree visualization:

- Search functionality to locate specific nodes
- Additional layout options (adjustable radius, angle distribution)
- Animation for transitions between different views
- Customizable node colors based on data attributes
- Ability to save and restore view states
- Enhanced filtering options for complex datasets
- Further refinement of responsive behavior for different device types

## Visual Styling

The Radial Tidy Tree visualization uses a consistent color scheme to represent different types of nodes:

- **Root Node**: Indigo (#4f46e5)
- **Category Nodes**:
  - Dark mode: Green (#00F583)
  - Light mode: Green (#00D975)
- **Field Nodes**:
  - Dark mode: Yellow (#F5E100)
  - Light mode: Yellow (#E6D300)
- **Other Nodes**:
  - Dark mode: Gray (#69635C)
  - Light mode: Gray (#d8dbe2)

Nodes have the following visual behaviors:
- On hover, nodes increase in size by 1.2x and change to indigo color (#4f46e5)
- Text labels adapt to the current theme (white in dark mode, black in light mode)
- Links use a subtle gray color that changes based on the theme

## Responsive Behavior

The Radial Tidy Tree visualization implements an adaptive layout strategy:

1. **Large Screens (≥768px):**
   - Maintains a square aspect ratio
   - Visualization is centered within the available space
   - Preserves the circular nature of the radial tree

2. **Small Screens (<768px):**
   - Transitions to a rectangular layout that fills the available frame
   - Adjusts the visualization to maximize use of available screen real estate
   - Maintains readability and interaction capabilities despite the shape change

This responsive approach ensures optimal visualization across different device sizes while preserving the integrity of the data representation. The transition between square and rectangular modes is seamless, with the visualization automatically recalculating node positions and zoom levels to accommodate the new container shape.