import { useState, useEffect } from 'react';
import { useSDK } from '@contentful/react-apps-toolkit';
import { callAppAction } from '@/utils/appAction';

interface UseFlagDataProps {
  flagKey: string | null;
  projectKey: string | null;
}

export interface FlagStatus {
  isLive: boolean;
  isExperiment: boolean;
}

export interface FlagVariations {
  variations: Array<{
    name: string;
    value: any;
    _id?: string;
  }>;
}

export interface FlagData extends FlagStatus, FlagVariations {
  key: string;
  name: string;
  description?: string;
}

export function useFlagData({ flagKey, projectKey }: UseFlagDataProps) {
  const [flagData, setFlagData] = useState<FlagData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sdk = useSDK();

  useEffect(() => {
    let cancelled = false;

    const fetchFlagData = async () => {
      if (!flagKey || !projectKey) {
        console.log('[useFlagData] Skipping fetch - missing required values:', { flagKey, projectKey });
        return;
      }

      // Check if SDK parameters are available using compatible method
      let apiKey, parameters;
      if ('app' in sdk && typeof sdk.app.getParameters === 'function') {
        parameters = await sdk.app.getParameters();
        apiKey = parameters?.launchDarklyApiKey;
      } else {
        apiKey = sdk.parameters?.installation?.launchDarklyApiKey;
        parameters = sdk.parameters?.installation;
      }
      


      setLoading(true);
      setError(null);

      try {
        const response = await callAppAction(sdk, 'getFlagDetails', { 
          projectKey,
          flagKey 
        });

        if (!cancelled) {
          if (response.status === 200 && response.body) {
            const flag = response.body;
            setFlagData({
              key: flag.key,
              name: flag.name,
              description: flag.description,
              isLive: flag.environments?.production?.on || false,
              isExperiment: flag.environments?.production?.experiment || false,
              variations: flag.variations || []
            });
            setError(null);
          } else {
            setFlagData(null);
            setError(response.body?.error || 'Failed to fetch flag data');
          }
        }
      } catch (err) {
        if (!cancelled) {
          setFlagData(null);
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchFlagData();

    return () => {
      cancelled = true;
    };
  }, [flagKey, projectKey, sdk]);

  return { flagData, loading, error };
} 