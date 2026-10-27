# Peyrassol mobile — point d'étape et reprise

Dernière mise à jour : 26/10/2026, commit `886a9ec`.

- Dépôt : https://github.com/quezaco-agency/peyrassol-mobile (public, branche `main`)
- Démo : https://quezaco-agency.github.io/peyrassol-mobile/
- Dossier local : `C:\Users\Armel\Documents\Peyrassol`

## Ce qui est fait

### Pages
- **Accueil** : `index.html`
- **Nos vins** : `nos-vins.html`
- **Restaurants** : `restaurants.html`
- **Menu mobile** : le burger de chaque page.

### Méthode
Les pages sont recodées en HTML, CSS et JS purs à partir des 3 PDF Figma desktop (1440 px), qui sont dans `_sources/`. Il n'y avait pas de maquette mobile : la version mobile est notre propre adaptation.

Depuis les PDF, on a extrait :
- les textes exacts ;
- la position de chaque élément au pixel près ;
- la taille de chaque police ;
- les couleurs ;
- les photos en haute définition.

Polices : duo **Inter** (style typographique suisse, texte courant) + **Literata** (titres), toutes deux sur Google Fonts. Répartition calée sur les maquettes : titres en serif, texte en sans-serif.

### Fichiers
| Fichier | Rôle |
| --- | --- |
| `assets/css/style.css` | base desktop |
| `assets/css/mobile.css` | responsive uniquement (media queries) |
| `assets/css/demo.css` | barre de démo, à ne pas reprendre dans le thème |
| `assets/js/menu-mobile.js` | burger, sous-menus en accordéon, Échap, focus piégé |
| `assets/js/main.js` | carrousels (points, flèches, défilement automatique), onglets des vins, menus déroulants du bandeau |
| `assets/js/demo-switch.js` | barre de démo : boutons des pages et aperçu PC / Mobile |

### Points de rupture
| Largeur | Affichage |
| --- | --- |
| ≥ 1280 px | desktop |
| ≤ 1279 px | burger |
| ≤ 1023 px | tablette |
| ≤ 767 px | mobile |

### Barre de démo en haut des pages
- Boutons Accueil, Menu mobile, Nos vins et Restaurants.
- Bouton PC / Mobile. Sur ordinateur, « Mobile » affiche la page dans un cadre de téléphone de 390 px. Sur téléphone, « PC » affiche la version desktop.

### Retours client du 26/10, traités
1. **Menu complet** avec toutes les rubriques de la maquette, même celles dont la page n'existe pas : Nos vins, Le domaine viticole, Restaurants, Hébergements, Le centre d'art, Réserver et offrir.
2. **Bandeau du header** :
   - picto agenda qui renvoie à la section Agenda de l'accueil ;
   - choix FR / EN ;
   - sur mobile, les deux sont à côté du burger.
3. **Nos vins** :
   - les 2 grandes images ont été retirées ;
   - pour chaque gamme (domaine, négoce), on a mis le même bloc qu'à l'accueil : onglets Rosés / Blancs / Rouges, avec un slider de bouteilles par onglet.

### Défilement automatique
- Slider d'accueil : image par image toutes les 5 s, à toutes les tailles.
- Cartes, bouteilles, potager et labels (mobile) : défilement continu en boucle (`SPEED` = 32 px/s dans `main.js`). Les éléments sont dupliqués en copies inertes (`.is-clone`, masquées hors mobile) pour une boucle sans à-coup.
- Pause au toucher, au clic, à la molette ou au focus clavier, puis reprise. Arrêt hors écran.
- Le mouvement tourne même avec « réduire les animations », à la demande du client : c'est un écart volontaire à cette préférence d'accessibilité.

### Vérifications faites
- Aucun débordement horizontal à 390, 820, 1024, 1280 et 1440 px.
- Menu testé : ouverture, accordéon, Échap.
- Onglets testés en ligne.

## Points ouverts, à voir avec le client
- [ ] **Photos des blancs et des rouges.** Pour l'instant les onglets Blancs et Rouges réutilisent les 4 bouteilles de rosé. Il faut les vraies photos et les vrais noms de cuvées par couleur.
- [ ] **Lien EN** : pour l'instant il ne mène nulle part. Il n'y a pas de version anglaise, et WPML la gérera sur le vrai site.
- [ ] **Liens en `#`** : ce sont les pages non développées. Soit on les laisse, soit on les retire.
- [ ] **« Slider par catégorie »** : on l'a interprété comme des onglets par couleur. Le client voulait peut-être un seul slider qui passe d'une couleur à l'autre. À confirmer.
- [ ] **Picto calendrier** : il ouvre un menu déroulant avec les liens « Réserver et offrir », et « Voir l'agenda » pointe vers la section Agenda de l'accueil. Faut-il une vraie page Agenda ?
- [ ] **Choix de langue** : « FR ▾ » ouvre un menu avec EN.

## Directives pour reprendre

### Avant de toucher au code
```bash
cd C:\Users\Armel\Documents\Peyrassol
git pull
```
Le compte GitHub à utiliser est `quezaco-agency` (ni `armelpltr`, ni `arrmel-capitalboard`) : `gh auth switch --user quezaco-agency` si besoin. Vérifier avec `gh auth status`.

### Modifier les pages
**Ne pas éditer `index.html`, `nos-vins.html` et `restaurants.html` à la main.** Ils sont générés à partir des morceaux qui se trouvent dans `_sources/outils/parts/` :
- `header.html` : le menu ;
- `footer.html` ;
- `labels.html` ;
- `*.body.html` : le contenu de chaque page.

Procédure :
1. Modifier le bon fichier dans `parts/`.
2. Regénérer les pages :
   ```bash
   python _sources/outils/build.py C:/Users/Armel/Documents/Peyrassol
   ```
   Le script ajoute aussi les `width` et `height` des images.

Les bouteilles de Nos vins sont décrites dans `build.py`, par les listes `BOTTLES` et `COLORS`. Pour donner des photos différentes à chaque couleur, il faut passer une liste de bouteilles par couleur.

`_sources/` est ignoré par git. Les outils n'existent donc qu'en local et ne doivent pas être supprimés.

### Modifier le style
- Design system : toutes les couleurs, tailles de texte et espacements sont des variables dans le `:root` de `style.css`. Utiliser ces variables, pas de valeur en dur. Le mobile redéfinit l'échelle de texte une seule fois (`:root` du bloc ≤ 767 px de `mobile.css`). Référence visuelle : `design-system.html`, son style est dans `demo.css`.
- Le desktop va dans `style.css`.
- Le tablette et le mobile vont dans `mobile.css`, uniquement à l'intérieur des `@media`.
- Toute modification desktop doit être vérifiée en mobile.

### Vérifier avant de committer
Playwright avec Edge :
```bash
cd _sources/outils
python pw.py index,nos-vins,restaurants 390,820,1024,1280,1440
```
- Le script affiche `scrollWidth/innerWidth` : les deux nombres doivent être égaux, sinon il y a un débordement horizontal.
- Les captures arrivent dans `_sources/outils/shots/`.

Piège connu : un `.visually-hidden` placé dans un carrousel mobile sort de la piste si celle-ci n'est pas en `position: relative`.

### Committer et publier
- Un commit par étape, avec un message en français du type `feat: …` ou `style: …`, puis `git push`.
- GitHub Pages se met à jour en 1 à 2 minutes. Pour suivre le build :
  ```bash
  gh api repos/quezaco-agency/peyrassol-mobile/pages/builds/latest --jq .status
  ```
