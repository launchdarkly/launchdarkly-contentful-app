import React from 'react';
import {
  FormControl,
  Select,
  Spinner,
  Text,
} from '@contentful/f36-components';
import { Project } from '../types';

interface ProjectSelectorProps {
  projectKey: string;
  projects: Project[];
  isLoading: boolean;
  onChange: (projectKey: string) => void;
}

/**
 * Component for selecting a LaunchDarkly project
 */
const ProjectSelector: React.FC<ProjectSelectorProps> = ({
  projectKey,
  projects,
  isLoading,
  onChange,
}) => {
  if (isLoading) {
    return (
      <FormControl>
        <FormControl.Label>Project</FormControl.Label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Spinner size="small" />
          <Text>Loading projects...</Text>
        </div>
      </FormControl>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <FormControl>
        <FormControl.Label>Project</FormControl.Label>
        <Text fontColor="gray600">No projects found</Text>
      </FormControl>
    );
  }

  return (
    <FormControl>
      <FormControl.Label>Project</FormControl.Label>
      <Select
        id="project-select"
        name="project"
        value={projectKey}
        onChange={(e) => onChange(e.target.value)}
        isDisabled={isLoading}
      >
        <Select.Option value="">Select a project</Select.Option>
        {projects.map((project) => (
          <Select.Option key={project.key} value={project.key}>
            {project.name} ({project.key})
          </Select.Option>
        ))}
      </Select>
    </FormControl>
  );
};

export default ProjectSelector; 