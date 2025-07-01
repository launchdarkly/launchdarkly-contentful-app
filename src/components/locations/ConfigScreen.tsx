'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { ConfigAppSDK } from '@contentful/app-sdk';
import { Heading, Form, Paragraph, Flex } from '@contentful/f36-components';
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

  const sdk = useSDK<ConfigAppSDK>();
  const { fetchProjects, fetchEnvironments } = useLaunchDarkly(parameters.launchDarklyApiKey);

  // Validate API key by attempting to fetch projects
  const handleValidateApiKey = async () => {
    setApiKeyValidation({ isValidating: true, error: null, isValid: false });
    setProjects([]);
    setParameters((prev) => ({ ...prev, launchDarklyProjectKey: '', launchDarklyEnvironment: '' }));
    try {
      setProjectsLoading(true);
      const fetchedProjects = await fetchProjects();
      if (fetchedProjects && fetchedProjects.length > 0) {
        setProjects(fetchedProjects);
        setApiKeyValidation({ isValidating: false, error: null, isValid: true });
      } else {
        setApiKeyValidation({ isValidating: false, error: 'No projects found for this API key.', isValid: false });
      }
    } catch (error: any) {
      setApiKeyValidation({ isValidating: false, error: error.message || 'Invalid API key.', isValid: false });
    } finally {
      setProjectsLoading(false);
    }
  };

  // When project changes, fetch environments
  useEffect(() => {
    const fetchEnv = async () => {
      if (parameters.launchDarklyProjectKey && apiKeyValidation.isValid) {
        setEnvironmentsLoading(true);
        try {
          const envs = await fetchEnvironments(parameters.launchDarklyProjectKey);
          setEnvironments(envs || []);
        } catch (error) {
          setEnvironments([]);
        } finally {
          setEnvironmentsLoading(false);
        }
      } else {
        setEnvironments([]);
      }
    };
    fetchEnv();
  }, [parameters.launchDarklyProjectKey, apiKeyValidation.isValid, fetchEnvironments]);

  // Load saved parameters on mount
  useEffect(() => {
    (async () => {
      try {
        const currentParameters: AppInstallationParameters | null = await sdk.app.getParameters();
        if (currentParameters) {
          setParameters(currentParameters);
        }
        sdk.app.setReady();
      } catch (error) {
        console.error('Error initializing app:', error);
      }
    })();
  }, [sdk]);

  // If API key is present, auto-validate on mount
  useEffect(() => {
    if (parameters.launchDarklyApiKey) {
      handleValidateApiKey();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        {apiKeyValidation.isValid && (
          <ProjectSelector
            projectKey={parameters.launchDarklyProjectKey || ''}
            projects={projects}
            isLoading={projectsLoading}
            onChange={(projectKey) => {
              setParameters((prev) => ({ ...prev, launchDarklyProjectKey: projectKey, launchDarklyEnvironment: '' }));
            }}
          />
        )}
        {apiKeyValidation.isValid && parameters.launchDarklyProjectKey && (
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
