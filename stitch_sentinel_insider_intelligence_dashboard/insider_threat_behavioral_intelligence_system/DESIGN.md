---
name: Insider Threat Behavioral Intelligence System
colors:
  surface: '#111318'
  surface-dim: '#111318'
  surface-bright: '#37393e'
  surface-container-lowest: '#0c0e12'
  surface-container-low: '#1a1c20'
  surface-container: '#1e2024'
  surface-container-high: '#282a2e'
  surface-container-highest: '#333539'
  on-surface: '#e2e2e8'
  on-surface-variant: '#bac9cc'
  inverse-surface: '#e2e2e8'
  inverse-on-surface: '#2f3035'
  outline: '#849396'
  outline-variant: '#3b494c'
  surface-tint: '#00daf3'
  primary: '#c3f5ff'
  on-primary: '#00363d'
  primary-container: '#00e5ff'
  on-primary-container: '#00626e'
  inverse-primary: '#006875'
  secondary: '#b0c6ff'
  on-secondary: '#002d6e'
  secondary-container: '#0068ed'
  on-secondary-container: '#f2f3ff'
  tertiary: '#ffe7e2'
  on-tertiary: '#621100'
  tertiary-container: '#ffc2b3'
  on-tertiary-container: '#aa2600'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#9cf0ff'
  primary-fixed-dim: '#00daf3'
  on-primary-fixed: '#001f24'
  on-primary-fixed-variant: '#004f58'
  secondary-fixed: '#d9e2ff'
  secondary-fixed-dim: '#b0c6ff'
  on-secondary-fixed: '#001945'
  on-secondary-fixed-variant: '#00429b'
  tertiary-fixed: '#ffdad2'
  tertiary-fixed-dim: '#ffb4a2'
  on-tertiary-fixed: '#3c0700'
  on-tertiary-fixed-variant: '#8a1d00'
  background: '#111318'
  on-background: '#e2e2e8'
  surface-variant: '#333539'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-lg:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  container-padding-desktop: 24px
  container-padding-mobile: 16px
  gutter: 16px
  component-gap-sm: 8px
  component-gap-md: 16px
---

## Brand & Style
The design system is engineered for high-stakes Security Operations Center (SOC) environments. The brand personality is authoritative, vigilant, and analytical, prioritizing rapid information synthesis and "eyes-on-glass" endurance. 

The aesthetic is a refined **Corporate Glassmorphism**. It blends the structural reliability of enterprise software with the depth and sophistication of modern cybersecurity interfaces. By utilizing translucent layers and background blurs, the system maintains a sense of hierarchy without overwhelming the user with heavy solid blocks. Visuals are characterized by precision, utilizing thin 1px borders and subtle glows to highlight critical data paths and active threat vectors.

## Colors
The color strategy employs a "Deep Space" palette to minimize eye strain during long shifts. 

- **Primary (Cyan):** Used for active states, primary actions, and "safe" data visualizations. Its high luminosity ensures it vibrates against the dark background.
- **Secondary (Blue):** Used for informational accents, link text, and secondary data series.
- **Tertiary (Red-Orange):** Reserved strictly for high-severity alerts and destructive actions.
- **Neutral/Background:** A foundation of Rich Black (#0A0C10) and Deep Navy (#12161F) provides the canvas for glassmorphic effects.
- **Functional Colors:** Success (Green-A400), Warning (Amber-400), and Info (Light Blue-300) follow standard SOC semiotics.

## Typography
The system uses **Inter** for all UI elements and body text to ensure maximum legibility at small sizes. For technical data, telemetry, and code-based logs, **JetBrains Mono** is employed to provide a clear distinction between narrative UI and raw machine data.

- **Headlines:** Use tighter letter spacing and semi-bold weights to create a strong visual anchor.
- **Labels:** Monospaced labels are used for "metadata" (e.g., timestamps, IP addresses, hash values) to maintain character alignment in dense tables.
- **Density:** Line heights are kept tight (approx 1.4x) to accommodate the high-density requirements of a professional dashboard.

## Layout & Spacing
This design system utilizes a **12-column fluid grid** for desktop and a **4-column fluid grid** for mobile. 

- **Density:** High-density layout is the default. Information is packed tightly but categorized through clear containment and glassmorphic separation.
- **Rhythm:** A 4px baseline grid governs all spacing.
- **Sidebar:** A fixed 280px navigation rail on the left (collapsible to 64px) ensures constant access to high-level modules (Dashboard, Alerts, Hunting, Forensics).
- **Responsive Behavior:** On tablet, the 12-column grid collapses to 8. On mobile, charts and data tables reflow into vertical stacks or horizontally scrollable containers with frozen primary columns.

## Elevation & Depth
Depth is communicated through **Translucency and Outlines** rather than heavy shadows.

- **Surface Layers:** The base layer is the darkest. Elevated surfaces (cards, modals) use a semi-transparent fill (80-90% opacity) with a `20px` background blur (backdrop-filter).
- **Borders:** Every elevated element features a 1px solid border. Use `rgba(255, 255, 255, 0.08)` for standard containers and `rgba(0, 229, 255, 0.2)` for active or "Hot" containers.
- **Glows:** High-severity elements use a subtle outer glow (box-shadow: 0 0 15px rgba(255, 61, 0, 0.15)) to draw immediate attention without breaking the flat-glass aesthetic.

## Shapes
The shape language is "Soft-Industrial." Radii are kept small to maintain a professional, technical feel, avoiding the overly-playful nature of highly rounded consumer apps.

- **Standard Elements:** 4px (0.25rem) radius for buttons, input fields, and small cards.
- **Large Containers:** 8px (0.5rem) radius for main dashboard panels and modals.
- **Badges:** Fully pill-shaped for status indicators to contrast against the rectangular grid.

## Components
Consistent styling across components reinforces the SOC aesthetic:

- **Buttons:** 
  - *Primary:* Solid Cyan with black text for maximum contrast.
  - *Secondary:* Ghost style with 1px Cyan border and subtle hover fill.
- **Data Tables:** High-density rows (32px-40px height). Zebra striping using subtle opacity shifts. Headers use `label-sm` in all-caps with `JetBrains Mono`.
- **Professional Cards:** Glassmorphic background with a top-aligned "accent bar" (1px height) that changes color based on the data status (e.g., Red for Critical Threat).
- **Input Fields:** Darker than the surface color, 1px border that glows Cyan on focus. Labels are positioned above the field in `label-md`.
- **Status Badges:** Small, high-contrast pills. Use "Glow Dots" (4px circles with box-shadow) next to text to indicate real-time connectivity or system health.
- **Charts:** Use thin lines (1.5px) for sparklines and area charts with a gradient fill that fades to 0% opacity at the baseline.