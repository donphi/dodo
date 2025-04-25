# Radial Tree Visualization Update

## Recent UI Improvements

### Parent Node Styling Enhancements (April 2025)

The parent nodes in the radial tree visualization have been updated with the following improvements:

1. **Removed Minus Sign**: 
   - Parent nodes no longer display a minus sign when expanded
   - Only collapsed nodes show a plus sign, making the visualization cleaner

2. **Hover-Only Indigo Stroke**: 
   - The permanent stroke around parent nodes has been removed
   - An indigo stroke is now only applied when hovering over nodes
   - This creates a more subtle and elegant visual experience

3. **Improved Centering**:
   - All node components are now properly centered
   - The node circles have explicit cx/cy attributes set to 0
   - The plus icon SVG has been resized and repositioned for perfect centering
   - The expansion indicator circle size has been adjusted for better visibility

These changes improve the overall aesthetics of the visualization while maintaining all functionality. The hover-based highlighting provides better visual feedback without cluttering the default view.