#  MIJERCA Event — Application Web & PWA

**Progressive Web App de gestion des événements du MIJERCA** — Application Vue 3 (Vite) avec administration d’événements, gestion du personnel, finances, et plus.

---

##  Table des matières

- [Vue d’ensemble](#-vue-densemble)  
- [Fonctionnalités clés](#-fonctionnalités-clés)  
- [Tech Stack](#-tech-stack)  
- [Démo / Capture d’écran (à venir)](#-démonstration)  
- [Installation & Exécution](#-installation--exécution)  
- [Déploiement comme PWA](#-déploiement-pwa)  
- [Structure du projet](#-structure-du-projet)  
- [Contribution](#-contribution)  
- [Licence](#-licence)

---

##  Vue d’ensemble

MIJERCA-Event est une application Vue 3 développée avec Vite, pensée pour :

- Gérer plusieurs événements annuels 
- Organiser des activités par catégorie (Membre, Finances, Informatique, Logistique, Média)
- Gérer les services (diocésain, décanal, paroissial, jeunes)
- Organiser les paiements par **secteurs (Kin-Est, Kin-Centre, Kin-Ouest)**
- Déclarer des dépenses : *Nouvelle dépense* & *Suivi des dépenses*
- Afficher des **rapports financiers (journaliers & globaux)** dynamiques
- Être installable comme **Progressive Web App** (mode hors-ligne, installation mobile…)

---

##  Fonctionnalités clés

-  **Dashboard** avec statistiques globales
-  **Gestion événements & activités**
-  **Administration des services hiérarchisés**
-  **Paiement segmenté** par secteur (Kin Est, Centre, Ouest)
-  **Module Dépenses** : création et suivi
-  **Rapports financiers** : journaliers et globaux
-  **PWA-ready** : installation sur mobile, fonctionnement hors ligne (cache via Service Worker), icône sur écran d’accueil.

---

##  Tech Stack

- **Frontend** : Vue 3 avec Vite  
- **UI / CSS** : Bootstrap  
- **Routing** : Vue Router, structuration dynamique des routes selon les services  
- **Icons** : Material Design Icons (`@mdi/font`)  
- **PWA** : Service Worker + manifest.json (via plugin Vue ou configuration manuelle)  
- **Optional** : Backend/API (à connecter selon besoin)

---

##  Démonstration

> *Captures d’écran ou lien vers démo à ajouter ici (désolé, elles arrivant bientôt)*

---

##  Installation & Exécution

```bash
# Cloner le projet
git clone https://github.com/JoNgoma/mijerca-event.git
cd mijerca-event

# Installer les dépendances
pnpm install
# ou
yarn install

# Lancer le serveur de dev
pnpm dev
# ou
yarn dev
