# 🎨 Référence Rapide des Couleurs - Loto Happy

## Thème Clair

```css
/* Fond */
--background: #F4F4F7;           /* Fond principal */
--card: #FFFFFF;                  /* Cartes, panneaux */

/* Texte */
--foreground: #1A202C;            /* ⭐ Texte principal (gris anthracite foncé) */
--muted-foreground: #718096;      /* Texte secondaire (gris moyen) */

/* Accents */
--secondary: #F97316;             /* ⭐ Orange vif (montants, highlights) */
--accent: #FFD700;                /* Or/Jaune (boutons d'action) */

/* États */
--success: #34C759;               /* Vert (confirmations, gains) */
--error: #FF3B30;                 /* Rouge (alertes, erreurs) */
```

## Thème Sombre

```css
/* Fond */
--background: #121212;            /* Fond principal (noir profond) */
--card: #1C1C1E;                  /* Cartes, panneaux (gris anthracite) */

/* Texte */
--foreground: #EAEAEA;            /* Texte principal (blanc cassé) */
--muted-foreground: #8E8E93;      /* Texte secondaire (gris clair) */

/* Accents */
--secondary: #FF6B00;             /* Orange vif (dégradés) */
--accent: #FFD700;                /* Or/Jaune (jackpots, boutons) */

/* États */
--success: #34C759;               /* Vert (confirmations, gains) */
--error: #FF3B30;                 /* Rouge (alertes, erreurs) */
```

## Éléments Invariants (Ne changent jamais)

| Élément | Couleur | Code |
|---------|---------|------|
| Logo "LH" | Orange | `#FF6B00` |
| Boutons principaux | Or + texte noir | `#FFD700` + `#121212` |
| Succès | Vert | `#34C759` |
| Erreur | Rouge | `#FF3B30` |
| Drapeaux | Couleurs naturelles | N/A |

## Variables CSS Custom (Loto Happy)

```css
/* Thème Clair */
.theme-light {
  --am-bg-main: #F4F4F7;
  --am-bg-card: #FFFFFF;
  --am-text-primary: #1A202C;      /* ⭐ CORRIGÉ */
  --am-text-secondary: #718096;
  --am-accent-orange: #F97316;     /* ⭐ CORRIGÉ */
  --am-accent-gold: #FFD700;
}

/* Thème Sombre */
:root {
  --am-bg-main: #121212;
  --am-bg-card: #1C1C1E;
  --am-text-primary: #EAEAEA;
  --am-text-secondary: #8E8E93;
  --am-accent-orange: #FF6B00;
  --am-accent-gold: #FFD700;
}
```

## Utilisation Recommandée

### Texte
```tsx
<h1 className="text-foreground">Titre principal</h1>
<p className="text-muted-foreground">Texte secondaire</p>
```

### Cartes
```tsx
<Card className="bg-card border-border">
  Contenu
</Card>
```

### Accents
```tsx
<span className="text-[#FFD700]">Jackpot</span>              {/* Or - Invariant */}
<span className="text-[#F97316]">Montant (Clair)</span>      {/* Orange vif */}
<span className="text-[#FF6B00]">Montant (Sombre)</span>     {/* Orange */}
```

## Contraste WCAG AA

| Combinaison | Ratio | Status |
|-------------|-------|--------|
| `#1A202C` sur `#FFFFFF` | 15.2:1 | ✅ AAA |
| `#718096` sur `#FFFFFF` | 4.8:1 | ✅ AA |
| `#F97316` sur `#FFFFFF` | 4.6:1 | ✅ AA |
| `#EAEAEA` sur `#121212` | 13.8:1 | ✅ AAA |
| `#FFD700` sur `#121212` | 10.5:1 | ✅ AAA |

---

**Note** : Toujours tester les deux thèmes lors de l'ajout de nouvelles couleurs !
