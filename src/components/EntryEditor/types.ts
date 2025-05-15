// src/components/EntryEditor/types.ts

export type FlagFormState = {
  name: string;
  key: string;
  description: string;
  variations: { name: string; value: any }[];
  flagDetails: Record<string, any>;
};

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