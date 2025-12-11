#!/bin/sh

# Runtime configuration script
# This script injects environment variables into the built JavaScript at container startup

set -e

# Default values
VITE_USE_CUSTOM_API=${VITE_USE_CUSTOM_API:-false}
VITE_API_ENDPOINT=${VITE_API_ENDPOINT:-""}
GEMINI_API_KEY=${GEMINI_API_KEY:-""}

echo "Injecting runtime configuration..."
echo "VITE_USE_CUSTOM_API: $VITE_USE_CUSTOM_API"
echo "VITE_API_ENDPOINT: $VITE_API_ENDPOINT"

# Create a runtime config file
cat > /usr/share/nginx/html/config.js <<EOF
window.__RUNTIME_CONFIG__ = {
  VITE_USE_CUSTOM_API: "${VITE_USE_CUSTOM_API}",
  VITE_API_ENDPOINT: "${VITE_API_ENDPOINT}",
  GEMINI_API_KEY: "${GEMINI_API_KEY}"
};
EOF

echo "Runtime configuration injected successfully."

# Start nginx
exec nginx -g 'daemon off;'
