import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#f5f7fa',
          100: '#e1e6ef',
          900: '#0f172a'
        }
      },
      fontFamily: {
        sans: ['"Inter Tight"', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};

export default config;
