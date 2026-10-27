# Peyrassol — versions mobiles

Intégration HTML/CSS/JS (sans framework) de trois pages du site de la Commanderie de Peyrassol, d'après les maquettes desktop Figma, avec leurs versions tablette et mobile.

**Démo :** https://quezaco-agency.github.io/peyrassol-mobile/

## Pages

| Page | Fichier |
| --- | --- |
| Accueil | `index.html` |
| Nos vins | `nos-vins.html` |
| Restaurants | `restaurants.html` |
| Menu mobile | dans le header de chaque page (bouton burger), menu complet du site |

Le bandeau du header porte aussi un picto agenda (lien vers la section Agenda de l'accueil) et le choix de langue FR / EN, à côté du burger sur mobile. Sur la page Nos vins, chaque gamme (domaine, négoce) a le même bloc que l'accueil : un onglet par couleur (Rosés, Blancs, Rouges) et, dans chaque onglet, un slider de bouteilles.

Les entrées du menu qui mènent à des pages non développées pointent vers `#`.

En haut de chaque page, une barre de démo donne accès aux 4 pages (le bouton « Menu mobile » ouvre la version mobile menu déployé) et à l'**aperçu PC / Mobile**, qui permet de voir les deux versions depuis n'importe quel écran (`demo.css` + `demo-switch.js`, à ne pas reprendre dans le thème WordPress).

## Structure

```
assets/
  css/style.css        base desktop (maquettes 1440 px)
  css/mobile.css       responsive uniquement : media queries chargées après style.css
  js/menu-mobile.js    menu burger + sous-menus en accordéon (vanilla JS)
  js/main.js           slider d'accueil, carrousel des labels, onglets des vins
  img/                 images extraites des maquettes, optimisées pour le web
```

## Points de rupture

| Largeur | Comportement |
| --- | --- |
| ≥ 1280 px | desktop, navigation complète avec sous-menus au survol |
| ≤ 1279 px | menu burger plein écran, agenda et langue à côté du burger |
| ≤ 1023 px | tablette : blocs image + texte empilés, cartes sur 2 colonnes |
| ≤ 767 px | mobile : carrousels horizontaux, boutons pleine largeur |

## Lancer en local

Aucune compilation : ouvrir `index.html` dans un navigateur.
