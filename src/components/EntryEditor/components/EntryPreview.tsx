import React, { useState, useEffect } from 'react';
import { Card, Stack, Heading, Text, Button, EntryCard, MenuItem, Box, Spinner } from '@contentful/f36-components';
import { useSDK } from '@contentful/react-apps-toolkit';
import { EditorAppSDK } from '@contentful/app-sdk';

interface EntryPreviewProps {
  entryId: string;
  onEdit: (entryId: string) => void;
  onRemove: () => void;
}

export const EntryPreview: React.FC<EntryPreviewProps> = ({
  entryId,
  onEdit,
  onRemove
}) => {
  const sdk = useSDK<EditorAppSDK>();
  const [entryData, setEntryData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!entryId) {
      setLoading(false);
      return;
    }

    const fetchEntryData = async () => {
      try {
        setLoading(true);
        setError(null);
        const space = sdk.ids.space;
        const environment = sdk.ids.environment;
        
        // Use Contentful's CMA to get the entry
        const entry = await sdk.cma.entry.get({ 
          entryId, 
          spaceId: space,
          environmentId: environment 
        });
        console.log('Fetched entry:', entry);
        
        // Get content type to enhance the display
        const contentType = await sdk.cma.contentType.get({
          contentTypeId: entry.sys.contentType.sys.id,
          spaceId: space,
          environmentId: environment
        });
        console.log('Fetched contentType:', contentType);

        // Find the first Asset field
        const imageField = contentType.fields.find(
          (f: any) =>
            (f.type === 'Link' && f.linkType === 'Asset') ||
            (f.type === 'Array' && f.items?.type === 'Link' && f.items?.linkType === 'Asset')
        );
        console.log('Found imageField:', imageField);
        let imageUrl = '';
        if (imageField) {
          let assetRef;
          if (imageField.type === 'Link' && imageField.linkType === 'Asset') {
            assetRef = entry.fields[imageField.id]?.[sdk.locales.default];
          } else if (
            imageField.type === 'Array' &&
            imageField.items?.type === 'Link' &&
            imageField.items?.linkType === 'Asset'
          ) {
            assetRef = entry.fields[imageField.id]?.[sdk.locales.default]?.[0];
          }
          console.log('Asset reference from entry:', assetRef);
          const assetId = assetRef?.sys?.id;
          console.log('Resolved assetId:', assetId);
          if (assetId) {
            try {
              const asset = await sdk.cma.asset.get({
                assetId,
                spaceId: space,
                environmentId: environment
              });
              console.log('Fetched asset:', asset);
              const file = asset.fields.file?.[sdk.locales.default];
              // Only use if it's an image
              if (file && file.url && file.contentType && file.contentType.startsWith('image/')) {
                imageUrl = file.url.startsWith('//') ? `https:${file.url}` : file.url;
                console.log('Resolved imageUrl:', imageUrl);
              } else {
                console.log('Asset is not an image or missing file/url/contentType:', file);
              }
            } catch (err) {
              console.log('Error fetching asset:', err);
            }
          }
        }
        
        setEntryData({
          entry,
          contentType,
          imageUrl
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load entry');
      } finally {
        setLoading(false);
      }
    };

    fetchEntryData();
  }, [entryId, sdk.cma.entry, sdk.cma.contentType, sdk.ids.space, sdk.ids.environment]);

  const getEntryStatus = () => {
    if (!entryData?.entry) return 'draft';
    
    const { entry } = entryData;
    // Check entry status
    if (entry.sys.publishedAt) {
      if (entry.sys.updatedAt > entry.sys.publishedAt) {
        return 'changed';
      }
      return 'published';
    }
    return 'draft';
  };

  const getDisplayFields = () => {
    if (!entryData?.entry || !entryData?.contentType) return { title: 'Loading...', description: '', contentType: '', imageUrl: '' };
    
    const { entry, contentType, imageUrl } = entryData;
    const displayField = contentType.displayField;
    const descriptionField = contentType.fields.find((f: { id: string }) => f.id === 'description' || f.id === 'summary');
    
    // Ensure all values are strings
    const title = entry.fields[displayField]?.[sdk.locales.default];
    const description = descriptionField ? entry.fields[descriptionField.id]?.[sdk.locales.default] : '';
    
    return {
      title: typeof title === 'string' ? title : title ? String(title) : 'Untitled',
      description: typeof description === 'string' ? description : description ? String(description) : '',
      contentType: typeof contentType.name === 'string' ? contentType.name : 'Content',
      imageUrl
    };
  };

  if (loading) {
    return (
      <Card>
        <Box padding="spacingM" textAlign="center">
          <Spinner />
          <Text fontColor="gray500" marginTop="spacingXs">Loading entry details...</Text>
        </Box>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <Stack spacing="spacingM" padding="spacingM">
          <Heading>Error loading entry</Heading>
          <Text fontColor="red500">{error}</Text>
          <Button onClick={() => onEdit(entryId)}>Open entry</Button>
        </Stack>
      </Card>
    );
  }

  const { title, description, contentType, imageUrl } = getDisplayFields();
  const status = getEntryStatus();

  return (
    <Stack spacing="spacingM" flexDirection="column" padding="spacingM" fullWidth>
      <EntryCard
        contentType={contentType || ''}
        title={title || 'Untitled'}
        description={typeof description === 'string' ? description : ''}
        status={status}
        thumbnailElement={
          imageUrl
            ? <img src={imageUrl} alt={title || 'Entry image'} style={{ maxWidth: 48, maxHeight: 48, borderRadius: 4 }} />
            : undefined
        }
        actions={[
          <MenuItem key="edit" onClick={() => onEdit(entryId)}>
            Edit
          </MenuItem>,
          <MenuItem key="remove" onClick={onRemove}>
            Remove
          </MenuItem>
        ]}
      />
    </Stack>
  );
}; 