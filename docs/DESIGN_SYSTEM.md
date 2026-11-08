# Wedding Website Design System

## Design Intent
The website follows a premium light heritage editorial direction inspired by Indian wedding stationery.

## Core Principles
- Light-first visual identity with warm paper surfaces.
- Clear bilingual readability for Hindi and English.
- Restrained ornamentation that supports content.
- Mobile-first spacing and interaction targets.
- Minimal motion used for clarity, not decoration.

## Color Tokens
Defined in src/app/globals.css.

### Foundational
- Warm Ivory: #F7F2E9
- Paper White: #FFFCF7
- Warm Sand: #E9DFD2
- Deep Ink: #302725
- Muted Brown: #75665D
- Deep Wine: #713D46
- Muted Burgundy: #8A535A
- Antique Brass: #A58A61
- Soft Rose: #D8BEB5
- Warm Border: #DED3C5

### Semantic
- --background
- --foreground
- --primary
- --secondary
- --accent
- --surface
- --surface-elevated
- --muted
- --muted-strong
- --border
- --border-strong
- --focus
- --input-bg
- --input-border
- --success
- --warning
- --error

## Typography
Configured through next/font in src/app/layout.tsx.

- Display serif (English): Cormorant Garamond
- Display serif (Hindi): Noto Serif Devanagari
- UI/body sans-serif: DM Sans

Guidelines:
- Use serif for ceremonial headings and highlights.
- Use sans for body content and controls.
- Keep heading scale restrained on mobile.

## Spacing and Layout
- Mobile-first single-column flow.
- Minimum interactive target: 44px.
- Avoid horizontal overflow at 320px and 390px widths.
- Preserve moderate line lengths for bilingual text blocks.

## Reusable Component Styles
Defined in src/app/globals.css.

- editorial-panel
- editorial-surface
- form-card
- royal-invitation-frame
- royal-divider
- field, field--phone, field--phone-input
- btn-primary, btn-secondary, btn-outline, btn-ghost
- input-label and label helpers
- error-text, success-text

## Registration-Specific Classes
- party-option, party-option--selected
- guest-entry, guest-entry--new, guest-entry--removing
- guest-remove-btn
- file-chip
- consent-card
- review-panel, review-item
- language-menu, language-menu__item, language-menu__item--active

## Motion Rules
Allowed:
- Short 120-220ms transitions for form and menu states.
- Guest add/remove transitions.

Disallowed:
- Continuous decorative animation.
- Animated borders and floating motifs.

Reduced motion:
- Honor prefers-reduced-motion by removing non-essential animations.

## Accessibility
- Keep visible focus styles on all interactive controls.
- Maintain AA-level contrast for text and controls.
- Do not rely on color alone for validation and status.
- Keep decorative SVG layers aria-hidden.

## Functional Boundaries
Visual redesign must never alter:
- Form validation rules and schema behavior.
- Contact formatting and +91 normalization.
- Guest list limits and behavior.
- Aadhaar file validation constraints.
- Encryption and server integration contracts.
