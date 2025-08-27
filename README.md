#  MIJERCA Event — Application Web & PWA

**Progressive Web App de gestion des événements du MIJERCA** — Application web destinée à l’organisation des camps bibliques annuels du **MIJERCA** (Ministère des Jeunes du Renouveau Catholique).  
Elle centralise la planification, depuis la gestion des inscriptions des jeunes regroupés par paroisse, doyenné et secteur, jusqu’au suivi global de l’événement.  
De plus, cette application **web** prend en charge la génération personnalisée des badges ainsi que le suivi financier tout au long des activités.


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

| Fonctionnalité | Description |
|----------------|-------------|
| **Dashboard** | Vue globale avec statistiques en temps réel |
| **Gestion événements & activités** | Création, mise à jour et suivi des activités |
| **Administration des services hiérarchisés** | Gestion par secteurs, paroisses et noyaux |
| **Paiement segmenté** | Organisation des paiements par secteur (*Kin-Est, Kin-Centre, Kin-Ouest*) |
| **Module Dépenses** | Création et suivi des dépenses en temps réel |
| **Rapports financiers** | Génération de rapports journaliers et globaux |
| **Customisation & impression des badges** | Personnalisation (nom, carrefour, chef, QR code) + impression A4 |
| **Gestion des participants** | Recherche rapide, filtres avancés et suivi des inscrits |
| **Gestion des carrefours & responsables** | Affectation automatique et suivi des chefs |
| **Support multi-écrans** | Responsive design (desktop, tablette, mobile) |
| **PWA-ready** | Installation mobile, fonctionnement hors-ligne (Service Worker, manifest) |


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
