# Screen Description

Name: Landing page
Route: /

## Description
The Landing page is a marketing-focused home for Task Bee, designed to introduce the product’s value with a light-hearted, minimal aesthetic. It features a full-screen hero carousel that cycles through concise value propositions:
- Capture rich task details with Markdown (edit and preview)
- Stay focused with complete and archive workflows
- Share and export as Markdown
- Multi-tenant accounts with roles and invites

The hero uses generous negative space, a subtle gradient background, and rounded, low-contrast surfaces to frame content. A single primary CTA (“Get started”) leverages the brand color background, while secondary actions remain neutral. Users can manually navigate slides via arrows and pagination dots, with autoplay that pauses on hover. The carousel is fully keyboard-accessible and respects reduced motion preferences.

Below the hero, a feature overview section presents compact cards explaining core capabilities (add/remove, complete, archive, download as .md, share link), followed by a short “How it works” sequence that outlines sign-up, create tasks with Markdown, and collaborate. A light-weight testimonial or visual “brand frame” can be included to reinforce trust and show UI previews without heavy detail.

The page is responsive and uses stacked column layouts for clarity on mobile. Decorative imagery and screenshots are framed with subtle brand-border-thin accents instead of brand backgrounds. No authenticated content is shown here; it serves both guests and signed-in users as an introduction and quick path to start or sign in.

Accessibility considerations:
- Carousel controls are focusable with appropriate labels
- Pause on hover and on focus for autoplay
- Reduced motion disables slide transitions
- High-contrast text over gradients and surfaces
- Short, clear copy for screen readers

## Actions
- Advance to the next or previous hero slide
- Jump directly to a specific hero slide via pagination dots
- Trigger the primary CTA to start the registration flow
- Open a secondary action to learn more about features on the same page
- Pause/resume the carousel by interacting with controls or hovering
- Scroll to “Features” and “How it works” sections for additional product context

## Links
- None (the landing page uses in-page anchors and marketing content; contextual routes beyond main navigation are not linked from here)