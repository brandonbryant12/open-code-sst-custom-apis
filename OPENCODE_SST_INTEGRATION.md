# Integrating Custom Providers with Open Code SST

This guide provides step-by-step instructions for adding your custom gateway providers to Open Code SST.

## Prerequisites

- Open Code SST installed locally
- Node.js 18+ installed
- Access to your custom gateway endpoints and credentials

## Step 1: Install Open Code SST

If you haven't already installed Open Code SST:

```bash
# Install globally
npm install -g @opencode/sst

# Or install locally in your project
npm install --save-dev @opencode/sst
```

## Step 2: Create a Custom Provider Package

### Option A: Use the Published Package (Recommended)

```bash
# In your Open Code SST project directory
npm install open-code-sst-custom-apis
```

### Option B: Use Local Development

```bash
# Clone the custom APIs repository
git clone https://github.com/brandonbryant12/open-code-sst-custom-apis
cd open-code-sst-custom-apis

# Install dependencies and build
npm install
npm run build

# Link the package locally
npm link

# In your Open Code SST project
cd /path/to/your/opencode-sst-project
npm link open-code-sst-custom-apis
```

## Step 3: Configure Open Code SST

### 3.1 Create Configuration File

Create `sst.config.js` in your Open Code SST project root:

```javascript
const { getGatewayService } = require('open-code-sst-custom-apis');

// Initialize gateway once to avoid multiple initializations
let gatewayInstance = null;

function getGateway() {
  if (!gatewayInstance) {
    gatewayInstance = getGatewayService();
    console.log('Custom gateway initialized');
  }
  return gatewayInstance;
}

module.exports = {
  // Core AI provider configuration
  ai: {
    // Return the custom provider
    provider: async () => {
      const gateway = getGateway();
      return gateway.getProvider();
    },
    
    // Return the default model
    model: async () => {
      const gateway = getGateway();
      return gateway.getDefaultModel();
    },
    
    // Optional: Allow model selection by ID
    getModel: async (modelId) => {
      const gateway = getGateway();
      return gateway.getModel(modelId);
    },
    
    // Optional: List available models
    listModels: async () => {
      const gateway = getGateway();
      return gateway.getAvailableModels();
    },
  },
  
  // Optional: Custom settings
  settings: {
    // Disable default providers
    disableDefaultProviders: true,
    
    // Custom provider name
    providerName: 'Custom Gateway',
  },
};
```

### 3.2 Set Environment Variables

Create `.env` file in your Open Code SST project:

```bash
# For Custom OpenAI Gateway
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

# OR for Custom Bedrock Gateway
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

## Step 4: Update Open Code SST Settings

### 4.1 Using Environment Variables

Set the Open Code SST configuration to use your custom provider:

```bash
# Tell Open Code SST to use custom configuration
export OPENCODE_SST_CONFIG=./sst.config.js

# Or add to your .env file
OPENCODE_SST_CONFIG=./sst.config.js
```

### 4.2 Using Command Line Arguments

```bash
# Run Open Code SST with custom config
opencode-sst --config ./sst.config.js
```

## Step 5: Verify Integration

### 5.1 Test Configuration

Create a test script `test-integration.js`:

```javascript
const { getGatewayService } = require('open-code-sst-custom-apis');

async function testIntegration() {
  try {
    console.log('Testing Open Code SST custom provider integration...\n');
    
    // Initialize gateway
    const gateway = getGatewayService();
    console.log('✅ Gateway initialized');
    
    // Get available models
    const models = gateway.getAvailableModels();
    console.log('\n📋 Available models:');
    models.forEach(model => {
      console.log(`  - ${model.name} (${model.id})${model.isDefault ? ' [DEFAULT]' : ''}`);
    });
    
    // Test provider
    const provider = gateway.getProvider();
    console.log('\n✅ Provider accessible');
    
    // Test default model
    const defaultModel = gateway.getDefaultModel();
    console.log('✅ Default model accessible');
    
    console.log('\n🎉 Integration test passed!');
  } catch (error) {
    console.error('❌ Integration test failed:', error);
    process.exit(1);
  }
}

testIntegration();
```

Run the test:

```bash
node test-integration.js
```

### 5.2 Test with Open Code SST

```bash
# Start Open Code SST with custom config
opencode-sst --config ./sst.config.js

# In the Open Code SST interface, you should see your custom models available
```

## Step 6: Advanced Configuration

### 6.1 Multiple Environments

Create environment-specific configurations:

```javascript
// sst.config.js
const env = process.env.NODE_ENV || 'development';

const configs = {
  development: {
    GATEWAY_PROVIDER: 'custom-openai',
    // ... dev settings
  },
  production: {
    GATEWAY_PROVIDER: 'custom-bedrock',
    // ... prod settings
  },
};

// Apply environment-specific config
Object.assign(process.env, configs[env]);
```

### 6.2 Dynamic Model Selection

Add model selection to your Open Code SST workflow:

```javascript
// In your sst.config.js
module.exports = {
  ai: {
    // ... existing config
    
    // Add model selector UI
    modelSelector: {
      enabled: true,
      models: async () => {
        const gateway = getGateway();
        return gateway.getAvailableModels().map(model => ({
          id: model.id,
          label: model.name,
          description: model.description,
        }));
      },
    },
  },
};
```

### 6.3 Request/Response Interceptors

Add logging or modification:

```javascript
module.exports = {
  ai: {
    // ... existing config
    
    interceptors: {
      request: async (request) => {
        console.log('Request to model:', request.model);
        // Modify request if needed
        return request;
      },
      
      response: async (response) => {
        console.log('Tokens used:', response.usage);
        // Modify response if needed
        return response;
      },
    },
  },
};
```

## Step 7: Troubleshooting

### Common Issues and Solutions

1. **"Cannot find module 'open-code-sst-custom-apis'"**
   ```bash
   # Ensure package is installed
   npm install open-code-sst-custom-apis
   
   # Or if using local development
   npm link open-code-sst-custom-apis
   ```

2. **"Environment validation failed"**
   ```bash
   # Validate your environment
   cd /path/to/open-code-sst-custom-apis
   npm run validate-env
   ```

3. **"No models available"**
   - Check that your MODELS environment variable contains valid JSON
   - Ensure at least one model has `"isDefault": true`

4. **"Authentication failed"**
   - Verify API keys or OAuth credentials
   - Check network connectivity to gateway endpoints
   - Ensure OAuth token endpoint is accessible

### Debug Mode

Enable detailed logging:

```bash
# Set debug environment variable
export DEBUG=gateway:*,opencode-sst:*

# Run with debug logging
opencode-sst --config ./sst.config.js --debug
```

## Step 8: Production Deployment

### 8.1 Environment Variables

For production, use a secure method to manage environment variables:

```bash
# Use a secrets manager
export CUSTOM_BEDROCK_CLIENT_SECRET=$(aws secretsmanager get-secret-value --secret-id prod/gateway/secret --query SecretString --output text)
```

### 8.2 Health Checks

Add health check endpoint:

```javascript
// In your sst.config.js
module.exports = {
  ai: {
    // ... existing config
    
    healthCheck: async () => {
      try {
        const gateway = getGateway();
        const models = gateway.getAvailableModels();
        return {
          status: 'healthy',
          models: models.length,
          provider: process.env.GATEWAY_PROVIDER,
        };
      } catch (error) {
        return {
          status: 'unhealthy',
          error: error.message,
        };
      }
    },
  },
};
```

## Complete Example

Here's a complete example of integrating with Open Code SST:

```javascript
// sst.config.js
const { getGatewayService } = require('open-code-sst-custom-apis');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

let gatewayInstance = null;

function getGateway() {
  if (!gatewayInstance) {
    try {
      gatewayInstance = getGatewayService();
      console.log('✅ Custom gateway initialized successfully');
      
      // Log available models
      const models = gatewayInstance.getAvailableModels();
      console.log(`📋 ${models.length} models available`);
    } catch (error) {
      console.error('❌ Failed to initialize gateway:', error.message);
      throw error;
    }
  }
  return gatewayInstance;
}

module.exports = {
  ai: {
    provider: async () => getGateway().getProvider(),
    model: async () => getGateway().getDefaultModel(),
    getModel: async (id) => getGateway().getModel(id),
    listModels: async () => getGateway().getAvailableModels(),
    
    modelSelector: {
      enabled: true,
      models: async () => {
        return getGateway().getAvailableModels().map(m => ({
          id: m.id,
          label: m.name,
          description: m.description,
        }));
      },
    },
  },
  
  settings: {
    disableDefaultProviders: true,
    providerName: 'Custom Gateway',
  },
  
  onError: (error) => {
    console.error('Open Code SST Error:', error);
  },
};
```

## Next Steps

1. Test the integration thoroughly with your specific use cases
2. Monitor token usage and response times
3. Set up proper error handling and fallbacks
4. Configure rate limiting if needed
5. Add custom middleware for specific requirements

For more information and support, see the [main documentation](./SETUP_GUIDE.md).