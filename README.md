# Ougot — Site web

Site vitrine de **Ougot**, pâtisserie sur mesure à Levallois-Perret.
Recréé en HTML / CSS / JavaScript purs (aucun framework, aucune dépendance à installer).

## Aperçu

- `index.html` — structure et contenu du site (une seule page)
- `styles.css` — mise en forme (palette crème / vert, typographies serif)
- `script.js` — menu mobile, animations d'apparition, FAQ, navigation active
- `assets/images/` — logo, favicon et images

## Lancer le site en local

Ouvrez simplement `index.html` dans un navigateur, ou lancez un petit serveur :

```bash
python3 -m http.server 8000
# puis ouvrez http://localhost:8000
```

## Remplacer les photos par les vôtres

Les images fournies sont des **placeholders** (fichiers `.svg`). Pour mettre vos vraies photos :

1. Déposez vos photos dans `assets/images/` (idéalement en `.jpg` ou `.webp`).
2. Dans `index.html`, remplacez le nom du fichier dans la balise `<img src="...">` correspondante.

| Emplacement sur le site        | Fichier à remplacer                    | Format conseillé |
|--------------------------------|----------------------------------------|------------------|
| Grande image d'accueil (hero)  | `assets/images/hero.svg`               | portrait 4:5     |
| Section « À Propos »           | `assets/images/about.svg`              | portrait 5:6     |
| Pâtisseries à partager         | `assets/images/patisseries.svg`        | paysage 16:11    |
| Layer & Number cakes           | `assets/images/layercakes.svg`         | paysage 16:11    |
| Buffets desserts               | `assets/images/buffets.svg`            | paysage 16:11    |
| Plateaux miniatures            | `assets/images/plateaux.svg`           | paysage 16:11    |
| Galerie Instagram (x4)         | `assets/images/insta-1.svg` … `4`      | carré 1:1        |

> Astuce : vous pouvez aussi garder le même nom de fichier en `.jpg`
> (ex. `hero.jpg`) et modifier l'extension dans `index.html`.

## À personnaliser

- **Coordonnées** : e-mail, téléphone et adresse dans le pied de page (`index.html`).
- **Lien Instagram** : boutons/section Instagram.
- **Textes FAQ, tarifs, à propos** : directement dans `index.html`.

## Palette

- Crème `#f7f2ea` · Vert forêt `#3b473e` · Doré `#b08b5a`
