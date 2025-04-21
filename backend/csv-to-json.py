import pandas as pd
import json
import numpy as np
from pathlib import Path
import logging
from datetime import datetime

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# CONFIGURATION SECTION - Easy to modify
# =====================================

# Columns to exclude from the output (add any columns you want to filter out)
EXCLUDED_COLUMNS = [
    "main_category",
    "is_recommended",
    "is_origin",
    "availability",
    "stability",
    "private",
    "value_type",
    "base_type",
    "item_type",
    "strata",
    "units",
    "encoding_id",
    "instance_id",
    "instance_min",
    "instance_max",
    "array_min",
    "array_max",
    "notes",
    "item_count",
    "showcase_order",
    "cost_do",
    "cost_on",
    "cost_sc",
    "category_id_x",
    "image_name",
    "description",
    "prop_participants",
    "participants",
    "prop_value_type",
    "value type",
    "prop_sexed",
    "prop_debut",
    "prop_item_count",
    "item count",
    "prop_item_type",
    "prop_instances",
    "instances",
    "prop_version",
    "prop_stability",
    "prop_strata",
    "prop_array",
    "prop_cost_tier",
    "array",
    "cost tier",
    "related_field_id",
    "category_id_y",
    "AI_description",
    "item type",
]

# Category columns that define the hierarchical structure
CATEGORY_COLUMNS = [
    "category_level_1",
    "category_level_2",
    "category_level_3",
    "category_level_4",
    "category_level_5",
    "category_level_6",
]

# Data types for columns
NUMERIC_COLUMNS = [
    'field_id', 'main_category', 'availability', 'stability', 'private', 
    'value_type', 'base_type', 'item_type', 'strata', 'instanced', 'arrayed', 
    'sexed', 'encoding_id', 'instance_id', 'instance_min', 'instance_max', 
    'array_min', 'array_max', 'num_participants', 'item_count', 'showcase_order',
    'cost_do', 'cost_on', 'cost_sc', 'category_id_x', 'category_id_y'
]

BOOLEAN_COLUMNS = ['is_recommended', 'is_origin']

DATE_COLUMNS = ['debut', 'version']

# Columns that should be split by semicolon
ARRAY_COLUMNS = ['extract_id']

# Input/output file paths
INPUT_PATH = "data_raw/uk_biobank_features.csv"
OUTPUT_PATH = "data_processed/uk_biobank_features.json"

# Processing configuration
CHUNK_SIZE = 10000

# END OF CONFIGURATION SECTION
# ============================

def convert_data_types(df):
    """Convert data types to appropriate formats for efficiency and D3 compatibility"""
    # Convert numeric columns
    for col in NUMERIC_COLUMNS:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='ignore')
    
    # Convert boolean columns
    for col in BOOLEAN_COLUMNS:
        if col in df.columns:
            df[col] = df[col].map({'TRUE': True, 'FALSE': False})
    
    # Convert date columns
    for col in DATE_COLUMNS:
        if col in df.columns:
            df[col] = pd.to_datetime(df[col], errors='ignore')
    
    return df

def clean_empty_values(obj):
    """Replace NaN, None and empty strings with null for JSON compatibility"""
    if isinstance(obj, dict):
        return {k: clean_empty_values(v) for k, v in obj.items() if k is not None}
    elif isinstance(obj, list):
        return [clean_empty_values(item) for item in obj if item is not None]
    elif isinstance(obj, float) and np.isnan(obj):
        return None
    elif obj == '':
        return None
    elif isinstance(obj, (np.int64, np.float64)):
        return int(obj) if obj.is_integer() else float(obj)
    elif isinstance(obj, pd.Timestamp):
        return obj.strftime('%Y-%m-%d')
    else:
        return obj

def find_or_create_node(children, name):
    """Find or create a node in a children list"""
    for node in children:
        if node["name"] == name:
            return node
    new = {"name": name, "children": []}
    children.append(new)
    return new

def process_chunk(chunk, tree):
    """Process a chunk of the dataframe to build the tree"""
    for _, row in chunk.iterrows():
        # Get categories as a list, only including non-empty values
        categories = []
        for col in CATEGORY_COLUMNS:
            if pd.notna(row[col]) and row[col] != '':
                categories.append(row[col])
            else:
                break  # Stop at the first empty category
        
        if not categories:
            continue  # Skip rows with no categories
        
        # Prepare the field data
        field = {}
        for col in row.index:
            if col not in CATEGORY_COLUMNS and col not in EXCLUDED_COLUMNS:
                field[col] = row[col]
        
        # Ensure field_id is an integer if possible
        try:
            field["field_id"] = int(row["field_id"])
        except (ValueError, TypeError):
            field["field_id"] = row["field_id"]  # Keep as is if not convertible
        
        # Process array columns (split by semicolon)
        for col in ARRAY_COLUMNS:
            if col in field and pd.notna(field[col]) and field[col] != '':
                field[col] = field[col].split(";")
            elif col in field:
                field[col] = []
        
        # Create the leaf node name with field_id and title
        leaf_name = f"{field.get('field_id', '')}: {field.get('title', '')}"
        
        # Create a leaf node with data
        leaf_node = {
            "name": leaf_name,
            "data": clean_empty_values(field)
        }
        
        # Add size attribute for D3 visualization
        if "num_participants" in field and pd.notna(field["num_participants"]):
            leaf_node["size"] = int(field["num_participants"])
        
        # Navigate/build the tree structure based on categories
        current = tree
        for category in categories:
            current = find_or_create_node(current["children"], category)
        
        # Add the leaf node at the correct position
        if "children" not in current:
            current["children"] = []
        current["children"].append(leaf_node)

def generate_biobank_tree(input_path=INPUT_PATH, output_path=OUTPUT_PATH, chunk_size=CHUNK_SIZE):
    """Generate hierarchical tree from UK Biobank data"""
    start_time = datetime.now()
    logger.info(f"Starting processing at {start_time}")
    
    input_file = Path(input_path)
    if not input_file.exists():
        logger.error(f"Input file not found: {input_file}")
        return False
    
    # Create output directory if it doesn't exist
    output_file = Path(output_path)
    output_file.parent.mkdir(exist_ok=True, parents=True)
    
    # Initialize the tree
    tree = {"name": "UKB", "children": []}
    
    # Read and process CSV in chunks for memory efficiency
    logger.info(f"Reading CSV file in chunks: {input_file}")
    logger.info(f"Excluding columns: {len(EXCLUDED_COLUMNS)} columns")
    
    chunk_reader = pd.read_csv(
        input_file, 
        chunksize=chunk_size, 
        low_memory=False, 
        dtype={col: str for col in CATEGORY_COLUMNS}  # Read categories as strings
    )
    
    for i, chunk in enumerate(chunk_reader):
        logger.info(f"Processing chunk {i+1}")
        # Convert data types
        chunk = convert_data_types(chunk)
        # Process the chunk
        process_chunk(chunk, tree)
    
    # Add metadata to the tree
    tree["metadata"] = {
        "generated_at": datetime.now().isoformat(),
        "source_file": str(input_file.name),
        "excluded_columns": EXCLUDED_COLUMNS,
    }
    
    # Calculate node statistics
    def count_nodes(node):
        if "children" not in node or not node["children"]:
            return 1
        return 1 + sum(count_nodes(child) for child in node["children"])
    
    def max_depth(node, current_depth=0):
        if "children" not in node or not node["children"]:
            return current_depth
        return max(max_depth(child, current_depth + 1) for child in node["children"])
    
    tree["metadata"]["total_nodes"] = count_nodes(tree)
    tree["metadata"]["max_depth"] = max_depth(tree)
    
    # Write out with pretty-printing (indent=2 for readability)
    logger.info(f"Writing JSON to {output_file}")
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(tree, f, ensure_ascii=False, indent=2)
    
    end_time = datetime.now()
    processing_time = (end_time - start_time).total_seconds()
    logger.info(f"✅ Processing completed in {processing_time:.2f} seconds")
    logger.info(f"Total nodes: {tree['metadata']['total_nodes']}")
    logger.info(f"Maximum depth: {tree['metadata']['max_depth']}")
    logger.info(f"Top level categories: {[n['name'] for n in tree['children']]}")
    
    return True

if __name__ == "__main__":
    success = generate_biobank_tree()
    if success:
        print(f"✅ Successfully generated tree at {OUTPUT_PATH}")
    else:
        print("❌ Failed to generate tree")