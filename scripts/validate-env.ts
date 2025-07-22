#!/usr/bin/env tsx

import { initializeGateway, validateEnv } from '../src';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

console.log('🔍 Validating environment configuration...\n');

try {
  // Step 1: Validate environment variables
  console.log('Step 1: Validating environment variables...');
  const env = validateEnv(process.env);
  console.log('✅ Environment variables are valid');
  console.log(`   Provider: ${env.GATEWAY_PROVIDER}`);
  
  // Step 2: Parse models configuration
  console.log('\nStep 2: Parsing models configuration...');
  const modelsVar = env.GATEWAY_PROVIDER === 'custom-openai' 
    ? env.CUSTOM_OPENAI_MODELS 
    : env.CUSTOM_BEDROCK_MODELS;
    
  if (modelsVar) {
    try {
      const models = JSON.parse(modelsVar);
      console.log(`✅ Models configuration is valid (${models.length} models configured)`);
      models.forEach((model: any, index: number) => {
        console.log(`   ${index + 1}. ${model.name} (${model.id})${model.isDefault ? ' [DEFAULT]' : ''}`);
      });
    } catch (error) {
      console.error('❌ Failed to parse models JSON:', error);
      process.exit(1);
    }
  } else {
    console.error('❌ No models configured for the selected provider');
    process.exit(1);
  }
  
  // Step 3: Initialize gateway
  console.log('\nStep 3: Initializing gateway service...');
  const gateway = initializeGateway();
  console.log('✅ Gateway service initialized successfully');
  
  // Step 4: Test gateway functionality
  console.log('\nStep 4: Testing gateway functionality...');
  const availableModels = gateway.getAvailableModels();
  console.log(`✅ ${availableModels.length} models available`);
  
  const defaultModel = gateway.getDefaultModel();
  console.log('✅ Default model accessible');
  
  // Step 5: Configuration summary
  console.log('\n📊 Configuration Summary:');
  console.log('========================');
  console.log(`Provider: ${env.GATEWAY_PROVIDER}`);
  console.log(`Models: ${availableModels.length}`);
  
  if (env.GATEWAY_PROVIDER === 'custom-openai') {
    console.log(`Base URL: ${env.CUSTOM_OPENAI_BASE_URL}`);
    console.log(`API Key: ${env.CUSTOM_OPENAI_API_KEY ? '✅ Set' : '❌ Not set'}`);
  } else {
    console.log(`Base URL: ${env.CUSTOM_BEDROCK_BASE_URL}`);
    console.log(`App ID: ${env.CUSTOM_BEDROCK_APP_ID}`);
    console.log(`App Name: ${env.CUSTOM_BEDROCK_APP_NAME}`);
    console.log(`OAuth URL: ${env.CUSTOM_BEDROCK_OAUTH_URL}`);
    console.log(`Client ID: ${env.CUSTOM_BEDROCK_CLIENT_ID ? '✅ Set' : '❌ Not set'}`);
    console.log(`Client Secret: ${env.CUSTOM_BEDROCK_CLIENT_SECRET ? '✅ Set' : '❌ Not set'}`);
  }
  
  console.log('\n✅ All validation checks passed! Your configuration is ready to use.');
  
} catch (error) {
  console.error('\n❌ Validation failed:', error);
  
  if (error instanceof Error) {
    console.error('\nError details:', error.message);
    
    // Provide helpful suggestions based on error
    if (error.message.includes('GATEWAY_PROVIDER')) {
      console.log('\n💡 Tip: Make sure GATEWAY_PROVIDER is set to either "custom-openai" or "custom-bedrock"');
    } else if (error.message.includes('Missing required environment variables')) {
      console.log('\n💡 Tip: Check that all required environment variables for your provider are set');
      console.log('   See .env.example for a complete list of required variables');
    } else if (error.message.includes('valid JSON')) {
      console.log('\n💡 Tip: Make sure your MODELS environment variable contains valid JSON');
      console.log('   Example: \'[{"id":"model-1","name":"Model 1","isDefault":true}]\'');
    }
  }
  
  process.exit(1);
}