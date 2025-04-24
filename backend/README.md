# Biobank Data Processing Docker Setup

This Docker setup allows running multiple Python data processing scripts without needing to install Python or dependencies locally.

## Available Scripts

1. **csv-to-json.py** (Default)
   - Converts UK Biobank CSV data to JSON format
   - Input: `data_raw/uk_biobank_features.csv`
   - Output: `data_processed/uk_biobank_features.json`

2. **cat-radii-size.py** (New)
   - Analyzes tree structure to determine optimal radii for visualization
   - Reads JSON data and generates TypeScript configuration for optimal visualization
   - Output: `optimal_radii_config.ts`

## Prerequisites

- Docker installed on your system

## How to Use

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Build the Docker image:
   ```
   docker build -t biobank-backend .
   ```

3. Run the container with your chosen script:

   **To run the default csv-to-json.py script:**
   ```
   docker run --rm -v $(pwd)/data_raw:/app/data_raw -v $(pwd)/data_processed:/app/data_processed biobank-backend
   ```

   **To run the cat-radii-size.py script:**
   ```
   docker run --rm -e SCRIPT_TO_RUN=cat-radii-size.py -v $(pwd)/data_processed:/app/data_processed -v $(pwd):/app/output biobank-backend
   ```

   These commands:
   - Mount your local `data_raw` directory into the container
   - Mount your local `data_processed` directory to receive the output
   - For cat-radii-size.py, also mount the current directory to save the TypeScript config
   - Use the SCRIPT_TO_RUN environment variable to specify which script to run
   - Automatically remove the container when finished

4. The output will be available in the appropriate directory:
   - CSV to JSON conversion: `data_processed/uk_biobank_features.json`
   - Radii size analysis: `optimal_radii_config.ts` in the current directory

## Notes

- The csv-to-json script expects a CSV file named `uk_biobank_features.csv` in the `data_raw` directory
- The cat-radii-size script now looks for the JSON file primarily in `data_processed/uk_biobank_features.json`
- If you need to process different files, you can modify the scripts or mount volumes to different locations

## Making Changes to the Python Scripts

If you make changes to any of the Python scripts, you'll need to rebuild the Docker image for those changes to take effect:

1. Check for running containers:
   ```
   docker ps
   ```
   
   Note: The container will NOT appear in this list after it completes running because:
   - It's designed to run a task and exit (not run continuously)
   - We use the `--rm` flag which automatically removes the container after completion
   
   If you need to stop a running container during processing:
   ```
   docker stop <container_id>
   ```

2. Rebuild the Docker image:
   ```
   docker build -t biobank-backend .
   ```

3. Run the container with the updated image using the appropriate command from the "How to Use" section.

The `--rm` flag automatically removes the container when it exits, so you don't need to manually clean up containers after each run.