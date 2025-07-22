# Open Code SST Custom Gateway Setup Guide

This guide will help you set up Open Code SST with custom gateway implementations for multiple AI models.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Environment Variables](#environment-variables)
5. [Usage Examples](#usage-examples)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

- Node.js 18.x or later
- npm or yarn
- Access to your custom AI gateway endpoints
- OAuth credentials (for custom Bedrock gateway)
- API keys (for custom OpenAI gateway)

## Installation

### Step 1: Install Open Code SST

```bash
npm install -g open-code-sst
# or
yarn global add open-code-sst
```

### Step 2: Install Custom Gateway Package

```bash
npm install open-code-sst-custom-apis
# or
yarn add open-code-sst-custom-apis
```

### Step 3: Install Required Dependencies

```bash
npm install @ai-sdk/amazon-bedrock @ai-sdk/openai @ai-sdk/provider valibot
# or
yarn add @ai-sdk/amazon-bedrock @ai-sdk/openai @ai-sdk/provider valibot
```

## Configuration

### Step 1: Create Configuration File

Create a `.env` file in your project root or set environment variables:

```bash
# Choose your gateway provider
GATEWAY_PROVIDER=custom-bedrock # or custom-openai
```

### Step 2: Configure Models

Models are configured as JSON arrays in environment variables. Each model should have:
- `id`: The model identifier
- `name`: Human-readable name
- `description`: Optional description
- `isDefault`: Optional boolean to mark default model

## Environment Variables

### Custom OpenAI Gateway

```bash
# Provider selection
GATEWAY_PROVIDER=custom-openai

# Gateway configuration
CUSTOM_OPENAI_BASE_URL=https://your-gateway.example.com/v1
CUSTOM_OPENAI_API_KEY=your-api-key-here

# Models configuration (JSON array)
CUSTOM_OPENAI_MODELS='[
  {
    "id": "meta-llama/Llama-3.3-70B-Instruct:latest",
    "name": "Llama 3.3 70B",
    "description": "Meta's latest Llama model",
    "isDefault": true
  },
  {
    "id": "gpt-4-turbo",
    "name": "GPT-4 Turbo",
    "description": "OpenAI's GPT-4 Turbo model"
  },
  {
    "id": "mixtral-8x7b",
    "name": "Mixtral 8x7B",
    "description": "Mistral's mixture of experts model"
  }
]'
```

### Custom Bedrock Gateway

```bash
# Provider selection
GATEWAY_PROVIDER=custom-bedrock

# Gateway configuration
CUSTOM_BEDROCK_BASE_URL=https://your-bedrock-gateway.example.com
CUSTOM_BEDROCK_APP_ID=your-app-id
CUSTOM_BEDROCK_APP_NAME=your-app-name
CUSTOM_BEDROCK_OAUTH_URL=https://oauth.example.com/token
CUSTOM_BEDROCK_CLIENT_ID=your-client-id
CUSTOM_BEDROCK_CLIENT_SECRET=your-client-secret

# Models configuration (JSON array)
CUSTOM_BEDROCK_MODELS='[
  {
    "id": "us.anthropic.claude-opus-4-20250514-v1:0",
    "name": "Claude Opus 4",
    "description": "Anthropic's most capable model",
    "isDefault": true
  },
  {
    "id": "anthropic.claude-3-sonnet-20240229-v1:0",
    "name": "Claude 3 Sonnet",
    "description": "Balanced performance and cost"
  },
  {
    "id": "anthropic.claude-instant-v1",
    "name": "Claude Instant",
    "description": "Fast and efficient"
  }
]'
```

### Additional Configuration (Optional)

```bash
# Proxy settings (if needed)
HTTP_PROXY=http://proxy.example.com:8080
HTTPS_PROXY=http://proxy.example.com:8080

# TLS settings
NODE_TLS_REJECT_UNAUTHORIZED=1 # Set to 0 to disable certificate validation (not recommended)
```

## Usage Examples

### Basic Usage

```typescript
import { getGatewayService } from 'open-code-sst-custom-apis';
import { generateText, streamText } from 'ai';

// Get the gateway service
const gateway = getGatewayService();

// Use default model
const result = await generateText({
  model: gateway.getDefaultModel(),
  prompt: 'What is the capital of France?',
});

console.log(result.text);
```

### Using Specific Models

```typescript
// Get available models
const models = gateway.getAvailableModels();
console.log('Available models:', models);

// Use a specific model
const model = gateway.getModel('anthropic.claude-3-sonnet-20240229-v1:0');
const result = await generateText({
  model,
  prompt: 'Explain quantum computing in simple terms',
});
```

### Streaming Responses

```typescript
const stream = await streamText({
  model: gateway.getDefaultModel(),
  prompt: 'Write a story about a robot',
});

for await (const chunk of stream) {
  process.stdout.write(chunk);
}
```

### Integration with Open Code SST

Create a configuration file `open-code-sst.config.js`:

```javascript
const { getGatewayService } = require('open-code-sst-custom-apis');

module.exports = {
  ai: {
    provider: () => {
      const gateway = getGatewayService();
      return gateway.getProvider();
    },
    model: () => {
      const gateway = getGatewayService();
      return gateway.getDefaultModel();
    },
  },
};
```

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Verify your API keys or OAuth credentials
   - Check if tokens are expired
   - Ensure OAuth URL is accessible

2. **Model Not Found**
   - Verify the model ID matches exactly
   - Check the MODELS environment variable is valid JSON
   - Ensure at least one model is configured

3. **Network Issues**
   - Check proxy settings if behind corporate firewall
   - Verify base URLs are accessible
   - Check TLS certificate settings

4. **Environment Variable Issues**
   - Ensure all required variables are set
   - Check for typos in variable names
   - Verify JSON in MODELS variables is properly formatted

### Debug Mode

Enable debug logging:

```bash
DEBUG=gateway:* npm start
```

### Validation Script

Create a test script to validate your configuration:

```javascript
const { initializeGateway } = require('open-code-sst-custom-apis');

try {
  const gateway = initializeGateway();
  console.log('✅ Gateway initialized successfully');
  console.log('Available models:', gateway.getAvailableModels());
} catch (error) {
  console.error('❌ Failed to initialize gateway:', error.message);
}
```

## Support

For issues or questions:
- Check the [GitHub repository](https://github.com/your-org/open-code-sst-custom-apis)
- Review environment variable configuration
- Ensure all dependencies are installed correctly