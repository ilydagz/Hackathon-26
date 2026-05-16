/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "var(--primary)",
        "on-primary": "var(--on-primary)",
        "app-bg": "var(--app-bg)",
        "surface-card": "var(--surface-card)",
        "on-background": "var(--on-background)",
        "on-surface": "var(--on-surface)",
        "text-secondary": "var(--text-secondary)",
        "border-subtle": "var(--border-subtle)",
        "surface-muted": "var(--surface-muted)",
        "primary-container": "var(--primary-container)",
        "on-primary-container": "var(--on-primary-container)",
        "status-success": "var(--status-success)",
        "status-error": "var(--status-error)",
        "inverse-surface": "var(--inverse-surface)",
        "inverse-on-surface": "var(--inverse-on-surface)",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        foreground: "hsl(var(--foreground))",
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      spacing: {
        "margin-mobile": "16px",
        "gutter": "16px",
        "xl": "32px",
        "md": "16px",
        "xs": "8px",
        "lg": "24px",
        "sm": "12px",
        "margin-desktop": "48px",
        "base": "4px"
      },
      fontFamily: {
        "display-lg": ["Outfit", "sans-serif"],
        "title-card": ["Manrope", "sans-serif"],
        "body-main": ["Manrope", "sans-serif"],
        "body-sm": ["Manrope", "sans-serif"],
        "label-caps": ["Manrope", "sans-serif"],
        "headline-md": ["Outfit", "sans-serif"],
        "display-lg-mobile": ["Outfit", "sans-serif"]
      },
      fontSize: {
        "display-lg": ["48px", {"lineHeight": "1.2", "fontWeight": "700"}],
        "title-card": ["18px", {"lineHeight": "1.4", "fontWeight": "600"}],
        "body-main": ["16px", {"lineHeight": "1.5", "fontWeight": "400"}],
        "body-sm": ["14px", {"lineHeight": "1.5", "fontWeight": "400"}],
        "label-caps": ["12px", {"lineHeight": "1", "letterSpacing": "0.05em", "fontWeight": "700"}],
        "headline-md": ["24px", {"lineHeight": "1.3", "fontWeight": "600"}],
        "display-lg-mobile": ["32px", {"lineHeight": "1.2", "fontWeight": "700"}]
      }
    },
  },
  plugins: [],
}
