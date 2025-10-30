# 💰 SYSTÈME DE RETRAIT MOBILE MONEY

## 🎯 Vue d'ensemble
Système de retrait d'argent via Mobile Money avec validation intelligente des numéros par opérateur.

---

## ✅ CORRECTIONS APPLIQUÉES

### **Problème initial**
❌ L'utilisateur ne pouvait **pas taper** dans le champ de numéro de téléphone
❌ Le `useEffect` bloquait la saisie en validant à chaque changement

### **Solution implémentée**
✅ **Validation uniquement au clic sur "Confirmer le retrait"**
✅ **Pré-remplissage intelligent** à l'étape 3 (une seule fois)
✅ **Saisie libre** : l'utilisateur peut taper et modifier le numéro
✅ **Message d'aide** : Affichage des préfixes acceptés sous le champ

---

## 🔄 FLUX DE RETRAIT (3 étapes)

### **Étape 1 : Montant**
```
┌────────────────────────────┐
│ Montant minimum : 500 F    │
│ Montants rapides : 1K-50K  │
│ Validation du solde        │
└────────────────────────────┘
```

### **Étape 2 : Opérateur Mobile Money**
```
┌────────────────────────────┐
│ 💰 Yas Togo (ex T-Money)  │
│ 📱 Moov Money Togo        │
│ 📞 MTN Mobile Money       │
│ 💵 Flooz (Moov)           │
└────────────────────────────┘
```

### **Étape 3 : Confirmation + Saisie du numéro**
```
┌────────────────────────────┐
│ Champ de saisie LIBRE      │
│ ↓                          │
│ Pré-remplissage SI match   │
│ (sinon vide)               │
│ ↓                          │
│ Validation au CLIC final   │
└────────────────────────────┘
```

---

## 🎯 LOGIQUE DE PRÉ-REMPLISSAGE

```typescript
// Au passage à l'étape 3 (une seule fois)
if (numéro utilisateur CORRESPOND à l'opérateur) {
  → Pré-remplir le champ
  → Afficher un checkmark ✓
} else {
  → Laisser le champ VIDE
  → L'utilisateur tape manuellement
}

// L'utilisateur peut TOUJOURS modifier le numéro
// Validation finale au clic sur "Confirmer le retrait"
```

---

## 📱 OPÉRATEURS ET PRÉFIXES

### **🇹🇬 TOGO**
| Opérateur | Préfixes |
|-----------|----------|
| **Yas Togo** | 90, 70, 73, 93, 91 |
| **Moov Togo** | 98, 78, 79, 99, 97 |
| **MTN** | 92, 93, 94, 95, 96 |
| **Flooz** | 96, 97, 98, 99 |

### **🇧🇯 BÉNIN**
| Opérateur | Préfixes |
|-----------|----------|
| **MTN** | 92, 93, 94, 95, 96 |
| **Moov Bénin** | 96, 97, 61, 62, 63 |
| **Orange Money** | 07, 08, 09, 57, 58, 59 |
| **Wave** | 91, 92, 93, 94, 95 |

### **🇨🇮 CÔTE D'IVOIRE**
| Opérateur | Préfixes |
|-----------|----------|
| **MTN** | 92, 93, 94, 95, 96 |
| **Orange Money** | 07, 08, 09, 57, 58, 59 |
| **Wave** | 91, 92, 93, 94, 95 |

---

## 🔍 VALIDATION AU CLIC FINAL

```typescript
// Au clic sur "Confirmer le retrait"
const validation = validateNumberForOperator(
  phoneNumber,      // Ex: "90102030"
  userCountryCode,  // Ex: "+228"
  provider          // Ex: "yas"
);

if (!validation.isValid) {
  toast.error(validation.message);
  // Ex: "Pour Yas Togo, le numéro doit commencer par : 90, 70, 73, 93, 91"
  return; // Bloque le retrait
}

// ✅ Validation OK → Retrait effectué
```

---

## 📝 EXEMPLE CONCRET

### **Scénario A : Numéro correspondant**
```
Utilisateur : +22890102030 (Yas Togo)
Opérateur sélectionné : Yas Togo
→ Champ pré-rempli avec "90102030"
→ Utilisateur peut modifier si besoin
→ Validation au clic final ✅
```

### **Scénario B : Numéro non correspondant**
```
Utilisateur : +22890102030 (Yas Togo)
Opérateur sélectionné : Moov Money Togo
→ Champ VIDE (pas de pré-remplissage)
→ Utilisateur tape un autre numéro Moov
→ Ex: "98123456"
→ Validation au clic final ✅
```

### **Scénario C : Erreur de saisie**
```
Utilisateur tape : "90102030"
Opérateur sélectionné : Moov Money Togo
Clic sur "Confirmer le retrait"
→ ❌ Toast d'erreur :
   "Pour Moov Money Togo, le numéro doit commencer par : 98, 78, 79, 99, 97"
→ L'utilisateur corrige → "98102030"
→ Nouvelle validation ✅
```

---

## 🛠️ FICHIERS MODIFIÉS

### **`/components/WithdrawModal.tsx`**
```typescript
// État
const [hasPreFilled, setHasPreFilled] = useState(false);

// useEffect : Pré-remplissage unique à l'étape 3
useEffect(() => {
  if (step === 3 && !hasPreFilled && provider) {
    // Pré-remplir SI correspondance
    // Sinon laisser vide
  }
}, [step, provider]);

// Validation finale au clic
if (step === 3) {
  const validation = validateNumberForOperator(...);
  if (!validation.isValid) {
    toast.error(validation.message);
    return;
  }
}
```

### **`/utils/auth.ts`**
```typescript
// Nouvelles fonctions
export function validateNumberForOperator(
  phoneNumber: string,
  countryCode: string,
  operatorId: string
): { isValid: boolean; message?: string }

export function detectOperatorFromNumber(
  phoneNumber: string,
  countryCode: string
): MobileMoneyOperator | null

export function getOperatorsForCountry(
  countryCode: string
): MobileMoneyOperator[]
```

---

## 🎨 INTERFACE UTILISATEUR

### **Message d'aide sous le champ**
```
┌──────────────────────────────────────┐
│ Numéro de téléphone                  │
│ ┌──────────────────────────────────┐ │
│ │ 90102030                         │ │
│ └──────────────────────────────────┘ │
│ Pour Yas Togo, le numéro doit        │
│ commencer par : 90, 70, 73, 93, 91   │
└──────────────────────────────────────┘
```

### **Toast d'erreur personnalisé**
```
❌ Pour Moov Money Togo, le numéro doit
   commencer par : 98, 78, 79, 99, 97
```

---

## ✅ CHECKLIST DE TEST

- [x] L'utilisateur peut **taper librement** dans le champ
- [x] Pré-remplissage si numéro correspond
- [x] Champ vide si numéro ne correspond pas
- [x] Validation **uniquement** au clic final
- [x] Message d'erreur clair avec préfixes
- [x] Affichage des préfixes acceptés
- [x] Support multi-pays
- [x] Réinitialisation correcte à la fermeture

---

## 🚀 PROCHAINES ÉTAPES

- [ ] Validation en temps réel avec API opérateurs
- [ ] Historique des numéros utilisés
- [ ] Suggestion automatique de numéros valides
- [ ] Vérification du solde Mobile Money

---

**Date** : 26 Octobre 2025  
**Version** : 2.0 (Validation au clic uniquement)  
**Statut** : ✅ Fonctionnel
