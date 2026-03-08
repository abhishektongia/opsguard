import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'severity-p1': '#dc2626',
        'severity-p2': '#ea580c',
        'severity-p3': '#eab308',
        'severity-p4': '#3b82f6',
        'severity-p5': '#6b7280',
        'status-open': '#dc2626',
        'status-ack': '#eab308',
        'status-resolved': '#22c55e',
        'status-closed': '#9ca3af',
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};

export default config;
