import { useCallback } from 'react';
import { ConfigAppSDK } from '@contentful/app-sdk';

const LAUNCHDARKLY_FEATURE_FLAG_CONTENT_TYPE = 'launchDarklyFeatureFlag'; 

/**
 * Custom hook for managing content types in Contentful
 */
export const useContentTypeManagement = (sdk: ConfigAppSDK) => {
  /**
   * Creates the LaunchDarkly feature flag content type if it doesn't exist
   */
  const createFeatureFlagContentType = useCallback(async () => {
    let contentTypeExists = false;
    
    try {
      // Check if the content type already exists
      await sdk.cma.contentType.get({
        contentTypeId: LAUNCHDARKLY_FEATURE_FLAG_CONTENT_TYPE,
      });
      contentTypeExists = true;
      console.log('[useContentTypeManagement] Feature flag content type already exists');
    } catch (error) {
      console.log('[useContentTypeManagement] Content type does not exist, will create it');
    }

    if (!contentTypeExists) {
      try {
        // Create the feature flag content type definition
        const contentTypeData = {
          sys: {
            id: LAUNCHDARKLY_FEATURE_FLAG_CONTENT_TYPE,
          },
          name: 'LaunchDarkly Feature Flag',
          description: 'Content type for LaunchDarkly feature flags',
          displayField: 'name',
          fields: [
            {
              id: 'name',
              name: 'Name',
              type: 'Symbol',
              required: true,
              localized: false,
            },
            {
              id: 'key',
              name: 'Feature Flag Key',
              type: 'Symbol',
              required: true,
              localized: false,
            },
            {
              id: 'description',
              name: 'Description',
              type: 'Text',
              required: false,
              localized: false,
            },
            {
              id: 'variations',
              name: 'Variations',
              type: 'Object',
              required: true,
              localized: false,
            },
            {
              id: 'contentMappings',
              name: 'Content Mappings',
              type: 'Object',
              required: false,
              localized: false,
            }
          ],
        };

        // Create the content type
        const contentType = await sdk.cma.contentType.createWithId(
          { contentTypeId: LAUNCHDARKLY_FEATURE_FLAG_CONTENT_TYPE },
          contentTypeData
        );

        // Publish the content type
        await sdk.cma.contentType.publish(
          { contentTypeId: LAUNCHDARKLY_FEATURE_FLAG_CONTENT_TYPE },
          contentType
        );

        console.log('[useContentTypeManagement] Successfully created and published feature flag content type');
        return true;
      } catch (error) {
        console.error('[useContentTypeManagement] Error creating content type:', error);
        throw new Error('Failed to create feature flag content type');
      }
    }

    return true;
  }, [sdk.cma.contentType]);

  return { createFeatureFlagContentType };
}; 