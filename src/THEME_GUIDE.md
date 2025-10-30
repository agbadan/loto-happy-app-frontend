# 🎨 Guide du Système de Thèmes - Loto Happy

## 📋 Vue d'ensemble

Loto Happy dispose d'un **système de thèmes harmonieux et intelligent** avec trois modes :
- **🌞 Thème Clair** : Lumineux et accueillant pour une utilisation en journée
- **🌙 Thème Sombre** : Confort optimal pour les yeux, parfait pour le jeu
- **🖥️ Thème Automatique** : S'adapte automatiquement aux préférences système de l'utilisateur

---

## 🎯 Stratégie de Cohérence

### Rôle de Chaque Thème

#### Thème Clair (Light)
- **Contexte d'utilisation** : Écran de connexion par défaut, utilisation en journée
- **Objectif** : Accueillant, lumineux, rassurant et professionnel
- **Public cible** : Nouveaux utilisateurs, utilisation diurne

#### Thème Sombre (Dark)
- **Contexte d'utilisation** : Application principale après connexion
- **Objectif** : Immersif, concentré sur le jeu, met en valeur les couleurs
- **Public cible** : Joueurs réguliers, utilisation nocturne

#### Thème Automatique (Auto)
- **Contexte d'utilisation** : Adaptable selon les préférences système
- **Objectif** : Flexibilité maximale, respect des choix utilisateur
- **Public cible** : Utilisateurs qui changent de contexte

---

## 🎨 Palette de Couleurs

### Thème Clair

| Élément | Couleur | Code | Usage |
|---------|---------|------|-------|
| Fond principal | Gris très clair | `#F4F4F7` | Background de l'app |
| Cartes | Blanc pur | `#FFFFFF` | Cartes, panneaux |
| **Texte principal** | **Gris anthracite foncé** | **`#1A202C`** | Titres, textes importants |
| Texte secondaire | Gris moyen | `#718096` | Labels, sous-titres |
| **Accent principal** | **Orange vif** | **`#F97316`** | Montants, éléments importants |
| Accent secondaire | Or/Jaune | `#FFD700` | Boutons d'action |
| Succès | Vert | `#34C759` | Confirmations, gains |
| Erreur | Rouge | `#FF3B30` | Alertes, erreurs |

### Thème Sombre

| Élément | Couleur | Code | Usage |
|---------|---------|------|-------|
| Fond principal | Noir profond | `#121212` | Background de l'app |
| Cartes | Gris anthracite | `#1C1C1E` | Cartes, panneaux |
| Texte principal | Blanc cassé | `#EAEAEA` | Titres, textes importants |
| Texte secondaire | Gris clair | `#8E8E93` | Labels, sous-titres |
| Accent orange | Orange vif | `#FF6B00` | Dégradés, highlights |
| Accent or | Or/Jaune | `#FFD700` | Boutons, jackpots |
| Succès | Vert | `#34C759` | Confirmations, gains |
| Erreur | Rouge | `#FF3B30` | Alertes, erreurs |

---

## 🔒 Éléments Invariants (Ancrages Visuels)

Ces éléments **ne changent JAMAIS** de couleur, quel que soit le thème :

### 1. Logo "LH"
- **Couleur** : Toujours orange `#FF6B00`
- **Raison** : Identité visuelle de la marque

### 2. Boutons d'Action Principaux
- **Couleur** : Toujours or/jaune `#FFD700` avec texte noir `#121212`
- **Raison** : Cohérence de l'appel à l'action

### 3. Drapeaux des Pays
- **Couleur** : Couleurs naturelles des drapeaux
- **Raison** : Authenticité et reconnaissance

### 4. Alertes
- **Succès** : Toujours vert `#34C759`
- **Erreur** : Toujours rouge `#FF3B30`
- **Raison** : Standards universels

### 5. Jackpots et Montants Importants
- **Couleur en thème sombre** : Or `#FFD700`
- **Couleur en thème clair** : Orange vif `#F97316` (meilleur contraste)
- **Raison** : Mise en valeur maximale

---

## ⚡ Transitions Fluides

### Configuration CSS
```css
transition: background-color 0.3s ease-in-out, 
            color 0.3s ease-in-out,
            border-color 0.3s ease-in-out,
            box-shadow 0.3s ease-in-out;
```

### Durée
- **0.3 secondes** : Transition rapide et discrète
- **ease-in-out** : Accélération et décélération naturelles

### Expérience Utilisateur
1. **Changement instantané** : L'application réagit immédiatement
2. **Toast de confirmation** : Notification visuelle du changement
3. **Persistence** : Le choix est sauvegardé dans `localStorage`

---

## 🔧 Implémentation Technique

### ThemeProvider
```tsx
type Theme = 'light' | 'dark' | 'auto';
```

- **Détection automatique** : Via `window.matchMedia('(prefers-color-scheme: dark)')`
- **Sauvegarde** : `localStorage.getItem('loto-happy-theme')`
- **Application** : Classe CSS `theme-light` sur le `<body>`

### Utilisation dans les Composants
```tsx
import { useTheme } from './ThemeProvider';

const { theme, actualTheme, setTheme } = useTheme();
```

---

## 📱 Sélecteur de Thème (Profil > Apparence)

### Options Disponibles
1. **Clair** (Sun icon) : Lumineux et accueillant
2. **Sombre** (Moon icon) : Confort pour vos yeux
3. **Automatique** (Monitor icon) : Suit votre système

### Indicateur Visuel
- Bordure dorée `#FFD700` sur l'option active
- Background avec opacité `#FFD700/10`
- Barre de progression dorée en bas

---

## 🎯 Bonnes Pratiques

### ✅ À Faire
- Utiliser les variables CSS (`--am-text-primary`, `--foreground`, etc.)
- Tester les deux thèmes pour chaque nouveau composant
- S'assurer que les contrastes respectent WCAG AA (4.5:1 minimum)
- Conserver les couleurs invariantes pour la cohérence

### ❌ À Éviter
- Hardcoder les couleurs en dehors des variables CSS
- Modifier les couleurs des éléments invariants
- Utiliser des transitions trop longues (> 0.5s)
- Oublier de tester l'accessibilité

---

## 🌈 Corrections Appliquées

### Problème Initial
- **Texte blanc sur fond blanc** en thème clair
- Manque de contraste
- Lisibilité compromise

### Solution Appliquée
1. **Texte principal** : `#1A202C` (gris anthracite très foncé)
2. **Texte secondaire** : `#718096` (gris moyen)
3. **Accent orange** : `#F97316` (meilleur contraste que le jaune)
4. **Ombres subtiles** : `box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08)` pour les cartes

---

## 📊 Résultat Final

### Thème Clair
✅ Lisibilité parfaite  
✅ Contraste optimal (WCAG AA compliant)  
✅ Design professionnel et accueillant  
✅ Cohérence avec la marque  

### Thème Sombre
✅ Confort visuel optimal  
✅ Couleurs vibrantes qui ressortent  
✅ Expérience immersive  
✅ Économie de batterie (OLED)  

### Transition
✅ Fluide et élégante (0.3s)  
✅ Toast de confirmation  
✅ Persistence dans localStorage  
✅ Support du mode automatique  

---

## 🚀 Évolutions Futures Possibles

- Ajouter des thèmes personnalisés
- Permettre de choisir les couleurs d'accent
- Mode "Haute visibilité" pour accessibilité
- Synchronisation entre appareils (compte utilisateur)

---

**Dernière mise à jour** : Octobre 2025  
**Version du système de thèmes** : 2.0  
**Compatibilité** : Tous les navigateurs modernes
