# SnowPing Design System

## Color Palette

### Primary Colors
- **Background**: `from-slate-950 to-slate-900` (Dark gradient)
- **Glass**: `bg-white/10 backdrop-blur-md border-white/10`
- **Glass Dark**: `bg-black/20 backdrop-blur-md border-white/5`

### Action Colors
- **Primary (Emerald)**: `bg-emerald-500 hover:bg-emerald-400`
- **Danger/SOS (Rose)**: `bg-rose-500 hover:bg-rose-400`
- **Meet (Indigo)**: `bg-indigo-500 hover:bg-indigo-400`
- **Sky Accent**: `text-sky-400`, `ring-sky-400/60`

### Status Colors
- **Online**: `bg-emerald-400`
- **Offline**: `bg-slate-500`

## Typography

### Font
- **Primary**: Inter (imported from Google Fonts)
- **Letter Spacing**: `-0.025em` (tight tracking)
- **Weights**: 300, 400, 500, 600, 700

### Text Styles
- **Heading**: `font-bold text-white tracking-tight`
- **Body**: `text-slate-300`
- **Muted**: `text-slate-400`
- **Code**: `font-mono`

## Spacing & Layout

### Safe Areas
- `pt-safe-top`, `pb-safe-bottom`, `pl-safe-left`, `pr-safe-right`

### Border Radius
- **Small**: `rounded-xl` (12px)
- **Medium**: `rounded-2xl` (16px)
- **Large**: `rounded-3xl` (24px)

### Shadows
- **Standard**: `shadow-lg shadow-black/30`
- **Elevated**: `shadow-xl shadow-black/40`
- **Colored**: `shadow-xl shadow-emerald-500/30`

## Components

### Button Classes
```css
.btn-primary     /* Emerald primary button */
.btn-secondary   /* Glass secondary button */
.btn-danger      /* Rose danger button */
.btn-meet        /* Indigo meet button */
.fab            /* Floating action button base */
```

### Glass Morphism
```css
.glass          /* Light glass effect */
.glass-dark     /* Dark glass effect */
```

### Status Indicators
```css
.status-online   /* Green online dot */
.status-offline  /* Gray offline dot */
```

## Animations

### Available Animations
- `animate-slide-up` - Slide up from bottom
- `animate-slide-down` - Slide down from top  
- `animate-fade-in` - Simple fade in
- `animate-pulse` - Pulsing effect
- `animate-spin` - Rotation

### Transitions
- **Standard**: `transition-all duration-200`
- **Smooth**: `transition-all duration-300 ease-out`

## Responsive Design

### Mobile First
- Base styles target mobile
- `md:` prefix for desktop (768px+)

### Layout Patterns
- **Mobile**: Bottom sheets, full-width cards
- **Desktop**: Side panels, floating elements

### Touch Targets
- Minimum 44px (`h-11` or `w-11`) for tappable elements
- `active:scale-95` for press feedback

## Accessibility

### Focus States
- `focus:outline-none focus:ring-2 focus:ring-sky-400/60`

### Reduced Motion
- `@media (prefers-reduced-motion: reduce)` disables animations

### Color Contrast
- White text on dark backgrounds
- High contrast status indicators
- Semi-transparent overlays for readability

## Usage Examples

### Basic Card
```tsx
<div className="glass rounded-2xl p-6">
  <h2 className="text-xl font-bold text-white mb-4">Title</h2>
  <p className="text-slate-300">Content</p>
</div>
```

### Action Button
```tsx
<button className="btn-primary">
  <Icon className="w-5 h-5 mr-2" />
  Action
</button>
```

### Status Dot
```tsx
<div className="w-4 h-4 status-online rounded-full" />
```