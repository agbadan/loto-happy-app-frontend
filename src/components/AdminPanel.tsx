// src/components/AdminPanel.tsx

import { useState, useEffect } from "react";
// CORRECTION : On importe useAuth pour avoir les infos de l'utilisateur
import { useAuth } from "../contexts/AuthContext"; 
import { AdminDashboard } from "./admin/AdminDashboard";
import { AdminPlayers } from "./admin/AdminPlayers";
import { AdminResellers } from "./admin/AdminResellers";
import { AdminGames } from "./admin/AdminGames";
import { AdminFinance } from "./admin/AdminFinance";
import { AdminAdministrators } from "./admin/AdminAdministrators";
import { 
  LayoutDashboard, Users, UsersRound, Dices, Wallet, Shield, LogOut, Menu, X
} from "lucide-react";
import { Button } from "./ui/button";
// CORRECTION : On supprime l'import de 'getCurrentAdminRole' qui est obsolète
// import { getCurrentAdminRole } from "../utils/auth";

interface AdminPanelProps {
  onLogout: () => void;
}

type AdminScreen = 'dashboard' | 'players' | 'resellers' | 'games' | 'finance' | 'administrators' | 'access-denied';

export function AdminPanel({ onLogout }: AdminPanelProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<AdminScreen>('dashboard');

  // --- LA CORRECTION PRINCIPALE EST ICI ---
  // On récupère l'utilisateur et son rôle directement depuis le contexte
  const { user } = useAuth();
  const adminRole = user?.role ?? null; // Le rôle vient de l'utilisateur connecté

  useEffect(() => {
    console.log(`[ADMIN PANEL] Rôle détecté depuis le contexte: ${adminRole}`);
    
    // Si l'utilisateur n'est pas un admin, on le bloque immédiatement
    if (!adminRole || !adminRole.toLowerCase().includes('admin')) {
      setCurrentScreen('access-denied');
      return;
    }

    // Définir l'écran par défaut selon le rôle
    if (adminRole === 'Admin Financier')      setCurrentScreen('finance');
    else if (adminRole === 'Admin du Jeu')    setCurrentScreen('games');
    else if (adminRole === 'Support Client')  setCurrentScreen('players');
    else                                      setCurrentScreen('dashboard'); // Super Admin ou autre
  }, [adminRole]); // On ré-évalue si le rôle change

  const hasAccessToMenu = (menuId: AdminScreen): boolean => {
    if (!adminRole) return false;
    if (adminRole === 'Super Admin') return true;
    if (menuId === 'administrators') return adminRole === 'Super Admin';
    if (menuId === 'dashboard') return true;
    if (adminRole === 'Admin Financier') return menuId === 'finance';
    if (adminRole === 'Admin du Jeu') return menuId === 'games';
    if (adminRole === 'Support Client') return menuId === 'players' || menuId === 'resellers';
    return false;
  };
  
  // Le reste du code est presque identique, juste plus robuste.
  const allMenuItems = [
    { id: 'dashboard' as AdminScreen, label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'players' as AdminScreen, label: 'Gestion des Joueurs', icon: Users },
    { id: 'resellers' as AdminScreen, label: 'Gestion des Revendeurs', icon: UsersRound },
    { id: 'games' as AdminScreen, label: 'Gestion des Jeux', icon: Dices },
    { id: 'finance' as AdminScreen, label: 'Gestion Financière', icon: Wallet },
  ];
  
  const menuItems = allMenuItems.filter(item => hasAccessToMenu(item.id));
  if (adminRole === 'Super Admin') {
    menuItems.push({ id: 'administrators' as AdminScreen, label: 'Gestion des Admins', icon: Shield });
  }

  const handleMenuClick = (screenId: AdminScreen) => {
    setCurrentScreen(screenId);
    setSidebarOpen(false);
  };

  // --- Affichage d'un écran de chargement ou d'accès refusé si le rôle n'est pas encore défini ---
  if (!user || currentScreen === 'access-denied') {
    return (
      <div className="flex items-center justify-center h-screen p-8 bg-background">
        <div className="text-center space-y-4">
          <Shield className="h-16 w-16 text-muted-foreground mx-auto" />
          <h2 className="text-2xl font-bold">Accès Refusé</h2>
          <p className="text-muted-foreground">Vous n'avez pas les permissions nécessaires pour accéder à cette section.</p>
          <Button onClick={onLogout} className="bg-destructive text-destructive-foreground">Se déconnecter</Button>
        </div>
      </div>
    );
  }

  // --- Le JSX principal reste le même ---
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#FFD700]">Lotto Happy</h1>
            <p className="text-sm text-muted-foreground">Panel Admin</p>
            {adminRole && <p className="text-xs text-[#FFD700] mt-1 font-medium">{adminRole}</p>}
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 hover:bg-accent rounded-lg"><X className="h-5 w-5" /></button>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-visible">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            return (
              <button key={item.id} onClick={() => handleMenuClick(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/20' : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'}`}>
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border">
          <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10" onClick={onLogout}>
            <LogOut className="mr-3 h-5 w-5" />
            Déconnexion
          </Button>
        </div>
      </aside>
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="lg:hidden sticky top-0 z-30 bg-card border-b border-border p-4 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-accent rounded-lg"><Menu className="h-6 w-6" /></button>
          <h2 className="font-bold text-[#FFD700]">Lotto Happy Admin</h2>
          <div className="w-10" />
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-visible">
          {currentScreen === 'dashboard' && hasAccessToMenu('dashboard') && <AdminDashboard />}
          {currentScreen === 'players' && hasAccessToMenu('players') && <AdminPlayers />}
          {currentScreen === 'resellers' && hasAccessToMenu('resellers') && <AdminResellers />}
          {currentScreen === 'games' && hasAccessToMenu('games') && <AdminGames />}
          {currentScreen === 'finance' && hasAccessToMenu('finance') && <AdminFinance />}
          {currentScreen === 'administrators' && hasAccessToMenu('administrators') && adminRole === 'Super Admin' && <AdminAdministrators />}
        </div>
      </main>
    </div>
  );
}