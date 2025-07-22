# Quick Start: Open Code SST Integration

## 1. Install Dependencies

```bash
# In your Open Code SST project
npm install @your-org/open-code-sst-custom-apis dotenv
```

## 2. Create Configuration File

Create `sst.config.js` in your project root:

```javascript
const { getGatewayService } = require('@your-org/open-code-sst-custom-apis');
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

## 3. Set Environment Variables

Create `.env` file:

### For Custom OpenAI:
```bash
GATEWAY_PROVIDER=custom-openai
CUSTOM_OPENAI_BASE_URL=https://your-gateway.com/v1
CUSTOM_OPENAI_API_KEY=your-key
CUSTOM_OPENAI_MODELS='[{"id":"llama-70b","name":"Llama 70B","isDefault":true}]'
```

### For Custom Bedrock:
```bash
GATEWAY_PROVIDER=custom-bedrock
CUSTOM_BEDROCK_BASE_URL=https://your-gateway.com
CUSTOM_BEDROCK_APP_ID=app-id
CUSTOM_BEDROCK_APP_NAME=app-name
CUSTOM_BEDROCK_OAUTH_URL=https://oauth.com/token
CUSTOM_BEDROCK_CLIENT_ID=client-id
CUSTOM_BEDROCK_CLIENT_SECRET=client-secret
CUSTOM_BEDROCK_MODELS='[{"id":"claude-opus","name":"Claude Opus","isDefault":true}]'
```

## 4. Run Open Code SST

```bash
# Set config path
export OPENCODE_SST_CONFIG=./sst.config.js

# Run Open Code SST
opencode-sst

# Or directly with config
opencode-sst --config ./sst.config.js
```

## 5. Verify It Works

You should see:
- ✅ "Custom gateway initialized successfully" in the console
- Your custom models available in the Open Code SST interface
- Ability to generate responses using your gateway

## That's it! 🎉

Your custom providers are now integrated with Open Code SST.