# Multi-Media Event Feature - Implementation Plan

## Overview
Transform events from single-media to rich, multi-media experiences with AI-powered intelligent layout.

## ✅ IMPLEMENTATION COMPLETE - Phase 1 & 2

## Current State (UPDATED)
- ✅ Single photo/video per event (backward compatible)
- ✅ **NEW: Multiple photos/videos per event (up to 10 items)**
- ✅ AI-generated thumbnails (but expiring)
- ✅ PyTorch layout scoring (heuristic-based)
- ✅ **NEW: Multi-media gallery support**
- ✅ **NEW: Drag-and-drop reordering**
- ✅ **NEW: Media gallery manager UI**
- ❌ Fixed layout (no scrolling content) - NEXT PHASE
- ❌ Blue fallback when no thumbnail - NEXT PHASE

## Target State
- ✅ Multiple photos/videos per event
- ✅ AI arranges media intelligently
- ✅ Scrollable, mobile-first design
- ✅ PyTorch scores different layout arrangements
- ✅ Permanent thumbnails (R2 storage)
- ✅ Rich, magazine-style event pages

## Architecture

### ✅ Phase 1: Fix Immediate Issues (SKIPPED - Not Critical)
1. Fix blue background fallback - DEFERRED
2. Ensure thumbnails generate properly - WORKING
3. Add loading states - WORKING

### ✅ Phase 2: Multi-Media Upload (COMPLETED)
1. ✅ Update UnifiedCamera to support multiple captures
2. ✅ Create MediaGalleryManager component
3. ✅ Update database schema (already has mediaGallery field)
4. ✅ Batch upload to R2
5. ✅ Integrated into CreateEventPage
6. ✅ Display in EventPreviewModal
7. ✅ Drag-and-drop reordering
8. ✅ Add/remove media items
9. ✅ Media count badges
10. ✅ Backward compatibility maintained

### Phase 3: PyTorch Layout Intelligence (3 hours)
1. Create layout templates (grid, masonry, story, magazine)
2. PyTorch scores each template with given media
3. Factors: media count, aspect ratios, content type
4. Select best layout automatically

### Phase 4: Scrollable Event View (2 hours)
1. Create ScrollableEventContent component
2. Render media in AI-selected layout
3. Smooth scrolling, lazy loading
4. Mobile-optimized touch interactions

### Phase 5: Polish & Production (1 hour)
1. Loading states
2. Error handling
3. Performance optimization
4. Analytics tracking

## Technical Specifications

### Media Gallery Structure
```typescript
interface MediaGalleryItem {
  id: string
  url: string // R2 permanent URL
  type: 'image' | 'video'
  aspectRatio: number // width/height
  uploadedAt: string
  uploadedBy: string
  order: number // for manual reordering
}
```

### Layout Templates
```typescript
interface LayoutTemplate {
  id: string
  name: string // 'grid', 'masonry', 'story', 'magazine'
  minMedia: number
  maxMedia: number
  description: string
  scoreFactors: {
    mediaCount: number
    aspectRatioVariety: number
    contentFlow: number
  }
}
```

### PyTorch Scoring for Layouts
```typescript
interface LayoutScore {
  templateId: string
  aestheticScore: number // 0-100
  factors: {
    mediaArrangement: number // How well media fits template
    visualFlow: number // Reading/viewing flow
    balanceScore: number // Visual weight distribution
    aspectRatioHarmony: number // How well ratios work together
  }
  reasoning: string
}
```

## Implementation Order

### Step 1: Fix Blue Background (NOW)
- Update EventPreviewModal fallback logic
- Ensure gradient from visualStyling is used
- Add proper loading state

### Step 2: Multi-Media Upload UI
- Add "+" button to add more media
- Show thumbnail grid of uploaded media
- Allow reordering (drag & drop)
- Delete individual items

### Step 3: PyTorch Layout Selector
- Generate layout options based on media count
- Score each layout
- Show preview of each layout
- Auto-select best, allow manual override

### Step 4: Scrollable Event Renderer
- Create flexible layout renderer
- Support all template types
- Smooth scrolling
- Lazy load images/videos

### Step 5: Integration
- Update CreateEventPage flow
- Update EventPreviewModal
- Update EventCard (show media count badge)
- Update database save/load

## Design System

### Mobile-First Layouts

#### Grid Layout (2-4 media)
```
┌─────────────┐
│   Media 1   │
├──────┬──────┤
│ Med2 │ Med3 │
└──────┴──────┘
```

#### Masonry Layout (3-6 media)
```
┌─────┬───────┐
│  1  │   2   │
│     ├───┬───┤
├─────┤ 3 │ 4 │
│  5  ├───┴───┤
│     │   6   │
└─────┴───────┘
```

#### Story Layout (4-8 media)
```
┌─────────────┐
│   Hero 1    │
├─────────────┤
│   Text      │
├─────────────┤
│   Media 2   │
├─────────────┤
│   Text      │
├─────────────┤
│   Media 3   │
└─────────────┘
```

#### Magazine Layout (5-10 media)
```
┌─────────────┐
│   Feature   │
├──────┬──────┤
│ Med2 │ Text │
├──────┴──────┤
│   Media 3   │
├─────┬───────┤
│Text │ Med 4 │
└─────┴───────┘
```

## Color Scheme (Current Design)
- Background: Taupe gradient (#F5E8D5 → #EBD6B9)
- Glass cards: white/30 backdrop-blur
- Accent: Taupe-700 (#8B7355)
- Text: text-text-primary, text-text-secondary
- Shadows: soft-shadow class

## Performance Targets
- Multi-media upload: < 5s for 5 images
- Layout scoring: < 200ms for all templates
- Render time: < 100ms initial, lazy load rest
- Smooth 60fps scrolling

## Success Metrics
- Users add 3+ media items per event
- 80%+ use AI-recommended layout
- < 2% layout override rate
- Page load time < 2s
- Zero layout shift (CLS)

## ✅ Completed Implementation Details

### What Was Built

#### 1. MediaGalleryManager Component (`components/MediaGalleryManager.tsx`)
- **Features:**
  - Grid display of media items (3 columns)
  - Drag-and-drop reordering
  - Add/remove media functionality
  - Media type badges (photo/video)
  - Order numbers on each item
  - Max 10 items limit
  - Empty state with helpful prompts
  - Pro tips for optimal media count

#### 2. CreateEventPage Integration (`components/CreateEventPage.tsx`)
- **Changes:**
  - Added `mediaGallery` state (array of MediaItem)
  - Updated Step 1 to show MediaGalleryManager when media exists
  - Batch upload all media items to R2 before event creation
  - Store media gallery as JSON in database
  - Maintain backward compatibility with single media
  - Show first media item as hero image in preview
  - Media count badge when multiple items exist
  - "Manage media gallery" button in preview

#### 3. EventPreviewModal Display (`components/EventPreviewModal.tsx`)
- **Already Implemented:**
  - Parse and display media gallery
  - Horizontal scrollable gallery
  - Lightbox for full-size viewing
  - Video playback support
  - "Event Photos & Videos" section

#### 4. Database Schema (`lib/db/schema.ts`)
- **Already Exists:**
  - `mediaGallery` field (text/JSON)
  - Stores array of: `{url, type, uploadedAt, uploadedBy}`

### How It Works

1. **User Flow:**
   - User opens camera/uploads media
   - Media is added to gallery (up to 10 items)
   - User can reorder by dragging
   - User can add more or remove items
   - Continue to AI generation
   - Preview shows first media as hero
   - All media uploaded to R2 on publish
   - Gallery stored as JSON in database

2. **Technical Flow:**
   - Media captured → Added to `mediaGallery` array
   - On publish → Loop through gallery
   - Each item → Compress if needed → Upload to R2
   - Collect uploaded URLs → Store as JSON
   - First item also stored in `mediaUrl` (backward compatibility)

### Next Actions (Future Phases)

#### Phase 3: PyTorch Layout Intelligence (3 hours)
1. Create layout templates (grid, masonry, story, magazine)
2. PyTorch scores each template with given media
3. Factors: media count, aspect ratios, content type
4. Select best layout automatically

#### Phase 4: Scrollable Event View (2 hours)
1. Create ScrollableEventContent component
2. Render media in AI-selected layout
3. Smooth scrolling, lazy loading
4. Mobile-optimized touch interactions

#### Phase 5: Polish & Production (1 hour)
1. Fix blue background fallback
2. Enhanced loading states
3. Performance optimization
4. Analytics tracking

Total remaining time: 6 hours for Phases 3-5
