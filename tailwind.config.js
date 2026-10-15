/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        jua: ['Jua', 'sans-serif'],
        body: ['"Gowun Dodum"', 'sans-serif'],
        hand: ['Gaegu', 'cursive'],
      },
      colors: {
        ink: '#3D3552',
        cream: '#FFF8EE',
        pink: { DEFAULT: '#FFD3DF', deep: '#FF8FAB' },
        peach: { DEFAULT: '#FFE0C2', deep: '#FFAD6B' },
        butter: { DEFAULT: '#FFF1A8', deep: '#F5C93B' },
        mint: { DEFAULT: '#CDEFD9', deep: '#5FC48C' },
        sky: { DEFAULT: '#CFE6FF', deep: '#6AA9EE' },
        lilac: { DEFAULT: '#E2D6FF', deep: '#A68BF0' },
      },
      boxShadow: {
        pop: '4px 4px 0 #3D3552',
        'pop-sm': '2px 2px 0 #3D3552',
        'pop-lg': '7px 7px 0 #3D3552',
      },
    },
  },
  plugins: [],
};
