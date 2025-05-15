import { KnownSDK } from '@contentful/app-sdk';

interface AppActionParams {
  apiKey: string;
  action: string;
  params: any;
}

interface AppActionResponse<T> {
  body: T;
  error?: string;
}

export const callAppAction = async <T = any>(
  sdk: KnownSDK,
  action: string,
  params: any
): Promise<T> => {
  
  const apiKey = sdk.parameters?.installation?.launchDarklyApiKey;
  if (!apiKey) {
    throw new Error('Missing LaunchDarkly API key');
  }
  
  const requestBody: AppActionParams = { apiKey, action, params };
  
  const response = await fetch('/api/app-action', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });
    
  if (!response.ok) {
    const error = await response.json() as AppActionResponse<never>;
    throw new Error(error.error || 'Failed to perform action');
  }
  
  const data = await response.json() as AppActionResponse<T>;
  
  return data.body;
}; 