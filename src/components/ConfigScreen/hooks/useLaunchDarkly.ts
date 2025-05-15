import { useCallback } from 'react';
import { API_TIMEOUT_MS } from '../../../utils/constants';
import { Project, Environment } from '../types';

/**
 * Custom hook for LaunchDarkly API interactions
 */
export const useLaunchDarkly = (apiKey: string | undefined, devMode = false) => {
  /**
   * Fetch all projects from LaunchDarkly
   */
  const fetchProjects = useCallback(async (): Promise<Project[] | null> => {
    if (!apiKey || devMode) {
      return null;
    }
    
    try {
      console.log('[useLaunchDarkly] Fetching projects...');
      
      // Add a timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
      
      const response = await fetch('/api/app-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey,
          action: 'getProjects',
          params: {},
        }),
        signal: controller.signal
      }).finally(() => clearTimeout(timeoutId));
  
      // Check for non-JSON responses before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('[useLaunchDarkly] Received non-JSON response:', await response.text());
        throw new Error('Received non-JSON response from server');
      }
      
      const result = await response.json();
  
      if (result.status !== 200) {
        throw new Error(result.body?.error || 'Failed to fetch projects');
      }
  
      const fetchedProjects = result.body.items || [];
      const mappedProjects: Project[] = fetchedProjects.map((project: any) => ({
        key: project.key,
        name: project.name,
        environments: [],
      }));
  
      console.log('[useLaunchDarkly] Retrieved projects:', mappedProjects.length);
      return mappedProjects;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.error('[useLaunchDarkly] Request timed out fetching projects');
        throw new Error('Request timed out. Please check your network connection.');
      }
      console.error('[useLaunchDarkly] Error fetching projects:', error);
      throw error;
    }
  }, [apiKey, devMode]);

  /**
   * Fetch environments for a specific project
   */
  const fetchEnvironments = useCallback(async (projectKey: string): Promise<Environment[] | null> => {
    if (!apiKey || devMode) {
      return null;
    }
    
    if (!projectKey || projectKey.trim() === '') {
      console.error('[useLaunchDarkly] Cannot fetch environments: projectKey is empty or invalid');
      return null;
    }
    
    try {
      console.log(`[useLaunchDarkly] Fetching environments for project: ${projectKey}`);
      
      // Add a timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
      
      const response = await fetch('/api/app-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey,
          action: 'getEnvironments',
          params: { projectKey },
        }),
        signal: controller.signal
      }).finally(() => clearTimeout(timeoutId));
      
      // Check for non-JSON responses before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('[useLaunchDarkly] Received non-JSON response:', await response.text());
        throw new Error('Received non-JSON response from server');
      }
      
      const data = await response.json();
      
      if (data.status !== 200) {
        throw new Error(data.body?.error || 'Failed to fetch environments');
      }
      
      const environmentsList = data.body?.items || [];
      console.log('[useLaunchDarkly] Number of environments found:', environmentsList.length);
      
      const mappedEnvironments: Environment[] = environmentsList.map((env: any) => ({
        key: env.key,
        name: env.name,
      }));
      
      return mappedEnvironments;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.error('[useLaunchDarkly] Request timed out fetching environments');
        throw new Error('Request timed out. Please check your network connection.');
      }
      console.error('[useLaunchDarkly] Error fetching environments:', error);
      return null;
    }
  }, [apiKey, devMode]);

  return { fetchProjects, fetchEnvironments };
}; 