/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/components/website/landing/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // shadcn / chat-app tokens — resolved from CSS vars that are scoped to
        // [data-app="chat"] routes (see app/(webapp)/app.css). Outside that scope
        // the vars are undefined; these utilities are only used in chat-app code.
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        "primary-foreground": "var(--primary-foreground)",
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--primary-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        sidebar: {
          DEFAULT: "var(--sidebar)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
        chart: {
          1: "var(--chart-1)",
          2: "var(--chart-2)",
          3: "var(--chart-3)",
          4: "var(--chart-4)",
          5: "var(--chart-5)",
        },
        green: {
          50: '#e9f1ee',
          100: '#bad2ca',
          200: '#98bcb1',
          300: '#6a9e8d',
          400: '#4d8b77',
          500: '#206e55',
          600: '#1d644d',
          700: '#174e3c',
          800: '#123d2f',
          900: '#0d2e24',
        },
        neutral: {
          50: '#f4f5f5',
          100: '#dfe2e1',
          200: '#cacecd',
          300: '#b5bab9',
          400: '#a0a7a5',
          500: '#8a9390',
          600: '#767f7c',
          700: '#626a67',
          800: '#4e5553',
          900: '#3b403e',
          950: '#272a29',
          1000: '#141515',
        },
        primary: {
          DEFAULT: '#206e55',
          900: '#003E45',
          700: '#04754B',
          600: '#206E55',
          500: '#08907C',
          400: '#088F7B',
        },
        dark: {
          DEFAULT: '#111111',
          900: '#141515',
          800: '#1A1A1A',
          700: '#1D1D1D',
        },
        lime: {
          DEFAULT: '#CFFB20',
          light: '#ECFDF6',
        },
        blue: {
          DEFAULT: '#00B2FF',
          light: '#D4F9FF',
          bg: '#EBFAFF',
        },
        red: {
          DEFAULT: '#FF423E',
          bg: '#FFF5F5',
        },
        yellow: {
          DEFAULT: '#FAD82D',
          light: '#FAE77D',
        },
        'green-success': '#00EC92',
        cream: '#FAF9F5',
        'warm-tint': '#F5F4EF',
        'green-primary': '#206E55',
        'text-primary': '#1C1917',
        'text-secondary': 'rgba(28, 25, 23, 0.7)',
        'text-muted': '#A8A29E',
        surface: '#FAF9F5',
        'dark-surface': '#1C1917',
      },
      borderRadius: {
        pill: '100px',
        '5xl': '52px',
        '4xl': '40px',
        '3xl': '30px',
      },
      boxShadow: {
        card: 'rgba(150, 150, 150, 0.1) 0px 3px 7px 0px, rgba(150, 150, 150, 0.09) 0px 13px 13px 0px, rgba(150, 150, 150, 0.05) 0px 30px 18px 0px, rgba(150, 150, 150, 0.01) 0px 53px 21px 0px, rgba(150, 150, 150, 0) 0px 83px 23px 0px',
        elevated: 'rgba(0, 0, 0, 0.18) 0px 1px 2px 0px, rgba(0, 0, 0, 0.16) 0px 4px 4px 0px, rgba(0, 0, 0, 0.09) 0px 9px 5px 0px, rgba(0, 0, 0, 0.03) 0px 16px 6px 0px, rgba(0, 0, 0, 0) 0px 24px 7px 0px',
        subtle: 'rgba(0, 0, 0, 0) 0px 45px 13px 0px, rgba(0, 0, 0, 0) 0px 29px 11px 0px, rgba(0, 0, 0, 0.02) 0px 16px 10px 0px, rgba(0, 0, 0, 0.03) 0px 7px 7px 0px, rgba(0, 0, 0, 0.03) 0px 2px 4px 0px',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.8s ease',
      },
    },
  },
  plugins: [],
};
