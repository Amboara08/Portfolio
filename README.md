# Portfolio — Amboara Oliva Andriamamonjisoa

Site portfolio statique (HTML / CSS / JavaScript vanilla, sans framework, sans étape de build).

## Structure

```
portfolio/
├── index.html                          # Structure HTML uniquement
├── css/
│   └── style.css                       # Tous les styles du site
├── js/
│   └── script.js                       # Toute la logique JS (thème, menu mobile, animations, formulaire)
├── images/
│   └── profile-photo.png               # Photo de profil
├── cv-amboara-andriamamonjisoa.pdf     # CV téléchargeable (lié au bouton "Télécharger mon CV")
├── package.json                        # Script optionnel pour lancer un serveur local
└── README.md
```

Aucune dépendance n'est requise pour que le site fonctionne : ouvrir `index.html` charge automatiquement `css/style.css` et `js/script.js` via des chemins relatifs (police et icônes chargées depuis des CDN externes).

## Lancer le projet en local

**Option 1 — sans rien installer**
Double-clique simplement sur `index.html` (ou clic droit → Ouvrir avec ton navigateur).

**Option 2 — via un petit serveur local (recommandé pour tester le responsive/le menu comme en production)**
```bash
npm install
npm start
```
Puis ouvre http://localhost:3000 dans ton navigateur.

## Important

- Le bouton **« Télécharger mon CV »** utilise un chemin relatif vers `cv-amboara-andriamamonjisoa.pdf`, à la racine du projet. Il doit toujours rester au même niveau qu'`index.html`.
- `index.html` référence `css/style.css`, `js/script.js` et `images/profile-photo.png` en chemins relatifs : conserve impérativement cette arborescence de dossiers, y compris une fois déployé en ligne (GitHub Pages, Netlify, etc.).
- Aucune modification n'a été apportée au design, aux animations, aux couleurs, aux textes ou aux fonctionnalités du portfolio : seule la structure des fichiers a changé (HTML / CSS / JS / images séparés).
