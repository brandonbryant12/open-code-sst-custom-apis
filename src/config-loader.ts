import * as v from 'valibot';
import { GatewayConfig, ModelConfig } from './gateway-factory';

const modelConfigSchema = v.object({
  id: v.string(),
  name: v.string(),
  description: v.optional(v.string()),
  isDefault: v.optional(v.boolean()),
});

const customOpenAIOptionsSchema = v.object({
  provider: v.literal('custom-openai'),
  baseURL: v.pipe(v.string(), v.url()),
  apiKey: v.string(),
});

const customBedrockOptionsSchema = v.object({
  provider: v.literal('custom-bedrock'),
  baseURL: v.pipe(v.string(), v.url()),
  appId: v.string(),
  appName: v.string(),
  oauthUrl: v.pipe(v.string(), v.url()),
  clientId: v.string(),
  clientSecret: v.string(),
});

const gatewayConfigSchema = v.object({
  provider: v.picklist(['custom-openai', 'custom-bedrock']),
  models: v.array(modelConfigSchema),
  options: v.union([customOpenAIOptionsSchema, customBedrockOptionsSchema]),
});

export const envSchema = v.object({
  GATEWAY_PROVIDER: v.picklist(
    ['custom-openai', 'custom-bedrock'],
    'GATEWAY_PROVIDER must be one of: custom-openai, custom-bedrock'
  ),
  
  // Custom OpenAI configuration
  CUSTOM_OPENAI_BASE_URL: v.optional(v.pipe(v.string(), v.url())),
  CUSTOM_OPENAI_API_KEY: v.optional(v.string()),
  CUSTOM_OPENAI_MODELS: v.optional(v.string()),
  
  // Custom Bedrock configuration
  CUSTOM_BEDROCK_BASE_URL: v.optional(v.pipe(v.string(), v.url())),
  CUSTOM_BEDROCK_APP_ID: v.optional(v.string()),
  CUSTOM_BEDROCK_APP_NAME: v.optional(v.string()),
  CUSTOM_BEDROCK_OAUTH_URL: v.optional(v.pipe(v.string(), v.url())),
  CUSTOM_BEDROCK_CLIENT_ID: v.optional(v.string()),
  CUSTOM_BEDROCK_CLIENT_SECRET: v.optional(v.string()),
  CUSTOM_BEDROCK_MODELS: v.optional(v.string()),
});

export type Env = v.InferOutput<typeof envSchema>;

function parseModels(modelsString: string): ModelConfig[] {
  try {
    return JSON.parse(modelsString);
  } catch (error) {
    console.error('Failed to parse models configuration:', error);
    throw new Error('MODELS environment variable must be a valid JSON array');
  }
}

export function loadGatewayConfig(env: Env): GatewayConfig {
  switch (env.GATEWAY_PROVIDER) {
    case 'custom-openai': {
      if (!env.CUSTOM_OPENAI_BASE_URL || !env.CUSTOM_OPENAI_API_KEY || !env.CUSTOM_OPENAI_MODELS) {
        throw new Error(
          'Missing required environment variables for custom-openai: CUSTOM_OPENAI_BASE_URL, CUSTOM_OPENAI_API_KEY, CUSTOM_OPENAI_MODELS'
        );
      }
      
      const models = parseModels(env.CUSTOM_OPENAI_MODELS);
      
      return {
        provider: 'custom-openai',
        models,
        options: {
          provider: 'custom-openai',
          baseURL: env.CUSTOM_OPENAI_BASE_URL,
          apiKey: env.CUSTOM_OPENAI_API_KEY,
        },
      };
    }
    
    case 'custom-bedrock': {
      if (
        !env.CUSTOM_BEDROCK_BASE_URL ||
        !env.CUSTOM_BEDROCK_APP_ID ||
        !env.CUSTOM_BEDROCK_APP_NAME ||
        !env.CUSTOM_BEDROCK_OAUTH_URL ||
        !env.CUSTOM_BEDROCK_CLIENT_ID ||
        !env.CUSTOM_BEDROCK_CLIENT_SECRET ||
        !env.CUSTOM_BEDROCK_MODELS
      ) {
        throw new Error(
          'Missing required environment variables for custom-bedrock: CUSTOM_BEDROCK_BASE_URL, CUSTOM_BEDROCK_APP_ID, CUSTOM_BEDROCK_APP_NAME, CUSTOM_BEDROCK_OAUTH_URL, CUSTOM_BEDROCK_CLIENT_ID, CUSTOM_BEDROCK_CLIENT_SECRET, CUSTOM_BEDROCK_MODELS'
        );
      }
      
      const models = parseModels(env.CUSTOM_BEDROCK_MODELS);
      
      return {
        provider: 'custom-bedrock',
        models,
        options: {
          provider: 'custom-bedrock',
          baseURL: env.CUSTOM_BEDROCK_BASE_URL,
          appId: env.CUSTOM_BEDROCK_APP_ID,
          appName: env.CUSTOM_BEDROCK_APP_NAME,
          oauthUrl: env.CUSTOM_BEDROCK_OAUTH_URL,
          clientId: env.CUSTOM_BEDROCK_CLIENT_ID,
          clientSecret: env.CUSTOM_BEDROCK_CLIENT_SECRET,
        },
      };
    }
    
    default: {
      const _exhaustive: never = env.GATEWAY_PROVIDER;
      throw new Error(`Unsupported provider ${env.GATEWAY_PROVIDER}`);
    }
  }
}

export function validateEnv(rawEnv: Record<string, string | undefined>): Env {
  try {
    return v.parse(envSchema, rawEnv);
  } catch (error) {
    if (error instanceof v.ValiError) {
      const messages = error.issues.map(
        (issue) =>
          `${issue.path?.map((p: any) => p.key).join('.') || 'root'}: ${issue.message} (received: ${JSON.stringify(issue.input)})`
      );
      console.error('Environment validation errors:\n' + messages.join('\n'));
    }
    throw new Error('Environment validation failed');
  }
}