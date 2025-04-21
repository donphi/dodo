# Use a lightweight Python image
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Install required packages
RUN pip install --no-cache-dir pandas numpy

# Copy the Python script and data directory
COPY csv-to-json.py .
COPY data_raw/ ./data_raw/

# Create output directory
RUN mkdir -p data_processed

# Set environment variables (optional)
ENV PYTHONUNBUFFERED=1

# Run the script when the container starts
CMD ["python", "csv-to-json.py"]