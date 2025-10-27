import React from "react";

export interface LogoProps {
    color?: string;
    /**
     * Tailwind classes for sizing and coloring. Recommended: w-6 h-6 or w-8 h-8.
     * Note: Avoid mixing size prop with w-/h- classes to keep sizing predictable.
     * @default "w-8 h-8"
     */
    className?: string;
    /**
     * Sets width and height on the SVG.
     * number => pixels; string => any CSS unit (e.g., "1.5rem", "32px")
     */
    size?: string | number;
}

/**
 * Task Bee Logo
 * - Minimal, light-hearted bee mark
 * - Inherits color by default (currentColor) or use the color prop
 * - Scales cleanly; prefer Tailwind w-/h- classes for consistent sizing
 */
export function Logo({ color, className = "w-8 h-8", size }: LogoProps) {
    const resolvedSize =
        typeof size === "number" ? `${size}px` : size || "1rem";
    const stroke = color || "currentColor";

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            width={resolvedSize}
            height={resolvedSize}
            className={className}
            role="img"
        >
            {/* Bee - friendly minimal outline. Uses currentColor or provided color for strokes. */}
            <g
                fill="none"
                stroke={stroke}
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                {/* Wings */}
                <ellipse cx="26" cy="14" rx="7" ry="5" />
                <ellipse cx="34" cy="16" rx="6" ry="4" />

                {/* Head */}
                <circle cx="14" cy="24" r="5" />

                {/* Antennae */}
                <path d="M12 18 L9 14" />
                <path d="M16 18 L19 14" />

                {/* Body */}
                <ellipse cx="28" cy="24" rx="12" ry="9" />

                {/* Stripes */}
                <path d="M22 16.5 L22 31.5" />
                <path d="M26 15.6 L26 32.4" />
                <path d="M30 16.5 L30 31.5" />
                <path d="M34 18 L34 30" />

                {/* Stinger */}
                <path d="M40 24 L44 22 M40 24 L44 26" />
            </g>
        </svg>
    );
}