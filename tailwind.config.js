/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // NOUVELLE SECTION : On force la génération des classes de couleur
  safelist: [
    'bg-yellow-500',
    'hover:bg-yellow-600',
    'text-black',
    'bg-[#4F00BC]', // La couleur violette pour le numéro sélectionné (d'après votre maquette)
    'text-white',   // La couleur du texte sur le fond violet
    'text-yellow-500',
    'bg-[#4F00BC]/20',
    'text-[#4F00BC]',
    'border-[#4F00BC]/30',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}