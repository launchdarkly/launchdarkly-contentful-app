import { EnhancedFlagFormState } from '../components/EntryEditor/types';

/**
 * Extracts the simple content IDs from an enhanced form state for backward compatibility
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