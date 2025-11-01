// src/App.tsx

import { useState, useEffect } from "react";
import { ThemeProvider } from "./components/ThemeProvider";
import { Toaster } from "./components/ui/sonner";
import { useAuth, User } from "./contexts/AuthContext";

// Import de tous vos écrans
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

// CORRECTION #1 : On définit la liste officielle des rôles d'administrateur.
// C'est la source de vérité pour la redirection.
const ADMIN_ROLES = [
  'Super Admin',
  'Admin du Jeu',
  'Admin Financier',
  'Support Client'
];

// CORRECTION #2 : La fonction de redirection est rendue robuste et précise.
const getHomeScreenForUser = (user: User): Screen => {
  const role = user.role;
  // Log amélioré pour voir les espaces potentiels (ex: " Support Client ")
  console.log(`[AUTH] Rôle détecté pour redirection: "${role}"`);

  // On utilise .trim() pour enlever les espaces au début/fin avant de comparer.
  // C'est la correction la plus importante pour résoudre le bug.
  if (ADMIN_ROLES.includes(role.trim())) {
    console.log('[AUTH] Rôle admin identifié. Redirection vers admin-panel.');
    return 'admin-panel';
  }
  
  if (role.trim().toLowerCase() === 'reseller') {
    console.log('[AUTH] Rôle revendeur identifié. Redirection vers reseller-dashboard.');
    return 'reseller-dashboard';
  }

  // Si aucune des conditions ci-dessus n'est remplie, l'utilisateur est un joueur.
  console.log('[AUTH] Rôle par défaut (Joueur). Redirection vers dashboard.');
  return 'dashboard';
};

export default function App() {
  const { user, isLoading, logout } = useAuth();

  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [authIdentifier, setAuthIdentifier] = useState<string>('');
  const [selectedGame, setSelectedGame] = useState<string>('');

  const playBalance = user?.balanceGame ?? 0;
  const winningsBalance = user?.balanceWinnings ?? 0;

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
  const handleNavigateToRegistration = (identifier: string) => { setAuthIdentifier(identifier); setCurrentScreen('registration'); };
  const handleBackToLogin = () => { setAuthIdentifier(''); setCurrentScreen('login'); };
  
  // CORRECTION #3 : Le bouton "Retour" est maintenant intelligent.
  // Un admin dans son profil reviendra au panel admin, pas au dashboard joueur.
  const handleBackToDashboard = () => {
    const homeScreen = user ? getHomeScreenForUser(user) : 'login';
    setCurrentScreen(homeScreen);
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
      {currentScreen === 'login' && <LoginScreen onNavigateToPassword={handleNavigateToPassword} />}
      {currentScreen === 'password' && <PasswordLoginScreen identifier={authIdentifier} onBack={handleBackToLogin} onNavigateToRegistration={handleNavigateToRegistration} />}
      {currentScreen === 'registration' && <RegistrationScreen prefilledIdentifier={authIdentifier} onBack={handleBackToLogin} />}
      {currentScreen === 'dashboard' && user && <Dashboard onNavigateToGame={handleNavigateToGame} onNavigateToProfile={handleNavigateToProfile} onNavigateToResellers={() => setCurrentScreen('resellers')} onNavigateToResults={() => setCurrentScreen('results')} playBalance={playBalance} winningsBalance={winningsBalance} onRecharge={() => {}} onLogout={handleLogout} />}
      {currentScreen === 'game' && user && <GameScreen drawId={selectedGame} onBack={handleBackToDashboard} onNavigateToProfile={handleNavigateToProfile} playBalance={playBalance} onPlaceBet={() => {}} />}
      {currentScreen === 'profile' && user && <ProfileScreen onBack={handleBackToDashboard} playBalance={playBalance} winningsBalance={winningsBalance} onRecharge={() => {}} onConvertWinnings={() => {}} onLogout={handleLogout} />}
      {currentScreen === 'resellers' && user && <ResellersScreen onBack={handleBackToDashboard} userPhoneNumber={user.phoneNumber} playBalance={playBalance} onProfile={handleNavigateToProfile} />}
      {currentScreen === 'results' && <ResultsScreen onBack={handleBackToDashboard} />}
      {currentScreen === 'reseller-dashboard' && user && <ResellerDashboard onLogout={handleLogout} />}
      {currentScreen === 'admin-panel' && user && <AdminPanel onLogout={handleLogout} />}
      <Toaster position="top-center" />
    </ThemeProvider>
  );
}