/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Core Surfaces ──
        "background": "#f8f9ff",
        "on-background": "#0b1c30",
        "surface": "#f8f9ff",
        "surface-dim": "#cbdbf5",
        "surface-bright": "#f8f9ff",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#eff4ff",
        "surface-container": "#e5eeff",
        "surface-container-high": "#dce9ff",
        "surface-container-highest": "#d3e4fe",
        "surface-variant": "#d3e4fe",
        "surface-tint": "#565e74",
        "on-surface": "#0b1c30",
        "on-surface-variant": "#45464d",
        "inverse-surface": "#213145",
        "inverse-on-surface": "#eaf1ff",

        // ── Primary (Deep Navy) ──
        "primary": "#0f172a",
        "on-primary": "#ffffff",
        "primary-container": "#131b2e",
        "on-primary-container": "#7c839b",
        "inverse-primary": "#bec6e0",
        "primary-fixed": "#dae2fd",
        "primary-fixed-dim": "#bec6e0",
        "on-primary-fixed": "#131b2e",
        "on-primary-fixed-variant": "#3f465c",

        // ── Secondary (Burnt Orange) ──
        "secondary": "#9d4300",
        "on-secondary": "#ffffff",
        "secondary-container": "#fd761a",
        "on-secondary-container": "#5c2400",
        "secondary-fixed": "#ffdbca",
        "secondary-fixed-dim": "#ffb690",
        "on-secondary-fixed": "#341100",
        "on-secondary-fixed-variant": "#783200",

        // ── Tertiary (Teal) ──
        "tertiary": "#000000",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#00201d",
        "on-tertiary-container": "#0c9488",
        "tertiary-fixed": "#89f5e7",
        "tertiary-fixed-dim": "#6bd8cb",
        "on-tertiary-fixed": "#00201d",
        "on-tertiary-fixed-variant": "#005049",

        // ── Error / Semantic ──
        "error": "#ba1a1a",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",

        // ── Outline ──
        "outline": "#76777d",
        "outline-variant": "#c6c6cd",

        // ── Legacy alias ──
        "accent": "#f97316",
      },
      borderRadius: {
        "sm": "0.25rem",
        "DEFAULT": "0.5rem",
        "md": "0.75rem",
        "lg": "1rem",
        "xl": "1.5rem",
        "full": "9999px"
      },
      spacing: {
        "base": "8px",
        "container-max": "1280px",
        "gutter": "24px",
        "margin-mobile": "16px",
        "margin-desktop": "32px",
        "stack-xs": "4px",
        "stack-sm": "8px",
        "stack-md": "16px",
        "stack-lg": "24px",
        "stack-xl": "40px"
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        "body-sm": ["Inter"],
        "body-md": ["Inter"],
        "body-lg": ["Inter"],
        "data-mono": ["Inter"],
        "headline-md": ["Inter"],
        "headline-lg": ["Inter"],
        "label-sm": ["Inter"],
        "label-md": ["Inter"],
        "display-lg": ["Inter"]
      },
      fontSize: {
        "body-sm": ["14px", { "lineHeight": "20px", "fontWeight": "400" }],
        "body-md": ["16px", { "lineHeight": "24px", "fontWeight": "400" }],
        "body-lg": ["18px", { "lineHeight": "28px", "fontWeight": "400" }],
        "data-mono": ["14px", { "lineHeight": "20px", "fontWeight": "500" }],
        "headline-md": ["24px", { "lineHeight": "32px", "fontWeight": "600" }],
        "headline-lg": ["32px", { "lineHeight": "40px", "letterSpacing": "-0.01em", "fontWeight": "600" }],
        "label-sm": ["11px", { "lineHeight": "14px", "fontWeight": "500" }],
        "label-md": ["12px", { "lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "600" }],
        "display-lg": ["48px", { "lineHeight": "56px", "letterSpacing": "-0.02em", "fontWeight": "700" }]
      }
    },
  },
  plugins: [],
}
