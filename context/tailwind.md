# Tailwind
Always be sure to use Tailwind v4 syntax

## Top level imports
The top of the globals.css file should be formatted as the following:
``` css
@import url("https://fonts.googleapis.com/css2?{QUEREY_PARAMS_HERE}");
@import "tailwindcss";
@plugin "@tailwindcss/typography";
```

Additional plugins may be added after the `@tailwindcss/typography` plugin.

## Utility classes
Tailwind utility classes must be defined using `@utility` directive instead of the older v3 method
of using `@layer utility`. Any class used in an `@apply` directive must be defined as a utility
class, classed defined in `@layer components` can not be used in the `@apply` directive.

Utility classes can not use Pseudo-class or Pseudo-element selectors. Pseudo selectors should be
apply in the class name of the element using the utility class or in the components applying the
utility

## Components
If a component has multiple variants with shared styles define a "base" utility class to apply to
the variants.

Utility and component class example:
``` css
@utility btn-base{
    border:1px solid var(--border-color);
}

@layer components{
    .btn{
        @apply btn-base;
    }
}
```