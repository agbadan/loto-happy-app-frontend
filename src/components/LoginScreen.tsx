import { useState, useEffect } from "react";
import { motion } from "motion/react";
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
import { toast } from "sonner@2.0.3";
import { useTheme } from "./ThemeProvider";
import { useAuth } from "../contexts/AuthContext";
import { GoogleAuthModal } from "./GoogleAuthModal";
import { userExistsWithPhone, validatePhoneNumber } from "../utils/auth";

interface LoginScreenProps {
  onNavigateToPassword: (
    phoneNumber: string,
    countryCode: string,
  ) => void;
  onNavigateToRegistration: (
    phoneNumber: string,
    countryCode: string,
    googleEmail?: string,
    googleName?: string,
  ) => void;
}

const COUNTRIES = [
  { code: "+228", name: "Togo", flag: "🇹🇬" },
  { code: "+233", name: "Ghana", flag: "🇬🇭" },
  { code: "+229", name: "Bénin", flag: "🇧🇯" },
  { code: "+226", name: "Burkina Faso", flag: "🇧🇫" },
  { code: "+225", name: "Côte d'Ivoire", flag: "🇨🇮" },
];

// ... (keep the rest of the component as is, only changing the auth logic)

export function LoginScreen({
  onNavigateToPassword,
  onNavigateToRegistration,
}: LoginScreenProps) {
  const { loginWithGoogle, error } = useAuth();
  const [countryCode, setCountryCode] = useState("+228");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [balls, setBalls] = useState<Ball[]>(generateBalls());
  const [animationMode, setAnimationMode] = useState(0);
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  
  const { actualTheme } = useTheme();
  const isDark = actualTheme === 'dark';

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // ... (keep the animation useEffect)

  const handleContinue = () => {
    if (!phoneNumber || phoneNumber.length < 1) {
      toast.error(
        "Veuillez entrer un numéro de téléphone",
      );
      return;
    }

    const isEmail = phoneNumber.includes('@');
    
    if (isEmail) {
      onNavigateToPassword(phoneNumber, '');
      return;
    }

    const cleanPhoneOnly = phoneNumber.replace(/[\s\-\.]/g, '');
    
    if (cleanPhoneOnly === '000000000000') {
      onNavigateToPassword(phoneNumber, countryCode);
      return;
    }

    const validation = validatePhoneNumber(phoneNumber, countryCode);
    if (!validation.isValid) {
      toast.error(validation.message || "Numéro de téléphone invalide");
      return;
    }

    const fullNumber = `${countryCode}${phoneNumber}`;
    const exists = userExistsWithPhone(fullNumber);
    
    if (exists) {
      onNavigateToPassword(phoneNumber, countryCode);
    } else {
      onNavigateToRegistration(phoneNumber, countryCode);
    }
  };

  const handleGoogleAccountSelect = async (email: string, name: string) => {
    setGoogleModalOpen(false);
    try {
        // We are using the email as the google token for now, as per the backend specs (mock)
        await loginWithGoogle(email, ""); // Phone number is not needed for google login
        toast.success(`Bienvenue ${name} !`);
    } catch (e) {
        // The error is already handled by the context
    }
  };

  // ... (keep the rest of the JSX)

}