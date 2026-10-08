# SIMUL8 Studio

Un site d’apprentissage en français, réalisé à partir du dossier **Cours_Modélisation_Simulation_S8_2026_2027.zip**.

## Utilisation sans installation

Depuis GitHub, cliquez sur **Code → Download ZIP**, puis décompressez entièrement l’archive. Dans le dossier extrait, ouvrez **Ouvrir-SIMUL8.html** dans Chrome, Edge ou Firefox sur votre ordinateur. Conservez le dossier **public** à côté de ce fichier : il contient les documents et modèles dans `public/cours`. Le site, les polices, le laboratoire et les quiz fonctionnent sans connexion.

Le fichier `index.html` à la racine est l’entrée du projet de développement ; utilisez bien **Ouvrir-SIMUL8.html** pour la version sans installation.

Si vous disposez de l’archive séparée `SIMUL8-Studio-site.zip`, ouvrez plutôt son fichier **index.html** et conservez son dossier **cours** à côté.

La progression est conservée dans le stockage local du navigateur, lorsqu’il est disponible. Elle dépend du navigateur et de l’emplacement du site ; elle n’est pas synchronisée entre appareils. Effacer les données du navigateur efface également la progression. Sur un téléphone, utilisez de préférence la version servie par un serveur web : l’ouverture de fichiers HTML locaux dépend du système.

## Contenu

- 14 leçons en 7 chapitres, avec objectifs, explications, exercices et renvois aux pages du cours.
- 14 questions corrigées, avec révision par chapitre et conservation du dernier score.
- Laboratoire de file FIFO à événements discrets : intervalles et services fixes ou exponentiels, 1 à 5 serveurs, graine reproductible, mode pas à pas, animation, indicateurs et comparaison avec un scénario de référence.
- Bibliothèque de 100 fichiers d’origine, avec recherche, filtres et téléchargements.
- Lexique et progression enregistrée localement.

## Développement

Prérequis : Node.js 20.19+ ou 22.12+ (Node 24 utilisé pour la validation).

```sh
cd /workspace/ha
npm ci --cache /workspace/.npm-cache
npm run dev -- --port 5173
```

Pour une copie téléchargée ailleurs, placez-vous dans son dossier et utilisez simplement `npm ci`, puis `npm run dev`. Ouvrez l’adresse affichée par Vite. Aucun compte, secret ou service externe n’est requis.

```sh
npm test            # tests du moteur de simulation
npm run build      # produit dist/ et actualise Ouvrir-SIMUL8.html
npm run preview    # sert la version construite
npm run test:ui    # tests Chromium sur ordinateur et mobile
```

La version construite a été testée sans requêtes réseau supplémentaires, ainsi que les parcours sur ordinateur et mobile. L’ouverture directe en `file://` n’a pas pu être vérifiée dans cet environnement : la politique du navigateur fourni interdit ce protocole. Si votre navigateur refuse également l’ouverture directe, utilisez le serveur local décrit ci-dessous.

Les tests d’interface utilisent par défaut `/usr/bin/chromium`. Pour un autre emplacement : `CHROMIUM_PATH=/chemin/vers/chromium npm run test:ui`. Les captures des tests sont écrites dans `/tmp/simul8-*.png` dans cet environnement.

La compilation intègre JavaScript, styles et polices au fichier HTML pour permettre une ouverture locale. Pour héberger le site, publiez le contenu de `dist` sur un serveur statique. Aucune publication n’est effectuée automatiquement.

## Sources et périmètre pédagogique

Support principal : **Vincent Giard, Simulation des processus de production de biens et services, version du 25 septembre 2023**, 132 pages, fichier `Simulation (2).pdf`. Le nom du dossier indique l’année universitaire 2026–2027 ; il ne change pas la date du document.

Les textes du site sont des synthèses pédagogiques, avec des liens vers les pages sources. Le laboratoire est un modèle pédagogique indépendant, initialement vide, sans limite de file, abandon, pause ni warm-up. Il ne reproduit pas le cabinet médical complet, n’exécute pas le moteur SIMUL8 et ne lit pas les modèles `.S8`. Ceux-ci nécessitent SIMUL8 et n’ont pas été exécutés ici. La compatibilité des menus et modèles dépend de votre version.

Dans le laboratoire, la première arrivée suit un intervalle généré depuis t = 0. Les fins de traitement sont traitées avant les arrivées simultanées. À l’horizon, les items présents restent en file ou en traitement ; le système n’est pas vidé. L’attente moyenne est calculée sur les items ayant commencé leur traitement, le séjour moyen sur ceux qui sont sortis. L’occupation intègre le temps occupé de tous les serveurs, divisé par le nombre de serveurs et le temps observé. Les arrivées et traitements utilisent deux flux pseudo-aléatoires séparés, pour conserver les mêmes arrivées lors d’un changement de capacité.

Une expérience ne remplace pas une analyse par réplications. Le cours recommande au moins 30 réplications pour l’analyse statistique des moyennes. La référence de comparaison du laboratoire est conservée seulement tant que sa page reste ouverte.

Les deux fichiers `.icloud` sont des raccourcis sans le contenu des modèles. Ils sont exclus, ainsi que les deux sauvegardes `.bk8` et `.DS_Store`. Les 100 autres fichiers sont conservés sans modification dans `public/cours`. Le site ne s’appuie pas sur une lecture interne du format propriétaire `.S8` ; les exercices se fondent sur le PDF et les noms des exemples.

Les documents originaux conservent leurs auteurs et leurs droits. Le site est destiné à votre apprentissage personnel ; vérifiez vos droits avant de republier les supports de cours.
