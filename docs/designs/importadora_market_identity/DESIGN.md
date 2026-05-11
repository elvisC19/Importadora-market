---
name: Importadora Market Identity
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#45464d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#9d4300'
  on-secondary: '#ffffff'
  secondary-container: '#fd761a'
  on-secondary-container: '#5c2400'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#00201d'
  on-tertiary-container: '#0c9488'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#ffdbca'
  secondary-fixed-dim: '#ffb690'
  on-secondary-fixed: '#341100'
  on-secondary-fixed-variant: '#783200'
  tertiary-fixed: '#89f5e7'
  tertiary-fixed-dim: '#6bd8cb'
  on-tertiary-fixed: '#00201d'
  on-tertiary-fixed-variant: '#005049'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
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
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
  data-mono:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 32px
  stack-xs: 4px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
  stack-xl: 40px
---

## Brand & Style
The brand personality for this design system is built on the pillars of **Institutional Reliability** and **High-Performance Efficiency**. It is designed to bridge the gap between an inviting B2C storefront and a high-density B2B administrative environment. The visual language conveys a sense of stability and precision, ensuring users feel secure during financial transactions while maintaining the speed required for rapid inventory management.

The style is **Corporate / Modern**, characterized by a disciplined use of whitespace, a structured grid system, and subtle tactile cues. It avoids unnecessary ornamentation in favor of clarity and data-prominence. This design system prioritizes legibility and functional contrast to reduce cognitive load in complex dashboard scenarios.

## Colors
The palette is anchored by **Deep Professional Blue (#0F172A)**, used for primary navigation, headings, and core brand elements to establish authority. **Energetic Orange (#F97316)** serves as the primary action color, driving conversions in the storefront and highlighting critical alerts in the admin panel. **Teal (#0D9488)** is utilized for growth-oriented metrics and financial health indicators.

For administrative density, the system employs a sophisticated range of grays to differentiate surface levels. Secondary semantic tokens are strictly mapped to operational statuses:
- **Product States:** Use vibrant accents for "New" and "Offer" to draw consumer eye, while "Out of Stock" is de-saturated to signify unavailability.
- **Order Tracking:** Follows a standard traffic-light system for immediate recognition during fulfillment.
- **Financial Logic:** "Income" uses the teal tertiary for a positive growth feel, while "Expense" uses a sharp rose/red to signal outflow.

## Typography
This design system utilizes **Inter** exclusively to leverage its exceptional legibility in both large marketing headlines and small-scale UI labels. The type scale is optimized for high-density data display.

Special attention is given to **Tabular Figures** (`data-mono`) for financial tables and inventory counts, ensuring that columns of numbers align perfectly for quick scanning. Labels are often set in uppercase with slight letter-spacing to distinguish them from interactive body text. For mobile devices, display and headline sizes scale down by a factor of 0.85x to maintain readability without excessive scrolling.

## Layout & Spacing
The layout philosophy is based on a **12-column fluid grid** for desktop, transitioning to a **4-column grid** for mobile. A strict 8px base unit (the "stack") governs all padding and margins, ensuring mathematical harmony across all views.

In the administrative dashboard, the layout switches to a **Compressed Density** model, reducing vertical spacing and gutters to 16px to maximize the "above the fold" information for inventory lists and balance sheets. Storefront views utilize the **Standard Density** model with 24px-32px spacing to feel more premium and breathable.

## Elevation & Depth
Depth in this design system is communicated through **Tonal Layering** and **Precision Shadows**. Surfaces are categorized into three levels:
1.  **Level 0 (Background):** The canvas layer, typically a very light gray (#F8FAFC).
2.  **Level 1 (Cards/Containers):** Pure white surfaces with a 1px subtle border (#E2E8F0) to define boundaries in high-light environments.
3.  **Level 2 (Popovers/Modals):** Features an "Ambient Shadow"—a soft, diffused shadow (0px 10px 15px -3px rgba(15, 23, 42, 0.08)) that lifts the element without creating visual noise.

Data tables do not use shadows; they rely on 1px horizontal dividers and alternating row tints to maintain structural integrity.

## Shapes
The shape language follows a **Rounded** logic (8px/0.5rem base) to provide a modern, approachable feel while maintaining a professional "grid-aligned" look. 

- **Interactive Elements:** Buttons and input fields use the 8px radius.
- **Large Containers:** Dashboard cards and product image containers use `rounded-lg` (16px) to soften the overall interface.
- **Status Pills:** Tags for "Product States" and "Order Statuses" use a full pill shape (999px) to distinguish them from interactive buttons.

## Components
### Buttons
Buttons are high-contrast. **Primary Buttons** use the Deep Blue background with White text, while **CTAs** (like "Buy Now") use the Energetic Orange. Dashboard actions use **Ghost Buttons** (border only) to remain secondary to data.

### Cards & Metrics
Admin metrics are housed in cards with a top-accent border indicating the metric type (e.g., a 4px teal top border for "Profit"). Large-format typography is used for the primary metric value, with a smaller "label-md" for the description.

### Data Tables
Tables are the heart of the administrative view. They feature a sticky header, high-contrast text for row titles, and the `data-mono` font for all numerical values. Row hover states use a subtle blue tint (#F1F5F9) to assist eye-tracking.

### Status Badges
Status indicators (Pending, Completed, Out of Stock) are styled as "Soft Chips"—a light tinted background of the status color with high-saturation text of the same hue to ensure accessibility and clear categorization.

### Input Fields
Inputs use a 1px border that shifts to the Primary Blue on focus. Error states are clearly marked with a red border and a supporting "label-sm" error message below the field.