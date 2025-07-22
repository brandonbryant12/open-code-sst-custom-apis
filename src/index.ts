// Main export for Open Code provider
export { default } from './opencode-provider';
export type { OpenCodeProviderOptions } from './opencode-provider';

// Legacy exports for backward compatibility
export * from './gateway-factory';
export * from './config-loader';
export { createCustomBedrockProvider } from './providers/custom-bedrock';
export { createCustomOpenAIProvider } from './providers/custom-openai';

import { createGatewayService, type GatewayService } from './gateway-factory';
import { loadGatewayConfig, validateEnv } from './config-loader';

let gatewayService: GatewayService | null = null;

export function getGatewayService(): GatewayService {
  if (!gatewayService) {
    const env = validateEnv(process.env);
    const config = loadGatewayConfig(env);
    gatewayService = createGatewayService(config);
  }
  return gatewayService;
}

export function initializeGateway(env?: Record<string, string | undefined>): GatewayService {
  const validatedEnv = validateEnv(env || process.env);
  const config = loadGatewayConfig(validatedEnv);
  gatewayService = createGatewayService(config);
  return gatewayService;
}