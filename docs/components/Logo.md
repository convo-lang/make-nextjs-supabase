# Logo

A lightweight SVG mark for Task Bee. The Logo component is built for flexibility and aligns with the project’s minimalist, light-hearted visual language. It inherits color by default, scales cleanly at any size, and can be integrated into headers, cards, empty states, and printed exports.

Import
```tsx
import { Logo } from "@/components/Logo";
```

Component purpose
- Brand marker for navigation, page headers, and contextual brand moments
- Neutral by default; can take on ambient text color or an explicit color
- Works in light and dark surfaces, cards, and gradient areas

API
- Props
  - color?: string
    - Sets the SVG color directly. Defaults to inherit (currentColor).
    - Accepts hex, hsl, named colors, or CSS variables like var(--forest-green).
  - className?: string
    - Tailwind classes for sizing and coloring (for example, w-6 h-6 text-zinc-800).
    - Recommended default size for general UI: w-8 h-8.
  - size?: string | number
    - Sets width and height on the SVG.
    - number is interpreted as pixels, string can be any CSS unit (for example, "1.25rem", "32px").
    - Default: 1rem.
- Notes on precedence
  - Avoid passing both size and Tailwind w-/h- classes at the same time. Choose one strategy for sizing to keep results predictable.
  - Color typically inherits from the nearest text color. Set color via text-* utilities or the color prop, but avoid both simultaneously.

Design guidance and brand usage
- Use the brand color (#f9a620ff, --orange-web) sparingly
  - Appropriate uses:
    - As a background only for the most important CTA on a page (not for the logo itself)
    - As a thin border or ring highlight around a logo container when you need emphasis that isn’t a primary CTA (for example, brand-border-thin, brand-ring)
  - Preferred logo color in most contexts: neutral text colors (text-zinc-700/800) or the secondary color (--forest-green)
- Spacing and composition
  - Place the logo alongside text using a horizontal stack with items-center and modest gaps (for example, gap-2)
  - Keep generous negative space and rounded edges for containers (for example, card, brand-frame)
  - On gradient backgrounds, ensure sufficient contrast for the logo color (for example, text-white or text-zinc-900 depending on gradient)

Recommended sizes by context
- Navigation and toolbars: 24px (w-6 h-6)
- Cards and small badges: 20px (w-5 h-5)
- Page headers or hero frames: 48px (w-12 h-12)

Basic usage
```tsx
import { Logo } from "@/components/Logo";

export function AppNav() {
    return (
        <header className="app-container section-pad">
            <a href="/" className="flex items-center gap-2">
                <Logo className="w-6 h-6 text-zinc-800" />
                <span className="font-semibold">Task Bee</span>
            </a>
        </header>
    );
}
```

Sizing with the size prop
```tsx
// Number => pixels, string => any CSS unit
<Logo size={24} />           // 24px
<Logo size="1.5rem" />       // 1.5rem
<Logo size="2.75rem" />      // 2.75rem
```

Sizing with Tailwind (recommended for consistency)
```tsx
// Prefer Tailwind width/height utilities for standard sizing tokens
<Logo className="w-5 h-5" />
<Logo className="w-6 h-6" />
<Logo className="w-12 h-12" />
```

Controlling color
```tsx
// Inherit from parent text color (default)
<div className="text-zinc-800">
    <Logo className="w-6 h-6" />
</div>

// Explicit Tailwind text color
<Logo className="w-6 h-6 text-zinc-700" />

// Using CSS variables from the palette
<Logo className="w-6 h-6" style={{ color: "var(--forest-green)" }} />

// Using the color prop directly
<Logo size={28} color="#548c2f" />
```

Brand-safe highlights (non-CTA)
```tsx
// Subtle highlight around a logo without using brand as a background
<div className="card brand-border-thin inline-flex items-center gap-2 p-3">
    <Logo className="w-6 h-6 text-zinc-800" />
    <span className="font-medium">Task Bee</span>
</div>

// Selection/focus moment using a ring
<div className="card brand-ring inline-flex items-center gap-2 p-3">
    <Logo className="w-6 h-6 text-zinc-800" />
    <span className="font-medium">Workspace</span>
</div>
```

Hero frame example
```tsx
<section className="bg-app">
    <div className="app-container section-pad">
        <div className="brand-frame p-6 rounded-xl inline-flex items-center gap-3">
            <Logo className="w-12 h-12 text-zinc-900" />
            <div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Task Bee</h1>
                <p className="text-zinc-600">Light-hearted task management for teams</p>
            </div>
        </div>
    </div>
</section>
```

Accessibility
- Decorative use: when the logo appears alongside adjacent text like “Task Bee”, mark it decorative
  - Add aria-hidden="true" on the SVG element if the component exposes it, or wrap the logo in an element with aria-hidden where appropriate
- Standalone link: when the logo is used as the only element inside a home link, provide a label on the link
  - Example: <a href="/" aria-label="Go to Task Bee home"><Logo … /></a>
- Title for screen readers: if you need a spoken label on the SVG, add a title element or use aria-label on the SVG

Do and don’t
- Do
  - Keep the logo neutral in most UI (text-zinc-700/800) or use the secondary green
  - Use brand-border-thin or brand-ring for emphasis instead of filling the logo with the brand color
  - Size the logo with Tailwind w-/h- classes for consistency across the app
- Don’t
  - Don’t use the brand color as a background for the logo
  - Don’t apply brand background to multiple buttons or to non-CTA elements in the same view
  - Don’t mix the size prop with Tailwind width/height utilities in the same instance

Troubleshooting
- The logo looks too small or large
  - Confirm whether you’re using size or w-/h- classes, not both; use w-6 h-6 for nav, w-12 h-12 for hero
- The color isn’t changing
  - If you provided a color prop, remove text-* classes from className to avoid overrides
  - If you rely on currentColor, set a text-* color on a parent or on the Logo itself
- Low contrast on gradients
  - Switch to text-white or a darker neutral to meet contrast guidelines

Summary
- Logo is an SVG that inherits color by default and scales cleanly
- Default size is 1rem when size isn’t provided; for UI consistency, prefer Tailwind sizing (for example, w-6 h-6)
- Follow brand rules: use brand color sparingly, and lean on borders or rings for non-CTA emphasis