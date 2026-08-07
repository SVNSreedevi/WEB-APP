FROM python:3.11-slim

# Install system dependencies and Node.js
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

# Set working directory
WORKDIR /app

# Install Python dependencies
COPY AI_Model/requirements.txt ./AI_Model/
RUN pip install --no-cache-dir -r AI_Model/requirements.txt

# Install Node dependencies
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm install

# Copy rest of the code (respecting .dockerignore)
WORKDIR /app
COPY AI_Model/ ./AI_Model/
COPY server/ ./server/

# Set env and start
ENV NODE_ENV=production
WORKDIR /app/server

# Expose port (Render defaults to 10000, but we can stick to 5000 or let it use PORT)
EXPOSE 5000

CMD ["npm", "start"]
