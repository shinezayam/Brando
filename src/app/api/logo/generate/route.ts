import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are a logo designer. Generate SVG code for logos.

Rules:
- 100x100 viewBox
- Simple geometric shapes
- 2-3 colors max
- No text in symbol
- Center the symbol

Return JSON: {"symbol_svg":"<svg>...</svg>","concept":"short description","style":"modern|minimal|bold|elegant|playful|tech|organic","suggested_layout":"horizontal|stacked|mark"}`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { description, brandName, industry, style, colors, count = 4 } = body;

    const apiKey = process.env.QWEN_API_KEY;
    const baseUrl = process.env.QWEN_BASE_URL || 'https://tokenhub.mn/v1';
    const model = process.env.QWEN_MODEL || 'qwen3.7-flash';

    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI generation requires an API key. Please add QWEN_API_KEY to your .env.local file.' },
        { status: 400 }
      );
    }

    if (!description || typeof description !== 'string') {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 });
    }

    // Ensure base URL ends with /v1
    const apiBase = baseUrl.endsWith('/v1') ? baseUrl : `${baseUrl}/v1`;

    const prompt = `Design a logo for "${brandName || 'Brand'}"${industry ? ` in the ${industry} industry` : ''}.

Description: ${description}
${style ? `Style: ${style}` : ''}
${colors?.length ? `Preferred colors: ${colors.join(', ')}` : ''}

Generate ${count} different logo symbol variations. Each should be unique but match the description.

Return a JSON array with ${count} objects, each containing:
{
  "symbol_svg": "<svg>...</svg>",
  "concept": "brief description",
  "style": "modern|minimal|bold|elegant|playful|tech|organic",
  "suggested_layout": "horizontal|stacked|mark"
}`;

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
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1500,
        enable_thinking: false,
      }),
      signal: AbortSignal.timeout(120000), // 2 minute timeout
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('AI API error:', error);
      return NextResponse.json(
        { error: `AI API error: ${response.status}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    // Try to parse as JSON array
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        return NextResponse.json({ designs: parsed });
      } catch {
        // Fall through to single object parsing
      }
    }

    // Try single object
    const objMatch = content.match(/\{[\s\S]*\}/);
    if (objMatch) {
      try {
        const parsed = JSON.parse(objMatch[0]);
        return NextResponse.json({ designs: [parsed] });
      } catch {
        // Fall through
      }
    }

    // Try to extract SVG from markdown code blocks
    const svgMatch = content.match(/```(?:svg|xml)?\s*([\s\S]*?)```/);
    if (svgMatch) {
      return NextResponse.json({
        designs: [{
          symbol_svg: svgMatch[1].trim(),
          concept: 'AI-generated logo',
          style: 'modern',
          suggested_layout: 'horizontal'
        }]
      });
    }

    // Try raw SVG
    const rawSvgMatch = content.match(/<svg[\s\S]*?<\/svg>/);
    if (rawSvgMatch) {
      return NextResponse.json({
        designs: [{
          symbol_svg: rawSvgMatch[0],
          concept: 'AI-generated logo',
          style: 'modern',
          suggested_layout: 'horizontal'
        }]
      });
    }

    return NextResponse.json({ error: 'Could not parse AI response' }, { status: 500 });
  } catch (error) {
    console.error('Logo generation error:', error);
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
