import { EnhancedFlagFormState } from '../components/EntryEditor/types';

/**
 * Converts enhanced variation content back to simple entry IDs for Contentful storage.
 * 
 * This function bridges the gap between the UI's need for rich metadata and Contentful's
 * simple storage format. It extracts just the entry IDs from the enhanced content mappings
 * so they can be saved back to Contentful's contentMappings field.
 * 
 * @param enhancedState - The enhanced form state containing rich entry metadata
 * @returns Simple mapping of variation index to entry ID for Contentful storage
 */
export const extractSimpleContentMapping = (enhancedState: EnhancedFlagFormState): Record<string, string> => {
  const result: Record<string, string> = {};
  
  if (enhancedState.enhancedVariationContent) {
    Object.entries(enhancedState.enhancedVariationContent).forEach(([index, entry]) => {
      result[index] = entry.sys.id;
    });
  }
  
  return result;
};