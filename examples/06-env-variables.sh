#!/bin/bash

# Environment Variables Example
#
# This example shows how to use environment variables
# for configuration instead of CLI parameters.

# Method 1: Create a .env file
cat > .env << 'EOF'
SWAGGER_INPUT=https://api.example.com/swagger.json
OUTPUT_PATH=./src/api
CONVERT_TO_V3=true
EOF

# Run the generator (it will read from .env)
npx @miaoosi/swagger2ts

# Method 2: Use a custom .env file
cat > .env.production << 'EOF'
SWAGGER_INPUT=https://api.production.com/swagger.json
OUTPUT_PATH=./src/api/production
CONVERT_TO_V3=true
EOF

npx @miaoosi/swagger2ts --env .env.production

echo "✅ API clients generated using environment variables!"
