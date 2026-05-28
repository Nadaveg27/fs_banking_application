FROM node:20-alpine

WORKDIR /app

# Copy dependency manifest first so npm ci layer is cached separately from source code
COPY package*.json ./

# Install production dependencies only — devDependencies (nodemon) not needed at runtime
RUN npm ci --omit=dev

# Copy source code after dependencies so code changes don't invalidate the npm ci cache
COPY . .

# Switch to non-root user shipped with node:20-alpine to reduce attack surface
USER node

EXPOSE 3000

CMD ["node", "server.js"]
