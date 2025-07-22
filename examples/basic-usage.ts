import { getGatewayService } from '../src';
import { generateText, streamText } from 'ai';

async function main() {
  try {
    // Initialize the gateway service
    const gateway = getGatewayService();
    
    console.log('🚀 Gateway initialized successfully');
    
    // List available models
    const models = gateway.getAvailableModels();
    console.log('\n📋 Available models:');
    models.forEach(model => {
      console.log(`  - ${model.name} (${model.id})${model.isDefault ? ' [DEFAULT]' : ''}`);
      if (model.description) {
        console.log(`    ${model.description}`);
      }
    });
    
    // Example 1: Simple text generation with default model
    console.log('\n🤖 Example 1: Simple text generation');
    const result1 = await generateText({
      model: gateway.getDefaultModel(),
      prompt: 'What are the benefits of TypeScript over JavaScript?',
      maxTokens: 200,
    });
    console.log('Response:', result1.text);
    
    // Example 2: Using a specific model
    console.log('\n🤖 Example 2: Using a specific model');
    const availableModels = gateway.getAvailableModels();
    if (availableModels.length > 1) {
      const alternativeModel = availableModels.find(m => !m.isDefault);
      if (alternativeModel) {
        const result2 = await generateText({
          model: gateway.getModel(alternativeModel.id),
          prompt: 'Write a haiku about programming',
          maxTokens: 50,
        });
        console.log(`Response from ${alternativeModel.name}:`, result2.text);
      }
    }
    
    // Example 3: Streaming response
    console.log('\n🤖 Example 3: Streaming response');
    const stream = await streamText({
      model: gateway.getDefaultModel(),
      prompt: 'Tell me a short story about a helpful AI assistant',
      maxTokens: 300,
    });
    
    console.log('Streaming response:');
    for await (const chunk of stream) {
      process.stdout.write(chunk);
    }
    console.log('\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the examples
main();