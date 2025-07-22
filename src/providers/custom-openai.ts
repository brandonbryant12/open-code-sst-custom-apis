import { createOpenAI, type OpenAIProvider } from '@ai-sdk/openai';

export function createCustomOpenAIProvider(options: {
  baseURL: string;
  apiKey: string;
}): OpenAIProvider {
  return createOpenAI({
    baseURL: options.baseURL,
    apiKey: options.apiKey,
  });
}