# Frontend UI Fixes

## Visualization Header Menu Z-Index Fix

**Issue:** The VisualizationHeader's dropdown menu was appearing behind the TreeButtons and TidyTreeButtons components when opened.

**Solution:** Increased the z-index of the VisualizationHeader's dropdown menu from 10 to 50 to ensure it appears in front of other UI elements.

```tsx
// Before
<PopoverPanel
  transition
  className="absolute right-0 z-10 mt-5 w-screen max-w-md px-4 sm:px-0 ..."
>

// After
<PopoverPanel
  transition
  className="absolute right-0 z-50 mt-5 w-screen max-w-md px-4 sm:px-0 ..."
>
```

## Tree Visualization Component Structure Fix

**Issue:** The tree visualization components (TidyTree and RadialTidyTree) were experiencing issues with buttons disappearing due to D3 directly manipulating the DOM outside of React's control.

**Solution:** Restructured the components to separate the D3-controlled tree visualization from the React UI elements (buttons, tooltips). This prevents React from removing the D3-injected elements during its reconciliation process.

```tsx
// Before
<div ref={containerRef} className="w-full h-full" ...>
  {/* D3 visualization gets injected here */}
  
  {/* React UI elements */}
  <div className="absolute top-2 right-2 z-10 ...">
    <TidyTreeButtons ... />
  </div>
</div>

// After
<div className="relative w-full h-full">
  {/* D3 visualization container */}
  <div ref={containerRef} className="w-full h-full" ...>
    {/* D3 visualization gets injected here */}
  </div>
  
  {/* React UI elements */}
  <div className="absolute top-2 right-2 z-50 ...">
    <TidyTreeButtons ... />
  </div>
</div>
```

This approach ensures that:
1. D3 only manipulates its own container (the inner div with the containerRef)
2. React UI elements remain under React's control and won't be affected by D3's DOM manipulations
3. The z-index of UI elements is properly respected, ensuring menus and buttons appear in the correct stacking order

## RadialTidyTree ViewAll Function Fix

**Issue:** The `viewall` function in the RadialTidyTree component was not properly zooming out to show the entire chart. It used a fixed scale factor that didn't account for the actual size of the tree.

**Solution:** Enhanced the `handleViewAll` function to dynamically calculate the appropriate scale based on the actual size of the tree and the container dimensions.

```tsx
// Before
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
    );
});

// After
const handleViewAll = useCallback((): void => {
  if (!svgRef.current || !zoomRef.current || !containerRef.current) return;
  
  const svg = d3.select(svgRef.current);
  
  // Find all nodes to determine the maximum radius needed
  const allNodes = svg.selectAll(".node").data();
  if (!allNodes.length) return;
  
  // Calculate the maximum radius used in the tree
  let maxRadius = 0;
  allNodes.forEach((node: any) => {
    if (node.y > maxRadius) {
      maxRadius = node.y;
    }
  });
  
  // Add some padding to ensure labels are visible
  maxRadius += 100;
  
  // Calculate the scale needed to fit the entire tree
  const containerWidth = dimensions.width;
  const containerHeight = dimensions.height;
  const minDimension = Math.min(containerWidth, containerHeight);
  
  // Scale to fit the entire tree with some padding
  const scale = (minDimension / 2) / maxRadius * 0.9;
  
  // Apply the transform with a smooth transition
  svg.transition()
    .duration(750)
    .call(
      zoomRef.current.transform,
      d3.zoomIdentity
        .translate(0, 0)
        .scale(scale)
    );
});
```

This fix ensures that:
1. The entire tree is visible within the container
2. The scale is calculated based on the actual size of the tree
3. The visualization is properly centered on the root node