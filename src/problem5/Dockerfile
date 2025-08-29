# Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and yarn.lock
COPY package.json ./
COPY yarn.lock ./

# Install dependencies (including devDependencies for TypeScript)
RUN yarn install

# Copy source code
COPY . .

# Build TypeScript code
RUN yarn build

# Final stage
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy only necessary files from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.env ./

# Install only production dependencies
RUN yarn install --production

# Expose port
EXPOSE 3000

# Run the compiled code
CMD ["node", "dist/app.js"]