'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { ConfigAppSDK } from '@contentful/app-sdk';
import { Heading, Form, Paragraph, Flex, Card, Text, Badge } from '@contentful/f36-components';
import { css } from 'emotion';
import { /* useCMA, */ useSDK } from '@contentful/react-apps-toolkit';
import ApiKeySection from '../ConfigScreen/components/ApiKeySection';
import ProjectSelector from '../ConfigScreen/components/ProjectSelector';
import EnvironmentSelector from '../ConfigScreen/components/EnvironmentSelector';
import { useLaunchDarkly } from '../ConfigScreen/hooks/useLaunchDarkly';
import { Project, Environment } from '../ConfigScreen/types';

export interface AppInstallationParameters {
  launchDarklyApiKey?: string;
  launchDarklyProjectKey?: string;
  launchDarklyEnvironment?: string;
  launchDarklyBaseUrl?: string;
}

// Component to display current settings
const CurrentSettings: React.FC<{ parameters: AppInstallationParameters }> = ({ parameters }) => {
  const hasValidSettings = parameters.launchDarklyApiKey && 
                          parameters.launchDarklyProjectKey && 
                          parameters.launchDarklyEnvironment;

  if (!hasValidSettings) {
    return null;
  }

  return (
    <Card padding="large" style={{ marginBottom: '24px' }}>
      <Heading marginBottom="spacingM">Current Settings</Heading>
      <Flex flexDirection="column" gap="spacingS">
        <div>
          <Text fontWeight="fontWeightMedium">API Key:</Text>
          <Text fontColor="gray600">••••••••••••••••</Text>
        </div>
        <div>
          <Text fontWeight="fontWeightMedium">Project:</Text>
          <Text fontColor="gray600">{parameters.launchDarklyProjectKey}</Text>
        </div>
        <div>
          <Text fontWeight="fontWeightMedium">Environment:</Text>
          <Text fontColor="gray600">{parameters.launchDarklyEnvironment}</Text>
        </div>
        <Badge variant="positive" style={{ alignSelf: 'flex-start' }}>
          ✓ Configured
        </Badge>
      </Flex>
    </Card>
  );
};

const ConfigScreen = () => {
  const [parameters, setParameters] = useState<AppInstallationParameters>({
    launchDarklyApiKey: '',
    launchDarklyProjectKey: '',
    launchDarklyEnvironment: '',
    launchDarklyBaseUrl: 'https://app.launchdarkly.com',
  });
  const [apiKeyValidation, setApiKeyValidation] = useState({
    isValidating: false,
    error: null as string | null,
    isValid: false,
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [environmentsLoading, setEnvironmentsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const sdk = useSDK<ConfigAppSDK>();
  const { fetchProjects, fetchEnvironments } = useLaunchDarkly(parameters.launchDarklyApiKey);

  // Validate API key by attempting to fetch projects (clears stored values)
  const handleValidateApiKey = async () => {
    setApiKeyValidation({ isValidating: true, error: null, isValid: false });
    setProjects([]);
    setParameters((prev) => ({ ...prev, launchDarklyProjectKey: '', launchDarklyEnvironment: '' }));
    try {
      setProjectsLoading(true);
      console.log('[ConfigScreen] Validating API key and fetching projects...');
      const fetchedProjects = await fetchProjects();
      console.log('[ConfigScreen] Fetched projects:', fetchedProjects);
      if (fetchedProjects && fetchedProjects.length > 0) {
        setProjects(fetchedProjects);
        setApiKeyValidation({ isValidating: false, error: null, isValid: true });
        console.log('[ConfigScreen] API key validation successful');
      } else {
        console.log('[ConfigScreen] No projects found for API key');
        setApiKeyValidation({ isValidating: false, error: 'No projects found for this API key.', isValid: false });
      }
    } catch (error: any) {
      console.error('[ConfigScreen] API key validation error:', error);
      setApiKeyValidation({ isValidating: false, error: error.message || 'Invalid API key.', isValid: false });
    } finally {
      setProjectsLoading(false);
    }
  };

  // Auto-validate API key without clearing stored values
  const handleAutoValidateApiKey = async () => {
    setApiKeyValidation({ isValidating: true, error: null, isValid: false });
    setProjects([]);
    try {
      setProjectsLoading(true);
      console.log('[ConfigScreen] Auto-validating API key and fetching projects...');
      const fetchedProjects = await fetchProjects();
      console.log('[ConfigScreen] Fetched projects:', fetchedProjects);
      if (fetchedProjects && fetchedProjects.length > 0) {
        setProjects(fetchedProjects);
        setApiKeyValidation({ isValidating: false, error: null, isValid: true });
        console.log('[ConfigScreen] API key auto-validation successful');
      } else {
        console.log('[ConfigScreen] No projects found for API key');
        setApiKeyValidation({ isValidating: false, error: 'No projects found for this API key.', isValid: false });
      }
    } catch (error: any) {
      console.error('[ConfigScreen] API key auto-validation error:', error);
      setApiKeyValidation({ isValidating: false, error: error.message || 'Invalid API key.', isValid: false });
    } finally {
      setProjectsLoading(false);
    }
  };

  // When project changes, fetch environments
  useEffect(() => {
    const fetchEnv = async () => {
      if (parameters.launchDarklyProjectKey && (apiKeyValidation.isValid || parameters.launchDarklyApiKey)) {
        setEnvironmentsLoading(true);
        try {
          console.log('[ConfigScreen] Fetching environments for project:', parameters.launchDarklyProjectKey);
          const envs = await fetchEnvironments(parameters.launchDarklyProjectKey);
          console.log('[ConfigScreen] Fetched environments:', envs);
          setEnvironments(envs || []);
        } catch (error) {
          console.error('[ConfigScreen] Error fetching environments:', error);
          setEnvironments([]);
        } finally {
          setEnvironmentsLoading(false);
        }
      } else {
        setEnvironments([]);
      }
    };
    fetchEnv();
  }, [parameters.launchDarklyProjectKey, apiKeyValidation.isValid, parameters.launchDarklyApiKey, fetchEnvironments]);

  // Load saved parameters on mount
  useEffect(() => {
    (async () => {
      try {
        const currentParameters: AppInstallationParameters | null = await sdk.app.getParameters();
        if (currentParameters) {
          setParameters(currentParameters);
          // If we have a stored API key, we'll validate it and fetch projects
          if (currentParameters.launchDarklyApiKey) {
            setApiKeyValidation({ isValidating: false, error: null, isValid: false });
          }
        }
        setIsInitialized(true);
        sdk.app.setReady();
      } catch (error) {
        console.error('Error initializing app:', error);
        setIsInitialized(true);
      }
    })();
  }, [sdk]);

  // If API key is present and we have stored settings, auto-validate on mount
  useEffect(() => {
    if (isInitialized && parameters.launchDarklyApiKey) {
      console.log('[ConfigScreen] Auto-validating stored API key...');
      handleAutoValidateApiKey();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized]);

  const onConfigure = useCallback(async () => {
    const currentState = await sdk.app.getCurrentState();
    return {
      parameters,
      targetState: currentState,
    };
  }, [parameters, sdk]);

  useEffect(() => {
    sdk.app.onConfigure(() => onConfigure());
  }, [sdk, onConfigure]);

  return (
    <Flex flexDirection="column" className={css({ margin: '80px', maxWidth: '800px' })} gap="spacingL">
      <Form>
        <Heading>LaunchDarkly App Config</Heading>
        <Paragraph>Welcome to your LaunchDarkly Contentful app. This is your config page.</Paragraph>
        
        {/* Show current settings if they exist */}
        <CurrentSettings parameters={parameters} />
        
        <ApiKeySection
          apiKey={parameters.launchDarklyApiKey || ''}
          isLoading={projectsLoading}
          validation={apiKeyValidation}
          onChange={(apiKey) => {
            setParameters((prev) => ({ ...prev, launchDarklyApiKey: apiKey }));
            setApiKeyValidation({ isValidating: false, error: null, isValid: false });
            setProjects([]);
            setParameters((prev) => ({ ...prev, launchDarklyProjectKey: '', launchDarklyEnvironment: '' }));
          }}
          onValidate={handleValidateApiKey}
        />
        {(apiKeyValidation.isValid || parameters.launchDarklyApiKey) && (
          <ProjectSelector
            projectKey={parameters.launchDarklyProjectKey || ''}
            projects={projects}
            isLoading={projectsLoading}
            onChange={(projectKey) => {
              setParameters((prev) => ({ ...prev, launchDarklyProjectKey: projectKey, launchDarklyEnvironment: '' }));
            }}
          />
        )}
        {(apiKeyValidation.isValid || parameters.launchDarklyApiKey) && parameters.launchDarklyProjectKey && (
          <EnvironmentSelector
            environmentKey={parameters.launchDarklyEnvironment || ''}
            environments={environments}
            isLoading={environmentsLoading}
            onChange={(environmentKey) => {
              setParameters((prev) => ({ ...prev, launchDarklyEnvironment: environmentKey }));
            }}
          />
        )}
      </Form>
    </Flex>
  );
};

export default ConfigScreen;
