/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",       // App Router files
    "./pages/**/*.{js,ts,jsx,tsx}",     // Optional: if using Pages Router too
    "./components/**/*.{js,ts,jsx,tsx}",// Your components like Footer, Header
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
