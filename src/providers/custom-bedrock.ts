import { createAmazonBedrock } from '@ai-sdk/amazon-bedrock';
import type { AmazonBedrockProvider } from '@ai-sdk/amazon-bedrock';

interface TokenCache {
  token: string;
  expiresAt: number;
}

interface OAuthTokenResponse {
  access_token: string;
  expires_in: number;
  token_type?: string;
}

interface OAuthConfig {
  oauthUrl: string;
  clientId: string;
  clientSecret: string;
}

let tokenCache: TokenCache | null = null;

async function getOAuthToken(config: OAuthConfig): Promise<string> {
  if (tokenCache && tokenCache.expiresAt > Date.now()) {
    return tokenCache.token;
  }

  const tokenUrl = new URL(config.oauthUrl).toString();

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: config.clientId,
    client_secret: config.clientSecret,
    scope: 'AppIdClaimsTrust',
  });

  let res;
  try {
    res = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });
  } catch (err: any) {
    throw new Error(
      `Failed to obtain OAuth token: ${err.status || ''} ${err.statusText || ''} - ${err.message}`,
    );
  }

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(
      `Failed to obtain OAuth token: ${res.status} ${res.statusText} - ${errorText}`,
    );
  }

  const tokenResponse = (await res.json()) as OAuthTokenResponse;
  tokenCache = {
    token: tokenResponse.access_token,
    expiresAt: Date.now() + (tokenResponse.expires_in - 60) * 1000,
  };

  return tokenCache.token;
}

interface CustomFetchOptions {
  appId: string;
  appName: string;
  oauthConfig: OAuthConfig;
}

function createCustomFetch(options: CustomFetchOptions): typeof fetch {
  const customFetch: typeof fetch = async (input, init) => {
    const url =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;
    const request =
      typeof input === 'string'
        ? new Request(input, init)
        : input instanceof URL
          ? new Request(input.toString(), init)
          : input;

    const modelIdMatch = url.match(/\/model\/([^\/]+)\/converse/);
    const modelId =
      modelIdMatch && modelIdMatch[1]
        ? decodeURIComponent(modelIdMatch[1])
        : null;

    if (modelId && url.includes('/converse')) {
      const token = await getOAuthToken(options.oauthConfig);
      const baseUrl = url.split('/model/')[0];
      const newUrl = `${baseUrl}/llm-orchestrator/v2/inference`;

      const originalBody = await request.text();
      let requestData: any;
      try {
        requestData = JSON.parse(originalBody);
      } catch (e) {
        console.error('Failed to parse request body:', e);
        requestData = {};
      }
      if (requestData.inferenceConfig?.maxOutputTokens) {
        requestData.inferenceConfig.maxTokens =
          requestData.inferenceConfig?.maxOutputTokens;
        delete requestData.inferenceConfig?.maxOutputTokens;
      }
      const transformedBody = {
        model: {
          provider: 'bedrock',
          id: modelId,
        },
        requestBody: {
          ...requestData,
          ...(requestData.inferenceConfig && {
            inferenceConfig: requestData.inferenceConfig,
          }),
          ...(requestData.additionalModelRequestFields && {
            additionalModelRequestFields:
              requestData.additionalModelRequestFields,
          }),
        },
      };

      let response;
      try {
        response = await fetch(newUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            'app-id': options.appId,
            'app-name': options.appName,
            'fid-log-tracking-id': crypto.randomUUID(),
          },
          body: JSON.stringify(transformedBody),
        });
      } catch (err: any) {
        return new Response(
          JSON.stringify({
            error: {
              type: 'request_error',
              message: err.message || 'Request failed',
              status: err.status,
              statusText: err.statusText || '',
              response: err.response?.text,
            },
          }),
          {
            status: err.status || 500,
            statusText: err.statusText || 'Internal Server Error',
            headers: {
              'content-type': 'application/json',
            },
          },
        );
      }

      if (!response.ok) {
        const errorText = await response.text();
        return new Response(
          JSON.stringify({
            error: {
              type: 'request_error',
              message: errorText || 'Request failed',
              status: response.status,
              statusText: response.statusText || '',
            },
          }),
          {
            status: response.status || 500,
            statusText: response.statusText || 'Internal Server Error',
            headers: {
              'content-type': 'application/json',
            },
          },
        );
      }

      try {
        const responseData: any = await response.json();
        const bedrockResponse = {
          ...(responseData.output || responseData),
          output: responseData.output || {
            message: responseData.message || {
              role: 'assistant',
              content: responseData.content || [],
            },
          },
          stopReason: responseData.stopReason || 'end_turn',
          usage: responseData.usage || {
            inputTokens: 0,
            outputTokens: 0,
            totalTokens: 0,
          },
        };

        return new Response(JSON.stringify(bedrockResponse), {
          status: response.status,
          statusText: '',
          headers: {
            ...Object.fromEntries(response.headers.entries()),
            'content-type': 'application/json',
          },
        });
      } catch (error) {
        console.error('Failed to transform response:', error);
        return new Response(
          JSON.stringify({
            error: {
              type: 'transformation_error',
              message: 'Failed to transform response from custom endpoint',
            },
          }),
          {
            status: 500,
            statusText: 'Internal Server Error',
            headers: {
              'content-type': 'application/json',
            },
          },
        );
      }
    }

    return fetch(input, init);
  };

  return customFetch;
}

export function createCustomBedrockProvider(options: {
  baseURL: string;
  appId: string;
  appName: string;
  oauthUrl: string;
  clientId: string;
  clientSecret: string;
}): AmazonBedrockProvider {
  return createAmazonBedrock({
    region: 'not-used',
    accessKeyId: 'not-used',
    secretAccessKey: 'not-used',
    baseURL: options.baseURL,
    fetch: createCustomFetch({
      appId: options.appId,
      appName: options.appName,
      oauthConfig: {
        oauthUrl: options.oauthUrl,
        clientId: options.clientId,
        clientSecret: options.clientSecret,
      },
    }),
  });
}

export { getOAuthToken, createCustomFetch };