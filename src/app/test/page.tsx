import React from 'react'

export default function Home() {
  // Erreur ESLint : Variable déclarée mais jamais utilisée
  // Erreur TS : Usage explicite de 'any' (souvent découragé)
  // Erreur Prettier : Double quotes (alors qu'on veut des single)
  const variableInutile: any = 'Je sers à rien'

  // Erreur Prettier : Indentation catastrophique
  return (
    // Erreur Tailwind plugin : Les classes ne sont pas triées (layout > spacing > visual)
    <main className="flex min-h-screen flex-col items-center justify-between bg-black p-24 text-white">
      <h1>Page de test</h1>
      <p>Ici c'est le fichier src/app/test/page.tsx</p>

      {/* Erreur ESLint (Next) : Utilisation de <img> au lieu du composant <Image> optimisé */}
      {/* Erreur ESLint (a11y) : Manque la balise 'alt' pour l'accessibilité */}
      <img src="https://placehold.co/100" />
    </main>
  )
}
