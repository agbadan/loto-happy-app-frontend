import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner@2.0.3';
import { ArrowLeft, Eye, EyeOff, ShieldCheck, User, Mail, Phone, Loader2 } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { useAuth } from '../contexts/AuthContext';
import { validatePhoneNumber } from '../utils/auth';

interface RegistrationScreenProps {
  phoneNumber: string;
  countryCode: string;
  googleEmail?: string;
  googleName?: string;
  onBack: () => void;
}

export function RegistrationScreen({
  phoneNumber,
  countryCode,
  googleEmail,
  googleName,
  onBack
}: RegistrationScreenProps) {
  const { register, loginWithGoogle, isLoading, error } = useAuth();
  const [username, setUsername] = useState(googleName || '');
  const [email, setEmail] = useState(googleEmail || '');
  const [googlePhoneNumber, setGooglePhoneNumber] = useState('');
  const [googleCountryCode, setGoogleCountryCode] = useState('+228');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { actualTheme } = useTheme();
  const isDark = actualTheme === 'dark';
  
  const isGoogleSignup = !!googleEmail;

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleRegister = async () => {
    if (!username || username.length < 3) {
      toast.error('Le nom d\'utilisateur doit contenir au moins 3 caractères');
      return;
    }
    if (!email || !email.includes('@')) {
      toast.error('Veuillez entrer une adresse email valide');
      return;
    }
    if (!password || password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
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
      toast.success(`Compte créé avec succès ! Bienvenue ${username} ! 🎉`);
    } catch (e) {
      // Error is handled by the context
    }
  };

  const handleGoogleSignup = async () => {
    if (!username || username.length < 3) {
      toast.error('Le nom d\'utilisateur doit contenir au moins 3 caractères');
      return;
    }
    const validation = validatePhoneNumber(googlePhoneNumber, googleCountryCode);
    if (!validation.isValid) {
      toast.error(validation.message || 'Numéro de téléphone invalide');
      return;
    }
    
    if (googleEmail) {
      try {
        const fullPhoneNumber = `${googleCountryCode}${googlePhoneNumber}`;
        // The backend handles new user creation with this endpoint
        await loginWithGoogle(googleEmail, fullPhoneNumber);
        toast.success('Compte créé avec Google !');
      } catch (e) {
        // Error is handled by the context
      }
    }
  };

  return (
    <div 
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12"
      style={{ backgroundColor: isDark ? '#121212' : '#F4F4F7' }}
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
              Finalisez votre inscription
            </h1>
            <p 
              className="mt-2"
              style={{ color: isDark ? '#8E8E93' : '#6e6e73' }}
            >
              Créez votre compte en quelques secondes
            </p>
          </motion.div>

          {/* Registration Form */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            {/* ========== INSCRIPTION GOOGLE ========== */}
            {isGoogleSignup ? (
              <>
                {/* Email Google (non modifiable) */}
                <div className="space-y-2">
                  <Label style={{ color: isDark ? '#EAEAEA' : '#1C1C1E' }}>
                    <Mail className="inline h-4 w-4 mr-2" />
                    Email Google
                  </Label>
                  <div 
                    className="flex items-center gap-3 rounded-xl border px-4 py-3"
                    style={{
                      backgroundColor: isDark ? '#1C1C1E' : '#f5f5f7',
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#d1d1d6',
                      color: isDark ? '#EAEAEA' : '#1C1C1E',
                    }}
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    {googleEmail}
                  </div>
                </div>

                {/* Numéro de téléphone (requis pour Google aussi) */}
                <div className="space-y-2">
                  <Label style={{ color: isDark ? '#EAEAEA' : '#1C1C1E' }}>
                    <Phone className="inline h-4 w-4 mr-2" />
                    Numéro de téléphone
                  </Label>
                  <div className="flex gap-2">
                    <Select value={googleCountryCode} onValueChange={setGoogleCountryCode}>
                      <SelectTrigger 
                        className="w-[140px]"
                        style={{
                          backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                          borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#d1d1d6',
                          color: isDark ? '#EAEAEA' : '#1C1C1E',
                        }}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="+228">🇹🇬 +228</SelectItem>
                        <SelectItem value="+229">🇧🇯 +229</SelectItem>
                        <SelectItem value="+225">🇨🇮 +225</SelectItem>
                        <SelectItem value="+233">🇬🇭 +233</SelectItem>
                        <SelectItem value="+226">🇧🇫 +226</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="tel"
                      placeholder="90102030"
                      value={googlePhoneNumber}
                      onChange={(e) => setGooglePhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                      className="flex-1 focus:ring-2 focus:ring-[#FFD700]/20"
                      style={{
                        backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#d1d1d6',
                        color: isDark ? '#EAEAEA' : '#1C1C1E',
                      }}
                    />
                  </div>
                  <p 
                    className="text-xs"
                    style={{ color: isDark ? '#8E8E93' : '#6e6e73' }}
                  >
                    Nécessaire pour les recharges et la récupération de compte
                  </p>
                </div>

                {/* Créer un nom d'utilisateur */}
                <div className="space-y-2">
                  <Label 
                    htmlFor="username"
                    style={{ color: isDark ? '#EAEAEA' : '#1C1C1E' }}
                  >
                    <User className="inline h-4 w-4 mr-2" />
                    Créer un nom d'utilisateur
                  </Label>
                  <div className="relative">
                    <Input
                      id="username"
                      type="text"
                      placeholder="Au moins 3 caractères"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pr-12 focus:ring-2 focus:ring-[#FFD700]/20"
                      style={{
                        backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#d1d1d6',
                        color: isDark ? '#EAEAEA' : '#1C1C1E',
                      }}
                    />
                  </div>
                </div>

                {/* Info Google Auth */}
                <div className="rounded-xl border border-[#4285F4]/30 bg-[#4285F4]/5 p-4">
                  <p 
                    className="text-sm text-center"
                    style={{ color: isDark ? '#EAEAEA' : '#1C1C1E' }}
                  >
                    🔐 <strong>Inscription sécurisée avec Google</strong>
                    <br />
                    Aucun mot de passe nécessaire
                  </p>
                </div>

                {/* Bouton de création avec Google */}
                <Button
                  className="w-full bg-gradient-to-r from-[#4285F4] to-[#34A853] text-white hover:shadow-xl hover:shadow-[#4285F4]/40 transition-all h-14 text-sm sm:text-base md:text-lg px-4"
                  onClick={handleGoogleSignup}
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="mr-1.5 sm:mr-2 h-5 w-5 sm:h-6 sm:w-6 animate-spin" /> : (
                    <svg className="mr-1.5 sm:mr-2 h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  )}
                  <span className="truncate">Créer mon compte avec Google</span>
                </Button>
              </>
            ) : (
              <>
                {/* ========== INSCRIPTION CLASSIQUE ========== */}
                
                {/* Numéro de téléphone (non modifiable) */}
                <div className="space-y-2">
                  <Label style={{ color: isDark ? '#EAEAEA' : '#1C1C1E' }}>
                    <Phone className="inline h-4 w-4 mr-2" />
                    Numéro de téléphone
                  </Label>
                  <div 
                    className="rounded-xl border px-4 py-3"
                    style={{
                      backgroundColor: isDark ? '#1C1C1E' : '#f5f5f7',
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#d1d1d6',
                      color: isDark ? '#EAEAEA' : '#1C1C1E',
                    }}
                  >
                    {countryCode} {phoneNumber}
                  </div>
                </div>

                {/* Adresse email */}
                <div className="space-y-2">
                  <Label 
                    htmlFor="email"
                    style={{ color: isDark ? '#EAEAEA' : '#1C1C1E' }}
                  >
                    <Mail className="inline h-4 w-4 mr-2" />
                    Adresse email
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder="votre@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pr-12 focus:ring-2 focus:ring-[#FFD700]/20"
                      style={{
                        backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#d1d1d6',
                        color: isDark ? '#EAEAEA' : '#1C1C1E',
                      }}
                    />
                  </div>
                  <p 
                    className="text-xs"
                    style={{ color: isDark ? '#8E8E93' : '#6e6e73' }}
                  >
                    Pour la récupération de mot de passe
                  </p>
                </div>

                {/* Créer un nom d'utilisateur */}
                <div className="space-y-2">
                  <Label 
                    htmlFor="username"
                    style={{ color: isDark ? '#EAEAEA' : '#1C1C1E' }}
                  >
                    <User className="inline h-4 w-4 mr-2" />
                    Créer un nom d'utilisateur
                  </Label>
                  <div className="relative">
                    <Input
                      id="username"
                      type="text"
                      placeholder="Au moins 3 caractères"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pr-12 focus:ring-2 focus:ring-[#FFD700]/20"
                      style={{
                        backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#d1d1d6',
                        color: isDark ? '#EAEAEA' : '#1C1C1E',
                      }}
                    />
                  </div>
                </div>

                {/* Créer un mot de passe */}
                <div className="space-y-2">
                  <Label 
                    htmlFor="password"
                    style={{ color: isDark ? '#EAEAEA' : '#1C1C1E' }}
                  >
                    Créer un mot de passe
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Au moins 6 caractères"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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

                {/* Confirmer le mot de passe */}
                <div className="space-y-2">
                  <Label 
                    htmlFor="confirmPassword"
                    style={{ color: isDark ? '#EAEAEA' : '#1C1C1E' }}
                  >
                    Confirmer le mot de passe
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Retapez votre mot de passe"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pr-12 focus:ring-2 focus:ring-[#FFD700]/20"
                      style={{
                        backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#d1d1d6',
                        color: isDark ? '#EAEAEA' : '#1C1C1E',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                      style={{
                        color: isDark ? '#8E8E93' : '#6e6e73',
                      }}
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Indicateur de force du mot de passe */}
                {password.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      <div className={`h-1 flex-1 rounded ${password.length >= 6 ? 'bg-[#4CAF50]' : isDark ? 'bg-[#3A3A3C]' : 'bg-[#d1d1d6]'}`} />
                      <div className={`h-1 flex-1 rounded ${password.length >= 8 ? 'bg-[#4CAF50]' : isDark ? 'bg-[#3A3A3C]' : 'bg-[#d1d1d6]'}`} />
                      <div className={`h-1 flex-1 rounded ${password.length >= 10 && /[A-Z]/.test(password) && /[0-9]/.test(password) ? 'bg-[#4CAF50]' : isDark ? 'bg-[#3A3A3C]' : 'bg-[#d1d1d6]'}`} />
                    </div>
                    <p 
                      className="text-xs"
                      style={{ color: isDark ? '#8E8E93' : '#6e6e73' }}
                    >
                      {password.length < 6 ? 'Mot de passe faible' : password.length < 8 ? 'Mot de passe moyen' : 'Mot de passe fort'}
                    </p>
                  </div>
                )}

                {/* Bouton S'inscrire */}
                <Button
                  className="w-full bg-[#FFD700] text-lg text-[#121212] hover:bg-[#FFD700]/90 hover:shadow-xl hover:shadow-[#FFD700]/40 transition-all h-14"
                  onClick={handleRegister}
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <ShieldCheck className="mr-2 h-6 w-6" />}
                  S'inscrire
                </Button>
              </>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}