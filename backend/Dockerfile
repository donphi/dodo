# Use a lightweight Python image
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Install required packages
RUN pip install --no-cache-dir pandas numpy

# Copy the Python scripts and data directories
COPY csv-to-json.py cat-radii-size.py ./
COPY data_raw/ ./data_raw/
COPY data_processed/ ./data_processed/

# Create output directory if it doesn't exist
RUN mkdir -p data_processed

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV SCRIPT_TO_RUN=csv-to-json.py

# Create a simple entrypoint script to run the selected Python script
RUN echo '#!/bin/sh\npython ${SCRIPT_TO_RUN}' > /app/entrypoint.sh && \
    chmod +x /app/entrypoint.sh

# Run the entrypoint script when the container starts
CMD ["/app/entrypoint.sh"]