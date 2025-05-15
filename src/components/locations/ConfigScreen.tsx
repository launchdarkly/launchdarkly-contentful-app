import React, { useState, useEffect } from 'react';
import { Button, Form, Note, Heading, Paragraph, Flex } from '@contentful/f36-components';
import { css } from 'emotion';
import { useErrorState } from '../../hooks/useErrorState';
import { ErrorBoundary } from '../../components/ErrorBoundary/index';
import { ConfigAppSDK } from '@contentful/app-sdk';
import { useLaunchDarkly } from '../ConfigScreen/hooks/useLaunchDarkly';
import { useContentTypeManagement } from '../ConfigScreen/hooks/useContentTypeManagement';
import ApiKeySection from '../ConfigScreen/components/ApiKeySection';
import ProjectSelector from '../ConfigScreen/components/ProjectSelector';
import EnvironmentSelector from '../ConfigScreen/components/EnvironmentSelector';
import { AppInstallationParameters, Project, Environment } from '../ConfigScreen/types';
import { LAUNCHDARKLY_FEATURE_FLAG_CONTENT_TYPE, DEFAULT_LAUNCHDARKLY_BASE_URL } from '../../utils/constants';

interface ConfigScreenProps {
  sdk: ConfigAppSDK;
}

interface InstallationParameters {
  launchDarklyApiKey: string;
  launchDarklyProjectKey: string;
  launchDarklyEnvironment: string;
  launchDarklyBaseUrl: string;
}

const ConfigScreen: React.FC<ConfigScreenProps> = ({ sdk }) => {
  const { error, handleError, clearError } = useErrorState('ConfigScreen');
  const [parameters, setParameters] = useState<InstallationParameters>({
    launchDarklyApiKey: '',
    launchDarklyProjectKey: '',
    launchDarklyEnvironment: '',
    launchDarklyBaseUrl: DEFAULT_LAUNCHDARKLY_BASE_URL
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiKeyValidation, setApiKeyValidation] = useState({
    isValidating: false,
    isValid: true,
    error: null as string | null
  });

  const { fetchProjects, fetchEnvironments } = useLaunchDarkly(
    parameters.launchDarklyApiKey || undefined
  );
  const { createFeatureFlagContentType } = useContentTypeManagement(sdk);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const config = sdk.parameters.installation as AppInstallationParameters;
        setParameters({
          launchDarklyApiKey: config.launchDarklyApiKey || '',
          launchDarklyProjectKey: config.launchDarklyProjectKey || '',
          launchDarklyEnvironment: config.launchDarklyEnvironment || '',
          launchDarklyBaseUrl: config.launchDarklyBaseUrl || DEFAULT_LAUNCHDARKLY_BASE_URL
        });
      } catch (error) {
        console.error('[ConfigScreen] Error loading configuration:', error);
        handleError('Failed to load configuration');
      }
    };

    loadConfig();
  }, [sdk.parameters.installation, handleError]);

  const validateApiKey = async (keyToValidate: string) => {
    if (!keyToValidate) {
      setApiKeyValidation({
        isValidating: false,
        isValid: false,
        error: 'API key is required'
      });
      return false;
    }

    setLoading(true);
    clearError();

    try {
      const fetchedProjects = await fetchProjects();
      if (fetchedProjects) {
        setProjects(fetchedProjects);
        setApiKeyValidation({
          isValidating: false,
          isValid: true,
          error: null
        });
        return true;
      } else {
        setApiKeyValidation({
          isValidating: false,
          isValid: false,
          error: 'Invalid API key'
        });
        return false;
      }
    } catch (error: any) {
      setApiKeyValidation({
        isValidating: false,
        isValid: false,
        error: error.message || 'Invalid API key or network error'
      });
      setProjects([]);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleApiKeyChange = (value: string) => {
    setParameters(prev => ({
      ...prev,
      launchDarklyApiKey: value
    }));
    if (apiKeyValidation.isValid) {
      setApiKeyValidation({
        isValidating: false,
        isValid: true,
        error: null
      });
    }
  };

  const handleProjectChange = async (projectKey: string) => {
    setParameters(prev => ({
      ...prev,
      launchDarklyProjectKey: projectKey,
      launchDarklyEnvironment: '' // Clear environment when project changes
    }));
    
    if (projectKey && parameters.launchDarklyApiKey) {
      try {
        setLoading(true);
        const envs = await fetchEnvironments(projectKey);
        setEnvironments(envs || []);
      } catch (error) {
        console.error('[ConfigScreen] Error fetching environments:', error);
        setEnvironments([]);
      } finally {
        setLoading(false);
      }
    } else {
      setEnvironments([]);
    }
  };

  const handleEnvironmentChange = (environmentKey: string) => {
    setParameters(prev => ({
      ...prev,
      launchDarklyEnvironment: environmentKey
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      clearError();

      // Validate API key first
      if (!parameters.launchDarklyApiKey) {
        handleError('API key is required');
        return;
      }

      const isValid = await validateApiKey(parameters.launchDarklyApiKey);
      if (!isValid) {
        return;
      }

      // Create content type if needed
      await createFeatureFlagContentType();

      // Save configuration
      await sdk.app.onConfigure(() => ({
        parameters: {
          installation: {
            launchDarklyApiKey: parameters.launchDarklyApiKey,
            launchDarklyProjectKey: parameters.launchDarklyProjectKey || '',
            launchDarklyEnvironment: parameters.launchDarklyEnvironment || '',
            launchDarklyBaseUrl: parameters.launchDarklyBaseUrl || DEFAULT_LAUNCHDARKLY_BASE_URL
          }
        },
        targetState: {
          EditorInterface: {
            [LAUNCHDARKLY_FEATURE_FLAG_CONTENT_TYPE]: {
              editor: true,
              sidebar: { position: 1 }
            }
          }
        }
      }));

      sdk.notifier.success('Configuration saved successfully');
    } catch (error) {
      console.error('[ConfigScreen] Error during configuration:', error);
      handleError('Failed to save configuration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ErrorBoundary 
      componentName="ConfigScreen"
      onError={handleError}
    >
      <Flex flexDirection="column" className={css({ margin: '40px', maxWidth: '800px' })}>
        <Form>
          <Heading>LaunchDarkly Configuration</Heading>
          <Paragraph>
            Configure your LaunchDarkly integration with Contentful. You'll need to provide your
            LaunchDarkly API key, select a project, and choose an environment.
          </Paragraph>

          <ApiKeySection
            apiKey={parameters.launchDarklyApiKey}
            validation={apiKeyValidation}
            isLoading={loading}
            onChange={handleApiKeyChange}
            onValidate={() => validateApiKey(parameters.launchDarklyApiKey)}
          />

          {apiKeyValidation.isValid && (
            <>
              <ProjectSelector
                projectKey={parameters.launchDarklyProjectKey}
                projects={projects}
                isLoading={loading}
                onChange={handleProjectChange}
              />

              <EnvironmentSelector
                environmentKey={parameters.launchDarklyEnvironment}
                environments={environments}
                isLoading={loading}
                onChange={handleEnvironmentChange}
              />
            </>
          )}

          {error.message && (
            <Note variant="negative" style={{ marginBottom: '16px' }}>{error.message}</Note>
          )}

          <Button
            onClick={handleSave}
            isDisabled={loading || !parameters.launchDarklyApiKey || !parameters.launchDarklyProjectKey}
            isLoading={loading}
          >
            Save Configuration
          </Button>
        </Form>
      </Flex>
    </ErrorBoundary>
  );
};

export default ConfigScreen;
