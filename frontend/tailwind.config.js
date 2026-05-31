/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Paleta: Verde pizarra + Cobre cálido ──
        "brand-deep":       "#134E4A",   // Verde profundo (navbar, footer, fondos oscuros)
        "brand-tech":       "#0F766E",   // Verde tecnológico (hover, bordes, acentos)
        "brand-copper":     "#B45309",   // Cobre (botones CTA, badges)
        "brand-copper-light":"#FEF3C7",  // Texto sobre cobre
        "brand-mint":       "#CCFBF1",   // Texto claro sobre verde
        "brand-bg":         "#F0FDF4",   // Fondo general de páginas
        "brand-text":       "#134E4A",   // Texto principal oscuro

        // ── Core Surfaces (mapped to new palette) ──
        "background":                "#F0FDF4",
        "on-background":             "#134E4A",
        "surface":                   "#F0FDF4",
        "surface-dim":               "#D1FAE5",
        "surface-bright":            "#F0FDF4",
        "surface-container-lowest":  "#ffffff",
        "surface-container-low":     "#ECFDF5",
        "surface-container":         "#D1FAE5",
        "surface-container-high":    "#A7F3D0",
        "surface-container-highest": "#6EE7B7",
        "surface-variant":           "#D1FAE5",
        "surface-tint":              "#134E4A",
        "on-surface":                "#134E4A",
        "on-surface-variant":        "#3B6B66",
        "inverse-surface":           "#134E4A",
        "inverse-on-surface":        "#CCFBF1",

        // ── Primary (Verde profundo) ──
        "primary":                   "#134E4A",
        "on-primary":                "#ffffff",
        "primary-container":         "#0F766E",
        "on-primary-container":      "#CCFBF1",
        "inverse-primary":           "#6EE7B7",
        "primary-fixed":             "#D1FAE5",
        "primary-fixed-dim":         "#A7F3D0",
        "on-primary-fixed":          "#134E4A",
        "on-primary-fixed-variant":  "#0F766E",

        // ── Secondary (Cobre cálido) ──
        "secondary":                 "#B45309",
        "on-secondary":              "#FEF3C7",
        "secondary-container":       "#D97706",
        "on-secondary-container":    "#78350F",
        "secondary-fixed":           "#FEF3C7",
        "secondary-fixed-dim":       "#FDE68A",
        "on-secondary-fixed":        "#78350F",
        "on-secondary-fixed-variant":"#92400E",

        // ── Tertiary (Teal accent) ──
        "tertiary":                  "#0F766E",
        "on-tertiary":               "#ffffff",
        "tertiary-container":        "#134E4A",
        "on-tertiary-container":     "#5EEAD4",
        "tertiary-fixed":            "#99F6E4",
        "tertiary-fixed-dim":        "#5EEAD4",
        "on-tertiary-fixed":         "#134E4A",
        "on-tertiary-fixed-variant": "#0F766E",

        // ── Error / Semantic ──
        "error":                     "#ba1a1a",
        "on-error":                  "#ffffff",
        "error-container":           "#ffdad6",
        "on-error-container":        "#93000a",

        // ── Outline ──
        "outline":                   "#5F9B96",
        "outline-variant":           "#A7D4CF",

        // ── Legacy alias ──
        "accent":                    "#B45309",
      },
      borderRadius: {
        "sm":      "0.25rem",
        "DEFAULT": "0.5rem",
        "md":      "0.75rem",
        "lg":      "1rem",
        "xl":      "1.5rem",
        "full":    "9999px"
      },
      spacing: {
        "base":            "8px",
        "container-max":   "1280px",
        "gutter":          "24px",
        "margin-mobile":   "16px",
        "margin-desktop":  "32px",
        "stack-xs":        "4px",
        "stack-sm":        "8px",
        "stack-md":        "16px",
        "stack-lg":        "24px",
        "stack-xl":        "40px"
      },
      fontFamily: {
        sans:          ["Inter", "sans-serif"],
        "body-sm":     ["Inter"],
        "body-md":     ["Inter"],
        "body-lg":     ["Inter"],
        "data-mono":   ["Inter"],
        "headline-md": ["Inter"],
        "headline-lg": ["Inter"],
        "label-sm":    ["Inter"],
        "label-md":    ["Inter"],
        "display-lg":  ["Inter"]
      },
      fontSize: {
        "body-sm":     ["14px", { "lineHeight": "20px", "fontWeight": "400" }],
        "body-md":     ["16px", { "lineHeight": "24px", "fontWeight": "400" }],
        "body-lg":     ["18px", { "lineHeight": "28px", "fontWeight": "400" }],
        "data-mono":   ["14px", { "lineHeight": "20px", "fontWeight": "500" }],
        "headline-md": ["24px", { "lineHeight": "32px", "fontWeight": "600" }],
        "headline-lg": ["32px", { "lineHeight": "40px", "letterSpacing": "-0.01em", "fontWeight": "600" }],
        "label-sm":    ["11px", { "lineHeight": "14px", "fontWeight": "500" }],
        "label-md":    ["12px", { "lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "600" }],
        "display-lg":  ["48px", { "lineHeight": "56px", "letterSpacing": "-0.02em", "fontWeight": "700" }]
      }
    },
  },
  plugins: [],
}
