import { useState, useEffect } from "react";
import { motion } from "framer-motion"; // Assurez-vous que "framer-motion" est bien installé
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { toast } from "sonner";
import { useTheme } from "./ThemeProvider";
import { useAuth } from "../contexts/AuthContext";
import { GoogleAuthModal } from "./GoogleAuthModal";
import { validatePhoneNumber } from "../utils/auth";

interface LoginScreenProps {
  // --- CORRECTION DE LA SIGNATURE ---
  // onNavigateToPassword ne devrait prendre qu'un seul argument : l'identifiant.
  onNavigateToPassword: (identifier: string) => void;
  onNavigateToRegistration: (phoneNumber: string, countryCode: string, googleEmail?: string, googleName?: string) => void;
}

const COUNTRIES = [
  { code: "+228", name: "Togo", flag: "🇹🇬" },
  { code: "+233", name: "Ghana", flag: "🇬🇭" },
  { code: "+229", name: "Bénin", flag: "🇧🇯" },
  { code: "+226", name: "Burkina Faso", flag: "🇧🇫" },
  { code: "+225", name: "Côte d'Ivoire", flag: "🇨🇮" },
];

// --- LOGIQUE D'ANIMATION QUI MANQUAIT ---
interface Ball {
  id: number;
  size: number;
  x: number;
  y: number;
  duration: number;
  delay: number;
  number: number;
  color: string;
}

const BALL_COLORS = [
  "#FFD700", "#FF1744", "#2196F3", "#4CAF50", "#FF6B00",
  "#9C27B0", "#00BCD4", "#E91E63", "#FF9800", "#673AB7"
];

const generateBalls = (): Ball[] => {
  const balls: Ball[] = [];
  const count = 30;
  const usedNumbers = new Set<number>();
  for (let i = 0; i < count; i++) {
    const size = Math.random() * 90 + 60;
    let number: number;
    do {
      number = Math.floor(Math.random() * 90) + 1;
    } while (usedNumbers.has(number) && usedNumbers.size < 90);
    usedNumbers.add(number);
    const color = BALL_COLORS[Math.floor(Math.random() * BALL_COLORS.length)];
    balls.push({
      id: i, size, color, number,
      x: Math.random() * 110 - 5,
      y: Math.random() * 110 - 5,
      duration: Math.random() * 15 + 25,
      delay: Math.random() * 8,
    });
  }
  return balls;
};
// --- FIN DE LA LOGIQUE D'ANIMATION ---


export function LoginScreen({
  onNavigateToPassword,
  onNavigateToRegistration,
}: LoginScreenProps) {
  const { loginWithGoogle, error: authError } = useAuth();
  const [countryCode, setCountryCode] = useState("+228");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [balls] = useState<Ball[]>(generateBalls()); // Cet appel va maintenant fonctionner
  const [animationMode, setAnimationMode] = useState(0);
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  
  const { actualTheme } = useTheme();
  const isDark = actualTheme === 'dark';

  useEffect(() => {
    if (authError) {
      toast.error(authError);
    }
  }, [authError]);

  useEffect(() => {
    const changeAnimation = () => setAnimationMode(prev => (prev + 1) % 3);
    const timeoutId = setTimeout(changeAnimation, Math.random() * 20000 + 30000);
    return () => clearTimeout(timeoutId);
  }, [animationMode]);

  const handleContinue = () => {
    if (!phoneNumber) {
      toast.error("Veuillez entrer un email ou un numéro de téléphone.");
      return;
    }

    const isEmail = phoneNumber.includes('@');

    if (isEmail) {
      // Si c'est un email, on le passe directement.
      onNavigateToPassword(phoneNumber);
      return;
    }
    
    // Si c'est un numéro de téléphone
    const validation = validatePhoneNumber(phoneNumber, countryCode);
    if (!validation.isValid) {
      toast.error(validation.message || "Numéro de téléphone invalide");
      return;
    }
    
    // On construit le numéro complet et on le passe.
    const fullNumber = `${countryCode}${phoneNumber}`;
    onNavigateToPassword(fullNumber);
  };

  const handleGoogleAccountSelect = async (email: string, name: string) => {
    setGoogleModalOpen(false);
    toast.info("Connexion avec Google en cours...");
    const result = await loginWithGoogle(email, name);
    if (result?.isNewUser) {
      toast.success("Compte Google validé. Veuillez finaliser votre inscription.");
      onNavigateToRegistration("", "", result.email, result.name);
    } else if (result) {
      toast.success(`Bienvenue, ${result.name}!`);
      // Le AuthContext gère la redirection
    }
    // L'erreur est déjà gérée et affichée par le AuthContext
  };

  return (
    <div 
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12"
      style={{ backgroundColor: isDark ? '#121212' : '#F4F4F7' }}
    >
      <div className="absolute inset-0 overflow-hidden">
        {balls.map((ball) => {
          const moveX1 = (Math.random() - 0.5) * 180;
          const moveX2 = (Math.random() - 0.5) * 180;
          const moveY1 = (Math.random() - 0.5) * 180;
          const moveY2 = (Math.random() - 0.5) * 180;
          const fontSize = ball.size * 0.28;
          const circleSize = ball.size * 0.55;
          const chaoticAnimation = { x: [0, moveX1, moveX2, 0], y: [0, moveY1, moveY2, 0], scale: [1, 1.1, 0.9, 1], rotate: [0, 5, -5, 0] };
          const transitionConfig = { duration: ball.duration, delay: ball.delay, repeat: Infinity, ease: "easeInOut" };
          return (
            <motion.div
              key={ball.id}
              className="absolute flex items-center justify-center rounded-full"
              style={{
                width: ball.size, height: ball.size, left: `${ball.x}%`, top: `${ball.y}%`,
                willChange: "transform", transform: "translate3d(0, 0, 0)",
                background: `radial-gradient(circle at 28% 25%, ${ball.color}FF 0%, ${ball.color}A0 100%)`,
                boxShadow: `0 30px 70px rgba(0,0,0,0.12), inset -10px -10px 25px rgba(0,0,0,0.12), inset 8px 8px 20px rgba(255,255,255,0.2)`
              }}
              animate={chaoticAnimation}
              transition={transitionConfig}
            >
              <div className="absolute rounded-full" style={{ width: ball.size * 0.35, height: ball.size * 0.28, top: ball.size * 0.12, left: ball.size * 0.15, background: `radial-gradient(ellipse at center, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 100%)`, filter: "blur(2px)" }} />
              <div className="absolute flex items-center justify-center rounded-full bg-white" style={{ width: circleSize, height: circleSize, boxShadow: `0 0 0 ${ball.size * 0.04}px ${ball.color}, inset 0 3px 8px rgba(0,0,0,0.1)` }}>
                <span className="font-bold" style={{ fontSize: `${fontSize}px`, color: "#1C1C1E", textShadow: "0 1px 2px rgba(0,0,0,0.1)", fontFamily: "Inter, system-ui, sans-serif" }}>
                  {ball.number}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
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
          <motion.div className="mb-8 text-center" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, duration: 0.6 }}>
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF6B00] to-[#FF8800] shadow-lg"><span className="text-3xl font-bold text-white">LH</span></div>
            <h1 className="text-3xl font-bold" style={{ color: isDark ? '#EAEAEA' : '#1C1C1E' }}>Lotto Happy</h1>
            <p className="mt-2 text-lg" style={{ color: isDark ? '#FFD700' : '#FF6B00' }}>Le jackpot n'est qu'à un clic</p>
          </motion.div>
          <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.6 }}>
            <div className="space-y-2">
              <Label htmlFor="phone" style={{ color: isDark ? '#EAEAEA' : '#1C1C1E' }}>Email ou Numéro de téléphone</Label>
              <div className="flex gap-2">
                {!phoneNumber.includes('@') && (
                  <Select value={countryCode} onValueChange={setCountryCode}>
                    <SelectTrigger className="w-32 focus:ring-2 focus:ring-[#FFD700]/20" style={{ backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF', borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#d1d1d6' }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((country) => (<SelectItem key={country.code} value={country.code}><span className="flex items-center gap-2"><span>{country.flag}</span><span>{country.code}</span></span></SelectItem>))}
                    </SelectContent>
                  </Select>
                )}
                <Input id="phone" type="text" placeholder="90 12 34 56" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="flex-1 focus:ring-2 focus:ring-[#FFD700]/20" style={{ backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF', borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#d1d1d6', color: isDark ? '#EAEAEA' : '#1C1C1E' }}/>
              </div>
            </div>
            <Button className="w-full rounded-full bg-[#FFD700] text-lg text-[#121212] hover:bg-[#FFD700]/90 hover:shadow-lg hover:shadow-[#FFD700]/30 transition-all" onClick={handleContinue}>Continuer</Button>
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t" style={{ borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#d1d1d6' }} /></div>
              <div className="relative flex justify-center"><span className="px-4 text-sm" style={{ backgroundColor: isDark ? 'rgba(28, 28, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)', color: isDark ? '#8E8E93' : '#6e6e73' }}>Ou continuez avec</span></div>
            </div>
            <Button variant="outline" className="w-full border-2 hover:border-[#FFD700] hover:bg-[#FFD700]/5 transition-all" style={{ backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF', borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#d1d1d6', color: isDark ? '#EAEAEA' : '#1C1C1E' }} onClick={() => setGoogleModalOpen(true)}>
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
              Continuer avec Google
            </Button>
            <p className="text-center text-xs" style={{ color: isDark ? '#8E8E93' : '#6e6e73' }}>
              En continuant, vous acceptez nos <a href="#" className="text-[#FF3B30] hover:underline">Conditions d'utilisation</a> et notre <a href="#" className="text-[#FF3B30] hover:underline">Politique de confidentialité</a>
            </p>
            <div className="rounded-lg border border-[#FF3B30] bg-[#FF3B30]/10 p-3 text-center">
              <p className="text-xs" style={{ color: isDark ? '#FF3B30' : '#1C1C1E' }}><strong>Jeu interdit aux moins de 18 ans</strong></p>
            </div>
          </motion.div>
        </div>
      </motion.div>
      <GoogleAuthModal open={googleModalOpen} onClose={() => setGoogleModalOpen(false)} onSelectAccount={handleGoogleAccountSelect} />
    </div>
  );
}