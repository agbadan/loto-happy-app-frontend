// src/App.tsx

import { useState, useEffect } from "react";
import { ThemeProvider } from "./components/ThemeProvider";
import { Toaster } from "./components/ui/sonner";
// CORRECTION : On importe le type User pour l'utiliser dans notre fonction de redirection
import { useAuth, User } from "./contexts/AuthContext";

// Import de tous tes écrans
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

// --- NOUVELLE FONCTION UTILITAIRE POUR UNE REDIRECTION ROBUSTE ---
const getHomeScreenForUser = (user: User): Screen => {
  const role = user.role;
  console.log(`[AUTH] Rôle détecté: ${role}`); // Log pour le débogage

  // On vérifie les rôles les plus privilégiés en premier, de manière insensible à la casse.
  if (role.toLowerCase().includes('admin')) {
    return 'admin-panel';
  }
  if (role === 'reseller') {
    return 'reseller-dashboard';
  }
  // Par défaut, pour 'player' et tout autre rôle, on redirige vers le dashboard joueur.
  return 'dashboard';
};

export default function App() {
  const { user, isLoading, logout } = useAuth();

  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [authIdentifier, setAuthIdentifier] = useState<string>('');
  const [selectedGame, setSelectedGame] = useState<string>('');

  const playBalance = user?.balanceGame ?? 0;
  const winningsBalance = user?.balanceWinnings ?? 0;

  // --- useEffect CORRIGÉ pour utiliser la nouvelle logique ---
  useEffect(() => {
    if (!isLoading) {
      if (user) {
        // On utilise notre nouvelle fonction pour déterminer où aller.
        const homeScreen = getHomeScreenForUser(user);
        setCurrentScreen(homeScreen);
      } else {
        // Si aucun utilisateur n'est connecté, on retourne à l'écran de login.
        setCurrentScreen('login');
      }
    }
  }, [user, isLoading]);

  // --- GESTIONNAIRES DE NAVIGATION (INCHANGÉS) ---
  const handleLogout = () => {
    logout();
  };

  const handleNavigateToPassword = (identifier: string) => {
    setAuthIdentifier(identifier);
    setCurrentScreen('password');
  };

  const handleNavigateToRegistration = (identifier: string) => {
    setAuthIdentifier(identifier);
    setCurrentScreen('registration');
  };

  const handleBackToLogin = () => {
    setAuthIdentifier('');
    setCurrentScreen('login');
  };
  
  const handleBackToDashboard = () => {
    setCurrentScreen('dashboard');
  };

  const handleNavigateToGame = (drawId: string) => {
    setSelectedGame(drawId);
    setCurrentScreen('game');
  };

  const handleNavigateToProfile = () => {
    setCurrentScreen('profile');
  };

  // L'écran de chargement reste le même.
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#121212', color: 'white' }}>
        Chargement de votre session...
      </div>
    );
  }

  // --- Rendu conditionnel des écrans (logique conservée) ---
  return (
    <ThemeProvider>
      {currentScreen === 'login' && (
        <LoginScreen 
          onNavigateToPassword={handleNavigateToPassword}
        />
      )}
      
      {currentScreen === 'password' && (
        <PasswordLoginScreen
          identifier={authIdentifier}
          onBack={handleBackToLogin}
          onNavigateToRegistration={handleNavigateToRegistration}
        />
      )}
      
      {currentScreen === 'registration' && (
        <RegistrationScreen
          prefilledIdentifier={authIdentifier}
          onBack={handleBackToLogin}
        />
      )}
      
      {currentScreen === 'dashboard' && user && (
        <Dashboard
          onNavigateToGame={handleNavigateToGame}
          onNavigateToProfile={handleNavigateToProfile}
          onNavigateToResellers={() => setCurrentScreen('resellers')}
          onNavigateToResults={() => setCurrentScreen('results')}
          playBalance={playBalance}
          winningsBalance={winningsBalance}
          onRecharge={() => {}}
          onLogout={handleLogout}
        />
      )}
      
      {currentScreen === 'game' && user && (
        <GameScreen
          drawId={selectedGame}
          onBack={handleBackToDashboard}
          onNavigateToProfile={handleNavigateToProfile}
          playBalance={playBalance}
          onPlaceBet={() => {}}
        />
      )}
      
      {currentScreen === 'profile' && user && (
        <ProfileScreen 
          onBack={handleBackToDashboard}
          playBalance={playBalance}
          winningsBalance={winningsBalance}
          onRecharge={() => {}}
          onConvertWinnings={() => {}}
          onLogout={handleLogout}
        />
      )}
      
      {currentScreen === 'resellers' && user && (
        <ResellersScreen 
          onBack={handleBackToDashboard} 
          userPhoneNumber={user.phoneNumber}
          playBalance={playBalance}
          onProfile={handleNavigateToProfile}
        />
      )}
      
      {currentScreen === 'results' && (
        <ResultsScreen onBack={handleBackToDashboard} />
      )}
      
      {currentScreen === 'reseller-dashboard' && user && (
        <ResellerDashboard onLogout={handleLogout} />
      )}
      
      {currentScreen === 'admin-panel' && user && (
        <AdminPanel onLogout={handleLogout} />
      )}

      <Toaster position="top-center" />
    </ThemeProvider>
  );
}