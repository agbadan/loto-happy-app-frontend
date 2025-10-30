# Système de Thèmes - Loto Happy

## Vue d'ensemble

L'application Loto Happy dispose maintenant d'un système complet de thèmes permettant aux utilisateurs de basculer entre un **thème sombre** (par défaut) et un **thème clair**.

## Architecture

### 1. Variables CSS (`/styles/globals.css`)

Le système utilise des **CSS Custom Properties (variables CSS)** pour définir toutes les couleurs de l'application :

- **`:root`** : Définit les couleurs du thème sombre (par défaut)
- **`.theme-light`** : Redéfinit les couleurs pour le thème clair

#### Couleurs principales maintenues dans les deux thèmes :
- Or (accent principal) : `#FFD700`
- Orange : `#FF6B00`
- Violet : `#4F00BC`
- Succès : `#34C759`
- Erreur : `#FF3B30`

### 2. ThemeProvider (`/components/ThemeProvider.tsx`)

Composant React Context qui :
- Gère l'état du thème actuel (`'light'` ou `'dark'`)
- Persiste le choix dans `localStorage` (clé : `'loto-happy-theme'`)
- Applique/retire la classe `.theme-light` sur le `<body>`
- Expose les fonctions `setTheme()` et `toggleTheme()`

### 3. Écran de Connexion (`/components/LoginScreen.tsx`)

**Caractéristiques spéciales :**

#### Animation de Boules Flottantes
- 20 boules blanches de tailles variables (50-200px)
- Animation de flottement lent (30-50 secondes par cycle)
- Effet de profondeur de champ (bokeh) :
  - Boules lointaines : floues (8px blur), transparence 15%
  - Boules moyennes : légèrement floues (3px blur), transparence 25%
  - Boules proches : nettes (0px blur), transparence 40%

#### Effet Glassmorphism
- Conteneur du formulaire semi-transparent : `rgba(255, 255, 255, 0.8)`
- Backdrop filter : `blur(12px)`
- Bordure blanche fine
- Fond général : `#F4F4F7` (gris très clair)

#### Comportement du Thème
- L'écran de connexion **force le thème clair** au montage
- Restaure le thème sauvegardé au démontage (si ce n'est pas le thème clair)

### 4. Contrôle Utilisateur (`/components/ProfileScreen.tsx`)

Dans l'onglet **Paramètres** → Section **Apparence** :
- Interrupteur (Switch) "Thème Clair"
- Toast de confirmation lors du changement
- Le choix est immédiatement appliqué et sauvegardé

## Utilisation du Thème dans l'Application

### Pour utiliser le hook de thème dans un composant :

```tsx
import { useTheme } from "./ThemeProvider";

function MonComposant() {
  const { theme, setTheme, toggleTheme } = useTheme();
  
  // Vérifier le thème actuel
  if (theme === 'light') {
    // Code spécifique au thème clair
  }
  
  // Changer de thème
  setTheme('dark');
  
  // Basculer entre les thèmes
  toggleTheme();
}
```

## Palette de Couleurs

### Thème Sombre (par défaut)
- **Fond principal** : `#121212`
- **Cartes** : `#1C1C1E`
- **Texte principal** : `#EAEAEA`
- **Texte secondaire** : `#8E8E93`
- **Bordures** : `rgba(255, 255, 255, 0.08)`

### Thème Clair
- **Fond principal** : `#F4F4F7`
- **Cartes** : `#FFFFFF` (avec ombre subtile)
- **Texte principal** : `#1C1C1E`
- **Texte secondaire** : `#6E6E73`
- **Bordures** : `rgba(0, 0, 0, 0.1)`

## Transitions

Toutes les transitions de couleur sont animées avec une durée de **0.3s** et un easing **ease** pour une expérience fluide.

## Persistence

Le thème choisi est automatiquement sauvegardé dans le `localStorage` du navigateur sous la clé `'loto-happy-theme'`, permettant de conserver le choix de l'utilisateur entre les sessions.

## Notes Techniques

1. La classe `.theme-light` est appliquée sur le `<body>` et non sur `<html>` pour une meilleure compatibilité
2. Les variables CSS utilisent le préfixe `--am-` pour les couleurs métier et suivent la convention shadcn pour les composants UI
3. L'animation des boules utilise Motion (anciennement Framer Motion) pour des performances optimales
4. Le backdrop-filter est supporté par tous les navigateurs modernes mais a un fallback gracieux
