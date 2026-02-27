# Icône Dream - Structure modulaire

## Organisation du SVG

Le fichier `src/assets/dream.svg` est découpé en groupes sémantiques pour faciliter les modifications :

| Groupe | ID | Description |
|--------|-----|-------------|
| Corps | `dream-body` | Forme principale de la veilleuse |
| Visage (haut) | `dream-face-upper` | Détails décoratifs zone supérieure |
| Aile gauche | `dream-wing-left` | Forme latérale gauche |
| Aile droite | `dream-wing-right` | Forme latérale droite |
| Détail central | `dream-detail-center` | Tache/reflet central |
| Œil droit | `dream-eye-right` | Œil côté droit |
| Œil gauche | `dream-eye-left` | Œil côté gauche + sourcil |

## Modifications courantes

### Masquer une partie
```css
#dream-eye-left { display: none; }
```

### Changer la couleur d'une partie
```css
#dream-body { fill: #FF6B6B; }
#dream-eye-left { fill: #4ECDC4; }
```

### Extraire une partie
Ouvrir dans Inkscape/Figma, sélectionner le groupe par son ID, copier-coller dans un nouveau fichier.

## Outils recommandés

- **Inkscape** (gratuit) : pour éditer les paths, dégrouper, modifier
- **Figma** : import SVG, édition visuelle, export
- **SVGO** : optimiser le SVG après édition

## Coordonnées

Le SVG utilise une transformation `scale(0.1, -0.1)` avec origine en bas. Les coordonnées des paths sont en unités ×10 (ex: 5235 ≈ 523.5pt à l'écran).
