# Nouha English — site d'apprentissage de l'anglais (A1 → A2) expliqué en darija

**Site en ligne : https://yasbou2001-source.github.io/nouha-english/** (fonctionne sur n'importe quel PC avec Chrome ou Edge — à mettre en favori).
Dépôt : https://github.com/yasbou2001-source/nouha-english

Site **100 % statique** : aucun compte, aucune donnée envoyée (sauf la reconnaissance vocale de
Chrome/Edge, qui utilise le service de Google/Microsoft). La progression est enregistrée dans le navigateur
de chaque PC ; pour la transférer d'un PC à l'autre : page *Ttaqaddom* → « Sawbi noskha » (export) puis
« Rje3i noskha » (import) sur l'autre PC.

## Mettre à jour le site en ligne

- Depuis ce dossier : modifier → `python tools/build.py` → `git add -A && git commit -m "..." && git push`.
  GitHub Pages republie en 1 à 2 minutes.
- Ou directement sur GitHub (éditer un `content/lessons_XX.json` dans le navigateur) : l'action
  `.github/workflows/build-content.yml` valide le contenu et régénère `data/content.js` toute seule.

## Lancer le site en local (sans internet)

- **Option simple** : double-cliquer sur `index.html` (Chrome ou Edge recommandés).
- **Option conseillée** : double-cliquer sur `Nouha English.bat` → ouvre `http://localhost:8765`
  (le navigateur mémorise alors l'autorisation du micro ; en `file://` il la redemande à chaque fois).
  Python est nécessaire pour cette option (déjà installé sur ce PC).

Le micro (expression orale) fonctionne sur **Google Chrome** et **Microsoft Edge** avec internet.
La prononciation (voix anglaise) fonctionne hors-ligne avec les voix Windows ; Edge propose des
voix « naturelles » de meilleure qualité.

## Contenu

- `content/lessons_*.json` : 24 leçons (6 par niveau : A1.1, A1.2, A2.1, A2.2). Chaque leçon =
  explications en darija + vocabulaire + dialogue + 12–16 exercices + lecture + écoute + oral (prononciation
  et jeu de rôle) + écriture.
- `content/placement.json` : test de niveau (16 questions).
- `content/STYLE_GUIDE.md`, `SCHEMA.md`, `SYLLABUS.md` : règles d'écriture du contenu (darija en lettres
  latines, schéma JSON, programme).

### Modifier / ajouter du contenu

1. Éditer ou ajouter un fichier `content/lessons_XX.json` (respecter `content/SCHEMA.md`).
2. Vérifier : `python tools/validate.py content/lessons_XX.json`
3. Reconstruire : `python tools/build.py` → régénère `data/content.js` (le fichier chargé par le site).
4. Recharger la page.

## Fonctionnement

- **Niveau adaptatif** : test de niveau au départ, puis le site observe les 30 dernières réponses :
  ≥ 85 % de bonnes réponses (et 2 leçons du niveau terminées) → niveau supérieur ; < 45 % → niveau inférieur.
- **Vocabulaire** : répétition espacée (boîtes 0 → 5, revues après 1, 3, 7, 14, 30 jours).
- **Oral** : la reconnaissance vocale compare ce que Nouha dit à la phrase cible, mot par mot (vert / rouge).
- **Écriture** : vérifications automatiques (longueur, majuscules, ponctuation, erreurs fréquentes A1/A2),
  puis comparaison avec un texte modèle ; textes sauvegardés dans un journal.
- **Progression** : enregistrée dans le navigateur (localStorage). Page « Ttaqaddom » → export/import JSON
  pour sauvegarder ou changer de PC.

## Fichiers

```
index.html            page unique (application)
css/style.css         styles
js/*.js               application (util, store, speech, exercises, views, app)
data/content.js       contenu compilé (généré par tools/build.py)
content/*.json        sources du contenu
tools/validate.py     validateur de contenu
tools/build.py        génération de data/content.js
Nouha English.bat     lanceur (serveur local + navigateur)
```
