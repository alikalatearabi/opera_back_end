FROM node:22.12.0-slim

RUN apt-get update && \
    apt-get install -y ffmpeg libssl3 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install app dependencies
RUN --mount=type=cache,target=/root/.npm npm ci

# Bundle app source
COPY . .

# Build the TypeScript files
RUN npm run build
RUN npx prisma generate

# Expose port 8080
EXPOSE 8080

# Start the app
CMD npm run start
