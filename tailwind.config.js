/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // MISE À JOUR : On complète la liste avec les classes pour les boutons jaunes
  safelist: [
    // Classes pour la sélection des numéros (déjà présentes et fonctionnelles)
    'bg-[#4F00BC]',
    'text-white',
    
    // Classes pour le badge du type de pari (déjà présentes et fonctionnelles)
    'bg-[#4F00BC]/20',
    'text-[#4F00BC]',
    'border-[#4F00BC]/30',

    // --- AJOUTS pour les boutons jaunes ---
    'bg-yellow-500',
    'text-black',
    'hover:bg-yellow-600',
    'text-yellow-500', // Pour le texte des numéros sélectionnés dans le récap
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}