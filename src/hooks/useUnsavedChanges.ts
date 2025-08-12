import { useState, useEffect, useRef } from 'react';
import { FlagFormState } from '@/components/EntryEditor/types';

export function useUnsavedChanges(formState: FlagFormState) {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedState, setLastSavedState] = useState<FlagFormState | null>(null);
  const isInitialLoad = useRef(true);

  // Reset tracking state when form state is empty (like after mode changes)
  useEffect(() => {
    if (isEmptyFormState(formState)) {
      setLastSavedState(formState);
      setHasUnsavedChanges(false);
      isInitialLoad.current = false;
    }
  }, [formState]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  useEffect(() => {
    // Always capture the initial state without marking changes
    if (isInitialLoad.current || !lastSavedState) {
      setLastSavedState(formState);
      setHasUnsavedChanges(false);
      isInitialLoad.current = false;
      return;
    }

    // Helper function to compare variations accounting for default values
    const hasVariationsChanged = (oldVars: any[], newVars: any[]): boolean => {
      if (!oldVars || !newVars) return false;
      
      // For boolean type, check if both are in default state (True/False)
      const isBooleanDefault = (vars: any[]) =>
        vars.length === 2 &&
        vars[0]?.name === 'True' &&
        vars[0]?.value === true &&
        vars[1]?.name === 'False' &&
        vars[1]?.value === false;

      // If both are in boolean default state, consider them unchanged
      if (isBooleanDefault(oldVars) && isBooleanDefault(newVars)) {
        return false;
      }
      
      return JSON.stringify(oldVars) !== JSON.stringify(newVars);
    };

    // Helper function to compare values accounting for empty/default states
    const hasValueChanged = (oldVal: any, newVal: any, fieldName: string): boolean => {
      if (oldVal === newVal) return false;
      
      // Special handling for different field types
      switch (fieldName) {
        case 'name':
        case 'key':
        case 'description':
          // Empty strings are considered the same as null/undefined
          return (oldVal || '') !== (newVal || '');
        case 'variations':
          return hasVariationsChanged(oldVal, newVal);
        case 'tags':
          return JSON.stringify(oldVal || []) !== JSON.stringify(newVal || []);
        default:
          return oldVal !== newVal;
      }
    };

    // Check if any significant field has changed
    const significantFields: (keyof FlagFormState)[] = [
      'name', 'key', 'description', 'variations', 'variationType'
    ];

    const hasChanges = significantFields.some(field =>
      hasValueChanged(lastSavedState[field], formState[field], field)
    );

    setHasUnsavedChanges(hasChanges);
  }, [formState, lastSavedState]);

  const resetLastSavedState = (newState: FlagFormState) => {
    setLastSavedState(newState);
    setHasUnsavedChanges(false);
  };

  const markAsSaved = () => {
    setLastSavedState(formState);
    setHasUnsavedChanges(false);
  };

  return { 
    hasUnsavedChanges, 
    resetLastSavedState, 
    markAsSaved 
  };
}

const isEmptyFormState = (state: FlagFormState): boolean => {
  return (
    !state.name &&
    !state.key &&
    !state.description &&
    (!state.variations || state.variations.length === 0)
  );
}; 