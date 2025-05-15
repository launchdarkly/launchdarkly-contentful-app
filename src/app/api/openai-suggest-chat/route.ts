import { NextRequest, NextResponse } from 'next/server';

function extractFieldValue(value: any) {
  if (
    value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    Object.keys(value).length === 1 &&
    Object.keys(value)[0].match(/^[a-z]{2}-[A-Z]{2}$/)
  ) {
    // Looks like a locale object, return the value for the first (likely only) locale
    return value[Object.keys(value)[0]];
  }
  return value;
}

export async function POST(req: NextRequest) {
  try {
    const { entries, messages } = await req.json();
    const apiKey = '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';
    if (!apiKey) return NextResponse.json({ error: 'No API key' }, { status: 500 });

    // Adaptive entry summary with locale extraction
    const entrySummary = entries && entries.length > 0
      ? entries.map((e: any, i: number) => {
          const contentType = e.sys?.contentType?.sys?.id || 'unknown';
          const fieldSummaries = Object.entries(e.fields || {})
            .map(([key, value]) => {
              const extracted = extractFieldValue(value);
              let displayValue = typeof extracted === 'object' ? JSON.stringify(extracted) : String(extracted);
              if (displayValue.length > 100) displayValue = displayValue.slice(0, 100) + '...';
              return `${key}: ${displayValue}`;
            })
            .join(', ');
          return `Entry ${i + 1} (type: ${contentType}): ${fieldSummaries}`;
        }).join('\n')
      : '';

    const systemPrompt = "You are an expert product manager and experimentation strategist. You help users design and analyze A/B tests for their content.";
    const openaiMessages = [
      { role: 'system', content: systemPrompt + (entrySummary ? "\n" + entrySummary : '') },
      ...(messages || [])
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: openaiMessages,
        max_tokens: 600,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ error: 'OpenAI API error', details: error }, { status: 500 });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'No response from AI.';
    return NextResponse.json({ reply });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
} 