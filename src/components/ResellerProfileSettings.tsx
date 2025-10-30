import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useTheme } from "./ThemeProvider";
import { getCurrentUser, changePassword, logoutUser } from "../utils/auth";
import { toast } from "sonner@2.0.3";
import { User, Lock, LogOut, Phone, Shield, Palette, Sun, Moon, Monitor, AlertCircle } from "lucide-react";

interface ResellerProfileSettingsProps {
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export function ResellerProfileSettings({ open, onClose, onLogout }: ResellerProfileSettingsProps) {
  const { actualTheme, theme, setTheme } = useTheme();
  const isDark = actualTheme === 'dark';
  
  const reseller = getCurrentUser();
  
  if (!reseller) return null;
  
  const handleLogout = () => {
    logoutUser();
    toast.success('Déconnexion réussie !');
    onClose();
    onLogout();
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-md max-h-[90vh] overflow-y-auto scrollbar-visible"
        style={{
          backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-center text-foreground">Paramètres du Compte</DialogTitle>
          <DialogDescription className="text-center text-sm text-muted-foreground">Gérez vos informations et sécurité</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Avatar et Info */}
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24 border-4 border-[#FFD700]">
              <AvatarFallback 
                className="text-2xl font-bold"
                style={{
                  background: 'linear-gradient(135deg, #FF6B00 0%, #FFD700 100%)',
                  color: '#FFFFFF',
                }}
              >
                {reseller.username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="text-center">
              <h3 className="font-bold text-foreground">{reseller.username}</h3>
              <p className="text-sm text-muted-foreground">Revendeur Agréé</p>
            </div>
          </div>
          
          {/* Informations du compte */}
          <div className="space-y-4 rounded-lg border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-[#FF6B00]/10 p-2">
                <User className="h-4 w-4 text-[#FF6B00]" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Nom d'utilisateur</p>
                <p className="font-semibold text-foreground">{reseller.username}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-[#4F00BC]/10 p-2">
                <Phone className="h-4 w-4 text-[#4F00BC]" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Numéro de téléphone</p>
                <p className="font-semibold text-foreground">+{reseller.phoneNumber}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-[#FFD700]/10 p-2">
                <Shield className="h-4 w-4 text-[#FFD700]" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Rôle</p>
                <p className="font-semibold text-foreground">Revendeur Agréé</p>
              </div>
            </div>
          </div>
          
          {/* Sécurité - Message pour contacter l'administration */}
          <div className="space-y-3 rounded-lg border border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="h-5 w-5 text-foreground" />
              <h4 className="font-semibold text-foreground">Sécurité</h4>
            </div>
            
            <div className="flex items-start gap-3 rounded-lg bg-[#FF6B00]/10 p-3 border border-[#FF6B00]/20">
              <AlertCircle className="h-5 w-5 text-[#FF6B00] flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-foreground">
                  Pour changer vos identifiants ou nom de revendeur, veuillez contacter l'administration.
                </p>
              </div>
            </div>
          </div>
          
          {/* Apparence */}
          <div className="space-y-3 rounded-lg border border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <Palette className="h-5 w-5 text-foreground" />
              <h4 className="font-semibold text-foreground">Apparence</h4>
            </div>
            
            <p className="text-sm text-muted-foreground mb-3">
              Personnalisez l'apparence de l'application selon vos préférences
            </p>
            
            {/* Grille des options de thème */}
            <div className="grid grid-cols-1 gap-3">
              {/* Option Clair */}
              <button
                onClick={() => setTheme('light')}
                className={`flex items-center gap-3 rounded-xl border-2 p-3 transition-all hover:bg-muted/50 ${
                  theme === 'light'
                    ? 'border-[#FFD700] bg-[#FFD700]/10'
                    : 'border-border bg-card'
                }`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#FFD700] to-[#FFA500] flex-shrink-0">
                  <Sun className="h-5 w-5 text-[#121212]" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold text-foreground">Clair</p>
                  <p className="text-xs text-muted-foreground">Lumineux et accueillant</p>
                </div>
                {theme === 'light' && (
                  <div className="h-2 w-2 rounded-full bg-[#FFD700]" />
                )}
              </button>

              {/* Option Sombre */}
              <button
                onClick={() => setTheme('dark')}
                className={`flex items-center gap-3 rounded-xl border-2 p-3 transition-all hover:bg-muted/50 ${
                  theme === 'dark'
                    ? 'border-[#FFD700] bg-[#FFD700]/10'
                    : 'border-border bg-card'
                }`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#4F00BC] to-[#2D006B] flex-shrink-0">
                  <Moon className="h-5 w-5 text-white" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold text-foreground">Sombre</p>
                  <p className="text-xs text-muted-foreground">Confort pour vos yeux</p>
                </div>
                {theme === 'dark' && (
                  <div className="h-2 w-2 rounded-full bg-[#FFD700]" />
                )}
              </button>

              {/* Option Automatique */}
              <button
                onClick={() => setTheme('auto')}
                className={`flex items-center gap-3 rounded-xl border-2 p-3 transition-all hover:bg-muted/50 ${
                  theme === 'auto'
                    ? 'border-[#FFD700] bg-[#FFD700]/10'
                    : 'border-border bg-card'
                }`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#FF6B00] to-[#FF8800] flex-shrink-0">
                  <Monitor className="h-5 w-5 text-white" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold text-foreground">Automatique</p>
                  <p className="text-xs text-muted-foreground">Suit votre système</p>
                </div>
                {theme === 'auto' && (
                  <div className="h-2 w-2 rounded-full bg-[#FFD700]" />
                )}
              </button>
            </div>

            {/* Informations supplémentaires */}
            <div className="mt-3 rounded-lg border border-border bg-muted/50 p-2">
              <p className="text-xs text-muted-foreground">
                💡 <strong>Conseil :</strong> Le thème automatique s'adapte aux préférences de votre appareil.
                {theme === 'auto' && ' Actuellement : ' + (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'Sombre' : 'Clair')}
              </p>
            </div>
          </div>
          
          {/* Bouton de déconnexion */}
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full border-[#FF3B30] text-[#FF3B30] hover:bg-[#FF3B30] hover:text-white"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Se déconnecter
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}