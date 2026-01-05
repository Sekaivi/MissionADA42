import Link from 'next/link'

export default function Home() {
  return (
    <>
      <h1>Escape Game</h1>
      <p>Ici c'est le fichier src/app/page.tsx, qui équivaut à la homepage</p>
      <p>
        Avec l'App Router, pour créer des pages, il faut rajouter des dossier
        dans src/app avec à l'intérieur un page.tsx (équivalent d'un index.html
        pour le dossier)
      </p>
      <p>
        Exemple : j'ai créé le dossier src/app/test avec son page.tsx à
        l'intérieur, <Link href={'/test'}>clique ici</Link> pour voir la page
      </p>

      <br />
      <br />

      <p>
        On oublie les balise {'<a></a>'} pour les liens, maintenant on utilise{' '}
        {'<Link></Link'} issu de "next/link"
      </p>

      <br />
      <br />

      <p>
        Dans la construction des différentes pages, PENSEZ A FAIRE DES
        COMPOSANTS ! Ça rend le code facile à maintenir, et plus propre car on
        peut réutiliser des blocs utiles. Si vous créez des composants,
        placez-les dans src/components dans des dossiers logiques
      </p>
    </>
  )
}
