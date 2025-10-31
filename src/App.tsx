// src/App.tsx

import { useState, useEffect } from "react";
import { ThemeProvider } from "./components/ThemeProvider";
import { Toaster } from "./components/ui/sonner";
import { useAuth } from "./contexts/AuthContext";

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

// Le type Screen est conservé avec toutes vos définitions
type Screen = 'login' | 'password' | 'registration' | 'dashboard' | 'reseller-dashboard' | 'admin-panel' | 'game' | 'profile' | 'resellers' | 'results';

export default function App() {
  const { user, isLoading, logout } = useAuth();

  // --- ÉTATS ---
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  
  // CORRECTION: Un seul état pour gérer l'identifiant (email/téléphone) à travers le flux d'authentification.
  const [authIdentifier, setAuthIdentifier] = useState<string>('');
  
  // Les états spécifiques à vos fonctionnalités sont conservés
  const [selectedGame, setSelectedGame] = useState<string>('');

  // Les variables calculées sont conservées
  const playBalance = user?.balanceGame ?? 0;
  const winningsBalance = user?.balanceWinnings ?? 0;

  // Votre useEffect de redirection par rôle est parfait et reste inchangé.
  useEffect(() => {
    if (!isLoading) {
      if (user) {
        if (user.role === 'reseller') {
          setCurrentScreen('reseller-dashboard');
        } else if (user.role.includes('Admin')) {
          setCurrentScreen('admin-panel');
        } else {
          setCurrentScreen('dashboard');
        }
      } else {
        setCurrentScreen('login');
      }
    }
  }, [user, isLoading]);

  // --- GESTIONNAIRES DE NAVIGATION (CORRIGÉS ET SIMPLIFIÉS) ---
  
  const handleLogout = () => {
    logout();
    // La redirection se fera automatiquement via le useEffect ci-dessus.
  };

  const handleNavigateToPassword = (identifier: string) => {
    setAuthIdentifier(identifier);
    setCurrentScreen('password');
  };

  // CORRECTION: Une seule fonction unifiée pour aller à l'écran d'inscription.
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

  // Votre écran de chargement est conservé.
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#121212', color: 'white' }}>
        Chargement de votre session...
      </div>
    );
  }

  // --- AFFICHAGE COMPLET ET CORRIGÉ ---
  return (
    <ThemeProvider>
      {currentScreen === 'login' && (
        <LoginScreen 
          onNavigateToPassword={handleNavigateToPassword}
          // L'ancienne prop 'onNavigateToRegistration' est supprimée d'ici pour simplifier le flux.
        />
      )}
      
      {currentScreen === 'password' && (
        <PasswordLoginScreen
          identifier={authIdentifier}
          onBack={handleBackToLogin}
          onNavigateToRegistration={handleNavigateToRegistration} // Utilise la nouvelle fonction unifiée
        />
      )}
      
      {currentScreen === 'registration' && (
        <RegistrationScreen
          prefilledIdentifier={authIdentifier} // Utilise la nouvelle prop unique
          onBack={handleBackToLogin}
        />
      )}
      
      {/* Tous vos autres écrans sont conservés tels quels */}
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