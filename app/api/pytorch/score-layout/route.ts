import { NextRequest, NextResponse } from 'next/server'

/**
 * PyTorch Layout Scoring API
 * 
 * This endpoint uses aesthetic principles and CLIP-inspired scoring
 * to evaluate event layout quality. In production, this would connect
 * to a PyTorch model server, but for now it uses heuristic scoring.
 */

interface LayoutVariant {
  id: string
  gradient: string
  font: string
  layout: 'centered' | 'left-aligned' | 'split' | 'overlay'
  primaryColor: string
  theme: string
}

interface EventData {
  title: string
  description: string
  mediaUrl?: string
}

export async function POST(request: NextRequest) {
  try {
    const { variant, eventData } = await request.json() as {
      variant: LayoutVariant
      eventData: EventData
    }

    // Score the layout using aesthetic principles
    const score = await scoreLayoutAesthetics(variant, eventData)

    return NextResponse.json(score)
  } catch (error) {
    console.error('Error scoring layout:', error)
    return NextResponse.json(
      { error: 'Failed to score layout' },
      { status: 500 }
    )
  }
}

/**
 * Scores layout aesthetics using multiple factors
 * 
 * In production, this would call a PyTorch model API.
 * For now, it uses heuristic scoring based on design principles.
 */
async function scoreLayoutAesthetics(
  variant: LayoutVariant,
  eventData: EventData
) {
  // Composition scoring (layout structure)
  const compositionScore = scoreComposition(variant)
  
  // Color harmony scoring
  const colorHarmonyScore = scoreColorHarmony(variant)
  
  // Balance scoring (visual weight distribution)
  const balanceScore = scoreBalance(variant, eventData)
  
  // Typography scoring
  const typographyScore = scoreTypography(variant, eventData)
  
  // Calculate weighted aesthetic score
  const aestheticScore = Math.round(
    compositionScore * 0.3 +
    colorHarmonyScore * 0.3 +
    balanceScore * 0.25 +
    typographyScore * 0.15
  )

  // Generate reasoning
  const reasoning = generateReasoning(
    aestheticScore,
    compositionScore,
    colorHarmonyScore,
    balanceScore,
    typographyScore
  )

  return {
    layoutId: variant.id,
    aestheticScore,
    compositionScore,
    colorHarmonyScore,
    balanceScore,
    reasoning,
  }
}

/**
 * Scores layout composition
 */
function scoreComposition(variant: LayoutVariant): number {
  const layoutScores = {
    centered: 85, // Classic, balanced
    'left-aligned': 75, // Modern, but less balanced
    split: 80, // Dynamic
    overlay: 70, // Can be cluttered
  }
  
  return layoutScores[variant.layout] || 70
}

/**
 * Scores color harmony using color theory
 */
function scoreColorHarmony(variant: LayoutVariant): number {
  const colorPairs = {
    // Analogous colors (high harmony)
    'blue-indigo': 90,
    'purple-pink': 88,
    'green-emerald': 87,
    'yellow-orange': 85,
    
    // Complementary colors (medium-high harmony)
    'blue-orange': 82,
    'purple-yellow': 80,
    'green-red': 78,
    
    // Monochromatic (very high harmony)
    'slate-gray': 92,
    'gray-black': 90,
    
    // Triadic (medium harmony)
    'red-blue': 75,
    'yellow-blue': 73,
  }

  // Extract color from gradient
  const gradientColors = variant.gradient.match(/from-(\w+)-\d+\s+to-(\w+)-\d+/)
  if (gradientColors) {
    const [, color1, color2] = gradientColors
    const pairKey = `${color1}-${color2}`
    const reversePairKey = `${color2}-${color1}`
    
    return colorPairs[pairKey as keyof typeof colorPairs] || 
           colorPairs[reversePairKey as keyof typeof colorPairs] || 
           75
  }
  
  return 75
}

/**
 * Scores visual balance
 */
function scoreBalance(variant: LayoutVariant, eventData: EventData): number {
  let score = 70
  
  // Centered layouts are naturally balanced
  if (variant.layout === 'centered') {
    score += 15
  }
  
  // Split layouts need careful balance
  if (variant.layout === 'split') {
    score += 10
  }
  
  // Title length affects balance
  const titleLength = eventData.title.length
  if (titleLength > 10 && titleLength < 40) {
    score += 10 // Ideal length
  } else if (titleLength > 60) {
    score -= 10 // Too long, harder to balance
  }
  
  // Media presence affects balance
  if (eventData.mediaUrl) {
    score += 5
  }
  
  return Math.min(100, Math.max(0, score))
}

/**
 * Scores typography choices
 */
function scoreTypography(variant: LayoutVariant, eventData: EventData): number {
  let score = 70
  
  const fontWeights = {
    'font-semibold': 85, // Versatile
    'font-bold': 80, // Strong
    'font-extrabold': 75, // Can be overwhelming
    'font-medium': 70, // Too light for headers
  }
  
  score = fontWeights[variant.font as keyof typeof fontWeights] || 70
  
  // Adjust based on title length
  const titleLength = eventData.title.length
  if (titleLength > 40 && variant.font === 'font-extrabold') {
    score -= 15 // Too heavy for long titles
  }
  
  if (titleLength < 20 && variant.font === 'font-bold') {
    score += 10 // Bold works well for short titles
  }
  
  return Math.min(100, Math.max(0, score))
}

/**
 * Generates human-readable reasoning for the score
 */
function generateReasoning(
  aestheticScore: number,
  compositionScore: number,
  colorHarmonyScore: number,
  balanceScore: number,
  typographyScore: number
): string {
  const reasons: string[] = []
  
  if (aestheticScore >= 85) {
    reasons.push('Excellent overall aesthetic quality')
  } else if (aestheticScore >= 75) {
    reasons.push('Strong visual appeal')
  } else if (aestheticScore >= 65) {
    reasons.push('Good aesthetic foundation')
  } else {
    reasons.push('Room for improvement')
  }
  
  if (compositionScore >= 80) {
    reasons.push('well-balanced composition')
  }
  
  if (colorHarmonyScore >= 85) {
    reasons.push('harmonious color palette')
  }
  
  if (balanceScore >= 80) {
    reasons.push('excellent visual balance')
  }
  
  if (typographyScore >= 80) {
    reasons.push('effective typography')
  }
  
  return reasons.join(', ')
}
