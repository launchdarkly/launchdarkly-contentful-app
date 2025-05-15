import React, { useState, useRef, useEffect } from 'react';
import { Box, Card, Stack, TextInput, Button, Spinner, Paragraph, Text, Note } from '@contentful/f36-components';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ExperimentChatbotProps {
  entries: any[];
}

const MAX_HISTORY = 10;

const ExperimentChatbot: React.FC<ExperimentChatbotProps> = ({ entries }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom on new message
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: 'user' as const, content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/openai-suggest-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entries,
          messages: newMessages.slice(-MAX_HISTORY),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.error || 'Failed to get response');
        setMessages([...newMessages, { role: 'assistant' as const, content: 'Sorry, something went wrong.' }]);
      } else {
        const data = await res.json();
        setMessages([...newMessages, { role: 'assistant' as const, content: data.reply }]);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to get response');
      setMessages([...newMessages, { role: 'assistant' as const, content: 'Sorry, something went wrong.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !loading) {
      sendMessage();
    }
  };

  return (
    <Card padding="default" marginTop="spacingL">
      <Stack flexDirection="column" spacing="spacingM">
        <Text fontWeight="fontWeightMedium">Chat with Experiment Assistant</Text>
        <Box style={{ maxHeight: 300, overflowY: 'auto', background: '#fafafa', padding: 12, borderRadius: 4 }}>
          {messages.length === 0 && (
            <Text fontColor="gray600">Ask a question about your experiments, e.g. "How would you measure the impact of the homepage banner test?"</Text>
          )}
          {messages.map((msg, idx) => (
            <Box key={idx} marginBottom="spacingXs" style={{ textAlign: msg.role === 'user' ? 'right' : 'left' }}>
              <Text as="span" fontWeight={msg.role === 'user' ? 'fontWeightMedium' : 'fontWeightNormal'} fontColor={msg.role === 'user' ? 'blue600' : 'gray900'}>
                {msg.role === 'user' ? 'You: ' : 'Assistant: '}
              </Text>
              <Text as="span">{msg.content}</Text>
            </Box>
          ))}
          <div ref={chatEndRef} />
        </Box>
        {error && <Note variant="negative">{error}</Note>}
        <Stack flexDirection="row" spacing="spacingS" alignItems="center">
          <TextInput
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleInputKeyDown}
            isDisabled={loading}
            placeholder="Type your question..."
            style={{ flexGrow: 1 }}
          />
          <Button onClick={sendMessage} isDisabled={loading || !input.trim()} variant="primary">
            {loading ? <Spinner size="small" /> : 'Send'}
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
};

export default ExperimentChatbot; 