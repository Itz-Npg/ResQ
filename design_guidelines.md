# Emergency Assistance Application - Design Guidelines

## Design Approach
**System**: Material Design-inspired with emergency-focused modifications
**Rationale**: Emergency applications demand immediate clarity, accessibility, and trust. Material's elevation system and status feedback patterns excel at communicating urgency and hierarchy while maintaining professional polish.

## Core Design Elements

### Typography
- **Primary Font**: Inter (Google Fonts) - exceptional readability at all sizes
- **Headings**: 600-700 weight, sizes: 3xl (36px), 2xl (24px), xl (20px)
- **Body**: 400 weight, base (16px) for content, sm (14px) for metadata
- **Status/Alerts**: 600 weight, uppercase tracking for emphasis

### Layout System
**Spacing Units**: Tailwind 4, 6, 8, 12, 16, 24
- Cards/Components: p-6 or p-8
- Section gaps: gap-6 or gap-8
- Page margins: px-4 (mobile), px-8 (tablet), px-12 (desktop)
- Max-width containers: max-w-7xl for dashboard, max-w-2xl for forms

### Component Library

**Hero Section (Landing)**
- Full-width image showing emergency responders/assistance in action
- Overlay gradient (dark to transparent, 60% opacity)
- Centered content with blurred-background CTA buttons
- Height: min-h-[600px]
- Include: Bold headline, subtitle, dual CTAs ("Request Help" primary, "Learn More" secondary)

**Dashboard Layout**
- Sidebar navigation (w-64): Logo, main nav items with icons, user profile snippet at bottom
- Main content area: Status overview cards at top (3-column grid), request list below
- Top bar: Search, notifications bell, user avatar dropdown

**Request Cards**
- White background with subtle shadow (shadow-md)
- Status badge (top-right): Color-coded pill with icon
- Layout: Request ID + timestamp header, description preview, assignee info, action buttons footer
- Spacing: p-6, gap-4 internal
- Hover: subtle lift (shadow-lg transition)

**Profile Page**
- Two-column layout (lg:grid-cols-3)
- Left sidebar (col-span-1): Avatar (large, 160px), basic info card, contact preferences card
- Right content (col-span-2): Tabbed interface (Personal Info, Request History, Settings)
- Form fields: Clean input styling with floating labels, validation states

**Status Indicators**
- Active/In Progress: Blue accent
- Pending: Amber/orange
- Resolved: Green
- Urgent: Red with pulse animation
- All use consistent badge component (rounded-full, px-3, py-1, text-sm, font-semibold)

**Navigation**
- Primary: Vertical sidebar with icons + labels
- Items: Dashboard, My Requests, New Request, Profile, Settings
- Active state: Background fill + border accent
- Icons: Heroicons (outline style for inactive, solid for active)

**Forms (New Request)**
- Single-column centered layout (max-w-2xl)
- Progressive disclosure: Essential fields visible, additional in expandable sections
- Input styling: Border-2, focus:ring treatment, helper text below
- File upload: Drag-drop zone with preview
- Submit: Primary button (w-full on mobile, auto desktop)

**Modals/Overlays**
- Backdrop blur effect
- Centered card with close button (top-right)
- Max-width: max-w-lg for confirmations, max-w-2xl for detailed views
- Padding: p-8

### Animations
**Minimal, Purposeful Only**:
- Status changes: Gentle fade + scale (200ms)
- Card hover: Translate-y lift (-2px) with shadow transition
- No scroll-triggered animations
- Button states: Built-in focus rings, no custom animations

## Images

**Hero Image**: 
- Professional photograph of emergency response team or person receiving assistance
- Conveys trust, urgency, and human connection
- Placement: Full-width background, 600-700px height
- Treatment: Slight blur overlay with gradient for text legibility

**Dashboard**: 
- Small avatar images for assigned personnel (40px circular)
- Icon-based status indicators (no decorative images)

**Profile**: 
- Large user avatar (160px circular) with upload capability
- Placeholder: Initials on colored background if no photo

**Empty States**:
- Friendly illustration for "No active requests" (simple line art, centered, 240px width)

## Critical Patterns

**Request Tracking Timeline**:
- Vertical stepper component showing request lifecycle
- Each step: Circle indicator (filled/outlined), timestamp, description, assignee
- Current step highlighted with accent color
- Spacing: gap-6 between steps

**Quick Actions Panel**:
- Fixed position (bottom-right on desktop, bottom bar on mobile)
- Floating action button: "New Request" (large, 56px, shadow-lg)
- Background: Blur effect with semi-transparent fill

**Accessibility**:
- All interactive elements: min-height 44px
- Focus indicators: 2px offset ring
- Color contrast: Minimum WCAG AA for all text
- Status communicated via text + icons, never color alone

This design prioritizes clarity and speed while maintaining professional polish essential for emergency services.