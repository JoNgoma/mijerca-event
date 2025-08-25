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

MIJERCA Event est conçu pour gérer les événements bibliques comme :
- Camp biblique *Camp biblique 2025*  
- JDM  
- Come to Me  
- A la montagne  
- Veillée  

Chaque événement comprend des activités avec catégories **Membre**, **Finances**, **Informatique**, **Logistique** et **Media**, ainsi qu’une hiérarchie d’organes (diocésains → décanaux → paroissiaux → jeunes).

---

##  Fonctionnalités clés

-  **Dashboard** : Statistiques globales d’un coup d’œil.  
-  **Gestion des événements & activités**.  
-  **Gestion du personnel** selon la hiérarchie du MIJERCA.  
-  **Module Finance** : confirmation des paiements, rapports globaux.  
-  **Administration complète des utilisateurs**.  
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
npm install
# ou
yarn install

# Lancer le serveur de dev
npm run dev
# ou
yarn dev
