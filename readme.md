# Open Code SST Custom API Local Adapter

This repository provides a local adapter for using custom AI gateways (OpenAI and Bedrock) with Open Code SST during development.

## Prerequisites

- Node.js 18+ or Bun
- Open Code SST installed locally
- Access to your custom gateway endpoints

## Quick Setup

### 1. Clone and Install

```bash
# Clone this repository
git clone https://github.com/brandonbryant12/open-code-sst-custom-apis
cd open-code-sst-custom-apis

# Install dependencies (npm, yarn, or bun)
npm install
# or
bun install

# Build the project
npm run build
# or
bun run build
```

### 2. Link for Local Development

#### Using npm:
```bash
# Link this package locally
npm link

# In your Open Code SST project directory
cd /path/to/your/opencode-sst-project
npm link open-code-sst-custom-apis
```

#### Using Bun:
```bash
# Link this package locally
bun link

# In your Open Code SST project directory
cd /path/to/your/opencode-sst-project
bun link open-code-sst-custom-apis
```

### 3. Configure Open Code SST

Create `sst.config.js` in your Open Code SST project root:

```javascript
const { getGatewayService } = require('open-code-sst-custom-apis');
require('dotenv').config();

let gateway = null;

module.exports = {
  ai: {
    provider: async () => {
      if (!gateway) gateway = getGatewayService();
      return gateway.getProvider();
    },
    model: async () => {
      if (!gateway) gateway = getGatewayService();
      return gateway.getDefaultModel();
    },
  },
};
```

### 4. Set Environment Variables

Create `.env` file in your Open Code SST project:

#### For Custom OpenAI Gateway:
```bash
GATEWAY_PROVIDER=custom-openai
CUSTOM_OPENAI_BASE_URL=https://your-openai-gateway.com/v1
CUSTOM_OPENAI_API_KEY=your-api-key
CUSTOM_OPENAI_MODELS='[
  {
    "id": "meta-llama/Llama-3.3-70B-Instruct:latest",
    "name": "Llama 3.3 70B",
    "isDefault": true
  },
  {
    "id": "gpt-4-turbo",
    "name": "GPT-4 Turbo"
  }
]'
```

#### For Custom Bedrock Gateway:
```bash
GATEWAY_PROVIDER=custom-bedrock
CUSTOM_BEDROCK_BASE_URL=https://your-bedrock-gateway.com
CUSTOM_BEDROCK_APP_ID=your-app-id
CUSTOM_BEDROCK_APP_NAME=your-app-name
CUSTOM_BEDROCK_OAUTH_URL=https://oauth.example.com/token
CUSTOM_BEDROCK_CLIENT_ID=your-client-id
CUSTOM_BEDROCK_CLIENT_SECRET=your-client-secret
CUSTOM_BEDROCK_MODELS='[
  {
    "id": "us.anthropic.claude-opus-4-20250514-v1:0",
    "name": "Claude Opus 4",
    "isDefault": true
  },
  {
    "id": "anthropic.claude-3-sonnet-20240229-v1:0",
    "name": "Claude 3 Sonnet"
  }
]'
```

### 5. Run Open Code SST

```bash
# In your Open Code SST project
opencode-sst --config ./sst.config.js
```

## Environment Variables Reference

### Common
- `GATEWAY_PROVIDER` - Provider type: `custom-openai` or `custom-bedrock`

### Custom OpenAI
- `CUSTOM_OPENAI_BASE_URL` - Your OpenAI-compatible gateway URL
- `CUSTOM_OPENAI_API_KEY` - API key for authentication
- `CUSTOM_OPENAI_MODELS` - JSON array of available models

### Custom Bedrock
- `CUSTOM_BEDROCK_BASE_URL` - Your Bedrock gateway URL
- `CUSTOM_BEDROCK_APP_ID` - Application ID
- `CUSTOM_BEDROCK_APP_NAME` - Application name
- `CUSTOM_BEDROCK_OAUTH_URL` - OAuth token endpoint
- `CUSTOM_BEDROCK_CLIENT_ID` - OAuth client ID
- `CUSTOM_BEDROCK_CLIENT_SECRET` - OAuth client secret
- `CUSTOM_BEDROCK_MODELS` - JSON array of available models

### Model Configuration Format
```json
[
  {
    "id": "model-identifier",
    "name": "Human Readable Name",
    "description": "Optional description",
    "isDefault": true
  }
]
```

## Development Commands

```bash
# Build TypeScript
npm run build

# Watch mode
npm run dev

# Validate environment configuration
npm run validate-env

# Run example
npm run example
```

## Troubleshooting

### Validation Script
Test your configuration:
```bash
npm run validate-env
```

### Common Issues

1. **Module not found**
   - Ensure you've run `npm link` (or `bun link`) in both directories
   - Check that the build completed successfully

2. **Invalid environment variables**
   - Run the validation script to check your configuration
   - Ensure models JSON is properly formatted

3. **Authentication failures**
   - Verify API keys and OAuth credentials
   - Check network access to gateway endpoints

4. **No models available**
   - Ensure at least one model has `"isDefault": true`
   - Check that the models JSON array is valid

## Architecture

This adapter:
- Wraps custom gateway endpoints with AI SDK-compatible interfaces
- Handles OAuth authentication for Bedrock gateways
- Supports multiple models per provider
- Provides type-safe TypeScript interfaces

## Local Development Only

This repository is intended for local development with Open Code SST. It is not published to npm and should be used via `npm link` for local testing.