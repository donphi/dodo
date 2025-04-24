
import json
import math
from collections import defaultdict
import os

# Configuration parameters (matching your TypeScript component)
CONFIG = {
    "fontSize": 8,
    "ptToPx": 1.333,
    "minSpacing": 10,
    "minRadiusGrowth": 1.2,
    "innerLevelBuffer": 40,
    "fieldNodeSpacingFactor": 1.5,
    "labelWeightAvg": 0.7,
    "labelWeightMax": 0.3,
    "minInnerRadius": 200,
    "maxLabelDensity": 0.85,
}

def analyze_tree_structure(json_path):
    """Analyze the full tree structure to determine optimal radii for each level"""
    print(f"Analyzing tree structure from: {json_path}")
    
    # Load the JSON data
    with open(json_path, 'r', encoding='utf-8') as f:
        tree_data = json.load(f)
    
    # Statistics collections
    nodes_by_level = defaultdict(int)  # Count of nodes at each level
    max_nodes_by_level = defaultdict(int)  # Maximum potential nodes at each level
    label_lengths_by_level = defaultdict(list)  # List of label lengths at each level
    field_nodes_by_level = defaultdict(int)  # Count of field nodes at each level
    
    # Analyze the tree structure
    def traverse_tree(node, level=0, path=None):
        if path is None:
            path = []
        
        # Count this node at its level
        nodes_by_level[level] += 1
        
        # Record label length
        name = node.get("name", "")
        label_lengths_by_level[level].append(len(name))
        
        # Check if this is a field node
        is_field_node = "data" in node and node["data"] and "field_id" in node["data"]
        if is_field_node:
            field_nodes_by_level[level] += 1
        
        # Process children if they exist
        if "children" in node and node["children"]:
            for child in node["children"]:
                traverse_tree(child, level + 1, path + [name])
    
    # Start traversal from root
    traverse_tree(tree_data)
    
    # Calculate maximum potential nodes at each level
    # This is more complex and would require analyzing all possible expansion states
    # For now, we'll use the actual counts and apply a safety factor
    
    # Calculate optimal radii based on node counts and label lengths
    optimal_radii = calculate_optimal_radii(nodes_by_level, label_lengths_by_level, field_nodes_by_level)
    
    # Generate detailed statistics
    statistics = {
        "totalNodes": sum(nodes_by_level.values()),
        "maxDepth": max(nodes_by_level.keys()),
        "nodesByLevel": dict(nodes_by_level),
        "fieldNodesByLevel": dict(field_nodes_by_level),
        "avgLabelLengthByLevel": {
            level: sum(lengths)/len(lengths) if lengths else 0 
            for level, lengths in label_lengths_by_level.items()
        },
        "maxLabelLengthByLevel": {
            level: max(lengths) if lengths else 0
            for level, lengths in label_lengths_by_level.items()
        },
        "optimalRadii": optimal_radii
    }
    
    return statistics

def calculate_optimal_radii(nodes_by_level, label_lengths_by_level, field_nodes_by_level):
    """Calculate optimal radii for each level to prevent label overlap"""
    optimal_radii = {}
    
    # Character width based on font size
    char_width_px = CONFIG["fontSize"] * CONFIG["ptToPx"] * 0.6
    
    # Calculate initial radii
    initial_radii = {}
    for level in sorted(nodes_by_level.keys()):
        node_count = nodes_by_level[level]
        
        # Skip calculation for root (level 0)
        if level == 0:
            initial_radii[level] = max(CONFIG["innerLevelBuffer"], CONFIG["minInnerRadius"])
            continue
        
        # Skip calculation if no nodes at this level
        if node_count == 0:
            continue
        
        # Get label lengths at this level
        label_lengths = label_lengths_by_level[level]
        
        # Calculate average and maximum label length
        avg_label_length = sum(label_lengths) / len(label_lengths) if label_lengths else 0
        max_label_length = max(label_lengths) if label_lengths else 0
        
        # Calculate effective label length using weighted approach
        effective_label_length = (
            avg_label_length * CONFIG["labelWeightAvg"] + 
            max_label_length * CONFIG["labelWeightMax"]
        )
        
        # Additional spacing for field nodes
        has_field_nodes = field_nodes_by_level[level] > 0
        field_node_spacing = CONFIG["fieldNodeSpacingFactor"] if has_field_nodes else 1.0
        
        # Calculate space needed for each label (in pixels)
        space_needed_per_label = (char_width_px * effective_label_length * field_node_spacing) + CONFIG["minSpacing"]
        
        # Calculate minimum circumference needed
        min_circumference_needed = node_count * space_needed_per_label
        
        # Apply maxLabelDensity to ensure we don't crowd the circumference
        adjusted_circumference_needed = min_circumference_needed / CONFIG["maxLabelDensity"]
        
        # Calculate minimum radius (circumference = 2πr)
        min_radius_needed = adjusted_circumference_needed / (2 * math.pi)
        
        # Store the result
        if level == 1:
            # Special case for level 1 - enforce minimum inner radius
            initial_radii[level] = max(min_radius_needed, CONFIG["minInnerRadius"])
        else:
            initial_radii[level] = min_radius_needed
    
    # Perform a second pass to ensure proper growth between levels
    final_radii = {}
    previous_radius = initial_radii.get(0, max(CONFIG["innerLevelBuffer"], CONFIG["minInnerRadius"]))
    final_radii[0] = previous_radius
    
    for level in sorted(initial_radii.keys())[1:]:
        initial_radius = initial_radii[level]
        
        # Ensure minimum growth between levels
        min_required_radius = previous_radius * CONFIG["minRadiusGrowth"]
        
        if level == 1:
            # For level 1, ensure it's at least minInnerRadius
            final_radius = max(initial_radius, min_required_radius, CONFIG["minInnerRadius"])
        else:
            # For other levels, use the larger of calculated radius or minimum required growth
            final_radius = max(initial_radius, min_required_radius)
        
        final_radii[level] = final_radius
        previous_radius = final_radius
    
    # Include a safety factor for levels with potentially many nodes
    for level in final_radii:
        if level > 1:  # Skip root and first level
            # Add a safety factor that increases with depth
            safety_factor = 1.0 + (level * 0.1)  # 10% per level of depth
            final_radii[level] *= safety_factor
    
    return final_radii

def generate_typescript_config(statistics):
    """Generate TypeScript configuration to be used in the component"""
    optimal_radii = statistics["optimalRadii"]
    
    # Format the radii as TypeScript code
    radii_map = "new Map([\n"
    for level, radius in optimal_radii.items():
        radii_map += f"  [{level}, {radius:.1f}],\n"
    radii_map += "]);"
    
    ts_config = f"""
// Auto-generated optimal radii configuration
// Total nodes: {statistics['totalNodes']}
// Maximum depth: {statistics['maxDepth']}

// Node distribution by level:
{json.dumps(statistics['nodesByLevel'], indent=2)}

// Field node distribution by level:
{json.dumps(statistics['fieldNodesByLevel'], indent=2)}

// Label length statistics by level:
{json.dumps({
    'avgLabelLengthByLevel': statistics['avgLabelLengthByLevel'],
    'maxLabelLengthByLevel': statistics['maxLabelLengthByLevel']
}, indent=2)}

// Pre-calculated optimal radii for each level:
const optimalRadii = {radii_map}

// Accessor function to get optimal radius for a level
const getOptimalRadius = (level: number, defaultRadius: number = 200): number => {{
    if (optimalRadii.has(level)) {{
        return optimalRadii.get(level) || defaultRadius;
    }}
    return defaultRadius;
}};
"""
    return ts_config

def main():
    """Main function to analyze tree and generate configuration"""
    # Default path (adjust as needed)
    json_path = "data_processed/uk_biobank_features.json"
    
    # Check if file exists, try alternative paths
    if not os.path.exists(json_path):
        alternative_paths = [
            "public/graph-data/uk_biobank_features.json",
            "graph-data/uk_biobank_features.json",
            "./uk_biobank_features.json"
        ]
        
        for alt_path in alternative_paths:
            if os.path.exists(alt_path):
                json_path = alt_path
                break
        else:
            print("Error: Cannot find the UK Biobank JSON file.")
            print("Please provide the correct path to the file.")
            return
    
    # Analyze the tree structure
    statistics = analyze_tree_structure(json_path)
    
    # Print summary statistics
    print("\nTree Structure Summary:")
    print(f"Total nodes: {statistics['totalNodes']}")
    print(f"Maximum depth: {statistics['maxDepth']}")
    print("\nNodes by level:")
    for level, count in sorted(statistics['nodesByLevel'].items()):
        print(f"  Level {level}: {count} nodes")
    
    # Generate TypeScript configuration
    ts_config = generate_typescript_config(statistics)
    
    # Write the configuration to a file
    output_path = "optimal_radii_config.ts"
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(ts_config)
    
    print(f"\nConfiguration written to {output_path}")
    print("Copy this configuration into your TypeScript component.")

if __name__ == "__main__":
    main()