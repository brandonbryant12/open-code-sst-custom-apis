import { type LanguageModelV1, type ProviderV1 } from '@ai-sdk/provider';
import type { AmazonBedrockProvider } from '@ai-sdk/amazon-bedrock';
import type { OpenAIProvider } from '@ai-sdk/openai';
import { createCustomBedrockProvider } from './providers/custom-bedrock';
import { createCustomOpenAIProvider } from './providers/custom-openai';

export type CustomProvider = OpenAIProvider | AmazonBedrockProvider;

export type ModelConfig = {
  id: string;
  name: string;
  description?: string;
  isDefault?: boolean;
};

export type GatewayConfig = {
  provider: 'custom-openai' | 'custom-bedrock';
  models: ModelConfig[];
  options: 
    | {
        provider: 'custom-openai';
        baseURL: string;
        apiKey: string;
      }
    | {
        provider: 'custom-bedrock';
        baseURL: string;
        appId: string;
        appName: string;
        oauthUrl: string;
        clientId: string;
        clientSecret: string;
      };
};

export class GatewayService {
  private provider: ProviderV1;
  private models: Map<string, ModelConfig>;
  private defaultModelId: string;

  constructor(config: GatewayConfig) {
    this.models = new Map(config.models.map(model => [model.id, model]));
    
    const defaultModel = config.models.find(m => m.isDefault) || config.models[0];
    if (!defaultModel) {
      throw new Error('At least one model must be configured');
    }
    this.defaultModelId = defaultModel.id;

    switch (config.provider) {
      case 'custom-openai':
        if (config.options.provider !== 'custom-openai') {
          throw new Error('Provider mismatch in configuration');
        }
        this.provider = createCustomOpenAIProvider({
          baseURL: config.options.baseURL,
          apiKey: config.options.apiKey,
        });
        break;
      
      case 'custom-bedrock':
        if (config.options.provider !== 'custom-bedrock') {
          throw new Error('Provider mismatch in configuration');
        }
        this.provider = createCustomBedrockProvider({
          baseURL: config.options.baseURL,
          appId: config.options.appId,
          appName: config.options.appName,
          oauthUrl: config.options.oauthUrl,
          clientId: config.options.clientId,
          clientSecret: config.options.clientSecret,
        });
        break;
      
      default:
        const _exhaustive: never = config.provider;
        throw new Error(`Unsupported provider ${config.provider}`);
    }
  }

  getProvider(): ProviderV1 {
    return this.provider;
  }

  getModel(modelId?: string): LanguageModelV1 {
    const id = modelId || this.defaultModelId;
    const modelConfig = this.models.get(id);
    
    if (!modelConfig) {
      throw new Error(`Model ${id} not found in configuration`);
    }

    return this.provider.languageModel(id);
  }

  getAvailableModels(): ModelConfig[] {
    return Array.from(this.models.values());
  }

  getDefaultModel(): LanguageModelV1 {
    return this.getModel(this.defaultModelId);
  }
}

export function createGatewayService(config: GatewayConfig): GatewayService {
  return new GatewayService(config);
}