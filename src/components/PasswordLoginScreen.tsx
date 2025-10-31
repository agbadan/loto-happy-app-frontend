import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { useAuth } from '../contexts/AuthContext';

interface PasswordLoginScreenProps {
  identifier: string;
  onBack: () => void;
  // Nouvelle prop pour naviguer vers l'inscription
  onNavigateToRegistration: (identifier: string) => void; 
}

export function PasswordLoginScreen({ identifier, onBack, onNavigateToRegistration }: PasswordLoginScreenProps) {
  const { login, isLoading } = useAuth(); // On n'a plus besoin de 'error' ici
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const { actualTheme } = useTheme();
  const isDark = actualTheme === 'dark';

  const handleLogin = async () => {
    if (!password) {
      toast.error('Veuillez entrer un mot de passe.');
      return;
    }
    
    try {
      // On appelle la fonction de login du contexte
      await login({ emailOrPhone: identifier, password });
      
      // Si on arrive ici, c'est que la connexion a réussi.
      // Le useEffect dans App.tsx s'occupera de la redirection.
      toast.success('Connexion réussie ! Redirection...');
      
    } catch (err: any) {
      // On attrape l'erreur lancée par le AuthContext
      const errorStatus = err?.response?.status;
      const errorMessage = err?.response?.data?.detail || "Une erreur est survenue.";

      if (errorStatus === 404) {
        // ERREUR 404 : L'utilisateur n'existe pas !
        toast.error("Aucun compte trouvé. Veuillez vous inscrire.");
        // On redirige vers l'écran d'inscription en passant l'identifiant
        onNavigateToRegistration(identifier);
      } else if (errorStatus === 401) {
        // ERREUR 401 : Mot de passe incorrect
        toast.error("Mot de passe incorrect.");
      } else {
        // Autre erreur (serveur en panne, etc.)
        toast.error(errorMessage);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };
  
  // LE JSX RESTE LE MÊME, IL EST CORRECT
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
            <h1 className="text-3xl font-bold" style={{ color: isDark ? '#EAEAEA' : '#1C1C1E' }}>Bon retour !</h1>
            <p className="mt-2" style={{ color: isDark ? '#8E8E93' : '#6e6e73' }}>Connectez-vous à votre compte</p>
          </motion.div>
          <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.6 }}>
            <div className="space-y-2">
              <Label htmlFor="password" style={{ color: isDark ? '#EAEAEA' : '#1C1C1E' }}>Mot de passe</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Entrez votre mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} onKeyPress={handleKeyPress} className="pr-12 focus:ring-2 focus:ring-[#FFD700]/20" style={{ backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF', borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#d1d1d6', color: isDark ? '#EAEAEA' : '#1C1C1E' }}/>
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors" style={{ color: isDark ? '#8E8E93' : '#6e6e73' }}>
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <div className="text-right"><a href="#" className="text-sm text-[#FFD700] hover:underline">Mot de passe oublié ?</a></div>
            <Button className="w-full rounded-full bg-[#FFD700] text-lg text-[#121212] hover:bg-[#FFD700]/90 hover:shadow-lg hover:shadow-[#FFD700]/30 transition-all" onClick={handleLogin} disabled={isLoading}>
              {isLoading ? (<><Loader2 className="mr-2 h-5 w-5 animate-spin" />Connexion en cours...</>) : ('Se connecter')}
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}