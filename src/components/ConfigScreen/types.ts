/**
 * LaunchDarkly Project representation
 */
export interface Project {
  key: string;
  name: string;
  environments: Environment[];
}

/**
 * LaunchDarkly Environment representation
 */
export interface Environment {
  key: string;
  name: string;
  color?: string;
  default?: boolean;
}

/**
 * App installation parameters
 */
export interface AppInstallationParameters {
  launchDarklyApiKey?: string;
  launchDarklyProjectKey?: string;
  launchDarklyEnvironment?: string;
  launchDarklyBaseUrl?: string;
}

