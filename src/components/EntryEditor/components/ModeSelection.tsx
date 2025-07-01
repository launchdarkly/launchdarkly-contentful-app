import React, { useState } from 'react';
import { Card, Button, Flex, Heading, Modal, Text } from '@contentful/f36-components';
import { FlagMode } from '@/types/launchdarkly';

interface ModeSelectionProps {
  flagMode: FlagMode;
  onModeChange: (mode: FlagMode) => void;
  onLoadExistingFlags: () => void;
  hasUnsavedChanges?: boolean;
  onResetForm: (mode?: FlagMode) => void;
}

export const ModeSelection: React.FC<ModeSelectionProps> = ({ 
  flagMode, 
  onModeChange, 
  onLoadExistingFlags,
  hasUnsavedChanges = false,
  onResetForm
}) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingMode, setPendingMode] = useState<FlagMode>(null);

    const handleModeChange = (newMode: FlagMode) => {
    if (hasUnsavedChanges && flagMode !== null) {
      setPendingMode(newMode);
      setShowConfirmation(true);
    } else {
      onModeChange(newMode);
      if (newMode === 'existing') {
        onLoadExistingFlags();
      } else {
        onResetForm(newMode);
      }
    }
  };

  const confirmModeChange = () => {
    onModeChange(pendingMode);
    if (pendingMode === 'existing') {
      onLoadExistingFlags();
    } else {
      onResetForm(pendingMode);
    }
    setShowConfirmation(false);
  };

  const cancelModeChange = () => {
    setPendingMode(null);
    setShowConfirmation(false);
  };

  return (
    <>
      <Card padding="default" style={{ marginBottom: '16px' }}>
        <Heading as="h3" marginBottom="spacingL" style={{ fontSize: '18px', fontWeight: 'semiBold' }}>
          Step 1: Choose your flag mode
        </Heading>
        <Flex justifyContent="center" gap="spacingL">
          <Button
            variant={flagMode === 'new' ? 'primary' : 'secondary'}
            onClick={() => handleModeChange('new')}
            size="medium"
          >
            Create New Flag
          </Button>
          <Button
            variant={flagMode === 'existing' ? 'primary' : 'secondary'}
            onClick={() => handleModeChange('existing')}
            size="medium"
          >
            Use Existing Flag
          </Button>
        </Flex>
      </Card>

      {showConfirmation && (
        <Modal
          title="Unsaved Changes"
          isShown={showConfirmation}
          onClose={cancelModeChange}
        >
          <Modal.Content>
            <Text>
              You have unsaved changes. Switching modes will discard these changes. Are you sure you want to continue?
            </Text>
          </Modal.Content>
          <Modal.Controls>
            <Button
              variant="secondary"
              onClick={cancelModeChange}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={confirmModeChange}
            >
              Switch Modes
            </Button>
          </Modal.Controls>
        </Modal>
      )}
    </>
  );
}; 