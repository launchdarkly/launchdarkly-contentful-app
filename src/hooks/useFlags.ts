import { useState, useEffect, useRef } from 'react';
import { useSDK } from '@contentful/react-apps-toolkit';
import { callAppAction } from '../utils/appAction';
import { useErrorState } from './useErrorState';
import { FeatureFlag } from '../types/launchdarkly';

export const useFlags = (search: string = '') => {
  const sdk = useSDK();
  const { error, handleError, clearError } = useErrorState('useFlags');
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlags = async () => {
      try {
        setLoading(true);
        clearError();

        // Try both parameter access methods for compatibility
        let apiKey, projectKey, parameters;
        
        if ('app' in sdk && typeof sdk.app.getParameters === 'function') {
          parameters = await sdk.app.getParameters();
          apiKey = parameters?.launchDarklyApiKey;
          projectKey = parameters?.launchDarklyProjectKey;
        } else {
          apiKey = sdk.parameters?.installation?.launchDarklyApiKey;
          projectKey = sdk.parameters?.installation?.launchDarklyProjectKey;
          parameters = sdk.parameters?.installation;
        }

        if (!apiKey || !projectKey) {
          handleError('Missing API key or project key');
          return;
        }

        console.log('[useFlags] Fetching all flags...');
        const result = await callAppAction<{ items: FeatureFlag[] }>(sdk, 'getFlags', {
          projectKey
        });
        console.log('[useFlags] Received flags count:', result?.items?.length || 0);

        if (result?.items) {
          setFlags(result.items);
          clearError();
        } else {
          handleError('No flags found');
        }
      } catch (err) {
        handleError(err instanceof Error ? err : new Error('Failed to fetch flags'));
      } finally {
        setLoading(false);
      }
    };

    fetchFlags();
  }, [sdk, handleError, clearError]);

  return { flags, loading, error };
}; 