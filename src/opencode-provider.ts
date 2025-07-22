import { createCustomBedrockProvider } from './providers/custom-bedrock';
import { createCustomOpenAIProvider } from './providers/custom-openai';
import type { ProviderV1 } from '@ai-sdk/provider';

export interface OpenCodeProviderOptions {
  type?: 'openai' | 'bedrock';
  baseURL: string;
  // OpenAI options
  apiKey?: string;
  // Bedrock options
  appId?: string;
  appName?: string;
  oauthUrl?: string;
  clientId?: string;
  clientSecret?: string;
}

/**
 * Creates a custom provider for Open Code
 * This is the main export that Open Code will use
 */
export default function createProvider(options: OpenCodeProviderOptions): ProviderV1 {
  // If type is not specified, try to infer from options
  const type = options.type || (options.apiKey ? 'openai' : 'bedrock');

  if (type === 'openai') {
    if (!options.apiKey) {
      throw new Error('apiKey is required for OpenAI provider');
    }
    return createCustomOpenAIProvider({
      baseURL: options.baseURL,
      apiKey: options.apiKey,
    });
  } else if (type === 'bedrock') {
    if (!options.appId || !options.appName || !options.oauthUrl || !options.clientId || !options.clientSecret) {
      throw new Error('appId, appName, oauthUrl, clientId, and clientSecret are required for Bedrock provider');
    }
    return createCustomBedrockProvider({
      baseURL: options.baseURL,
      appId: options.appId,
      appName: options.appName,
      oauthUrl: options.oauthUrl,
      clientId: options.clientId,
      clientSecret: options.clientSecret,
    });
  } else {
    throw new Error(`Unknown provider type: ${type}`);
  }
}