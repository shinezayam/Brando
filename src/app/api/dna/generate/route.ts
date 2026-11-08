import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are a brand strategy expert. Generate compelling brand DNA based on the brief provided.

Return a JSON object with these fields:
{
  "essence": "One powerful sentence capturing the brand's core identity",
  "positioning": "For [target], [brand] is the [frame of reference] that [point of difference] because [reason to believe]",
  "story": "A 2-3 sentence brand origin story that connects emotionally",
  "mission": "What the brand does every day (action-oriented, present tense)",
  "vision": "The future the brand is working toward (aspirational)",
  "values": ["value1", "value2", "value3", "value4", "value5"],
  "voiceTraits": ["trait1", "trait2", "trait3", "trait4"],
  "differentiators": ["differentiator1", "differentiator2", "differentiator3"],
  "messagingPillars": ["pillar1", "pillar2", "pillar3", "pillar4"],
  "taglineOptions": ["tagline1", "tagline2", "tagline3", "tagline4", "tagline5"],
  "audienceSummary": "2-3 sentences describing the primary audience"
}

Guidelines:
- Be specific and authentic, avoid generic marketing speak
- Ground everything in the actual brief details
- Values should be single words or short phrases
- Voice traits should be adjectives
- Taglines should be memorable and concise
- Make it feel human and distinctive`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { brief } = body;

    const apiKey = process.env.QWEN_API_KEY;
    const baseUrl = process.env.QWEN_BASE_URL || 'https://tokenhub.mn/v1';
    const model = process.env.QWEN_MODEL || 'qwen3.7-flash';

    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI generation requires an API key. Please add QWEN_API_KEY to your .env.local file.' },
        { status: 400 }
      );
    }

    if (!brief) {
      return NextResponse.json({ error: 'Brief is required' }, { status: 400 });
    }

    const userPrompt = `Generate brand DNA for:

Brand Name: ${brief.brandName || 'Unnamed'}
Tagline: ${brief.tagline || 'None yet'}
Industry: ${brief.industry || 'Unknown'}
Product/Service: ${brief.product || 'Not specified'}
Description: ${brief.description || 'Not provided'}

Target Customers: ${brief.targetCustomers || 'Not specified'}
Location: ${brief.location || 'Not specified'}
Competitors: ${brief.competitors || 'Not specified'}
Differentiation: ${brief.differentiation || 'Not specified'}
Price Positioning: ${brief.pricePositioning || 'Not specified'}

Brand Promise: ${brief.brandPromise || 'Not specified'}
Primary Goal: ${brief.primaryGoal || 'Not specified'}

Personality:
- Serious vs Playful: ${brief.personality?.seriousVsPlayful ?? 50}/100
- Casual vs Formal: ${brief.personality?.casualVsFormal ?? 50}/100
- Classic vs Contemporary: ${brief.personality?.classicVsContemporary ?? 50}/100
- Quiet vs Bold: ${brief.personality?.quietVsBold ?? 50}/100
- Reserved vs Warm: ${brief.personality?.reservedVsWarm ?? 50}/100
- Accessible vs Premium: ${brief.personality?.accessibleVsPremium ?? 50}/100

Adjectives: ${brief.adjectives?.join(', ') || 'Not specified'}

Generate authentic, specific brand DNA that reflects this brief.`;

    const apiBase = baseUrl.endsWith('/v1') ? baseUrl : `${baseUrl}/v1`;

    const response = await fetch(`${apiBase}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        enable_thinking: false,
      }),
      signal: AbortSignal.timeout(60000),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('AI DNA API error:', error);
      return NextResponse.json(
        { error: `AI API error: ${response.status}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Could not parse AI response' }, { status: 500 });
    }

    try {
      const dna = JSON.parse(jsonMatch[0]);
      return NextResponse.json({ dna });
    } catch {
      return NextResponse.json({ error: 'Invalid JSON response' }, { status: 500 });
    }
  } catch (error) {
    console.error('DNA generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Generation failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const isConfigured = !!process.env.QWEN_API_KEY;
  return NextResponse.json({ configured: isConfigured });
}
