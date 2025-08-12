// src/components/EntryEditor/types.ts

import { EditorAppSDK } from '@contentful/app-sdk';
import { FlagMode, RolloutStrategy, VariationType } from '../../types/launchdarkly';

// Enhanced FlagFormState with all the flag management capabilities
export interface FlagFormState {
  name: string;
  key: string;
  description: string;
  projectKey: string;
  variationType: VariationType;
  variations: Array<{ value: any; name: string }>;
  defaultVariation: number; // at the moment, this will always be 0
  existingFlagKey?: string;
  mode: FlagMode;
  // Keep the existing content mapping field
  contentMappings: Record<string, any>;
}

// Legacy simple FlagFormState for backward compatibility
export type SimpleFlagFormState = {
  name: string;
  key: string;
  description: string;
  variations: { name: string; value: any }[];
  contentMappings: Record<string, any>;
};

export interface EntryEditorProps {
  defaultProject?: string;
  defaultEnvironment?: string;
}

// Extended SDK for flag management capabilities
export interface ExtendedEditorAppSDK extends EditorAppSDK {
  entry: EditorAppSDK['entry'] & {
    fields: EditorAppSDK['entry']['fields'] & {
      mode: { getValue: () => FlagMode };
      rolloutStrategy: { getValue: () => RolloutStrategy };
      rolloutConfig: { getValue: () => any };
      scheduledRelease: { getValue: () => any };
      previewSettings: { getValue: () => any };
      dependencies: { getValue: () => string[] };
    };
  };
  window: {
    startAutoResizer: () => void;
    stopAutoResizer: () => void;
  };
}

export interface ContentfulEntry {
  sys: {
    id: string;
    type: string;
    linkType: string;
  };
}

// Enhanced ContentfulEntry with more metadata
export interface EnhancedContentfulEntry extends ContentfulEntry {
  metadata?: {
    entryTitle?: string;
    contentTypeName?: string;
    contentTypeId?: string;
    thumbnailUrl?: string;
  };
}

// Content type field information 
export interface ContentTypeField {
  id: string;
  name: string;
  type: string;
  required: boolean;
  localized?: boolean;
  items?: {
    type: string;
    linkType?: string;
  };
  linkType?: string;
}

// Content type definition
export interface ContentType {
  sys: {
    id: string;
    version?: number;
  };
  name: string;
  displayField: string;
  description?: string;
  fields: ContentTypeField[];
}

// Entry preview data for display
export interface EntryPreviewData {
  title: string;
  description?: string;
  status: 'draft' | 'published' | 'changed' | 'archived';
  contentType: string;
  contentTypeId: string;
  fields?: Record<string, any>;
  media?: {
    url?: string;
    width?: number;
    height?: number;
    type?: string;
  };
}

// Enhance FlagFormState with structured variation content
export interface EnhancedFlagFormState extends FlagFormState {
  // This extends the existing type without replacing it
  enhancedVariationContent?: Record<number, EnhancedContentfulEntry>;
}

// Filter options for content types
export interface ContentTypeFilter {
  search?: string;
  onlyEntryTypes?: boolean;
  excludeTypes?: string[];
  includeTypes?: string[];
}

export interface VariationContentMappingProps {
  variation: { name: string; value: any };
  variationIndex: number;
  entryLink?: EnhancedContentfulEntry;
  onSelectContent: (index: number, entry: EnhancedContentfulEntry) => void;
  onEditEntry: (entryId: string) => void;
  onRemoveContent: () => void;
}