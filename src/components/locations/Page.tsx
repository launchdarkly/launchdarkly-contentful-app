'use client';

import React, { useState } from 'react';
import { Paragraph, Button, Spinner, Card, Stack, Text, Note } from '@contentful/f36-components';
import { useCMA } from '@contentful/react-apps-toolkit';
import { useErrorState } from '../../hooks/useErrorState';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import ExperimentChatbot from '../ExperimentChatbot/ExperimentChatbot';

// Calls the Next.js API route that integrates with OpenAI
async function getAISuggestions(entries: any[]) {
  // This requires the OPENAI_API_KEY to be set in your environment
  const res = await fetch('/api/openai-suggest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ entries }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to get AI suggestions');
  }
  const data = await res.json();
  return data.suggestions;
}

const PageComponent = () => {
  const cma = useCMA();
  const { handleError } = useErrorState('Page');

  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [aiError, setAIError] = useState<string | null>(null);
  const [entries, setEntries] = useState<any[]>([]);

  const handleSuggestExperiments = async () => {
    setLoading(true);
    setAIError(null);
    setSuggestions([]);
    try {
      // Fetch a few recent entries (limit to 2 for MVP)
      // Type cast to 'any' to allow 'limit' param for MVP; refactor with correct type as needed
      const entriesResp = await cma.entry.getMany({ limit: 2 } as any);
      console.log('Page Entries Response:', entriesResp);
      const entries = entriesResp.items.slice(10, 20);
      console.log('Page Entries:', entries);
      setEntries(entries); // Save entries for chatbot
      // Call AI suggestion function (replace with real API call)
      const aiResults = await getAISuggestions(entries);
      setSuggestions(aiResults);
    } catch (err: any) {
      setAIError('Failed to fetch suggestions.');
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ErrorBoundary componentName="Page" onError={handleError}>
      <Paragraph>AI-Powered Experiment Suggestions</Paragraph>
      <Button onClick={handleSuggestExperiments} isDisabled={loading} variant="primary">
        {loading ? <Spinner size="small" /> : 'Suggest Experiments'}
      </Button>
      {aiError && <Note variant="negative">{aiError}</Note>}
      <Stack flexDirection="column" spacing="spacingM">
        {suggestions.map((s, idx) => (
          <Card key={idx} padding="default">
            <Text fontWeight="fontWeightMedium">Entry: {s.entryTitle}</Text>
            <Paragraph marginTop="spacingXs"><b>Hypothesis:</b> {s.hypothesis}</Paragraph>
            <Paragraph marginTop="spacing2Xs"><b>Metrics:</b> {s.metrics.join(', ')}</Paragraph>
          </Card>
        ))}
      </Stack>
      {entries.length > 0 && <ExperimentChatbot entries={entries} />}
    </ErrorBoundary>
  );
};

export default PageComponent;
