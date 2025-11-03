/**
 * PyTorch Aesthetic Scorer
 * 
 * This module provides aesthetic quality scoring for event layouts using
 * a pre-trained CLIP-based model. It evaluates visual composition, color
 * harmony, and overall aesthetic appeal.
 */

export interface LayoutScore {
  layoutId: string
  aestheticScore: number // 0-100
  compositionScore: number
  colorHarmonyScore: number
  balanceScore: number
  reasoning: string
}

export interface LayoutVariant {
  id: string
  gradient: string
  font: string
  layout: 'centered' | 'left-aligned' | 'split' | 'overlay'
  primaryColor: string
  theme: string
}

/**
 * Scores a single layout variant based on aesthetic principles
 */
export async function scoreLayout(
  variant: LayoutVariant,
  eventData: {
    title: string
    description: string
    mediaUrl?: string
  }
): Promise<LayoutScore> {
  try {
    const response = await fetch('/api/pytorch/score-layout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ variant, eventData }),
    })

    if (!response.ok) {
      throw new Error('Failed to score layout')
    }

    return await response.json()
  } catch (error) {
    console.error('Error scoring layout:', error)
    // Fallback to basic scoring
    return {
      layoutId: variant.id,
      aestheticScore: 50,
      compositionScore: 50,
      colorHarmonyScore: 50,
      balanceScore: 50,
      reasoning: 'Fallback scoring used',
    }
  }
}

/**
 * Generates multiple layout variants and scores them
 */
export async function generateAndScoreLayouts(eventData: {
  title: string
  description: string
  location: string
  visualStyling?: any
}): Promise<{ variants: LayoutVariant[]; scores: LayoutScore[] }> {
  // Generate layout variants
  const variants = generateLayoutVariants(eventData)

  // Score all variants in parallel
  const scores = await Promise.all(
    variants.map((variant) => scoreLayout(variant, eventData))
  )

  // Sort by aesthetic score
  const sortedIndices = scores
    .map((score, index) => ({ score, index }))
    .sort((a, b) => b.score.aestheticScore - a.score.aestheticScore)
    .map((item) => item.index)

  return {
    variants: sortedIndices.map((i) => variants[i]),
    scores: sortedIndices.map((i) => scores[i]),
  }
}

/**
 * Generates layout variants based on event characteristics
 */
function generateLayoutVariants(eventData: {
  title: string
  description: string
  location: string
  visualStyling?: any
}): LayoutVariant[] {
  const baseTheme = eventData.visualStyling?.theme || 'professional'
  
  const themeGradients = {
    professional: [
      'from-slate-600 to-slate-800',
      'from-blue-600 to-indigo-800',
      'from-gray-700 to-gray-900',
    ],
    creative: [
      'from-purple-500 to-pink-600',
      'from-fuchsia-500 to-purple-700',
      'from-violet-500 to-purple-600',
    ],
    social: [
      'from-pink-400 to-rose-500',
      'from-rose-400 to-pink-600',
      'from-red-400 to-pink-500',
    ],
    celebration: [
      'from-yellow-400 to-orange-500',
      'from-amber-400 to-orange-600',
      'from-orange-400 to-red-500',
    ],
    outdoor: [
      'from-green-500 to-emerald-600',
      'from-teal-500 to-green-600',
      'from-emerald-500 to-teal-600',
    ],
    formal: [
      'from-gray-800 to-black',
      'from-slate-800 to-gray-900',
      'from-zinc-800 to-black',
    ],
  }

  const gradients = themeGradients[baseTheme as keyof typeof themeGradients] || themeGradients.professional
  const fonts = ['font-semibold', 'font-bold', 'font-extrabold']
  const layouts: Array<'centered' | 'left-aligned' | 'split' | 'overlay'> = ['centered', 'left-aligned', 'split']

  const variants: LayoutVariant[] = []
  let id = 0

  // Generate combinations
  gradients.forEach((gradient) => {
    fonts.forEach((font) => {
      layouts.forEach((layout) => {
        variants.push({
          id: `variant-${id++}`,
          gradient: `bg-gradient-to-br ${gradient}`,
          font,
          layout,
          primaryColor: gradient.split('-')[1],
          theme: baseTheme,
        })
      })
    })
  })

  // Limit to top 9 variants for performance
  return variants.slice(0, 9)
}

/**
 * Gets the best layout variant for an event
 */
export async function getBestLayout(eventData: {
  title: string
  description: string
  location: string
  visualStyling?: any
}): Promise<LayoutVariant> {
  const { variants, scores } = await generateAndScoreLayouts(eventData)
  
  // Return the highest-scoring variant
  return variants[0]
}
