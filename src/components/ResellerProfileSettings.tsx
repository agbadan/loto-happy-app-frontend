// src/components/ResellerProfileSettings.tsx

import { useState } from "react";
// CORRECTION : On importe le hook useAuth et la fonction de l'API d'authentification
import { useAuth } from "../contexts/AuthContext";
import { changePassword as apiChangePassword } from "../utils/authAPI";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useTheme } from "./ThemeProvider";
import { toast } from "sonner";
import { User, Lock, LogOut, Phone, Shield, Palette, Sun, Moon, Monitor, Loader2 } from "lucide-react";

interface ResellerProfileSettingsProps {
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export function ResellerProfileSettings({ open, onClose, onLogout }: ResellerProfileSettingsProps) {
  const { actualTheme, theme, setTheme } = useTheme();
  const isDark = actualTheme === 'dark';
  
  // --- CORRECTION MAJEURE : On utilise le contexte ---
  const { user: reseller } = useAuth();
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Si le composant s'affiche avant que l'utilisateur ne soit chargé, on ne rend rien.
  if (!reseller) {
    return null;
  }

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) { return toast.error("Veuillez remplir tous les champs de mot de passe."); }
    if (newPassword.length < 8) { return toast.error("Le nouveau mot de passe doit faire au moins 8 caractères."); }
    if (newPassword !== confirmNewPassword) { return toast.error("Les nouveaux mots de passe ne correspondent pas."); }
    
    setIsSubmitting(true);
    try {
      await apiChangePassword({ current_password: currentPassword, new_password: newPassword });
      toast.success("Mot de passe mis à jour avec succès !");
      // On vide les champs et on ferme la modale
      setCurrentPassword(""); setNewPassword(""); setConfirmNewPassword("");
      onClose();
    } catch (err: any) {
      // On affiche l'erreur spécifique du backend (ex: "Mot de passe actuel incorrect")
      toast.error(err?.response?.data?.detail || "Échec de la mise à jour du mot de passe.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-md max-h-[90vh] overflow-y-auto scrollbar-visible"
        style={{ backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }}
      >
        <DialogHeader>
          <DialogTitle className="text-center text-foreground">Paramètres du Compte</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24 border-4 border-[#FFD700]">
              <AvatarFallback className="text-2xl font-bold" style={{ background: 'linear-gradient(135deg, #FF6B00 0%, #FFD700 100%)', color: '#FFFFFF' }}>
                {reseller.username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h3 className="font-bold text-foreground">{reseller.username}</h3>
              <p className="text-sm text-muted-foreground">Revendeur Agréé</p>
            </div>
          </div>
          
          <div className="space-y-4 rounded-lg border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-[#FF6B00]/10 p-2"><User className="h-4 w-4 text-[#FF6B00]" /></div>
              <div><p className="text-xs text-muted-foreground">Nom d'utilisateur</p><p className="font-semibold text-foreground">{reseller.username}</p></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-[#4F00BC]/10 p-2"><Phone className="h-4 w-4 text-[#4F00BC]" /></div>
              <div><p className="text-xs text-muted-foreground">Numéro de téléphone</p><p className="font-semibold text-foreground">{reseller.phoneNumber}</p></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-[#FFD700]/10 p-2"><Shield className="h-4 w-4 text-[#FFD700]" /></div>
              <div><p className="text-xs text-muted-foreground">Rôle</p><p className="font-semibold text-foreground capitalize">{reseller.role}</p></div>
            </div>
          </div>
          
          <div className="space-y-3 rounded-lg border border-border p-4">
            <div className="flex items-center gap-2 mb-2"><Lock className="h-5 w-5 text-foreground" /><h4 className="font-semibold text-foreground">Changer le mot de passe</h4></div>
            <div className="space-y-2"><Label htmlFor="currentPassword">Mot de passe actuel</Label><Input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="newPassword">Nouveau mot de passe</Label><Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="confirmNewPassword">Confirmer le nouveau mot de passe</Label><Input id="confirmNewPassword" type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} /></div>
            <Button onClick={handleChangePassword} disabled={isSubmitting} className="w-full">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Mettre à jour le mot de passe
            </Button>
          </div>
          
          <div className="space-y-3 rounded-lg border border-border p-4">
            <div className="flex items-center gap-2 mb-2"><Palette className="h-5 w-5 text-foreground" /><h4 className="font-semibold text-foreground">Apparence</h4></div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Button variant={theme === 'light' ? 'default' : 'outline'} onClick={() => setTheme('light')} className="flex items-center gap-2 justify-start"><Sun className="h-4 w-4" /> Clair</Button>
              <Button variant={theme === 'dark' ? 'default' : 'outline'} onClick={() => setTheme('dark')} className="flex items-center gap-2 justify-start"><Moon className="h-4 w-4" /> Sombre</Button>
              <Button variant={theme === 'auto' ? 'default' : 'outline'} onClick={() => setTheme('auto')} className="flex items-center gap-2 justify-start"><Monitor className="h-4 w-4" /> Système</Button>
            </div>
          </div>
          
          <Button onClick={onLogout} variant="destructive" className="w-full">
            <LogOut className="mr-2 h-4 w-4" />
            Se déconnecter
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}