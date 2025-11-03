// src/components/RegistrationScreen.tsx

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { ArrowLeft, ShieldCheck, User, Mail, Phone, Loader2 } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { useAuth } from '../contexts/AuthContext';
import { completeGoogleRegistrationAPI } from '../utils/authAPI'; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const COUNTRIES = [
  { code: "+228", name: "Togo", flag: "🇹🇬" },
  { code: "+233", name: "Ghana", flag: "🇬🇭" },
  { code: "+229", name: "Bénin", flag: "🇧🇯" },
  { code: "+226", name: "Burkina Faso", flag: "🇧🇫" },
  { code: "+225", name: "Côte d'Ivoire", flag: "🇨🇮" },
];

interface RegistrationScreenProps {
  prefilledIdentifier?: string;
  prefilledName?: string;
  onBack: () => void;
}

export function RegistrationScreen({ prefilledIdentifier, prefilledName, onBack }: RegistrationScreenProps) {
  const { register, isLoading } = useAuth();
  const { actualTheme } = useTheme();
  const isDark = actualTheme === 'dark';

  const isGoogleSignUp = !!prefilledName;

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+228'); 
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // NOUVEL ÉTAT : Pour gérer le chargement indépendamment du contexte
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isGoogleSignUp) {
        // Cas d'une inscription Google
        setEmail(prefilledIdentifier || '');
        setUsername(prefilledName || '');
    } else {
        // Cas d'une inscription classique
        if (prefilledIdentifier?.includes('@')) {
            setEmail(prefilledIdentifier);
        } else {
            setPhoneNumber(prefilledIdentifier?.replace('+', '') || '');
        }
    }
  }, [prefilledIdentifier, prefilledName, isGoogleSignUp]);

  const handleRegister = async () => {
    if (!username || username.length < 3) { toast.error("Le nom d'utilisateur doit contenir au moins 3 caractères."); return; }
    if (!email || !email.includes('@')) { toast.error("Veuillez entrer une adresse email valide."); return; }
    if (!phoneNumber || phoneNumber.length < 8) { toast.error("Veuillez entrer un numéro de téléphone valide."); return; }
    
    setIsSubmitting(true);
    const fullPhoneNumber = `${countryCode}${phoneNumber.replace(/\s/g, '')}`;

    try {
      if (isGoogleSignUp && prefilledName) {
        // --- LOGIQUE POUR GOOGLE ---
        const { token } = await completeGoogleRegistrationAPI({
          email,
          name: prefilledName,
          username,
          phoneNumber: fullPhoneNumber,
        });
        localStorage.setItem('authToken', token);
        toast.success(`Compte créé ! Bienvenue ${username} ! 🎉`);
        window.location.reload();
      } else {
        // --- LOGIQUE D'INSCRIPTION CLASSIQUE ---
        if (!password || password.length < 8) { 
          toast.error("Le mot de passe doit contenir au moins 8 caractères."); 
          setIsSubmitting(false);
          return; 
        }
        if (password !== confirmPassword) { 
          toast.error("Les mots de passe ne correspondent pas.");
          setIsSubmitting(false);
          return; 
        }
        
        await register({
          username,
          email,
          phoneNumber: fullPhoneNumber,
          password,
        });
        toast.success(`Compte créé ! Bienvenue ${username} ! 🎉`);
        // Le contexte Auth gère la redirection
      }
    } catch (err: any) {
      const errorDetail = err.response?.data?.detail || "Une erreur inconnue est survenue lors de l'inscription.";
      toast.error(errorDetail);
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <h1 className="text-3xl font-bold" style={{ color: isDark ? '#EAEAEA' : '#1C1C1E' }}>
              {isGoogleSignUp ? "Finaliser l'inscription" : "Créez votre compte"}
            </h1>
            <p className="mt-2" style={{ color: isDark ? '#8E8E93' : '#6e6e73' }}>
              {isGoogleSignUp ? "Veuillez compléter vos informations" : "Rejoignez Lotto Happy dès maintenant"}
            </p>
          </motion.div>

          <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.6 }}>
            
            <div className="space-y-2">
              <Label htmlFor="email"><Mail className="inline h-4 w-4 mr-2" />Adresse email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isGoogleSignUp} />
              {isGoogleSignUp && <p className="text-xs text-muted-foreground">Votre email est lié à votre compte Google.</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="username"><User className="inline h-4 w-4 mr-2" />Nom d'utilisateur</Label>
              <Input id="username" type="text" placeholder="Au moins 3 caractères" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone"><Phone className="inline h-4 w-4 mr-2" />Numéro de téléphone</Label>
              <div className="flex gap-2">
                <Select value={countryCode} onValueChange={setCountryCode}>
                    <SelectTrigger className="w-32">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {COUNTRIES.map((c) => (<SelectItem key={c.code} value={c.code}><span className="flex items-center gap-2"><span>{c.flag}</span><span>{c.code}</span></span></SelectItem>))}
                    </SelectContent>
                </Select>
                <Input id="phone" type="tel" placeholder="90123456" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="flex-1" />
              </div>
            </div>
          
            {!isGoogleSignUp && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="password">Créer un mot de passe</Label>
                  <Input id="password" type="password" placeholder="Au moins 8 caractères" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                  <Input id="confirmPassword" type="password" placeholder="Retapez votre mot de passe" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                </div>
              </>
            )}

            <Button className="w-full bg-[#FFD700] text-lg text-[#121212] hover:bg-[#FFD700]/90 h-14" onClick={handleRegister} disabled={isLoading || isSubmitting}>
              {(isLoading || isSubmitting) ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <ShieldCheck className="mr-2 h-6 w-6" />}
              {isGoogleSignUp ? "Terminer l'inscription" : "Créer mon compte"}
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}