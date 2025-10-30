import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner@2.0.3';
import { Wallet, ArrowRight, Smartphone, AlertCircle, CheckCircle } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { 
  getCurrentUser, 
  MOBILE_MONEY_OPERATORS, 
  getOperatorsForCountry, 
  detectOperatorFromNumber,
  validateNumberForOperator,
  PHONE_FORMATS
} from '../utils/auth';

interface WithdrawModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentBalance: number;
  onWithdraw: (amount: number, provider: string, phoneNumber: string) => void;
}

// Montants rapides
const QUICK_AMOUNTS = [1000, 5000, 10000, 25000, 50000];

export function WithdrawModal({ open, onOpenChange, currentBalance, onWithdraw }: WithdrawModalProps) {
  const [amount, setAmount] = useState('');
  const [provider, setProvider] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [step, setStep] = useState(1); // 1: Montant, 2: Opérateur, 3: Confirmation
  const [detectedOperator, setDetectedOperator] = useState<string | null>(null);
  const [hasPreFilled, setHasPreFilled] = useState(false);
  
  const { actualTheme } = useTheme();
  const isDark = actualTheme === 'dark';
  const currentUser = getCurrentUser();
  
  // Détecter le code pays de l'utilisateur
  const userCountryCode = currentUser?.phoneNumber 
    ? '+' + currentUser.phoneNumber.substring(0, 3) 
    : '+228';
  
  // Obtenir les opérateurs disponibles pour le pays
  const availableOperators = getOperatorsForCountry(userCountryCode);

  // Pré-remplir UNIQUEMENT au passage à l'étape 3, une seule fois
  useEffect(() => {
    if (step === 3 && !hasPreFilled && currentUser?.phoneNumber && provider) {
      // Retirer l'indicatif (3 premiers chiffres) pour avoir le numéro local
      const localNumber = currentUser.phoneNumber.substring(3);
      
      // Vérifier si le numéro de l'utilisateur correspond à l'opérateur sélectionné
      const validation = validateNumberForOperator(localNumber, userCountryCode, provider);
      
      if (validation.isValid) {
        // Le numéro correspond → pré-remplir
        setPhoneNumber(localNumber);
        setDetectedOperator(provider);
      } else {
        // Le numéro ne correspond pas → laisser vide pour saisie manuelle
        setPhoneNumber('');
        setDetectedOperator(null);
      }
      
      setHasPreFilled(true);
    }
    
    // Réinitialiser hasPreFilled si on revient en arrière
    if (step < 3) {
      setHasPreFilled(false);
    }
  }, [step, provider, currentUser, userCountryCode, hasPreFilled]);

  const handleAmountSelect = (value: number) => {
    setAmount(value.toString());
  };

  const handleContinue = () => {
    const withdrawAmount = parseFloat(amount);
    
    if (step === 1) {
      // Validation du montant
      if (!amount || withdrawAmount <= 0) {
        toast.error('Veuillez entrer un montant valide');
        return;
      }
      
      if (withdrawAmount < 500) {
        toast.error('Le montant minimum de retrait est 500 F CFA');
        return;
      }
      
      if (withdrawAmount > currentBalance) {
        toast.error('Solde insuffisant');
        return;
      }
      
      setStep(2);
    } else if (step === 2) {
      // Validation de l'opérateur
      if (!provider) {
        toast.error('Veuillez sélectionner un opérateur');
        return;
      }
      
      setStep(3);
    } else if (step === 3) {
      // Validation du numéro
      if (!phoneNumber || phoneNumber.length < 8) {
        toast.error('Veuillez entrer un numéro valide');
        return;
      }
      
      // ✅ NOUVELLE VALIDATION : Vérifier que le numéro correspond à l'opérateur sélectionné
      const validation = validateNumberForOperator(phoneNumber, userCountryCode, provider);
      if (!validation.isValid) {
        toast.error(validation.message || 'Numéro invalide pour cet opérateur');
        return;
      }
      
      // Effectuer le retrait
      onWithdraw(withdrawAmount, provider, phoneNumber);
      
      // Réinitialiser et fermer
      setAmount('');
      setProvider('');
      setPhoneNumber('');
      setStep(1);
      setHasPreFilled(false);
      onOpenChange(false);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleClose = () => {
    setAmount('');
    setProvider('');
    setStep(1);
    onOpenChange(false);
  };

  const selectedProvider = MOBILE_MONEY_OPERATORS.find(p => p.id === provider);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent 
        className="sm:max-w-[425px]"
        style={{
          backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#e5e5e5',
        }}
      >
        <DialogHeader>
          <DialogTitle 
            className="flex items-center gap-2 text-2xl"
            style={{ color: isDark ? '#EAEAEA' : '#1C1C1E' }}
          >
            <Wallet className="h-6 w-6 text-[#FFD700]" />
            Retirer mon argent
          </DialogTitle>
          <DialogDescription style={{ color: isDark ? '#8E8E93' : '#6e6e73' }}>
            {step === 1 && 'Combien souhaitez-vous retirer ?'}
            {step === 2 && 'Choisissez votre opérateur Mobile Money'}
            {step === 3 && 'Confirmez votre retrait'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Indicateur d'étapes */}
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className="h-2 w-16 rounded-full transition-all"
                style={{
                  backgroundColor: s <= step 
                    ? '#FFD700' 
                    : isDark ? '#3A3A3C' : '#d1d1d6'
                }}
              />
            ))}
          </div>

          {/* Solde actuel */}
          <div 
            className="rounded-xl p-4 text-center"
            style={{
              backgroundColor: isDark ? '#2C2C2E' : '#F4F4F7',
              borderWidth: '2px',
              borderColor: '#FFD700',
            }}
          >
            <p 
              className="text-sm mb-1"
              style={{ color: isDark ? '#8E8E93' : '#6e6e73' }}
            >
              Solde de jeu disponible
            </p>
            <p className="text-3xl font-bold text-[#FFD700]">
              {currentBalance.toLocaleString('fr-FR')} F
            </p>
          </div>

          {/* ÉTAPE 1 : Montant */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label style={{ color: isDark ? '#EAEAEA' : '#1C1C1E' }}>
                  Montant à retirer
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="Entrez le montant"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pr-12 text-lg"
                    style={{
                      backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#d1d1d6',
                      color: isDark ? '#EAEAEA' : '#1C1C1E',
                    }}
                  />
                  <span 
                    className="absolute right-4 top-1/2 -translate-y-1/2 font-medium"
                    style={{ color: isDark ? '#8E8E93' : '#6e6e73' }}
                  >
                    F CFA
                  </span>
                </div>
              </div>

              {/* Montants rapides */}
              <div className="space-y-2">
                <Label style={{ color: isDark ? '#EAEAEA' : '#1C1C1E' }}>
                  Montants rapides
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {QUICK_AMOUNTS.filter(qa => qa <= currentBalance).map((qa) => (
                    <Button
                      key={qa}
                      variant="outline"
                      className="h-12"
                      onClick={() => handleAmountSelect(qa)}
                      style={{
                        backgroundColor: amount === qa.toString() 
                          ? '#FFD700' 
                          : isDark ? '#1C1C1E' : '#FFFFFF',
                        borderColor: amount === qa.toString()
                          ? '#FFD700'
                          : isDark ? 'rgba(255, 255, 255, 0.1)' : '#d1d1d6',
                        color: amount === qa.toString()
                          ? '#121212'
                          : isDark ? '#EAEAEA' : '#1C1C1E',
                      }}
                    >
                      {(qa / 1000).toFixed(0)}K
                    </Button>
                  ))}
                </div>
              </div>

              {/* Info minimum */}
              <div 
                className="flex items-start gap-2 rounded-lg p-3"
                style={{
                  backgroundColor: isDark ? 'rgba(255, 107, 0, 0.1)' : 'rgba(255, 107, 0, 0.05)',
                  borderWidth: '1px',
                  borderColor: 'rgba(255, 107, 0, 0.3)',
                }}
              >
                <AlertCircle className="h-4 w-4 mt-0.5 text-[#FF6B00] flex-shrink-0" />
                <p 
                  className="text-sm"
                  style={{ color: isDark ? '#EAEAEA' : '#1C1C1E' }}
                >
                  Montant minimum : <strong>500 F CFA</strong>
                  <br />
                  Le retrait est gratuit et instantané
                </p>
              </div>
            </div>
          )}

          {/* ÉTAPE 2 : Opérateur */}
          {step === 2 && (
            <div className="space-y-4">
              <Label style={{ color: isDark ? '#EAEAEA' : '#1C1C1E' }}>
                Choisissez votre opérateur
              </Label>
              <div className="grid gap-3">
                {availableOperators.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setProvider(p.id)}
                    className="flex items-center gap-3 rounded-xl p-4 transition-all"
                    style={{
                      backgroundColor: provider === p.id 
                        ? isDark ? '#2C2C2E' : '#F4F4F7'
                        : isDark ? '#1C1C1E' : '#FFFFFF',
                      borderWidth: '2px',
                      borderColor: provider === p.id ? p.color : isDark ? 'rgba(255, 255, 255, 0.1)' : '#d1d1d6',
                    }}
                  >
                    <span className="text-3xl">{p.icon}</span>
                    <div className="flex-1 text-left">
                      <p 
                        className="font-medium"
                        style={{ color: isDark ? '#EAEAEA' : '#1C1C1E' }}
                      >
                        {p.name}
                      </p>
                      <p 
                        className="text-sm"
                        style={{ color: isDark ? '#8E8E93' : '#6e6e73' }}
                      >
                        Retrait instantané
                      </p>
                    </div>
                    {provider === p.id && (
                      <div 
                        className="h-6 w-6 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: p.color }}
                      >
                        <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ÉTAPE 3 : Confirmation */}
          {step === 3 && (
            <div className="space-y-4">
              {/* Numéro de téléphone */}
              <div className="space-y-2">
                <Label style={{ color: isDark ? '#EAEAEA' : '#1C1C1E' }}>
                  <Smartphone className="inline h-4 w-4 mr-2" />
                  Numéro de téléphone
                </Label>
                <Input
                  type="tel"
                  placeholder="90102030"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                  className="text-lg"
                  style={{
                    backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#d1d1d6',
                    color: isDark ? '#EAEAEA' : '#1C1C1E',
                  }}
                />
                {selectedProvider && (
                  <p 
                    className="text-xs"
                    style={{ color: isDark ? '#8E8E93' : '#6e6e73' }}
                  >
                    Pour {selectedProvider.name}, le numéro doit commencer par : {selectedProvider.prefixes.join(', ')}
                  </p>
                )}
              </div>

              {/* Récapitulatif */}
              <div 
                className="rounded-xl p-4 space-y-3"
                style={{
                  backgroundColor: isDark ? '#2C2C2E' : '#F4F4F7',
                  borderWidth: '1px',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#d1d1d6',
                }}
              >
                <h4 
                  className="font-medium"
                  style={{ color: isDark ? '#EAEAEA' : '#1C1C1E' }}
                >
                  Récapitulatif du retrait
                </h4>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span style={{ color: isDark ? '#8E8E93' : '#6e6e73' }}>Montant</span>
                    <span 
                      className="font-bold"
                      style={{ color: isDark ? '#EAEAEA' : '#1C1C1E' }}
                    >
                      {parseFloat(amount).toLocaleString('fr-FR')} F CFA
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span style={{ color: isDark ? '#8E8E93' : '#6e6e73' }}>Opérateur</span>
                    <div className="flex items-center gap-2">
                      <span>{selectedProvider?.icon}</span>
                      <span 
                        className="font-medium"
                        style={{ color: isDark ? '#EAEAEA' : '#1C1C1E' }}
                      >
                        {selectedProvider?.name}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span style={{ color: isDark ? '#8E8E93' : '#6e6e73' }}>Frais</span>
                    <span 
                      className="font-medium text-[#34C759]"
                    >
                      GRATUIT
                    </span>
                  </div>
                  
                  <div 
                    className="pt-2 mt-2 flex items-center justify-between"
                    style={{
                      borderTopWidth: '1px',
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#d1d1d6',
                    }}
                  >
                    <span 
                      className="font-medium"
                      style={{ color: isDark ? '#EAEAEA' : '#1C1C1E' }}
                    >
                      Vous recevez
                    </span>
                    <span className="text-xl font-bold text-[#FFD700]">
                      {parseFloat(amount).toLocaleString('fr-FR')} F CFA
                    </span>
                  </div>
                </div>
              </div>

              {/* Avertissement */}
              <div 
                className="flex items-start gap-2 rounded-lg p-3"
                style={{
                  backgroundColor: isDark ? 'rgba(79, 0, 188, 0.1)' : 'rgba(79, 0, 188, 0.05)',
                  borderWidth: '1px',
                  borderColor: 'rgba(79, 0, 188, 0.3)',
                }}
              >
                <AlertCircle className="h-4 w-4 mt-0.5 text-[#4F00BC] flex-shrink-0" />
                <p 
                  className="text-sm"
                  style={{ color: isDark ? '#EAEAEA' : '#1C1C1E' }}
                >
                  Assurez-vous que le numéro est correct. Le transfert est instantané et irréversible.
                </p>
              </div>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex gap-3 pt-2">
            {step > 1 && (
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleBack}
                style={{
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#d1d1d6',
                  color: isDark ? '#EAEAEA' : '#1C1C1E',
                }}
              >
                Retour
              </Button>
            )}
            <Button
              className="flex-1 bg-[#FFD700] text-[#121212] hover:bg-[#FFD700]/90"
              onClick={handleContinue}
            >
              {step === 3 ? 'Confirmer le retrait' : 'Continuer'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}