import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { entries } = await req.json();
    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      return NextResponse.json({ error: 'No entries provided.' }, { status: 400 });
    }

    const apiKey = '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';
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API key not configured.' }, { status: 500 });
    }

    // Build a prompt summarizing the entries
    const entrySummaries = entries.map((e: any, i: number) => {
      const title = e.fields?.title ? JSON.stringify(e.fields.title) : 'Untitled';
      const desc = e.fields?.description ? JSON.stringify(e.fields.description) : '';
      return `${i + 1}. Title: ${title}${desc ? ", Description: " + desc : ''}`;
    }).join('\n');

    const prompt = `Given the following content entries from our CMS:\n${entrySummaries}\n\nFor each entry, suggest an A/B or multivariate test we could run, with a clear hypothesis and 2-3 recommended metrics for each. Respond as a JSON array of objects with keys: entryTitle, hypothesis, metrics.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are an expert product manager and experimentation strategist.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 600,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ error: 'OpenAI API error', details: error }, { status: 500 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    console.log('OpenAI raw content:', content); 
    let suggestions = [];
    try {
      suggestions = JSON.parse(content);
    } catch (e) {
      // fallback: return raw content
      return NextResponse.json({ error: 'Failed to parse AI response', raw: content }, { status: 500 });
    }

    return NextResponse.json({ suggestions });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
} 