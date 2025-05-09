# Tidy Tree Visualization

This document describes the Tidy Tree visualization component added to the UK Biobank data visualization dashboard.

## Overview

The Tidy Tree visualization provides a hierarchical tree layout for the UK Biobank features data. Unlike the force-directed graph visualizations (2D and 3D), the Tidy Tree organizes nodes in a clean, organized tree structure that clearly shows parent-child relationships.

## Implementation Details

### Components

- **TidyTree.tsx**: The main component that renders the tree visualization using D3.js
- **TidyTreeButtons.tsx**: A specialized button component for TidyTree that provides export functionality
- **Integration with dashboard**: The component is integrated into the dashboard's view options alongside the existing 2D and 3D force graph visualizations

### Data Structure

The Tidy Tree visualization uses the same hierarchical JSON data structure as the force graph visualizations:

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

- **Hierarchical Layout**: Displays the data in a clean, organized tree structure with optimized horizontal spacing
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
- **Export Capability**: Allows exporting the visualization as an SVG file using the dedicated TidyTreeButtons component

## Usage

The Tidy Tree visualization can be accessed from the dashboard by:

1. Clicking the "View Options" button in the header
2. Selecting "Tidy Tree" from the dropdown menu

The visualization is also accessible in the view cycle when clicking the toggle view button.

## Technical Implementation

The Tidy Tree component uses D3.js's tree layout algorithm to position nodes. Key aspects of the implementation include:

- Direct D3.js integration (not using a wrapper library)
- SVG-based rendering for high-quality visualization
- Dynamic resizing to fit the container
- Efficient data filtering to handle large datasets
- Tooltip information on hover for detailed node information
- Custom TidyTreeButtons component for export functionality, ensuring consistent styling with other visualizations

## Visual Styling

The Tidy Tree visualization uses a consistent color scheme to represent different types of nodes:

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
- Expand/collapse indicators use green (#22c55e) for expanded nodes and white for collapsed nodes
- No strokes are used on any nodes to maintain a clean visual appearance

## Future Enhancements

Potential future enhancements for the Tidy Tree visualization:

- Search functionality to locate specific nodes
- Additional layout options (vertical vs. horizontal orientation)
- Animation for transitions between different views
- Customizable node colors based on data attributes