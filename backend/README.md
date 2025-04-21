# CSV to JSON Converter Docker Setup

This is a simple Docker setup for running the CSV to JSON conversion script without needing to install Python or dependencies locally.

## Prerequisites

- Docker installed on your system

## How to Use

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Build the Docker image:
   ```
   docker build -t csv-to-json .
   ```

3. Run the container:
   ```
   docker run --rm -v $(pwd)/data_raw:/app/data_raw -v $(pwd)/data_processed:/app/data_processed csv-to-json
   ```

   This command:
   - Mounts your local `data_raw` directory into the container
   - Mounts your local `data_processed` directory to receive the output
   - Runs the script and automatically removes the container when finished

4. The converted JSON file will be available in your local `data_processed` directory

## Notes

- The script expects a CSV file named `uk_biobank_features.csv` in the `data_raw` directory
- The output will be saved as `uk_biobank_features.json` in the `data_processed` directory
- If you need to process different files, you can modify the script or mount volumes to different locations

## Making Changes to the Python Script

If you make changes to the `csv-to-json.py` file, you'll need to rebuild the Docker image for those changes to take effect:

1. Check for running containers:
   ```
   docker ps
   ```
   
   Note: The csv-to-json container will NOT appear in this list after it completes running because:
   - It's designed to run a task and exit (not run continuously)
   - We use the `--rm` flag which automatically removes the container after completion
   
   If you need to stop a running container during processing:
   ```
   docker stop <container_id>
   ```

2. Rebuild the Docker image:
   ```
   docker build -t csv-to-json .
   ```

3. Run the container with the updated image:
   ```
   docker run --rm -v $(pwd)/data_raw:/app/data_raw -v $(pwd)/data_processed:/app/data_processed csv-to-json
   ```

The `--rm` flag automatically removes the container when it exits, so you don't need to manually clean up containers after each run.