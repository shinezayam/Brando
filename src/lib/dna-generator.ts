import type { BrandBrief, BrandDNA } from '@/types';

// Deterministic Brand DNA generator — works without API keys
// Uses the brief's actual answers to generate grounded content

export function generateBrandDNA(brief: BrandBrief): BrandDNA {
  const {
    brandName,
    tagline,
    industry,
    product,
    description,
    targetCustomers,
    location,
    competitors,
    differentiation,
    pricePositioning,
    brandPromise,
    primaryGoal,
    personality,
    adjectives,
  } = brief;

  // Personality interpretation
  const personalityTraits: string[] = [];
  if (personality.seriousVsPlayful > 65) personalityTraits.push('playful');
  else if (personality.seriousVsPlayful < 35) personalityTraits.push('serious');
  else personalityTraits.push('balanced');

  if (personality.casualVsFormal > 65) personalityTraits.push('formal');
  else if (personality.casualVsFormal < 35) personalityTraits.push('casual');

  if (personality.classicVsContemporary > 65) personalityTraits.push('contemporary');
  else if (personality.classicVsContemporary < 35) personalityTraits.push('classic');

  if (personality.quietVsBold > 65) personalityTraits.push('bold');
  else if (personality.quietVsBold < 35) personalityTraits.push('understated');

  if (personality.reservedVsWarm > 65) personalityTraits.push('warm');
  else if (personality.reservedVsWarm < 35) personalityTraits.push('reserved');

  if (personality.accessibleVsPremium > 65) personalityTraits.push('premium');
  else if (personality.accessibleVsPremium < 35) personalityTraits.push('accessible');

  const adjList = adjectives?.length ? adjectives : personalityTraits.slice(0, 3);
  const adjStr = adjList.join(', ');

  // Essence
  const essence = `${brandName} is a ${adjStr} ${industry.toLowerCase()} brand that stands for ${brandPromise || 'quality and authenticity'}.`;

  // Positioning
  const positioning = differentiation
    ? `In the ${industry.toLowerCase()} market, ${brandName} occupies a ${pricePositioning || 'distinct'} position by offering ${differentiation.toLowerCase()}. Unlike ${competitors || 'competitors'}, ${brandName} delivers a uniquely ${adjStr} experience.`
    : `${brandName} serves the ${industry.toLowerCase()} market with a ${adjStr} approach, targeting ${targetCustomers || 'discerning customers'}${location ? ` in ${location}` : ''}.`;

  // Story
  const story = product || description
    ? `${brandName} was born from a desire to ${primaryGoal || 'make a difference'} in the ${industry.toLowerCase()} space. ${description || `With ${product || 'our products'}, we bring ${adjStr} quality to ${targetCustomers || 'our customers'}.${location ? ` Based in ${location},` : ''} we believe every interaction should reflect our commitment to ${brandPromise || 'excellence'}.`}`
    : `${brandName} brings a ${adjStr} perspective to the ${industry.toLowerCase()} industry, focused on delivering real value to ${targetCustomers || 'its customers'}.`;

  // Mission
  const mission = `To ${primaryGoal || 'deliver exceptional value'} through ${adjStr} ${product || industry.toLowerCase()} solutions that ${brandPromise ? brandPromise.toLowerCase() : 'exceed expectations'}.`;

  // Vision
  const vision = `A world where ${targetCustomers || 'people'} can rely on ${adjStr} ${industry.toLowerCase()} brands that truly understand their needs — and ${brandName} leads the way.`;

  // Values
  const values = generateValues(personality, adjList);

  // Audience
  const audienceSummary = targetCustomers
    ? `${brandName} serves ${targetCustomers}${location ? ` in ${location}` : ''}. The brand appeals to those who value ${adjStr} qualities and seek ${pricePositioning || 'quality'} ${industry.toLowerCase()} solutions.`
    : `${brandName}'s audience values ${adjStr} experiences in the ${industry.toLowerCase()} space.`;

  // Differentiators
  const differentiators = [
    differentiation || `A ${adjStr} approach to ${industry.toLowerCase()}`,
    pricePositioning ? `${pricePositioning.charAt(0).toUpperCase() + pricePositioning.slice(1)} positioning` : 'Distinct market presence',
    personalityTraits.includes('warm') ? 'Emotionally resonant brand experience' : 'Professional and reliable service',
    brandPromise || 'Consistent quality commitment',
  ].filter(Boolean);

  // Voice traits
  const voiceTraits = generateVoiceTraits(personality);

  // Messaging pillars
  const messagingPillars = [
    `${personalityTraits.includes('warm') ? 'Connection' : 'Excellence'} — Every touchpoint reflects our ${adjStr} character`,
    `${product ? 'Product' : 'Quality'} — ${brandPromise || 'Delivering on our promise of quality'}`,
    `Community — Building lasting relationships with ${targetCustomers || 'our audience'}`,
    `Growth — ${primaryGoal || 'Continuously evolving to serve better'}`,
  ];

  // Tagline options
  const taglineOptions = generateTaglines(brandName, industry, adjList, tagline);

  return {
    essence,
    positioning,
    story,
    mission,
    vision,
    values,
    audienceSummary,
    differentiators,
    voiceTraits,
    messagingPillars,
    taglineOptions,
  };
}

function generateValues(personality: BrandBrief['personality'], adjectives: string[]): string[] {
  const values: string[] = [];

  if (personality.accessibleVsPremium > 50) {
    values.push('Excellence — We pursue the highest standards in everything we do');
  } else {
    values.push('Inclusivity — We believe great experiences should be accessible to all');
  }

  if (personality.reservedVsWarm > 50) {
    values.push('Empathy — We lead with understanding and genuine care');
  } else {
    values.push('Integrity — We are transparent and honest in all dealings');
  }

  if (personality.quietVsBold > 50) {
    values.push('Innovation — We push boundaries and challenge the status quo');
  } else {
    values.push('Reliability — We deliver consistently and dependably');
  }

  if (personality.classicVsContemporary > 50) {
    values.push('Progress — We embrace change and look toward the future');
  } else {
    values.push('Heritage — We honor tradition and time-tested principles');
  }

  if (adjectives.length > 0) {
    values.push(`Authenticity — We stay true to our ${adjectives[0]} identity`);
  }

  return values.slice(0, 5);
}

function generateVoiceTraits(personality: BrandBrief['personality']): string[] {
  const traits: string[] = [];

  if (personality.seriousVsPlayful > 65) traits.push('Lighthearted');
  else if (personality.seriousVsPlayful < 35) traits.push('Authoritative');
  else traits.push('Professional');

  if (personality.casualVsFormal > 65) traits.push('Polished');
  else if (personality.casualVsFormal < 35) traits.push('Conversational');
  else traits.push('Approachable');

  if (personality.quietVsBold > 65) traits.push('Confident');
  else traits.push('Thoughtful');

  if (personality.reservedVsWarm > 65) traits.push('Friendly');
  else traits.push('Respectful');

  if (personality.classicVsContemporary > 65) traits.push('Fresh');
  else traits.push('Established');

  return traits;
}

function generateTaglines(
  brandName: string,
  industry: string,
  adjectives: string[],
  existingTagline?: string
): string[] {
  const options: string[] = [];

  if (existingTagline) options.push(existingTagline);

  const adj = adjectives[0] || 'great';
  options.push(`${brandName} — ${adj.charAt(0).toUpperCase() + adj.slice(1)} by design`);
  options.push(`Where ${industry.toLowerCase()} meets ${adj}`);
  options.push(`${adj.charAt(0).toUpperCase() + adj.slice(1)}. ${brandName}.`);
  options.push(`The ${adj} choice for ${industry.toLowerCase()}`);
  options.push(`${brandName}: Built ${adj}, made for you`);

  return options.slice(0, 5);
}
