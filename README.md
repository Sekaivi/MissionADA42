# SAE501-groupe1

# SAE 501 - Escape Game (Groupe 1)

Projet réalisé dans le cadre de la SAE 501.
Application Next.js + Tailwind CSS + TypeScript.

## Add your files

- [ ] [Create](https://docs.gitlab.com/ee/user/project/repository/web_editor.html#create-a-file) or [upload](https://docs.gitlab.com/ee/user/project/repository/web_editor.html#upload-a-file) files
- [ ] [Add files using the command line](https://docs.gitlab.com/topics/git/add_files/#add-files-to-a-git-repository) or push an existing Git repository with the following command:

```
cd existing_repo
git remote add origin https://gricad-gitlab.univ-grenoble-alpes.fr/mmi-students-projects/s5-2026/sae501/groupe-1/sae501-groupe1.git
git branch -M main
git push -uf origin main
```

---

## Escape Game

## Description

SAE501 - Création d'un escape game

## Installation

Configurez votre machine pour utiliser pnpm à la place de npm :
`npm install -g pnpm@latest-10`

maintenant vous pourrez exécuter :

- `pnpm install` au lieu de `npm install`
- `pnpm dev` au lieu de `npm run dev`
- `pnpm build` au lieu de `npm run build`
- ...

Une fois les fichiers récupérés, exécutez pnpm install pour téléchargez les dépendances.
Ensuite, pnpm dev pour lancer le projet en local.

## Architectures et bonnes pratiques

### Règles de développement

1. Pages & Routing :
    - Le dossier src/app ne doit contenir que la logique de routing.
    - Créez un dossier pour chaque nouvelle page (ex: src/app/enigmes/page.tsx est accessible via /enigmes).

2. Composants :
    - Découpez votre interface ! Si un bloc de code est gros ou est utilisé deux fois, il doit devenir un composant dans src/components.

3. Liens et Images :
    - Pas de balise `<a>` ou `<img>` : Utilisez `<Link>` (de next/link) et `<Image />` (de next/image).

4. Tailwind CSS v4 :
    - Utilisez les classes Tailwind dans vos composants
    - Pour les couleurs récurrentes, créez des variables dans le `src/app/globals.css`
    - Pour avoir l'autocomplétion des classes Tailwind pendant la saisie, vérifiez vos plugins PhpStorm ou VsCode

Respectez au mieux l'architecture en place :

```
.
├── public
│   └── fichiers divers
├── src
│   ├── app
│   │   ├── pageX
│   │   │   └── page.tsx
│   │   ├── pageY
│   │   │   └── page.tsx
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components
│   ├── hooks
│   ├── lib
│   └── types
└── tsconfig.json
```

## Commandes dispo

- `pnpm dev` : Lance le serveur de dev.
- `pnpm quality` : Formate et corrige le code (à lancer avant push). Lisez bien les retours, pour nettoyer manuellement les coquilles
- `pnpm build` : Compile pour la production.
- `pnpm start` : Lance la version de production (après un build).
