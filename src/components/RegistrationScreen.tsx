// src/components/RegistrationScreen.tsx

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
// L'import de sonner doit être simple
import { toast } from 'sonner';
import { ArrowLeft, Eye, EyeOff, ShieldCheck, User, Mail, Phone, Loader2 } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { useAuth } from '../contexts/AuthContext';
// Remarque : le composant Select n'est plus utilisé dans ce flux simplifié, mais on peut le garder pour plus tard.
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

// CORRECTION: L'interface des props est mise à jour.
interface RegistrationScreenProps {
  prefilledIdentifier: string; // La nouvelle prop unique
  onBack: () => void;
}

export function RegistrationScreen({ prefilledIdentifier, onBack }: RegistrationScreenProps) {
  const { register, isLoading } = useAuth();
  const { actualTheme } = useTheme();
  const isDark = actualTheme === 'dark';

  // --- ÉTATS DU FORMULAIRE ---
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  // Supposons un code pays par défaut, car il est difficile de le deviner.
  const [countryCode, setCountryCode] = useState('+228'); 
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Ce `useEffect` est crucial. Il s'exécute une seule fois au montage
  // pour analyser `prefilledIdentifier` et remplir les champs.
  useEffect(() => {
    if (prefilledIdentifier.includes('@')) {
      setEmail(prefilledIdentifier);
    } else {
      // Pour les numéros de téléphone, c'est plus complexe.
      // On le place dans le champ `phoneNumber` et on laisse le code pays par défaut.
      // On retire le '+' potentiel pour ne pas le dupliquer.
      setPhoneNumber(prefilledIdentifier.replace('+', ''));
    }
    // Le tableau de dépendances vide assure que cela ne se produit qu'une seule fois.
  }, []);


const handleRegister = async () => {
  // --- La validation des champs reste la même ---
  if (!username || username.length < 3) {
    toast.error("Le nom d'utilisateur doit contenir au moins 3 caractères.");
    return;
  }
  if (!email || !email.includes('@')) {
    toast.error("Veuillez entrer une adresse email valide.");
    return;
  }
  if (!phoneNumber || phoneNumber.length < 8) {
    toast.error("Veuillez entrer un numéro de téléphone valide.");
    return;
  }
  if (!password || password.length < 6) {
    toast.error("Le mot de passe doit contenir au moins 6 caractères.");
    return;
  }
  if (password !== confirmPassword) {
    toast.error("Les mots de passe ne correspondent pas.");
    return;
  }
  
  try {
    const fullPhoneNumber = `${countryCode}${phoneNumber}`;
    
    await register({
      username,
      email,
      phoneNumber: fullPhoneNumber,
      password,
      role: 'player',
    });

    toast.success(`Compte créé ! Bienvenue ${username} ! 🎉`);
    // Si succès, la redirection sera gérée automatiquement par App.tsx

  } catch (err: any) {
    // --- CORRECTION IMPORTANTE ---
    // On attrape l'erreur et on affiche un message détaillé à l'utilisateur.
    const errorMessage = err?.response?.data?.detail || "L'inscription a échoué. Veuillez vérifier vos informations.";
    toast.error(errorMessage);
    // L'utilisateur reste sur la page d'inscription pour pouvoir corriger ses erreurs.
  }
};

  // Le JSX est simplifié pour ne montrer que le formulaire d'inscription classique
  // La logique Google a été retirée pour clarifier, elle peut être réintégrée plus tard si besoin.
  return (
    <div 
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12"
      style={{ backgroundColor: isDark ? '#121212' : '#F4F4F7' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-md"
      >
        <div 
          className="rounded-3xl px-8 py-16 shadow-2xl"
          style={{ backgroundColor: isDark ? 'rgba(28, 28, 30, 0.75)' : 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.5)' }}
        >
          <button onClick={onBack} className="mb-6 flex items-center gap-2 transition-colors" style={{ color: isDark ? '#8E8E93' : '#6e6e73' }}>
            <ArrowLeft className="h-5 w-5" />
            <span>Retour</span>
          </button>
          
          <motion.div className="mb-8 text-center" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, duration: 0.6 }}>
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF6B00] to-[#FF8800] shadow-lg"><span className="text-3xl font-bold text-white">LH</span></div>
            <h1 className="text-3xl font-bold" style={{ color: isDark ? '#EAEAEA' : '#1C1C1E' }}>Créez votre compte</h1>
            <p className="mt-2" style={{ color: isDark ? '#8E8E93' : '#6e6e73' }}>Rejoignez Loto Happy dès maintenant</p>
          </motion.div>

          <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.6 }}>
            {/* Numéro de téléphone */}
            <div className="space-y-2">
              <Label htmlFor="phone" style={{ color: isDark ? '#EAEAEA' : '#1C1C1E' }}><Phone className="inline h-4 w-4 mr-2" />Numéro de téléphone</Label>
              <div className="flex">
                <Input value={countryCode} onChange={e => setCountryCode(e.target.value)} className="w-20 mr-2 rounded-l-md" />
                <Input id="phone" type="tel" placeholder="90102030" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="flex-1 rounded-r-md" style={{ backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF', borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#d1d1d6', color: isDark ? '#EAEAEA' : '#1C1C1E' }}/>
              </div>
            </div>
          
            {/* Adresse email */}
            <div className="space-y-2">
              <Label htmlFor="email" style={{ color: isDark ? '#EAEAEA' : '#1C1C1E' }}><Mail className="inline h-4 w-4 mr-2" />Adresse email</Label>
              <Input id="email" type="email" placeholder="votre@email.com" value={email} onChange={(e) => setEmail(e.target.value)} style={{ backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF', borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#d1d1d6', color: isDark ? '#EAEAEA' : '#1C1C1E' }}/>
            </div>
            
            {/* Nom d'utilisateur */}
            <div className="space-y-2">
              <Label htmlFor="username" style={{ color: isDark ? '#EAEAEA' : '#1C1C1E' }}><User className="inline h-4 w-4 mr-2" />Nom d'utilisateur</Label>
              <Input id="username" type="text" placeholder="Au moins 3 caractères" value={username} onChange={(e) => setUsername(e.target.value)} style={{ backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF', borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#d1d1d6', color: isDark ? '#EAEAEA' : '#1C1C1E' }}/>
            </div>

            {/* Créer un mot de passe */}
            <div className="space-y-2">
              <Label htmlFor="password" style={{ color: isDark ? '#EAEAEA' : '#1C1C1E' }}>Créer un mot de passe</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Au moins 6 caractères" value={password} onChange={(e) => setPassword(e.target.value)} className="pr-12" style={{ backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF', borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#d1d1d6', color: isDark ? '#EAEAEA' : '#1C1C1E' }}/>
<button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: isDark ? '#8E8E93' : '#6e6e73' }}>
  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
</button>
              </div>
            </div>

            {/* Confirmer le mot de passe */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" style={{ color: isDark ? '#EAEAEA' : '#1C1C1E' }}>Confirmer le mot de passe</Label>
              <div className="relative">
                <Input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} placeholder="Retapez votre mot de passe" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="pr-12" style={{ backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF', borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#d1d1d6', color: isDark ? '#EAEAEA' : '#1C1C1E' }}/>
<button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: isDark ? '#8E8E93' : '#6e6e73' }}> {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />} </button>
              </div>
            </div>

            <Button className="w-full bg-[#FFD700] text-lg text-[#121212] hover:bg-[#FFD700]/90 h-14" onClick={handleRegister} disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <ShieldCheck className="mr-2 h-6 w-6" />}
              Créer mon compte
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}