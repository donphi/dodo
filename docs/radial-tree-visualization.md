# Radial Tidy Tree Visualization

This document describes the Radial Tidy Tree visualization component added to the UK Biobank data visualization dashboard.

## Overview

The Radial Tidy Tree visualization provides a circular hierarchical layout for the UK Biobank features data. Unlike the standard Tidy Tree, the Radial Tidy Tree organizes nodes in a circular pattern, with the root node at the center and child nodes radiating outward. This layout is particularly effective for visualizing large hierarchical datasets in a compact space.

## Implementation Details

### Components

- **RadialTidyTree.tsx**: The main component that renders the radial tree visualization using D3.js
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
- **Export Capability**: Allows exporting the visualization as an SVG file
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
- Efficient data filtering to handle large datasets
- Tooltip information on click for detailed node information
- Automatic theme detection and adaptation
- Responsive design that works across different screen sizes

## Future Enhancements

Potential future enhancements for the Radial Tidy Tree visualization:

- Search functionality to locate specific nodes
- Additional layout options (adjustable radius, angle distribution)
- Animation for transitions between different views
- Customizable node colors based on data attributes
- Ability to save and restore view states
- Enhanced filtering options for complex datasets