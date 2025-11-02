/** @type {import('tailwindcss').Config} */
export default {
  // C'est la partie la plus importante.
  // Elle dit à Tailwind de scanner tous les fichiers .html, .js, .ts, .jsx, et .tsx
  // à la racine et dans le dossier `src` pour trouver les classes à générer.
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Ici, vous pourriez ajouter des couleurs personnalisées si besoin,
      // mais pour l'instant, nous voulons juste que les couleurs de base fonctionnent.
      // Par exemple :
      // colors: {
      //   'custom-yellow': '#FFD700',
      // }
    },
  },
  plugins: [],
}