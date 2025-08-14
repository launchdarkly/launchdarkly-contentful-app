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
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Clear any existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set a new timeout to debounce the search
    debounceTimeoutRef.current = setTimeout(async () => {
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

        console.log('[useFlags] Calling getFlags with search:', search);
        const result = await callAppAction<{ items: FeatureFlag[] }>(sdk, 'getFlags', {
          projectKey,
          search
        });
        console.log('[useFlags] Received flags count:', result?.items?.length || 0);

        if (result?.items) {
          setFlags(result?.items);
          clearError();
        } else if (result?.error) {
          handleError(result?.error);
        } else {
          handleError('No flags found');
        }
      } catch (err) {
        handleError(err instanceof Error ? err : new Error('Failed to fetch flags'));
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce delay

    // Cleanup function to clear timeout on unmount
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [sdk, search, handleError, clearError]);

  return { flags, loading, error };
}; 