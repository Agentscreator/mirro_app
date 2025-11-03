# PyTorch Layout Scoring - Integration Example

## Quick Integration into CreateEventPage

Here's how to add PyTorch layout scoring to your existing event creation flow:

### Option 1: Automatic Best Layout (Simplest)

Add this to your `CreateEventPage.tsx` after AI generation:

```typescript
import { optimizeEventLayout } from '@/lib/event-layout-optimizer'

// Inside handleAIGenerate function, after setting eventData:
const handleAIGenerate = async (content: string, input: string) => {
  setAiGeneratedContent(content)
  const parsed = JSON.parse(content)
  
  // Set initial event data
  setEventData({
    title: parsed.title || "",
    description: parsed.description || "",
    date: parsed.date || "",
    time: parsed.time || "",
    location: parsed.location || "",
    visualStyling: parsed.visualStyling || null,
  })
  
  // 🎯 NEW: Optimize layout with PyTorch scoring
  const optimizedLayout = await optimizeEventLayout({
    title: parsed.title,
    description: parsed.description,
    location: parsed.location,
    visualStyling: parsed.visualStyling
  })
  
  // Apply optimized layout
  setEventData(prev => ({
    ...prev,
    gradient: optimizedLayout.gradient,
    visualStyling: {
      ...prev.visualStyling,
      styling: {
        gradient: optimizedLayout.gradient,
        font: optimizedLayout.font,
        layout: optimizedLayout.layout,
        primaryColor: optimizedLayout.primaryColor,
        theme: optimizedLayout.theme,
      },
      aestheticScore: optimizedLayout.aestheticScore
    }
  }))
  
  setCurrentStep(3)
}
```

### Option 2: Show Layout Selector (More Control)

Add the LayoutSelector component to Step 3:

```typescript
import LayoutSelector from '@/components/LayoutSelector'

// In your CreateEventPage render, add this in Step 3:
{currentStep === 3 && (
  <div className="space-y-4">
    {/* Existing event form fields */}
    
    {/* 🎯 NEW: Layout Selector with PyTorch Scoring */}
    <LayoutSelector
      eventData={{
        title: eventData.title,
        description: eventData.description,
        location: eventData.location,
        visualStyling: eventData.visualStyling
      }}
      onSelectLayout={(variant) => {
        setEventData(prev => ({
          ...prev,
          gradient: variant.gradient,
          visualStyling: {
            ...prev.visualStyling,
            styling: {
              gradient: variant.gradient,
              font: variant.font,
              layout: variant.layout,
              primaryColor: variant.primaryColor,
              theme: variant.theme,
            }
          }
        }))
      }}
    />
    
    {/* Rest of your form */}
  </div>
)}
```

### Option 3: Background Optimization (Best UX)

Optimize in the background while user edits:

```typescript
// Add state for optimization
const [isOptimizingLayout, setIsOptimizingLayout] = useState(false)
const [optimizedLayouts, setOptimizedLayouts] = useState<any[]>([])

// Optimize in background after AI generation
useEffect(() => {
  if (eventData.title && eventData.description && !isOptimizingLayout) {
    optimizeLayoutsInBackground()
  }
}, [eventData.title, eventData.description])

const optimizeLayoutsInBackground = async () => {
  setIsOptimizingLayout(true)
  try {
    const { generateAndScoreLayouts } = await import('@/lib/pytorch-aesthetic-scorer')
    const result = await generateAndScoreLayouts({
      title: eventData.title,
      description: eventData.description,
      location: eventData.location,
      visualStyling: eventData.visualStyling
    })
    
    setOptimizedLayouts(result.variants)
    
    // Auto-apply best layout
    if (result.variants.length > 0) {
      const best = result.variants[0]
      setEventData(prev => ({
        ...prev,
        gradient: best.gradient,
        visualStyling: {
          ...prev.visualStyling,
          styling: {
            gradient: best.gradient,
            font: best.font,
            layout: best.layout,
            primaryColor: best.primaryColor,
            theme: best.theme,
          }
        }
      }))
    }
  } catch (error) {
    console.error('Background optimization failed:', error)
  } finally {
    setIsOptimizingLayout(false)
  }
}
```

## Testing the Integration

### 1. Test the API Endpoint

```bash
# Start your dev server
npm run dev

# Test scoring endpoint
curl -X POST http://localhost:3000/api/pytorch/score-layout \
  -H "Content-Type: application/json" \
  -d '{
    "variant": {
      "id": "test-1",
      "gradient": "bg-gradient-to-br from-purple-500 to-pink-600",
      "font": "font-bold",
      "layout": "centered",
      "primaryColor": "purple",
      "theme": "creative"
    },
    "eventData": {
      "title": "Summer Music Festival",
      "description": "An amazing outdoor concert experience"
    }
  }'
```

Expected response:
```json
{
  "layoutId": "test-1",
  "aestheticScore": 85,
  "compositionScore": 85,
  "colorHarmonyScore": 88,
  "balanceScore": 82,
  "reasoning": "Excellent overall aesthetic quality, well-balanced composition, harmonious color palette"
}
```

### 2. Test in Browser

1. Create a new event
2. Go through AI generation
3. Watch for layout optimization
4. Check browser console for logs:
   ```
   Analyzing layouts...
   Generated 9 layout variants
   Scored all variants in 150ms
   Best layout: variant-0 (score: 87)
   ```

### 3. Verify Visual Changes

The optimized layout should apply:
- ✅ Gradient background changes
- ✅ Font weight adjusts
- ✅ Layout composition updates
- ✅ Score badge appears (if using LayoutSelector)

## Minimal Integration (5 minutes)

If you just want to see it work quickly:

```typescript
// Add to your CreateEventPage.tsx imports
import { getBestLayout } from '@/lib/pytorch-aesthetic-scorer'

// Add this button in Step 3
<button
  onClick={async () => {
    const best = await getBestLayout({
      title: eventData.title,
      description: eventData.description,
      location: eventData.location,
      visualStyling: eventData.visualStyling
    })
    
    alert(`Best layout score: ${best.gradient}`)
    
    setEventData(prev => ({
      ...prev,
      gradient: best.gradient
    }))
  }}
  className="px-4 py-2 bg-purple-500 text-white rounded-lg"
>
  🎨 Optimize Layout with AI
</button>
```

## Performance Tips

1. **Cache Results**: Store layout scores to avoid re-scoring
2. **Debounce**: Wait for user to finish typing before optimizing
3. **Parallel Scoring**: Score multiple layouts simultaneously
4. **Progressive Enhancement**: Show default layout immediately, optimize in background

## Troubleshooting

### Issue: Layouts not changing
- Check browser console for errors
- Verify API endpoint is responding
- Ensure eventData has title and description

### Issue: Slow performance
- Reduce number of variants (change 9 to 6)
- Add caching layer
- Use debouncing for real-time optimization

### Issue: Scores seem wrong
- Review scoring weights in `route.ts`
- Adjust color harmony mappings
- Fine-tune composition scores

## Next Steps

1. ✅ Test basic integration
2. ✅ Add LayoutSelector component
3. ✅ Collect user feedback
4. 🔄 Fine-tune scoring weights
5. 🔄 Add real PyTorch model
6. 🔄 Implement user preference learning

## Questions?

Check `PYTORCH_INTEGRATION.md` for full documentation.
