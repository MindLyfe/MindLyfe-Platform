# Use a base image with build tools for MediaSoup compilation
FROM node:18-alpine as development

# Install Python, make, g++ and other build dependencies for MediaSoup
RUN apk add --no-cache \
    python3 \
    py3-pip \
    make \
    g++ \
    cmake \
    linux-headers \
    libc6-compat

# Create symbolic link for python (MediaSoup expects 'python' command)
RUN ln -sf python3 /usr/bin/python

WORKDIR /usr/src/app

COPY package*.json ./

# Install dependencies with verbose logging for debugging
RUN npm install --verbose

COPY . .

RUN npm run build

# Production stage with runtime dependencies
FROM node:18-alpine as production

# Install runtime dependencies for MediaSoup
RUN apk add --no-cache \
    python3 \
    libc6-compat

# Create symbolic link for python
RUN ln -sf python3 /usr/bin/python

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./

# Install only production dependencies
RUN npm install --only=production --verbose

COPY --from=development /usr/src/app/dist ./dist

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Change ownership of the app directory to the nodejs user
RUN chown -R nestjs:nodejs /usr/src/app

USER nestjs

EXPOSE 3002

CMD ["node", "dist/main"]