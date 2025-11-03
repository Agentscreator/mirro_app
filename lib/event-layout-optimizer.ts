/**
 * Event Layout Optimizer
 * 
 * High-level utility for optimizing event layouts using PyTorch scoring.
 * This is the main integration point for the event creation flow.
 */

import { getBestLayout, generateAndScoreLayouts, LayoutVariant } from './pytorch-aesthetic-scorer'

export interface OptimizedEventStyling {
  gradient: string
  font: string
  layout: string
  primaryColor: string
  theme: string
  aestheticScore: number
  reasoning: string
}

/**
 * Optimizes visual styling for an event using AI scoring
 * 
 * @param eventData - Event information
 * @param options - Optimization options
 * @returns Optimized styling with score
 */
export async function optimizeEventLayout(
  eventData: {
    title: string
    description: string
    location: string
    visualStyling?: any
  },
  options: {
    showAlternatives?: boolean
    minScore?: number
  } = {}
): Promise<OptimizedEventStyling> {
  const { showAlternatives = false, minScore = 75 } = options

  try {
    if (showAlternatives) {
      // Get all variants with scores for user selection
      const { variants, scores } = await generateAndScoreLayouts(eventData)
      
      // Find first variant meeting minimum score
      const bestIndex = scores.findIndex(s => s.aestheticScore >= minScore)
      const selectedIndex = bestIndex >= 0 ? bestIndex : 0
      
      return {
        ...variants[selectedIndex],
        aestheticScore: scores[selectedIndex].aestheticScore,
        reasoning: scores[selectedIndex].reasoning,
      }
    } else {
      // Get single best layout
      const bestLayout = await getBestLayout(eventData)
      
      // Score it
      const { scoreLayout } = await import('./pytorch-aesthetic-scorer')
      const score = await scoreLayout(bestLayout, eventData)
      
      return {
        ...bestLayout,
        aestheticScore: score.aestheticScore,
        reasoning: score.reasoning,
      }
    }
  } catch (error) {
    console.error('Error optimizing layout:', error)
    
    // Fallback to safe default
    return {
      gradient: 'bg-gradient-to-br from-slate-600 to-slate-800',
      font: 'font-semibold',
      layout: 'centered',
      primaryColor: 'slate',
      theme: 'professional',
      aestheticScore: 75,
      reasoning: 'Using safe default styling',
    }
  }
}

/**
 * Applies optimized layout to event data
 */
export function applyOptimizedLayout(
  eventData: any,
  optimizedLayout: OptimizedEventStyling
): any {
  return {
    ...eventData,
    gradient: optimizedLayout.gradient,
    visualStyling: {
      ...eventData.visualStyling,
      styling: {
        gradient: optimizedLayout.gradient,
        font: optimizedLayout.font,
        layout: optimizedLayout.layout,
        primaryColor: optimizedLayout.primaryColor,
        theme: optimizedLayout.theme,
      },
      aestheticScore: optimizedLayout.aestheticScore,
      reasoning: optimizedLayout.reasoning,
    },
  }
}

/**
 * Batch optimize multiple events (useful for migrations or bulk operations)
 */
export async function batchOptimizeLayouts(
  events: Array<{
    id: string
    title: string
    description: string
    location: string
  }>
): Promise<Map<string, OptimizedEventStyling>> {
  const results = new Map<string, OptimizedEventStyling>()
  
  // Process in batches of 5 to avoid overwhelming the API
  const batchSize = 5
  for (let i = 0; i < events.length; i += batchSize) {
    const batch = events.slice(i, i + batchSize)
    
    const batchResults = await Promise.all(
      batch.map(event => 
        optimizeEventLayout(event).then(result => ({ id: event.id, result }))
      )
    )
    
    batchResults.forEach(({ id, result }) => {
      results.set(id, result)
    })
  }
  
  return results
}

/**
 * Compare two layouts and return the better one
 */
export async function compareLayouts(
  layout1: LayoutVariant,
  layout2: LayoutVariant,
  eventData: { title: string; description: string }
): Promise<{ winner: LayoutVariant; score1: number; score2: number }> {
  const { scoreLayout } = await import('./pytorch-aesthetic-scorer')
  
  const [score1, score2] = await Promise.all([
    scoreLayout(layout1, eventData),
    scoreLayout(layout2, eventData),
  ])
  
  return {
    winner: score1.aestheticScore >= score2.aestheticScore ? layout1 : layout2,
    score1: score1.aestheticScore,
    score2: score2.aestheticScore,
  }
}
