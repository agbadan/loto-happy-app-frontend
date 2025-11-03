// src/App.tsx

import { useState, useEffect } from "react";
import { ThemeProvider } from "./components/ThemeProvider";
import { Toaster } from "./components/ui/sonner";
import { useAuth } from "./contexts/AuthContext";
import type { User } from "./contexts/AuthContext";
  
import { Dashboard } from "./components/Dashboard";
import { GameScreen } from "./components/GameScreen";
import { ProfileScreen } from "./components/ProfileScreen";
import { LoginScreen } from "./components/LoginScreen";
import { PasswordLoginScreen } from "./components/PasswordLoginScreen";
import { RegistrationScreen } from "./components/RegistrationScreen";
import { ResellersScreen } from "./components/ResellersScreen";
import { ResultsScreen } from "./components/ResultsScreen";
import { ResellerDashboard } from "./components/ResellerDashboard";
import { AdminPanel } from "./components/AdminPanel";

type Screen = 'login' | 'password' | 'registration' | 'dashboard' | 'reseller-dashboard' | 'admin-panel' | 'game' | 'profile' | 'resellers' | 'results';

const ADMIN_ROLES = [
  'Super Admin', 'Admin du Jeu', 'Admin Financier', 'Support Client'
];

const getHomeScreenForUser = (user: User): Screen => {
  const role = user.role.trim();

  if (ADMIN_ROLES.includes(role)) {
    return 'admin-panel';
  }
  
  if (role.toLowerCase() === 'reseller') {
    return 'reseller-dashboard';
  }

  return 'dashboard';
};

export default function App() {
  const { user, isLoading, logout } = useAuth();

  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [authIdentifier, setAuthIdentifier] = useState<string>('');
  const [selectedGame, setSelectedGame] = useState<string>('');
  
  // NOUVEAU: Ajout d'un état pour le montant de la recharge
  const [rechargeAmount, setRechargeAmount] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        const homeScreen = getHomeScreenForUser(user);
        setCurrentScreen(homeScreen);
      } else {
        setCurrentScreen('login');
      }
    }
  }, [user, isLoading]);

  const handleLogout = () => { logout(); };
  const handleNavigateToPassword = (identifier: string) => { setAuthIdentifier(identifier); setCurrentScreen('password'); };
  const handleNavigateToRegistration = (identifier?: string) => { setAuthIdentifier(identifier || ''); setCurrentScreen('registration'); };
  const handleBackToLogin = () => { setAuthIdentifier(''); setCurrentScreen('login'); };
  
  const handleBackToDashboard = () => {
    const homeScreen = user ? getHomeScreenForUser(user) : 'login';
    setCurrentScreen(homeScreen);
  };
  
  // NOUVELLE FONCTION: Pour naviguer vers les revendeurs
  const handleNavigateToResellers = (amount?: number) => {
    setRechargeAmount(amount);
    setCurrentScreen('resellers');
  };

  const handleNavigateToGame = (drawId: string) => { setSelectedGame(drawId); setCurrentScreen('game'); };
  const handleNavigateToProfile = () => { setCurrentScreen('profile'); };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#121212', color: 'white' }}>
        Chargement de votre session...
      </div>
    );
  }

  return (
    <ThemeProvider>
      {currentScreen === 'login' && <LoginScreen onNavigateToPassword={handleNavigateToPassword} onNavigateToRegistration={handleNavigateToRegistration} />}
      {currentScreen === 'password' && <PasswordLoginScreen identifier={authIdentifier} onBack={handleBackToLogin} />}
      {currentScreen === 'registration' && <RegistrationScreen prefilledIdentifier={authIdentifier} onBack={handleBackToLogin} />}
      {currentScreen === 'dashboard' && user && <Dashboard onNavigateToGame={handleNavigateToGame} onNavigateToProfile={handleNavigateToProfile} onNavigateToResellers={handleNavigateToResellers} onNavigateToResults={() => setCurrentScreen('results')} onLogout={handleLogout} />}
      {currentScreen === 'game' && user && <GameScreen drawId={selectedGame} onBack={handleBackToDashboard} onNavigateToProfile={handleNavigateToProfile} />}
      {currentScreen === 'profile' && user && <ProfileScreen onBack={handleBackToDashboard} onNavigateToProfile={handleNavigateToProfile} />}
      {currentScreen === 'resellers' && user && <ResellersScreen onBack={handleBackToDashboard} rechargeAmount={rechargeAmount} />}
      {currentScreen === 'results' && <ResultsScreen onBack={handleBackToDashboard} />}
      {currentScreen === 'reseller-dashboard' && user && <ResellerDashboard onLogout={handleLogout} />}
      {currentScreen === 'admin-panel' && user && <AdminPanel onLogout={handleLogout} />}
      <Toaster position="top-center" />
    </ThemeProvider>
  );
}