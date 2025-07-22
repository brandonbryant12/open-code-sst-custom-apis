/**
 * Example configuration file for integrating custom gateways with Open Code SST
 * Place this file in your Open Code SST project root
 */

const { getGatewayService } = require('@your-org/open-code-sst-custom-apis');

// Initialize the gateway service once
let gatewayInstance = null;

function getGateway() {
  if (!gatewayInstance) {
    gatewayInstance = getGatewayService();
  }
  return gatewayInstance;
}

module.exports = {
  // AI configuration for Open Code SST
  ai: {
    // Provider configuration
    provider: () => {
      const gateway = getGateway();
      return gateway.getProvider();
    },
    
    // Default model configuration
    model: () => {
      const gateway = getGateway();
      return gateway.getDefaultModel();
    },
    
    // Optional: Model selector function
    selectModel: (modelId) => {
      const gateway = getGateway();
      return gateway.getModel(modelId);
    },
    
    // Optional: List available models
    listModels: () => {
      const gateway = getGateway();
      return gateway.getAvailableModels();
    },
  },
  
  // Optional: Custom middleware for request modification
  middleware: {
    beforeRequest: (request) => {
      // Add custom headers, modify parameters, etc.
      console.log('Request to model:', request.model);
      return request;
    },
    
    afterResponse: (response) => {
      // Log usage, modify response, etc.
      console.log('Tokens used:', response.usage);
      return response;
    },
  },
  
  // Optional: Error handling
  errorHandler: (error) => {
    console.error('AI Gateway Error:', error);
    // Custom error handling logic
    throw error;
  },
};