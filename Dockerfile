FROM mcr.microsoft.com/playwright:v1.56.1-jammy

WORKDIR /app

# Copy only package files first for better caching
COPY package.json package-lock.json* ./

RUN npm ci || npm install

# Install Playwright browsers (already present in base image, but safe to ensure)
RUN npx playwright install --with-deps

# Copy rest of repo
COPY . .

# Default environment
ENV TEST_ENV=local \
    NODE_ENV=ci

# Example test command (can be overridden)
CMD ["npx", "playwright", "test", "-c", "config"]

