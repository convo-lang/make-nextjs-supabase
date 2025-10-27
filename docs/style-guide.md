# Task Bee UI Style Guide

This guide shows how to use the Tailwind v4 theme and utilities defined in tailwind-theme to build a minimal, light-hearted interface with generous negative space, gradient backgrounds, and rounded surfaces.

Key principles
- Use the brand color (#f9a620ff) sparingly. It should primarily appear:
  - As the background of the most important CTA only
  - As a thin border or subtle ring highlight when an element needs attention but is not a primary CTA
- Prefer stacked, columnar layouts for responsiveness
- Keep copy short; avoid long button labels
- Do not set fixed widths on buttons that contain text
- Use gentle gradients, soft shadows, and rounded corners

Typography and surfaces
- Headings use the Nunito family and body text uses Inter
- Default surface styles: .surface and .card for low-contrast panels
- Prose content like task descriptions and exports use .markdown

Layout utilities
- app-container centers and bounds page content
- page-stack creates a vertical flow with consistent gaps
- section-pad provides vertical rhythm
- full-bleed allows content to span edge-to-edge


Getting started

- Ensure your global stylesheet includes top-level Tailwind v4 imports and the @plugin line:
  - @import "tailwindcss";
  - @plugin "@tailwindcss/typography";
- Use the pre-defined utilities and components from the theme; avoid redefining them unless necessary
- Favor .btn-primary only for the page’s single most important CTA

Example: Landing hero with gradient background

```html
<section class="bg-app">
    <div class="app-container section-pad">
        <div class="page-stack items-center text-center">
            <h1 class="text-4xl md:text-6xl font-extrabold tracking-tight">
                Task Bee — Light-hearted task management for teams
            </h1>
            <p class="text-zinc-600 max-w-2xl">
                Capture, organize, complete, and archive tasks with rich markdown and simple sharing.
            </p>

            <div class="flex items-center gap-3">
                <!-- Primary CTA: use brand background only here -->
                <button class="btn-primary">
                    Get started
                </button>
                <!-- Secondary and Ghost for supporting actions -->
                <a class="btn-secondary" href="#features">See features</a>
                <a class="btn-ghost" href="/sign-in">Sign in</a>
            </div>

            <div class="brand-frame max-w-3xl w-full p-6">
                <p class="text-sm text-zinc-600">
                    Tip: Reserve the brand color for the most important CTA or thin highlight borders.
                </p>
            </div>
        </div>
    </div>
</section>
```

Example: Page shell with centered content

```html
<main class="page--DashboardPage page--full">
    <header class="app-container section-pad">
        <div class="flex items-center justify-between">
            <h2 class="text-2xl font-bold">Dashboard</h2>
            <div class="flex items-center gap-2">
                <a class="btn-ghost" href="/account">Account</a>
                <a class="btn-secondary" href="/profile">Profile</a>
            </div>
        </div>
    </header>

    <section class="page-container">
        <div class="page-stack">
            <div class="flex items-center justify-between">
                <div>
                    <h3 class="text-xl font-semibold">Tasks</h3>
                    <p class="text-zinc-600">Create and manage tasks for your team</p>
                </div>
                <!-- Important action: primary CTA -->
                <button class="btn-primary">New Task</button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <!-- Task card -->
                <article class="card card--hover">
                    <div class="flex items-start justify-between">
                        <h4 class="font-semibold">Launch checklist</h4>
                        <span class="badge">Active</span>
                    </div>
                    <p class="mt-2 text-zinc-600">Finalize copy, visuals, and rollout plan.</p>
                    <div class="mt-4 flex items-center gap-2">
                        <button class="btn-secondary">Mark complete</button>
                        <button class="btn-ghost">Archive</button>
                    </div>
                </article>

                <!-- Completed -->
                <article class="card">
                    <div class="flex items-start justify-between">
                        <h4 class="font-semibold">Write onboarding docs</h4>
                        <span class="badge--success">Completed</span>
                    </div>
                    <p class="mt-2 text-zinc-600">Add task details and markdown examples.</p>
                    <div class="mt-4 flex items-center gap-2">
                        <button class="btn-ghost">View</button>
                    </div>
                </article>

                <!-- Subtle highlight using brand-border-thin (not a main CTA) -->
                <article class="card brand-border-thin">
                    <div class="flex items-start justify-between">
                        <h4 class="font-semibold">Retro notes</h4>
                        <span class="badge">Active</span>
                    </div>
                    <p class="mt-2 text-zinc-600">Collect wins and improvements.</p>
                    <div class="mt-4 flex items-center gap-2">
                        <button class="btn-secondary">Open</button>
                    </div>
                </article>
            </div>
        </div>
    </section>
</main>
```

Buttons

- .btn-primary: Use for the single most important CTA on a page
- .btn-secondary: For common actions
- .btn-ghost: For low emphasis actions, dismissals, navigation
- .btn-icon: For square icon-only buttons

Examples

```html
<div class="flex flex-wrap items-center gap-3">
    <button class="btn-primary">Create task</button>
    <button class="btn-secondary">Export</button>
    <button class="btn-ghost">Share</button>

    <!-- Icon-only button (e.g., archive) -->
    <button class="btn-icon" aria-label="Archive">
        <!-- Replace with your SVG icon -->
        <svg class="w-5 h-5 text-zinc-700" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M6 7v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7" stroke="currentColor" stroke-width="1.5"/></svg>
    </button>

    <!-- Disabled state -->
    <button class="btn-primary" disabled>Submitting…</button>
</div>
```

Inputs and forms

Use .input, .textarea, and .select. Focus states are built-in and use a subtle brand ring. Invalid state can be toggled with aria-invalid="true" or .invalid.

```html
<form class="card max-w-xl space-y-4">
    <div>
        <label class="block text-sm font-medium mb-1">Title</label>
        <input class="input" placeholder="Enter task title" />
    </div>

    <div>
        <label class="block text-sm font-medium mb-1">Status</label>
        <select class="select">
            <option>Active</option>
            <option>Completed</option>
            <option>Archived</option>
        </select>
    </div>

    <div>
        <label class="block text-sm font-medium mb-1">Details (Markdown)</label>
        <textarea class="textarea h-40" placeholder="Write markdown details here..."></textarea>
    </div>

    <!-- Example invalid input -->
    <div>
        <label class="block text-sm font-medium mb-1">Assignee</label>
        <input class="input" aria-invalid="true" placeholder="Required field" />
        <p class="mt-1 text-sm text-red-600">This field is required</p>
    </div>

    <div class="flex items-center gap-2">
        <button class="btn-primary">Save</button>
        <button class="btn-ghost" type="button">Cancel</button>
    </div>
</form>
```

Links

Links use the secondary color and a subtle underline by default. Use .link--muted for low emphasis and .link--brand for brand moments.

```html
<p class="text-zinc-700">
    Need help? <a class="link" href="/docs">Read the docs</a> or
    <a class="link link--muted" href="/support">contact support</a>.
</p>
```

Badges and status

- .badge for a neutral label
- .badge--success for completed or success states

```html
<div class="flex items-center gap-2">
    <span class="badge">Active</span>
    <span class="badge--success">Completed</span>
</div>
```

Avatars

Use .avatar and apply sizing with width and height classes.

```html
<div class="flex items-center gap-3">
    <div class="avatar w-10 h-10">
        <img class="w-full h-full rounded-full object-cover" src="https://placehold.co/80x80" alt="User avatar" />
    </div>
    <div>
        <div class="font-medium">Alex Rivera</div>
        <div class="text-sm text-zinc-600">Manager</div>
    </div>
</div>
```

Brand highlights (non-CTA)

Use brand-border-thin for soft emphasis or brand-ring for a focus/selection style highlight without using brand background.

```html
<!-- Thin border highlight -->
<div class="card brand-border-thin">
    <div class="flex items-center justify-between">
        <h4 class="font-semibold">Share link</h4>
        <span class="badge">Info</span>
    </div>
    <p class="mt-2 text-zinc-600 break-all">
        https://app.taskbee.io/task/123
    </p>
    <div class="mt-4 flex items-center gap-2">
        <button class="btn-secondary">Copy</button>
        <button class="btn-ghost">Open</button>
    </div>
</div>

<!-- Brand ring style selection (e.g., selected card) -->
<div class="card brand-ring">
    <p class="text-zinc-700">This task is currently selected.</p>
</div>
```

Dividers and sections

Use divider to separate blocks of content.

```html
<section class="card">
    <h3 class="text-lg font-semibold">Task details</h3>
    <p class="text-zinc-600">Context and meta information for the task.</p>

    <div class="my-4 divider"></div>

    <ul class="list-disc pl-6 text-zinc-700 space-y-1">
        <li>Created by: Alex Rivera</li>
        <li>Account: Bee Org</li>
        <li>Last updated: Today</li>
    </ul>
</section>
```

Markdown

Wrap rendered Markdown content in .markdown to enable readable typography, code blocks, and blockquotes.

```html
<article class="card">
    <div class="markdown">
        <h2>Release notes</h2>
        <p>We added <code>export as .md</code> and improved task previews.</p>
        <pre><code>// Example snippet
function focusTask(id) {
    console.log("Focusing task", id);
}
</code></pre>
        <blockquote>
            Smooth and clear – love the preview mode!
        </blockquote>
        <p>Learn more in the <a href="/docs">docs</a>.</p>
    </div>
</article>
```

Backgrounds

- bg-app for subtle brand-flavored page backgrounds
- bg-surface-soft for elevated panels or hero frames

```html
<section class="bg-app">
    <div class="app-container section-pad">
        <div class="card bg-surface-soft">
            <h3 class="text-xl font-semibold">Welcome back</h3>
            <p class="text-zinc-600">Here’s what’s happening in your workspace.</p>
        </div>
    </div>
</section>
```

Page modes

- Use page--full to ensure the page fills the viewport height
- When a page needs edge-to-edge content (e.g., fullscreen editor), apply page--no-margins to the root and rely on .page-container overrides

```html
<!-- Full-height page -->
<main class="page--TaskDetailPage page--full">
    <section class="page-container">
        <div class="page-stack">
            <!-- Title and actions -->
            <div class="flex items-center justify-between">
                <h1 class="text-2xl font-bold">Task: Update docs</h1>
                <div class="flex gap-2">
                    <button class="btn-secondary">Mark complete</button>
                    <button class="btn-ghost">Archive</button>
                </div>
            </div>

            <!-- Content -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <aside class="card">
                    <h4 class="font-semibold">Metadata</h4>
                    <dl class="mt-2 text-sm text-zinc-700 space-y-1">
                        <div class="flex justify-between"><dt>Status</dt><dd>Active</dd></div>
                        <div class="flex justify-between"><dt>Account</dt><dd>Bee Org</dd></div>
                        <div class="flex justify-between"><dt>Owner</dt><dd>Alex</dd></div>
                    </dl>
                </aside>
                <article class="card lg:col-span-2">
                    <div class="markdown">
                        <h2>Details</h2>
                        <p>Use preview mode to verify headings, code, and links.</p>
                    </div>
                </article>
            </div>
        </div>
    </section>
</main>
```

Tables and dense data

Prefer cards and lists. If a table is necessary, maintain generous spacing and clear dividers.

```html
<div class="card overflow-x-auto">
    <table class="w-full text-left text-sm">
        <thead class="text-zinc-600">
            <tr class="border-b border-zinc-200">
                <th class="py-2">Title</th>
                <th class="py-2">Status</th>
                <th class="py-2">Updated</th>
                <th class="py-2"></th>
            </tr>
        </thead>
        <tbody class="text-zinc-800">
            <tr class="border-b border-zinc-100">
                <td class="py-2">Finalize landing copy</td>
                <td class="py-2"><span class="badge">Active</span></td>
                <td class="py-2 text-zinc-600">1h ago</td>
                <td class="py-2 text-right">
                    <button class="btn-ghost">Open</button>
                </td>
            </tr>
            <tr>
                <td class="py-2">Add export markdown</td>
                <td class="py-2"><span class="badge--success">Completed</span></td>
                <td class="py-2 text-zinc-600">Yesterday</td>
                <td class="py-2 text-right">
                    <button class="btn-ghost">View</button>
                </td>
            </tr>
        </tbody>
    </table>
</div>
```

Do and don’t

- Do
  - Use .btn-primary once per page for the most important CTA
  - Use brand-border-thin or brand-ring for non-CTA highlights
  - Prefer vertical stacks and cards for structure
  - Keep inputs full width within forms
- Don’t
  - Don’t use the brand color as a background on multiple buttons in the same view
  - Don’t set fixed widths on text buttons
  - Don’t overload cards with dense borders and shadows

Accessibility tips

- Ensure sufficient contrast on text and icons over gradients and surfaces
- Label icon-only buttons with aria-label
- Use semantic HTML for lists, headings, and buttons
- Make focusable elements visible; the theme provides a brand-tinted focus ring on inputs and buttons

Print-friendly markdown

- The theme includes a print stylesheet for .markdown
- Hide non-essential UI with .no-print when printing exports

```html
<article class="markdown">
    <h1>Task: Sprint plan</h1>
    <p class="no-print text-zinc-600">This header note won’t appear in print.</p>
    <p>Printed pages use a clean, high-contrast layout.</p>
</article>
```

Quick reference: commonly used utilities

- Layout: app-container, page-stack, section-pad, full-bleed
- Surfaces: surface, card, card--hover, surface-gradient
- CTAs: btn-primary, btn-secondary, btn-ghost, btn-icon
- Inputs: input, textarea, select, input-focus-ring, input-invalid
- Text and links: link, link--muted, link--brand
- Indicators: badge, badge--success, divider, avatar
- Brand accents: brand-border-thin, brand-ring, brand-frame
- Backgrounds: bg-app, bg-surface-soft
- Prose: markdown

Example: Account header with members

```html
<header class="page-container">
    <div class="card">
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
                <div class="avatar w-12 h-12">
                    <img class="w-full h-full rounded-full object-cover" src="https://placehold.co/96" alt="Account logo" />
                </div>
                <div>
                    <h2 class="text-xl font-semibold">Bee Org</h2>
                    <p class="text-sm text-zinc-600">ID: 3fd7…9b2</p>
                </div>
            </div>
            <div class="flex items-center gap-2">
                <button class="btn-secondary">Edit</button>
                <button class="btn-primary">Invite</button>
            </div>
        </div>

        <div class="divider my-4"></div>

        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            <a class="card card--hover" href="/profile/123">
                <div class="flex items-center gap-3">
                    <div class="avatar w-10 h-10">
                        <img class="w-full h-full rounded-full object-cover" src="https://placehold.co/80" alt="Member" />
                    </div>
                    <div class="font-medium">Alex Rivera</div>
                </div>
            </a>
            <a class="card card--hover" href="/profile/456">
                <div class="flex items-center gap-3">
                    <div class="avatar w-10 h-10">
                        <img class="w-full h-full rounded-full object-cover" src="https://placehold.co/80" alt="Member" />
                    </div>
                    <div class="font-medium">Casey Lee</div>
                </div>
            </a>
            <!-- More members... -->
        </div>
    </div>
</header>
```

Example: Task detail with edit/preview chrome

```html
<section class="page-container">
    <div class="page-stack">
        <div class="card">
            <div class="flex items-center justify-between">
                <h1 class="text-2xl font-bold">Add export to Markdown</h1>
                <div class="flex items-center gap-2">
                    <button class="btn-secondary">Mark complete</button>
                    <button class="btn-ghost">Archive</button>
                    <button class="btn-secondary">Download .md</button>
                </div>
            </div>

            <div class="divider my-4"></div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <!-- Editor -->
                <div class="card bg-surface-soft">
                    <h3 class="font-semibold mb-2">Edit</h3>
                    <textarea class="textarea h-64" placeholder="# Heading
Write details in markdown..."></textarea>
                </div>

                <!-- Preview -->
                <div class="card">
                    <h3 class="font-semibold mb-2">Preview</h3>
                    <div class="markdown">
                        <h2>Heading</h2>
                        <p>Write details in markdown…</p>
                        <ul>
                            <li>Bulleted lists</li>
                            <li>Inline <code>code</code></li>
                            <li>Links and quotes</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <!-- Subtle highlight (non-CTA) using brand border -->
        <div class="card brand-border-thin">
            <div class="flex items-center justify-between">
                <p class="text-zinc-700">Share a link to this task with teammates.</p>
                <button class="btn-secondary">Copy link</button>
            </div>
        </div>
    </div>
</section>
```

With these utilities and patterns, you can quickly assemble cohesive, brand-consistent interfaces that feel focused and friendly, while keeping the brand color special and sparingly used.