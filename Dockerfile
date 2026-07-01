FROM node:20-slim

# Install system dependencies needed for native npm modules (e.g. build tools for sqlite3 if needed)
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install all dependencies (including devDependencies needed for build/vite)
RUN npm install

# Copy the rest of the application source code
COPY . .

# Expose the Vite dev server port (default 3000 as configured in package.json)
EXPOSE 3000

# Start the dev server
CMD ["npm", "run", "dev"]
