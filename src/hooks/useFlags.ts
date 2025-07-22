import { useState, useEffect } from 'react';
import { useSDK } from '@contentful/react-apps-toolkit';
import { callAppAction } from '../utils/appAction';
import { useErrorState } from './useErrorState';

export const useFlags = (search: string = '') => {
  const sdk = useSDK();
  const { error, handleError, clearError } = useErrorState('useFlags');
  const [flags, setFlags] = useState<any[]>([]);
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

        const result = await callAppAction<any>(sdk, 'getFlags', {
          projectKey,
          search
        });

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
    };

    fetchFlags();
  }, [sdk, search, handleError, clearError]);

  return { flags, loading, error };
}; 