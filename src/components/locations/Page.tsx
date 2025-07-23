'use client';

import React, { useState } from 'react';
import { Paragraph, Button, Card, Stack, Text, Heading, Note, List, ListItem, Badge } from '@contentful/f36-components';
import { useSDK } from '@contentful/react-apps-toolkit';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { useErrorState } from '../../hooks/useErrorState';

const PageComponent = () => {
  const sdk = useSDK();
  const { handleError } = useErrorState('Page');
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const navigateToConfig = () => {
    sdk.navigator.openAppConfig();
  };

  const navigateToEntry = () => {
    // Navigate to any entry to show the entry editor
    sdk.navigator.openEntry('new');
  };

  const copyToClipboard = async (text: string, snippetId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSnippet(snippetId);
      setTimeout(() => setCopiedSnippet(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <ErrorBoundary componentName="Page" onError={handleError}>
      <div style={{ margin: '0 auto', maxWidth: '1400px', padding: '0 24px' }}>
        <Stack flexDirection="column" spacing="spacingXl" alignItems="flex-start" style={{ width: '100%' }}>
          <div>
            <Heading as="h1" marginBottom="spacingS">
              Welcome to LaunchDarkly + Contentful
            </Heading>
            <Paragraph>
              This app helps you create LaunchDarkly feature flags and map your Contentful content to flag variations. 
              Get started with personalized content delivery and A/B testing!
            </Paragraph>
          </div>

        <Card padding="default">
          <Stack flexDirection="column" spacing="spacingM" alignItems="flex-start">
            <div>
              <Heading as="h2" marginBottom="spacingS">
                🚀 Quick Start Guide
              </Heading>
              <Text>Follow these steps to start using feature flags with your content:</Text>
            </div>

            <Note variant="primary">
              <Text fontWeight="fontWeightMedium">Security Note:</Text> This app only allows you to create new flags in LaunchDarkly, not modify existing ones. This keeps your production flags safe!
            </Note>

            <div>
              <Text fontWeight="fontWeightMedium" marginBottom="spacingXs">Step 1: Configure LaunchDarkly Connection</Text>
              <Paragraph marginBottom="spacingS">
                Set up your LaunchDarkly API key, select your project, and choose your environment.
              </Paragraph>
              <Button variant="primary" onClick={navigateToConfig}>
                Open Configuration
              </Button>
            </div>

            <div>
              <Text fontWeight="fontWeightMedium" marginBottom="spacingXs">Step 2: Choose Your Workflow</Text>
              <Paragraph marginBottom="spacingS">
                The app has two distinct workflows. Choose the one that fits your needs:
              </Paragraph>
              
              <Stack flexDirection="column" spacing="spacingS" alignItems="flex-start">
                <Card padding="default" style={{ backgroundColor: '#f7f9fc' }}>
                  <Stack flexDirection="row" alignItems="center" spacing="spacingXs">
                    <Badge variant="primary">Create New Flag</Badge>
                    <Text fontWeight="fontWeightMedium">🚀 Flag Creation Workflow</Text>
                  </Stack>
                  <List>
                    <ListItem>Create a new feature flag in LaunchDarkly</ListItem>
                    <ListItem>Define flag variations (true/false, string values, etc.)</ListItem>
                    <ListItem>Flag is created in all your LaunchDarkly environments</ListItem>
                    <ListItem>Get a direct link to manage the flag in LaunchDarkly</ListItem>
                  </List>
                </Card>

                <Card padding="default" style={{ backgroundColor: '#f7f9fc' }}>
                  <Stack flexDirection="row" alignItems="center" spacing="spacingXs">
                    <Badge variant="secondary">Map Content</Badge>
                    <Text fontWeight="fontWeightMedium">📝 Content Mapping Workflow</Text>
                  </Stack>
                  <List>
                    <ListItem>Select an existing LaunchDarkly flag</ListItem>
                    <ListItem>Choose which Contentful content type to use</ListItem>
                    <ListItem>Map specific content entries to flag variations</ListItem>
                    <ListItem>Save the mapping for use in your applications</ListItem>
                  </List>
                </Card>
              </Stack>
            </div>

            <div>
              <Text fontWeight="fontWeightMedium" marginBottom="spacingXs">Step 3: Configure Contentful Content Models</Text>
              <Paragraph marginBottom="spacingS">
                Set up your Contentful content models to work with the LaunchDarkly integration.
              </Paragraph>
              <Button variant="secondary" onClick={navigateToEntry}>
                Open Entry Editor
              </Button>
            </div>
          </Stack>
        </Card>

        <Card padding="default">
          <Stack flexDirection="column" spacing="spacingM" alignItems="flex-start">
            <Heading as="h3">💡 Use Cases & Examples</Heading>
            
            <div>
              <Text fontWeight="fontWeightMedium">A/B Testing Content</Text>
              <Paragraph>
                Create a boolean flag and map different content entries to each variation. 
                Show different headlines, images, or entire page layouts to different user segments.
              </Paragraph>
            </div>

            <div>
              <Text fontWeight="fontWeightMedium">Feature Rollouts</Text>
              <Paragraph>
                Map new content to a flag variation and gradually roll it out to users. 
                Safely test new content before showing it to everyone.
              </Paragraph>
            </div>

            <div>
              <Text fontWeight="fontWeightMedium">Personalization</Text>
              <Paragraph>
                Use multi-variate flags to show different content based on user attributes, 
                location, subscription tier, or any other targeting criteria.
              </Paragraph>
            </div>
          </Stack>
        </Card>

        <Card padding="default" style={{ width: '100%' }}>
          <Stack flexDirection="column" spacing="spacingM" alignItems="flex-start" style={{ width: '100%' }}>
            <Heading as="h3">📋 Contentful Setup Guide</Heading>
            <Text>
              After installing the app, you need to configure your Contentful content models to work with the LaunchDarkly integration:
            </Text>

            <div style={{ width: '100%' }}>
              <Text fontWeight="fontWeightMedium">1. Add Entry Editor Location to Content Models</Text>
              <Paragraph marginTop="spacingXs">
                For each content type where you want to use LaunchDarkly flags, add the Entry Editor location:
              </Paragraph>
              <List>
                <ListItem>Go to <strong>Content Model</strong> in your Contentful space</ListItem>
                <ListItem>Select the content type you want to configure</ListItem>
                <ListItem>Click <strong>Appearance</strong> in the sidebar</ListItem>
                <ListItem>Under <strong>Entry Editor</strong>, click <strong>Add app</strong></ListItem>
                <ListItem>Select the <strong>LaunchDarkly + Contentful</strong> app</ListItem>
                <ListItem>Save your changes</ListItem>
              </List>
            </div>

            <div style={{ width: '100%' }}>
              <Text fontWeight="fontWeightMedium">2. Add Required Fields to Content Models</Text>
              <Paragraph marginTop="spacingXs">
                The app requires specific fields to be present in your content models. Add these fields:
              </Paragraph>
              <div style={{ position: 'relative', display: 'inline-block' }} onMouseEnter={(e) => {
                const button = e.currentTarget.querySelector('button');
                if (button) button.style.opacity = '1';
              }}
              onMouseLeave={(e) => {
                const button = e.currentTarget.querySelector('button');
                if (button) button.style.opacity = '0';
              }}>
                <Card padding="large" style={{ backgroundColor: '#1a1a1a', color: '#e6e6e6', fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace', fontSize: '13px', borderRadius: '6px', border: '1px solid #333', whiteSpace: 'pre-wrap', width: '700px', maxWidth: '100%', overflow: 'auto' }}>
                  <div dangerouslySetInnerHTML={{
                    __html: `<code style="color: #e6e6e6; display: block; line-height: 1.5; white-space: pre-line;"><span style="color: #6a9955;">// Required fields for LaunchDarkly integration</span>
                        <span style="color: #569cd6;">const</span> <span style="color: #9cdcfe;">requiredFields</span> <span style="color: #d4d4d4;">=</span> <span style="color: #d4d4d4;">[</span>
                        &nbsp;&nbsp;<span style="color: #ce9178;">&#39;name&#39;</span><span style="color: #d4d4d4;">,</span>           <span style="color: #6a9955;">// Symbol - Flag name</span>
                        &nbsp;&nbsp;<span style="color: #ce9178;">&#39;key&#39;</span><span style="color: #d4d4d4;">,</span>            <span style="color: #6a9955;">// Symbol - Flag key</span>
                        &nbsp;&nbsp;<span style="color: #ce9178;">&#39;description&#39;</span><span style="color: #d4d4d4;">,</span>      <span style="color: #6a9955;">// Text - Flag description</span>
                        &nbsp;&nbsp;<span style="color: #ce9178;">&#39;variations&#39;</span><span style="color: #d4d4d4;">,</span>        <span style="color: #6a9955;">// Object - Flag variations</span>
                        &nbsp;&nbsp;<span style="color: #ce9178;">&#39;flagDetails&#39;</span><span style="color: #d4d4d4;">,</span>       <span style="color: #6a9955;">// Object - Content mapping</span>
                        &nbsp;&nbsp;<span style="color: #ce9178;">&#39;mode&#39;</span><span style="color: #d4d4d4;">,</span>            <span style="color: #6a9955;">// Symbol - Current mode</span>
                        &nbsp;&nbsp;<span style="color: #ce9178;">&#39;projectKey&#39;</span><span style="color: #d4d4d4;">,</span>        <span style="color: #6a9955;">// Symbol - LaunchDarkly project</span>
                        &nbsp;&nbsp;<span style="color: #ce9178;">&#39;variationType&#39;</span><span style="color: #d4d4d4;">,</span>     <span style="color: #6a9955;">// Symbol - Variation type</span>
                        &nbsp;&nbsp;<span style="color: #ce9178;">&#39;tags&#39;</span><span style="color: #d4d4d4;">,</span>            <span style="color: #6a9955;">// Array - Flag tags</span>
                        &nbsp;&nbsp;<span style="color: #ce9178;">&#39;temporary&#39;</span><span style="color: #d4d4d4;">,</span>         <span style="color: #6a9955;">// Boolean - Temporary flag</span>
                        &nbsp;&nbsp;<span style="color: #ce9178;">&#39;rolloutConfig&#39;</span><span style="color: #d4d4d4;">,</span>      <span style="color: #6a9955;">// Object - Rollout settings</span>
                        &nbsp;&nbsp;<span style="color: #ce9178;">&#39;scheduledRelease&#39;</span><span style="color: #d4d4d4;">,</span>   <span style="color: #6a9955;">// Object - Release schedule</span>
                        &nbsp;&nbsp;<span style="color: #ce9178;">&#39;previewSettings&#39;</span><span style="color: #d4d4d4;">,</span>     <span style="color: #6a9955;">// Object - Preview settings</span>
                        &nbsp;&nbsp;<span style="color: #ce9178;">&#39;dependencies&#39;</span><span style="color: #d4d4d4;">,</span>        <span style="color: #6a9955;">// Array - Flag dependencies</span>
                        &nbsp;&nbsp;<span style="color: #ce9178;">&#39;existingFlagKey&#39;</span><span style="color: #d4d4d4;">,</span>    <span style="color: #6a9955;">// Symbol - For existing flags</span>
                        &nbsp;&nbsp;<span style="color: #ce9178;">&#39;rolloutStrategy&#39;</span><span style="color: #d4d4d4;">,</span>     <span style="color: #6a9955;">// Symbol - Rollout strategy</span>
                        <span style="color: #d4d4d4;">];</span>
                      </code>
                    `
                  }} />
                </Card>
                <button
                  onClick={() => copyToClipboard(`// Required fields for LaunchDarkly integration
const requiredFields = [
  'name',           // Symbol - Flag name
  'key',            // Symbol - Flag key
  'description',    // Text - Flag description
  'variations',     // Object - Flag variations
  'flagDetails',    // Object - Content mapping
  'mode',           // Symbol - Current mode
  'projectKey',     // Symbol - LaunchDarkly project
  'variationType',  // Symbol - Variation type
  'tags',           // Array - Flag tags
  'temporary',      // Boolean - Temporary flag
  'rolloutConfig',  // Object - Rollout settings
  'scheduledRelease', // Object - Release schedule
  'previewSettings', // Object - Preview settings
  'dependencies',   // Array - Flag dependencies
  'existingFlagKey', // Symbol - For existing flags
  'rolloutStrategy' // Symbol - Rollout strategy
];`, 'contentful-fields')}
                  style={{ position: 'absolute', top: '6px', right: '6px', background: copiedSnippet === 'contentful-fields' ? '#4caf50' : '#333', border: 'none', borderRadius: '3px', color: '#fff', cursor: 'pointer', padding: '4px 6px', fontSize: '10px', opacity: '0', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {copiedSnippet === 'contentful-fields' ? '✓' : 
                    <span style={{ position: 'relative', display: 'inline-block', width: '8px', height: '8px' }}>
                      <span style={{ position: 'absolute', top: '0px', left: '0px', width: '6px', height: '6px', border: '1px solid #fff', borderRadius: '1px' }}></span>
                      <span style={{ position: 'absolute', top: '2px', left: '2px', width: '6px', height: '6px', border: '1px solid #fff', borderRadius: '1px', backgroundColor: '#333' }}></span>
                    </span>
                  }
                </button>
              </div>
            </div>

            <div style={{ width: '100%' }}>
              <Text fontWeight="fontWeightMedium">3. Optional: Add Sidebar Location</Text>
              <Paragraph marginTop="spacingXs">
                For enhanced functionality, you can also add the Sidebar location to show flag information alongside entries:
              </Paragraph>
              <List>
                <ListItem>In the same <strong>Appearance</strong> settings</ListItem>
                <ListItem>Under <strong>Sidebar</strong>, click <strong>Add app</strong></ListItem>
                <ListItem>Select the <strong>LaunchDarkly + Contentful</strong> app</ListItem>
                <ListItem>This will show flag status and details in the entry sidebar</ListItem>
              </List>
            </div>

            <div style={{ width: '100%' }}>
              <Text fontWeight="fontWeightMedium">4. Verify App Permissions</Text>
              <Paragraph marginTop="spacingXs">
                Ensure the app has the necessary permissions to function properly:
              </Paragraph>
              <List>
                <ListItem><strong>Read/Write Entries:</strong> To save flag data and content mappings</ListItem>
                <ListItem><strong>Read Content Types:</strong> To access field definitions</ListItem>
                <ListItem><strong>Create Content Types:</strong> For automatic content type creation (optional)</ListItem>
                <ListItem><strong>Read/Write Assets:</strong> For media content mapping</ListItem>
              </List>
            </div>

            <Note variant="primary">
              <Text fontWeight="fontWeightMedium">Pro Tip:</Text>
              <Paragraph marginTop="spacingXs">
                You can create a dedicated content type specifically for LaunchDarkly flags, or add these fields to existing content types where you want to use feature flags.
              </Paragraph>
            </Note>
          </Stack>
        </Card>

        <Card padding="default" style={{ width: '100%' }}>
          <Stack flexDirection="column" spacing="spacingM" alignItems="flex-start" style={{ width: '100%' }}>
            <Heading as="h3">🔧 Implementation Guide</Heading>
            <Text>
              Once you've created flags and mapped content, here's how to implement this integration in your application:
            </Text>

            <div style={{ width: '100%' }}>
              <Text fontWeight="fontWeightMedium">1. Install LaunchDarkly SDK</Text>
              <Paragraph marginTop="spacingXs">
                First, install the LaunchDarkly SDK for your platform:
              </Paragraph>
              <div style={{ position: 'relative', display: 'inline-block' }} onMouseEnter={(e) => {
                const button = e.currentTarget.querySelector('button');
                if (button) button.style.opacity = '1';
              }}
              onMouseLeave={(e) => {
                const button = e.currentTarget.querySelector('button');
                if (button) button.style.opacity = '0';
              }}>
                <Card padding="large" style={{ backgroundColor: '#1a1a1a', color: '#e6e6e6', fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace', fontSize: '13px', borderRadius: '6px', border: '1px solid #333', width: 'fit-content', minWidth: '300px', maxWidth: '100%', overflow: 'auto' }}>
                  <div dangerouslySetInnerHTML={{
                    __html: `
                      <code style="color: #e6e6e6; display: block; line-height: 1.5;">
                        <span style="color: #569cd6;">npm</span> 
                        <span style="color: #9cdcfe;">install</span> 
                        <span style="color: #ce9178;">launchdarkly-js-client-sdk</span>
                      </code>
                    `
                  }} />
                </Card>
                <button
                  onClick={() => copyToClipboard('npm install launchdarkly-js-client-sdk', 'npm-install')}
                  style={{ position: 'absolute', top: '6px', right: '6px', background: copiedSnippet === 'npm-install' ? '#4caf50' : '#333', border: 'none', borderRadius: '3px', color: '#fff', cursor: 'pointer', padding: '4px 6px', fontSize: '10px', opacity: '0', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {copiedSnippet === 'npm-install' ? '✓' : 
                    <span style={{ position: 'relative', display: 'inline-block', width: '8px', height: '8px' }}>
                      <span style={{ position: 'absolute', top: '0px', left: '0px', width: '6px', height: '6px', border: '1px solid #fff', borderRadius: '1px' }}></span>
                      <span style={{ position: 'absolute', top: '2px', left: '2px', width: '6px', height: '6px', border: '1px solid #fff', borderRadius: '1px', backgroundColor: '#333' }}></span>
                    </span>
                  }
                </button>
              </div>
            </div>

            <div style={{ width: '100%' }}>
              <Text fontWeight="fontWeightMedium">2. Initialize LaunchDarkly Client</Text>
              <Paragraph marginTop="spacingXs">
                Set up the LaunchDarkly client in your application:
              </Paragraph>
              <div style={{ position: 'relative', display: 'inline-block' }} onMouseEnter={(e) => {
                const button = e.currentTarget.querySelector('button');
                if (button) button.style.opacity = '1';
              }}
              onMouseLeave={(e) => {
                const button = e.currentTarget.querySelector('button');
                if (button) button.style.opacity = '0';
              }}>
                <Card padding="large" style={{ backgroundColor: '#1a1a1a', color: '#e6e6e6', fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace', fontSize: '13px', borderRadius: '6px', border: '1px solid #333', whiteSpace: 'pre-wrap', width: '700px', maxWidth: '100%', overflow: 'auto' }}>
                  <div dangerouslySetInnerHTML={{
                    __html: `<code style="color: #e6e6e6; display: block; line-height: 1.5; white-space: pre-line;"><span style="color: #c586c0;">import</span> <span style="color: #569cd6;">*</span> <span style="color: #c586c0;">as</span> <span style="color: #4ec9b0;">LD</span> <span style="color: #c586c0;">from</span> <span style="color: #ce9178;">'launchdarkly-js-client-sdk'</span>;

                        <span style="color: #569cd6;">const</span> <span style="color: #9cdcfe;">client</span> <span style="color: #d4d4d4;">=</span> <span style="color: #4ec9b0;">LD</span><span style="color: #d4d4d4;">.</span><span style="color: #dcdcaa;">initialize</span><span style="color: #d4d4d4;">(</span><span style="color: #ce9178;">'YOUR_CLIENT_SIDE_ID'</span><span style="color: #d4d4d4;">, {</span>
                        &nbsp;&nbsp;<span style="color: #9cdcfe;">key</span><span style="color: #d4d4d4;">:</span> <span style="color: #ce9178;">'user-key'</span><span style="color: #d4d4d4;">,</span>
                        &nbsp;&nbsp;<span style="color: #9cdcfe;">email</span><span style="color: #d4d4d4;">:</span> <span style="color: #ce9178;">'user@example.com'</span>
                        <span style="color: #d4d4d4;">});</span>
                      </code>
                    `
                  }} />
                </Card>
                <button
                  onClick={() => copyToClipboard(`import * as LD from 'launchdarkly-js-client-sdk';

                  const client = LD.initialize('YOUR_CLIENT_SIDE_ID', {
                    key: 'user-key',
                    email: 'user@example.com'
                  });`, 'ld-init')}

                  style={{ position: 'absolute', top: '6px', right: '6px', background: copiedSnippet === 'ld-init' ? '#4caf50' : '#333', border: 'none', borderRadius: '3px', color: '#fff', cursor: 'pointer', padding: '4px 6px', fontSize: '10px', opacity: '0', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {copiedSnippet === 'ld-init' ? '✓' : 
                    <span style={{ position: 'relative', display: 'inline-block', width: '8px', height: '8px' }}>
                      <span style={{ position: 'absolute', top: '0px', left: '0px', width: '6px', height: '6px', border: '1px solid #fff', borderRadius: '1px' }}></span>
                      <span style={{ position: 'absolute', top: '2px', left: '2px', width: '6px', height: '6px', border: '1px solid #fff', borderRadius: '1px', backgroundColor: '#333' }}></span>
                    </span>
                  }
                </button>
              </div>
            </div>

            <div style={{ width: '100%' }}>
              <Text fontWeight="fontWeightMedium">3. Fetch Content Based on Flag Variations</Text>
              <Paragraph marginTop="spacingXs">
                Use the flag value to determine which content to show:
              </Paragraph>
              <div style={{ position: 'relative', display: 'inline-block' }} onMouseEnter={(e) => {
                const button = e.currentTarget.querySelector('button');
                if (button) button.style.opacity = '1';
              }}
              onMouseLeave={(e) => {
                const button = e.currentTarget.querySelector('button');
                if (button) button.style.opacity = '0';
              }}>
                <Card padding="large" style={{ backgroundColor: '#1a1a1a', color: '#e6e6e6', fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace', fontSize: '13px', borderRadius: '6px', border: '1px solid #333', whiteSpace: 'pre-wrap', width: '700px', maxWidth: '100%', overflow: 'auto' }}>
                  <div dangerouslySetInnerHTML={{
                    __html: `<code style="color: #e6e6e6; display: block; line-height: 1.5; white-space: pre-line;"><span style="color: #6a9955;">// Get flag variation</span>
                        <span style="color: #569cd6;">const</span> <span style="color: #9cdcfe;">flagValue</span> <span style="color: #d4d4d4;">=</span> <span style="color: #9cdcfe;">client</span><span style="color: #d4d4d4;">.</span><span style="color: #dcdcaa;">variation</span><span style="color: #d4d4d4;">(</span><span style="color: #ce9178;">'your-flag-key'</span><span style="color: #d4d4d4;">,</span> <span style="color: #569cd6;">false</span><span style="color: #d4d4d4;">);</span>
                        
                        <span style="color: #6a9955;">// Fetch mapped content from Contentful</span>
                        <span style="color: #569cd6;">const</span> <span style="color: #dcdcaa;">getContentForVariation</span> <span style="color: #d4d4d4;">=</span> <span style="color: #569cd6;">async</span> <span style="color: #d4d4d4;">(</span><span style="color: #9cdcfe;">variation</span><span style="color: #d4d4d4;">) => {</span>
                        &nbsp;&nbsp;<span style="color: #569cd6;">const</span> <span style="color: #9cdcfe;">contentId</span> <span style="color: #d4d4d4;">=</span> <span style="color: #dcdcaa;">getContentIdForVariation</span><span style="color: #d4d4d4;">(</span><span style="color: #9cdcfe;">variation</span><span style="color: #d4d4d4;">);</span>
                        &nbsp;&nbsp;<span style="color: #569cd6;">const</span> <span style="color: #9cdcfe;">entry</span> <span style="color: #d4d4d4;">=</span> <span style="color: #569cd6;">await</span> <span style="color: #9cdcfe;">contentfulClient</span><span style="color: #d4d4d4;">.</span><span style="color: #dcdcaa;">getEntry</span><span style="color: #d4d4d4;">(</span><span style="color: #9cdcfe;">contentId</span><span style="color: #d4d4d4;">);</span>
                        &nbsp;&nbsp;<span style="color: #c586c0;">return</span> <span style="color: #9cdcfe;">entry</span><span style="color: #d4d4d4;">;</span>
                        <span style="color: #d4d4d4;">};</span>
                        
                        <span style="color: #6a9955;">// Use the content</span>
                        <span style="color: #569cd6;">const</span> <span style="color: #9cdcfe;">content</span> <span style="color: #d4d4d4;">=</span> <span style="color: #569cd6;">await</span> <span style="color: #dcdcaa;">getContentForVariation</span><span style="color: #d4d4d4;">(</span><span style="color: #9cdcfe;">flagValue</span><span style="color: #d4d4d4;">);</span>
                      </code>
                    `
                  }} />
                </Card>
                <button
                  onClick={() => copyToClipboard(`// Get flag variation
                  const flagValue = client.variation('your-flag-key', false);

                  // Fetch mapped content from Contentful
                  const getContentForVariation = async (variation) => {
                    const contentId = getContentIdForVariation(variation);
                    const entry = await contentfulClient.getEntry(contentId);
                    return entry;
                  };

                  // Use the content
                  const content = await getContentForVariation(flagValue);`, 'fetch-content')}
                  style={{ position: 'absolute', top: '6px', right: '6px', background: copiedSnippet === 'fetch-content' ? '#4caf50' : '#333', border: 'none', borderRadius: '3px', color: '#fff', cursor: 'pointer', padding: '4px 6px', fontSize: '10px', opacity: '0', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {copiedSnippet === 'fetch-content' ? '✓' : 
                    <span style={{ position: 'relative', display: 'inline-block', width: '8px', height: '8px' }}>
                      <span style={{ position: 'absolute', top: '0px', left: '0px', width: '6px', height: '6px', border: '1px solid #fff', borderRadius: '1px' }}></span>
                      <span style={{ position: 'absolute', top: '2px', left: '2px', width: '6px', height: '6px', border: '1px solid #fff', borderRadius: '1px', backgroundColor: '#333' }}></span>
                    </span>
                  }
                </button>
              </div>
            </div>

            <div style={{ width: '100%' }}>
              <Text fontWeight="fontWeightMedium">4. Implement Content Mapping Logic</Text>
              <Paragraph marginTop="spacingXs">
                Create a mapping function based on your flag configuration:
              </Paragraph>
              <div style={{ position: 'relative', display: 'inline-block' }} onMouseEnter={(e) => {
                const button = e.currentTarget.querySelector('button');
                if (button) button.style.opacity = '1';
              }}
              onMouseLeave={(e) => {
                const button = e.currentTarget.querySelector('button');
                if (button) button.style.opacity = '0';
              }}>
                <Card padding="large" style={{ backgroundColor: '#1a1a1a', color: '#e6e6e6', fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace', fontSize: '13px', borderRadius: '6px', border: '1px solid #333', whiteSpace: 'pre-wrap', width: '700px', maxWidth: '100%', overflow: 'auto' }}>
                  <div dangerouslySetInnerHTML={{
                    __html: `
                      <code style="color: #e6e6e6; display: block; line-height: 1.5; white-space: pre-line;"><span style="color: #569cd6;">const</span> <span style="color: #9cdcfe;">contentMappings</span> <span style="color: #d4d4d4;">=</span> <span style="color: #d4d4d4;">{</span>
                        &nbsp;&nbsp;<span style="color: #ce9178;">'homepage-hero'</span><span style="color: #d4d4d4;">:</span> <span style="color: #d4d4d4;">{</span>
                        &nbsp;&nbsp;&nbsp;&nbsp;<span style="color: #569cd6;">true</span><span style="color: #d4d4d4;">:</span> <span style="color: #ce9178;">'contentful-entry-id-1'</span><span style="color: #d4d4d4;">,</span>&nbsp;&nbsp;&nbsp;<span style="color: #6a9955;">// Variation A</span>
                        &nbsp;&nbsp;&nbsp;&nbsp;<span style="color: #569cd6;">false</span><span style="color: #d4d4d4;">:</span> <span style="color: #ce9178;">'contentful-entry-id-2'</span>&nbsp;&nbsp;&nbsp;<span style="color: #6a9955;">// Variation B</span>
                        &nbsp;&nbsp;<span style="color: #d4d4d4;">}</span>
                        <span style="color: #d4d4d4;">};</span>
                        
                        <span style="color: #569cd6;">function</span> <span style="color: #dcdcaa;">getContentIdForVariation</span><span style="color: #d4d4d4;">(</span><span style="color: #9cdcfe;">flagKey</span><span style="color: #d4d4d4;">,</span> <span style="color: #9cdcfe;">variation</span><span style="color: #d4d4d4;">) {</span>
                        &nbsp;&nbsp;<span style="color: #c586c0;">return</span> <span style="color: #9cdcfe;">contentMappings</span><span style="color: #d4d4d4;">[</span><span style="color: #9cdcfe;">flagKey</span><span style="color: #d4d4d4;">]</span><span style="color: #d4d4d4;">?.</span><span style="color: #d4d4d4;">[</span><span style="color: #9cdcfe;">variation</span><span style="color: #d4d4d4;">];</span>
                        <span style="color: #d4d4d4;">}</span>
                      </code>
                    `
                  }} />
                </Card>
                <button
                  onClick={() => copyToClipboard(`const contentMappings = {
                    'homepage-hero': {
                      true: 'contentful-entry-id-1',   // Variation A
                      false: 'contentful-entry-id-2'   // Variation B
                    }
                  };

                  function getContentIdForVariation(flagKey, variation) {
                    return contentMappings[flagKey]?.[variation];
                  }`, 'content-mapping')}
                  style={{ position: 'absolute', top: '6px', right: '6px', background: copiedSnippet === 'content-mapping' ? '#4caf50' : '#333', border: 'none', borderRadius: '3px', color: '#fff', cursor: 'pointer', padding: '4px 6px', fontSize: '10px', opacity: '0', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {copiedSnippet === 'content-mapping' ? '✓' : 
                    <span style={{ position: 'relative', display: 'inline-block', width: '8px', height: '8px' }}>
                      <span style={{ position: 'absolute', top: '0px', left: '0px', width: '6px', height: '6px', border: '1px solid #fff', borderRadius: '1px' }}></span>
                      <span style={{ position: 'absolute', top: '2px', left: '2px', width: '6px', height: '6px', border: '1px solid #fff', borderRadius: '1px', backgroundColor: '#333' }}></span>
                    </span>
                  }
                </button>
              </div>
            </div>

            <div style={{ width: '100%' }}>
              <Text fontWeight="fontWeightMedium">5. React Example</Text>
              <Paragraph marginTop="spacingXs">
                Here's a complete React component example:
              </Paragraph>
              <div style={{ position: 'relative', display: 'inline-block' }} onMouseEnter={(e) => {
                const button = e.currentTarget.querySelector('button');
                if (button) button.style.opacity = '1';
              }}
              onMouseLeave={(e) => {
                const button = e.currentTarget.querySelector('button');
                if (button) button.style.opacity = '0';
              }}>
                <Card padding="large" style={{ backgroundColor: '#1a1a1a', color: '#e6e6e6', fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace', fontSize: '13px', borderRadius: '6px', border: '1px solid #333', whiteSpace: 'pre-wrap', width: '700px', maxWidth: '100%', overflow: 'auto' }}>
                  <div dangerouslySetInnerHTML={{
                    __html: `
                      <code style="color: #e6e6e6; display: block; line-height: 1.5; white-space: pre-line;"><span style="color: #c586c0;">import</span> <span style="color: #d4d4d4;">{</span> <span style="color: #9cdcfe;">useState</span><span style="color: #d4d4d4;">,</span> <span style="color: #9cdcfe;">useEffect</span> <span style="color: #d4d4d4;">}</span> <span style="color: #c586c0;">from</span> <span style="color: #ce9178;">'react'</span><span style="color: #d4d4d4;">;</span>
                        <span style="color: #c586c0;">import</span> <span style="color: #569cd6;">*</span> <span style="color: #c586c0;">as</span> <span style="color: #4ec9b0;">LD</span> <span style="color: #c586c0;">from</span> <span style="color: #ce9178;">'launchdarkly-js-client-sdk'</span><span style="color: #d4d4d4;">;</span>
                        
                        <span style="color: #569cd6;">function</span> <span style="color: #dcdcaa;">DynamicContent</span><span style="color: #d4d4d4;">({</span> <span style="color: #9cdcfe;">flagKey</span> <span style="color: #d4d4d4;">}) {</span>
                        &nbsp;&nbsp;<span style="color: #569cd6;">const</span> <span style="color: #d4d4d4;">[</span><span style="color: #9cdcfe;">content</span><span style="color: #d4d4d4;">,</span> <span style="color: #9cdcfe;">setContent</span><span style="color: #d4d4d4;">]</span> <span style="color: #d4d4d4;">=</span> <span style="color: #dcdcaa;">useState</span><span style="color: #d4d4d4;">(</span><span style="color: #569cd6;">null</span><span style="color: #d4d4d4;">);</span>
                        
                        &nbsp;&nbsp;<span style="color: #dcdcaa;">useEffect</span><span style="color: #d4d4d4;">(() => {</span>
                        &nbsp;&nbsp;&nbsp;&nbsp;<span style="color: #569cd6;">const</span> <span style="color: #dcdcaa;">loadContent</span> <span style="color: #d4d4d4;">=</span> <span style="color: #569cd6;">async</span> <span style="color: #d4d4d4;">() => {</span>
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color: #6a9955;">// Get flag variation</span>
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color: #569cd6;">const</span> <span style="color: #9cdcfe;">variation</span> <span style="color: #d4d4d4;">=</span> <span style="color: #9cdcfe;">client</span><span style="color: #d4d4d4;">.</span><span style="color: #dcdcaa;">variation</span><span style="color: #d4d4d4;">(</span><span style="color: #9cdcfe;">flagKey</span><span style="color: #d4d4d4;">,</span> <span style="color: #ce9178;">'default'</span><span style="color: #d4d4d4;">);</span>
                        
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color: #6a9955;">// Fetch corresponding content</span>
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color: #569cd6;">const</span> <span style="color: #9cdcfe;">contentId</span> <span style="color: #d4d4d4;">=</span> <span style="color: #dcdcaa;">getContentIdForVariation</span><span style="color: #d4d4d4;">(</span><span style="color: #9cdcfe;">flagKey</span><span style="color: #d4d4d4;">,</span> <span style="color: #9cdcfe;">variation</span><span style="color: #d4d4d4;">);</span>
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color: #569cd6;">const</span> <span style="color: #9cdcfe;">entry</span> <span style="color: #d4d4d4;">=</span> <span style="color: #569cd6;">await</span> <span style="color: #9cdcfe;">contentfulClient</span><span style="color: #d4d4d4;">.</span><span style="color: #dcdcaa;">getEntry</span><span style="color: #d4d4d4;">(</span><span style="color: #9cdcfe;">contentId</span><span style="color: #d4d4d4;">);</span>
                        
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color: #dcdcaa;">setContent</span><span style="color: #d4d4d4;">(</span><span style="color: #9cdcfe;">entry</span><span style="color: #d4d4d4;">.</span><span style="color: #9cdcfe;">fields</span><span style="color: #d4d4d4;">);</span>
                        &nbsp;&nbsp;&nbsp;&nbsp;<span style="color: #d4d4d4;">};</span>
                        
                        &nbsp;&nbsp;&nbsp;&nbsp;<span style="color: #dcdcaa;">loadContent</span><span style="color: #d4d4d4;">();</span>
                        &nbsp;&nbsp;<span style="color: #d4d4d4;">},</span> <span style="color: #d4d4d4;">[</span><span style="color: #9cdcfe;">flagKey</span><span style="color: #d4d4d4;">]);</span>
                        
                        &nbsp;&nbsp;<span style="color: #c586c0;">if</span> <span style="color: #d4d4d4;">(!</span><span style="color: #9cdcfe;">content</span><span style="color: #d4d4d4;">)</span> <span style="color: #c586c0;">return</span> <span style="color: #d4d4d4;">&lt;</span><span style="color: #4ec9b0;">div</span><span style="color: #d4d4d4;">&gt;</span>Loading...<span style="color: #d4d4d4;">&lt;/</span><span style="color: #4ec9b0;">div</span><span style="color: #d4d4d4;">&gt;;</span>
                        
                        &nbsp;&nbsp;<span style="color: #c586c0;">return</span> <span style="color: #d4d4d4;">(</span>
                        &nbsp;&nbsp;&nbsp;&nbsp;<span style="color: #d4d4d4;">&lt;</span><span style="color: #4ec9b0;">div</span><span style="color: #d4d4d4;">&gt;</span>
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color: #d4d4d4;">&lt;</span><span style="color: #4ec9b0;">h1</span><span style="color: #d4d4d4;">&gt;{</span><span style="color: #9cdcfe;">content</span><span style="color: #d4d4d4;">.</span><span style="color: #9cdcfe;">title</span><span style="color: #d4d4d4;">}&lt;/</span><span style="color: #4ec9b0;">h1</span><span style="color: #d4d4d4;">&gt;</span>
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color: #d4d4d4;">&lt;</span><span style="color: #4ec9b0;">p</span><span style="color: #d4d4d4;">&gt;{</span><span style="color: #9cdcfe;">content</span><span style="color: #d4d4d4;">.</span><span style="color: #9cdcfe;">description</span><span style="color: #d4d4d4;">}&lt;/</span><span style="color: #4ec9b0;">p</span><span style="color: #d4d4d4;">&gt;</span>
                        &nbsp;&nbsp;&nbsp;&nbsp;<span style="color: #d4d4d4;">&lt;/</span><span style="color: #4ec9b0;">div</span><span style="color: #d4d4d4;">&gt;</span>
                        &nbsp;&nbsp;<span style="color: #d4d4d4;">);</span>
                        <span style="color: #d4d4d4;">}</span>
                      </code>
                    `
                  }} />
                </Card>
                <button
                  onClick={() => copyToClipboard(`import { useState, useEffect } from 'react';
                  import * as LD from 'launchdarkly-js-client-sdk';

                  function DynamicContent({ flagKey }) {
                    const [content, setContent] = useState(null);

                    useEffect(() => {
                      const loadContent = async () => {
                        // Get flag variation
                        const variation = client.variation(flagKey, 'default');

                        // Fetch corresponding content
                        const contentId = getContentIdForVariation(flagKey, variation);
                        const entry = await contentfulClient.getEntry(contentId);

                        setContent(entry.fields);
                      };

                      loadContent();
                    }, [flagKey]);

                    if (!content) return <div>Loading...</div>;

                    return (
                      <div>
                        <h1>{content.title}</h1>
                        <p>{content.description}</p>
                      </div>
                    );
                  }`, 'react-example')}

                  style={{ position: 'absolute', top: '6px', right: '6px', background: copiedSnippet === 'react-example' ? '#4caf50' : '#333', border: 'none', borderRadius: '3px', color: '#fff', cursor: 'pointer', padding: '4px 6px', fontSize: '10px', opacity: '0', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {copiedSnippet === 'react-example' ? '✓' : 
                    <span style={{ position: 'relative', display: 'inline-block', width: '8px', height: '8px' }}>
                      <span style={{ position: 'absolute', top: '0px', left: '0px', width: '6px', height: '6px', border: '1px solid #fff', borderRadius: '1px' }}></span>
                      <span style={{ position: 'absolute', top: '2px', left: '2px', width: '6px', height: '6px', border: '1px solid #fff', borderRadius: '1px', backgroundColor: '#333' }}></span>
                    </span>
                  }
                </button>
              </div>
            </div>

            <Note variant="primary">
              <Text fontWeight="fontWeightMedium">Pro Tip:</Text>
              <Paragraph marginTop="spacingXs" style={{ marginTop: '0px' }}>
                Use LaunchDarkly's real-time updates to change content without redeploying your app. 
                The SDK will automatically receive flag changes and you can update content accordingly.
              </Paragraph>
            </Note>
          </Stack>
        </Card>

        <Note variant="neutral">
          <Text fontWeight="fontWeightMedium">Need Help?</Text>
          <Paragraph marginTop="spacingXs">
            Visit the configuration screen to set up your LaunchDarkly connection, or open any entry to start creating flags and mapping content.
          </Paragraph>
        </Note>
      </Stack>
      </div>
    </ErrorBoundary>
  );
};

export default PageComponent;
