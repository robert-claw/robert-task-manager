/**
 * Content Funnel Strategy Reference
 * Based on: /docs/projects/dandelion-labs/content-funnel-strategy.md
 */

import { FunnelStage, Platform } from './types'

export interface StrategyDefinition {
  id: string
  name: string
  funnelStage: FunnelStage
  platforms: Platform[]
  description: string
  format: string
  frequency: string
  metrics: {
    metric: string
    target?: string
  }[]
  linkedTo?: string[]  // IDs of strategy types this typically leads to
}

export const STRATEGY_DEFINITIONS: Record<string, StrategyDefinition> = {
  // === TOFU (Awareness) ===
  'linkedin-hot-take': {
    id: 'linkedin-hot-take',
    name: 'Hot Take',
    funnelStage: 'TOFU',
    platforms: ['linkedin'],
    description: 'Controversial opinions on AI development to spark engagement',
    format: 'Hook in first line, 3-5 short paragraphs, engagement question',
    frequency: '1-2x/week',
    metrics: [
      { metric: 'Impressions', target: '> 2K' },
      { metric: 'Comments', target: '> 10' },
      { metric: 'Profile visits', target: '> 50' },
    ],
    linkedTo: ['linkedin-framework', 'blog-guide'],
  },
  'linkedin-founder-journey': {
    id: 'linkedin-founder-journey',
    name: 'Founder Journey',
    funnelStage: 'TOFU',
    platforms: ['linkedin'],
    description: 'Behind-the-scenes of running Dandelion Labs',
    format: 'Personal story, lessons learned, authentic voice',
    frequency: '1x/week',
    metrics: [
      { metric: 'Engagement rate', target: '> 5%' },
      { metric: 'Shares', target: '> 5' },
    ],
    linkedTo: ['linkedin-case-study', 'blog-case-study'],
  },
  'linkedin-industry-commentary': {
    id: 'linkedin-industry-commentary',
    name: 'Industry Commentary',
    funnelStage: 'TOFU',
    platforms: ['linkedin'],
    description: 'Reactions to AI news from founder perspective',
    format: 'News → Insight → Implication for startups',
    frequency: '1x/week',
    metrics: [
      { metric: 'Impressions', target: '> 2K' },
      { metric: 'Click-through', target: '> 20' },
    ],
    linkedTo: ['blog-deep-dive', 'linkedin-framework'],
  },
  'twitter-quick-insight': {
    id: 'twitter-quick-insight',
    name: 'Quick Insight',
    funnelStage: 'TOFU',
    platforms: ['twitter'],
    description: 'Single-tweet punchy, quotable insights',
    format: '1-2 sentences, conversational',
    frequency: 'Daily',
    metrics: [
      { metric: 'Impressions', target: '> 1K' },
      { metric: 'Engagement rate', target: '> 3%' },
      { metric: 'Retweets', target: '> 5' },
    ],
    linkedTo: ['twitter-thread', 'blog-guide'],
  },
  'twitter-engagement-bait': {
    id: 'twitter-engagement-bait',
    name: 'Engagement Question',
    funnelStage: 'TOFU',
    platforms: ['twitter'],
    description: 'Questions, polls, or hot takes to spark conversation',
    format: 'Question or controversial statement',
    frequency: '3x/week',
    metrics: [
      { metric: 'Replies', target: '> 15' },
      { metric: 'Engagement rate', target: '> 5%' },
    ],
    linkedTo: ['twitter-thread'],
  },
  'blog-seo-guide': {
    id: 'blog-seo-guide',
    name: 'SEO Guide',
    funnelStage: 'TOFU',
    platforms: ['blog'],
    description: 'Comprehensive guides targeting buyer keywords',
    format: 'Long-form, well-structured, optimized for search',
    frequency: '2x/month',
    metrics: [
      { metric: 'Organic traffic', target: '> 500/mo' },
      { metric: 'Time on page', target: '> 3min' },
      { metric: 'Scroll depth', target: '> 60%' },
    ],
    linkedTo: ['blog-lead-magnet', 'blog-case-study'],
  },

  // === MOFU (Consideration) ===
  'linkedin-framework': {
    id: 'linkedin-framework',
    name: 'Educational Framework',
    funnelStage: 'MOFU',
    platforms: ['linkedin'],
    description: 'Actionable frameworks and templates',
    format: 'Problem → Framework → Application',
    frequency: 'Alternate weeks',
    metrics: [
      { metric: 'Engagement rate', target: '> 5%' },
      { metric: 'Link clicks', target: '> 20' },
      { metric: 'Lead magnet downloads', target: '> 5' },
    ],
    linkedTo: ['blog-lead-magnet', 'linkedin-case-study'],
  },
  'linkedin-case-study': {
    id: 'linkedin-case-study',
    name: 'Case Study Teaser',
    funnelStage: 'MOFU',
    platforms: ['linkedin'],
    description: 'Results-focused client win stories (anonymized)',
    format: 'Problem → Solution → Results (with numbers)',
    frequency: 'Alternate weeks',
    metrics: [
      { metric: 'Engagement rate', target: '> 5%' },
      { metric: 'Link clicks', target: '> 30' },
      { metric: 'Leads generated', target: '> 2' },
    ],
    linkedTo: ['blog-case-study', 'discovery-call'],
  },
  'linkedin-technical': {
    id: 'linkedin-technical',
    name: 'Technical Credibility',
    funnelStage: 'MOFU',
    platforms: ['linkedin'],
    description: 'Deep technical insights without jargon',
    format: 'Technical concept → Practical application',
    frequency: 'Monthly',
    metrics: [
      { metric: 'Engagement from technical audience', target: '> 8%' },
      { metric: 'Shares', target: '> 10' },
    ],
    linkedTo: ['blog-deep-dive', 'newsletter-signup'],
  },
  'twitter-thread': {
    id: 'twitter-thread',
    name: 'Educational Thread',
    funnelStage: 'MOFU',
    platforms: ['twitter'],
    description: 'Multi-tweet deep-dives on specific topics',
    format: 'Hook → Value (2-8 tweets) → CTA',
    frequency: '1-2x/week',
    metrics: [
      { metric: 'Thread impressions', target: '> 5K' },
      { metric: 'Link clicks', target: '> 50' },
      { metric: 'Bookmarks', target: '> 20' },
      { metric: 'Email signups', target: '> 5' },
    ],
    linkedTo: ['blog-guide', 'blog-lead-magnet'],
  },
  'twitter-story-thread': {
    id: 'twitter-story-thread',
    name: 'Story Thread',
    funnelStage: 'MOFU',
    platforms: ['twitter'],
    description: 'Client project breakdowns or challenge stories',
    format: 'Story arc with specific examples',
    frequency: '1x/week',
    metrics: [
      { metric: 'Engagement rate', target: '> 6%' },
      { metric: 'Replies', target: '> 25' },
    ],
    linkedTo: ['blog-case-study', 'discovery-call'],
  },
  'blog-guide': {
    id: 'blog-guide',
    name: 'How-To Guide',
    funnelStage: 'MOFU',
    platforms: ['blog'],
    description: 'Step-by-step tutorials and frameworks',
    format: 'Educational, actionable, with templates',
    frequency: '2x/month',
    metrics: [
      { metric: 'Lead magnet downloads', target: '> 20' },
      { metric: 'Email signups', target: '> 15' },
      { metric: 'Read time', target: '> 5min' },
    ],
    linkedTo: ['blog-lead-magnet', 'email-sequence'],
  },
  'blog-case-study': {
    id: 'blog-case-study',
    name: 'Full Case Study',
    funnelStage: 'MOFU',
    platforms: ['blog'],
    description: 'Detailed project breakdowns with results',
    format: 'Problem → Solution → Results → Testimonial',
    frequency: '1x/month',
    metrics: [
      { metric: 'Read time', target: '> 7min' },
      { metric: 'Scroll depth', target: '> 80%' },
      { metric: 'Discovery calls', target: '> 3' },
    ],
    linkedTo: ['discovery-call'],
  },
  'blog-lead-magnet': {
    id: 'blog-lead-magnet',
    name: 'Lead Magnet',
    funnelStage: 'MOFU',
    platforms: ['blog'],
    description: 'Downloadable templates, calculators, checklists',
    format: 'Interactive tool or PDF resource',
    frequency: 'As needed',
    metrics: [
      { metric: 'Downloads', target: '> 50' },
      { metric: 'Email list growth', target: '> 30' },
    ],
    linkedTo: ['email-sequence'],
  },

  // === BOFU (Conversion) ===
  'linkedin-social-proof': {
    id: 'linkedin-social-proof',
    name: 'Social Proof',
    funnelStage: 'BOFU',
    platforms: ['linkedin'],
    description: 'Client testimonials and milestone updates',
    format: 'Testimonial → Results → Direct CTA',
    frequency: '2x/month',
    metrics: [
      { metric: 'Discovery calls booked', target: '> 2' },
      { metric: 'Calendar link clicks', target: '> 30' },
      { metric: 'DM inquiries', target: '> 3' },
    ],
    linkedTo: ['discovery-call'],
  },
  'linkedin-objection-handling': {
    id: 'linkedin-objection-handling',
    name: 'Objection Handling',
    funnelStage: 'BOFU',
    platforms: ['linkedin'],
    description: 'Address common hesitations transparently',
    format: 'Objection → Truth → Reassurance → CTA',
    frequency: '1x/month',
    metrics: [
      { metric: 'Engagement from qualified leads', target: '> 7%' },
      { metric: 'Discovery calls', target: '> 3' },
    ],
    linkedTo: ['discovery-call'],
  },
  'linkedin-limited-availability': {
    id: 'linkedin-limited-availability',
    name: 'Limited Availability',
    funnelStage: 'BOFU',
    platforms: ['linkedin'],
    description: 'Time-sensitive offers or capacity updates',
    format: 'Scarcity → Value → Direct CTA',
    frequency: 'Quarterly',
    metrics: [
      { metric: 'Discovery calls booked', target: '> 5' },
      { metric: 'Urgency response rate', target: '> 10%' },
    ],
    linkedTo: ['discovery-call'],
  },
  'blog-comparison': {
    id: 'blog-comparison',
    name: 'Comparison Post',
    funnelStage: 'BOFU',
    platforms: ['blog'],
    description: 'Transparent positioning vs alternatives',
    format: 'Options → Comparison → When to choose us',
    frequency: 'Monthly',
    metrics: [
      { metric: 'Discovery calls booked', target: '> 5' },
      { metric: 'Calendar clicks', target: '> 50' },
    ],
    linkedTo: ['discovery-call'],
  },
  'blog-faq': {
    id: 'blog-faq',
    name: 'FAQ / Process Page',
    funnelStage: 'BOFU',
    platforms: ['blog'],
    description: 'Answer questions about working together',
    format: 'Q&A format, transparent, reassuring',
    frequency: 'Quarterly updates',
    metrics: [
      { metric: 'Time on page', target: '> 5min' },
      { metric: 'Calendar clicks', target: '> 40' },
    ],
    linkedTo: ['discovery-call'],
  },
  'email-sequence': {
    id: 'email-sequence',
    name: 'Email Nurture Sequence',
    funnelStage: 'MOFU',
    platforms: ['blog'],  // Blog captures email
    description: '5-email sequence for lead magnet downloaders',
    format: 'Day 1: Welcome, Day 3: Value, Day 5: Case Study, Day 7: Offer, Day 10: Last chance',
    frequency: 'Automated',
    metrics: [
      { metric: 'Open rate', target: '> 40%' },
      { metric: 'Click rate', target: '> 15%' },
      { metric: 'Conversion to call', target: '> 10%' },
    ],
    linkedTo: ['discovery-call'],
  },
  'newsletter-signup': {
    id: 'newsletter-signup',
    name: 'Newsletter Signup',
    funnelStage: 'MOFU',
    platforms: ['blog', 'linkedin', 'twitter'],
    description: 'Weekly newsletter for ongoing nurture',
    format: 'What we shipped, what we learned, AI insights',
    frequency: 'Weekly',
    metrics: [
      { metric: 'Subscriber growth', target: '> 50/mo' },
      { metric: 'Open rate', target: '> 35%' },
    ],
    linkedTo: ['discovery-call', 'blog-guide'],
  },
  'discovery-call': {
    id: 'discovery-call',
    name: 'Discovery Call Booked',
    funnelStage: 'BOFU',
    platforms: ['blog', 'linkedin', 'twitter'],
    description: 'Final conversion: book a discovery call',
    format: 'Calendar link',
    frequency: 'Goal: 10+/month',
    metrics: [
      { metric: 'Calls booked', target: '> 10/mo' },
      { metric: 'Show rate', target: '> 70%' },
      { metric: 'Qualified rate', target: '> 50%' },
    ],
    linkedTo: [],  // End of funnel
  },
}

export const FUNNEL_STAGE_COLORS: Record<FunnelStage, string> = {
  TOFU: '#3b82f6',  // Blue - Awareness
  MOFU: '#f59e0b',  // Amber - Consideration
  BOFU: '#10b981',  // Green - Conversion
}

export const FUNNEL_STAGE_LABELS: Record<FunnelStage, string> = {
  TOFU: 'Top of Funnel (Awareness)',
  MOFU: 'Middle of Funnel (Consideration)',
  BOFU: 'Bottom of Funnel (Conversion)',
}

export function getStrategyDefinition(strategyId: string): StrategyDefinition | undefined {
  return STRATEGY_DEFINITIONS[strategyId]
}

export function getStrategiesForPlatform(platform: Platform, stage?: FunnelStage): StrategyDefinition[] {
  return Object.values(STRATEGY_DEFINITIONS).filter(
    (s) => s.platforms.includes(platform) && (!stage || s.funnelStage === stage)
  )
}

export function getStrategiesForStage(stage: FunnelStage): StrategyDefinition[] {
  return Object.values(STRATEGY_DEFINITIONS).filter((s) => s.funnelStage === stage)
}
