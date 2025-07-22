# Open Code Custom Gateway Adapter

Local adapter for using custom AI gateways (OpenAI and Bedrock) with Open Code.

## Overview

This repository provides custom provider implementations for Open Code that handle:
- OAuth authentication for Bedrock gateways
- Multiple model support per provider
- OpenAI-compatible gateway connections

## Prerequisites

- Node.js 18+ or Bun
- Open Code installed (`npm install -g @opencode/ai` or `bun add -g @opencode/ai`)
- Access to your custom gateway endpoints

## Setup

### 1. Clone and Build

```bash
# Clone this repository
git clone https://github.com/brandonbryant12/open-code-sst-custom-apis
cd open-code-sst-custom-apis

# Install dependencies
npm install
# or
bun install

# Build the project
npm run build
# or
bun run build
```

### 2. Link for Local Development

```bash
# Link this package locally (note: the package name is open-code-custom-gateways)
npm link
# or
bun link
```

### 3. Configure Open Code

Create `opencode.json` in your project root:

#### For Custom OpenAI Gateway:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "custom-openai": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "Custom OpenAI Gateway",
      "options": {
        "baseURL": "{env:CUSTOM_OPENAI_BASE_URL}",
        "apiKey": "{env:CUSTOM_OPENAI_API_KEY}"
      },
      "models": {
        "llama-70b": {
          "name": "Llama 3.3 70B"
        },
        "gpt-4-turbo": {
          "name": "GPT-4 Turbo"
        }
      }
    }
  },
  "model": "custom-openai/llama-70b"
}
```

#### For Custom Bedrock Gateway (with OAuth):

Since Bedrock requires OAuth authentication, you'll need to use our custom adapter:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "custom-bedrock": {
      "npm": "open-code-custom-gateways",
      "name": "Custom Bedrock Gateway",
      "type": "bedrock",
      "options": {
        "baseURL": "{env:CUSTOM_BEDROCK_BASE_URL}",
        "appId": "{env:CUSTOM_BEDROCK_APP_ID}",
        "appName": "{env:CUSTOM_BEDROCK_APP_NAME}",
        "oauthUrl": "{env:CUSTOM_BEDROCK_OAUTH_URL}",
        "clientId": "{env:CUSTOM_BEDROCK_CLIENT_ID}",
        "clientSecret": "{env:CUSTOM_BEDROCK_CLIENT_SECRET}"
      },
      "models": {
        "claude-opus-4": {
          "name": "Claude Opus 4"
        },
        "claude-sonnet": {
          "name": "Claude 3 Sonnet"
        }
      }
    }
  },
  "model": "custom-bedrock/claude-opus-4"
}
```

### 4. Set Environment Variables

Create `.env` file in your project:

#### For OpenAI Gateway:
```bash
CUSTOM_OPENAI_BASE_URL=https://your-openai-gateway.com/v1
CUSTOM_OPENAI_API_KEY=your-api-key
```

#### For Bedrock Gateway:
```bash
CUSTOM_BEDROCK_BASE_URL=https://your-bedrock-gateway.com
CUSTOM_BEDROCK_APP_ID=your-app-id
CUSTOM_BEDROCK_APP_NAME=your-app-name
CUSTOM_BEDROCK_OAUTH_URL=https://oauth.example.com/token
CUSTOM_BEDROCK_CLIENT_ID=your-client-id
CUSTOM_BEDROCK_CLIENT_SECRET=your-client-secret
```

### 5. Use with Open Code

```bash
# Start Open Code with your custom configuration
opencode
```

Your custom models will now be available in Open Code!

## Configuration Reference

### Provider Options

#### OpenAI-Compatible Gateways
Use the built-in `@ai-sdk/openai-compatible` package:
- `baseURL`: Your gateway endpoint
- `apiKey`: API key for authentication

#### Bedrock Gateways (OAuth)
Use our custom adapter `open-code-custom-gateways`:
- `baseURL`: Your gateway endpoint
- `appId`: Application ID
- `appName`: Application name
- `oauthUrl`: OAuth token endpoint
- `clientId`: OAuth client ID
- `clientSecret`: OAuth client secret

### Model Configuration

Models are defined in the `models` section of each provider:
```json
"models": {
  "model-id": {
    "name": "Display Name"
  }
}
```

The full model ID in Open Code will be `provider-id/model-id`.

## Development

### Validate Configuration
```bash
npm run validate-env
# or
bun run validate-env
```

### Run Examples
```bash
npm run example
# or
bun run example
```

## Troubleshooting

### Config File Location
- Project-level: `opencode.json` in your project root
- Global: `~/.config/opencode/opencode.json`

### Common Issues

1. **Provider not found**
   - Ensure you've run `npm link` (or `bun link`) in this repository
   - Check that the npm package name in opencode.json matches exactly

2. **Authentication failures**
   - Verify all environment variables are set
   - Check OAuth credentials for Bedrock
   - Ensure API keys are valid for OpenAI gateways

3. **Models not appearing**
   - Verify your opencode.json syntax
   - Check that model IDs don't contain special characters
   - Use the full model ID format: `provider-id/model-id`

## Architecture

This adapter provides:
- OAuth token management for Bedrock gateways
- Request transformation for custom gateway formats
- Compatible interfaces for Open Code's AI SDK

## Note

This is a local development adapter. For production use, consider:
- Publishing as a proper npm package
- Contributing to Models.dev for official support
- Using Open Code's built-in providers when possible