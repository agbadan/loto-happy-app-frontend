import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner@2.0.3';
import { ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { useAuth } from '../contexts/AuthContext';

interface PasswordLoginScreenProps {
  // --- CORRECTION DE LA SIGNATURE ---
  identifier: string; // On ne reçoit plus que 'identifier'
  onBack: () => void;
}
export function PasswordLoginScreen({ phoneNumber, countryCode, onBack }: PasswordLoginScreenProps) {
  const { login, isLoading, error } = useAuth();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const { actualTheme } = useTheme();
  const isDark = actualTheme === 'dark';

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleLogin = async () => {
    if (!password || password.length < 6) {
      toast.error('Veuillez entrer un mot de passe valide');
      return;
    }
    
    try {
      const isEmail = phoneNumber.includes('@');
      const identifier = isEmail ? phoneNumber : `${countryCode}${phoneNumber}`;
      
      await login({ emailOrPhone: identifier, password });
      
      // Navigation is now handled by App.tsx based on user role
      toast.success('Connexion réussie !');
      
    } catch (e) {
      // Error is already handled by the context and displayed in the useEffect
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div 
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12"
      style={{
        backgroundColor: isDark ? '#121212' : '#F4F4F7',
      }}
    >
      {/* Conteneur du formulaire avec effet glassmorphism */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-md"
      >
        <div 
          className="rounded-3xl px-8 py-16 shadow-2xl"
          style={{
            backgroundColor: isDark ? 'rgba(28, 28, 30, 0.75)' : 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.5)',
          }}
        >
          {/* Bouton Retour */}
          <button
            onClick={onBack}
            className="mb-6 flex items-center gap-2 transition-colors"
            style={{
              color: isDark ? '#8E8E93' : '#6e6e73',
            }}
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Retour</span>
          </button>

          {/* Logo */}
          <motion.div 
            className="mb-8 text-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF6B00] to-[#FF8800] shadow-lg">
              <span className="text-3xl font-bold text-white">LH</span>
            </div>
            <h1 
              className="text-3xl font-bold"
              style={{ color: isDark ? '#EAEAEA' : '#1C1C1E' }}
            >
              Bon retour !
            </h1>
            <p 
              className="mt-2"
              style={{ color: isDark ? '#8E8E93' : '#6e6e73' }}
            >
              Connectez-vous à votre compte
            </p>
          </motion.div>

          {/* Password Input */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            {/* Champ Mot de passe */}
            <div className="space-y-2">
              <Label 
                htmlFor="password"
                style={{ color: isDark ? '#EAEAEA' : '#1C1C1E' }}
              >
                Mot de passe
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Entrez votre mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pr-12 focus:ring-2 focus:ring-[#FFD700]/20"
                  style={{
                    backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#d1d1d6',
                    color: isDark ? '#EAEAEA' : '#1C1C1E',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{
                    color: isDark ? '#8E8E93' : '#6e6e73',
                  }}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Mot de passe oublié */}
            <div className="text-right">
              <a href="#" className="text-sm text-[#FFD700] hover:underline">
                Mot de passe oublié ?
              </a>
            </div>

            {/* Bouton Se connecter */}
            <Button
              className="w-full rounded-full bg-[#FFD700] text-lg text-[#121212] hover:bg-[#FFD700]/90 hover:shadow-lg hover:shadow-[#FFD700]/30 transition-all"
              onClick={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                'Se connecter'
              )}
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}