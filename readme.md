# Open Code SST Custom API Gateways

This repository provides custom API gateway implementations for Open Code SST, supporting multiple AI models through custom OpenAI and Bedrock gateways.

## Features

- 🚀 Support for multiple AI models per gateway
- 🔐 OAuth authentication for Bedrock gateway
- 🔑 API key authentication for OpenAI gateway
- 📦 Easy integration with Open Code SST
- 🛠️ TypeScript support with full type safety
- 📝 Comprehensive configuration validation

## Quick Start

### 1. Install the package

```bash
npm install open-code-sst-custom-apis
```

### 2. Set environment variables

```bash
# Choose your provider
GATEWAY_PROVIDER=custom-bedrock

# Configure your models (JSON array)
CUSTOM_BEDROCK_MODELS='[{"id":"claude-opus-4","name":"Claude Opus 4","isDefault":true}]'

# Set gateway credentials
CUSTOM_BEDROCK_BASE_URL=https://your-gateway.com
CUSTOM_BEDROCK_APP_ID=your-app-id
# ... other required variables
```

### 3. Use in your code

```typescript
import { getGatewayService } from 'open-code-sst-custom-apis';
import { generateText } from 'ai';

const gateway = getGatewayService();
const result = await generateText({
  model: gateway.getDefaultModel(),
  prompt: 'Hello, world!',
});
```

## Open Code SST Integration

**New!** 🎉 See our dedicated guides for integrating with Open Code SST:
- [Quick Start Guide](./QUICK_START_OPENCODE_SST.md) - Get up and running in 5 minutes
- [Full Integration Guide](./OPENCODE_SST_INTEGRATION.md) - Detailed step-by-step instructions

## Documentation

- [Setup Guide](./SETUP_GUIDE.md) - Detailed installation and configuration instructions
- [Examples](./examples/) - Code examples and integration patterns
- [Environment Variables](./.env.example) - Complete list of configuration options

## Supported Providers

### Custom OpenAI Gateway
- Compatible with OpenAI API format
- Supports any OpenAI-compatible models
- API key authentication

### Custom Bedrock Gateway
- AWS Bedrock-compatible interface
- OAuth 2.0 authentication
- Support for Anthropic, Meta, and other Bedrock models

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run examples
npm run example

# Validate your configuration
npm run validate-env
```

## License

MIT
