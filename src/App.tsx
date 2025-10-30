import { useState, useEffect } from "react";
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
import { ThemeProvider } from "./components/ThemeProvider";
import { Toaster } from "./components/ui/sonner";
import { useAuth } from "./contexts/AuthContext";

type Screen = 'login' | 'password' | 'registration' | 'dashboard' | 'reseller-dashboard' | 'admin-panel' | 'game' | 'profile' | 'resellers' | 'results';

export default function App() {
  const { user, isLoading, logout } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [selectedGame, setSelectedGame] = useState<string>('');
  
  // --- CORRECTION MAJEURE : Simplification des états temporaires ---
  const [loginIdentifier, setLoginIdentifier] = useState<string>('');
  // On garde ceux pour l'inscription car ils sont plus complexes
  const [tempPhoneNumber, setTempPhoneNumber] = useState<string>('');
  const [tempCountryCode, setTempCountryCode] = useState<string>('');
  const [tempGoogleEmail, setTempGoogleEmail] = useState<string>('');
  const [tempGoogleName, setTempGoogleName] = useState<string>('');

  const playBalance = user?.balanceGame ?? 0;
  const winningsBalance = user?.balanceWinnings ?? 0;

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        if (user.role === 'reseller') {
          setCurrentScreen('reseller-dashboard');
        } else if (user.role.includes('Admin')) { // Gère 'Super Admin', 'Admin du Jeu', etc.
          setCurrentScreen('admin-panel');
        } else {
          setCurrentScreen('dashboard');
        }
      } else {
        setCurrentScreen('login');
      }
    }
  }, [user, isLoading]);

  const handleLogout = () => {
    logout();
    setCurrentScreen('login');
  };

  // --- CORRECTION DE LA LOGIQUE DE NAVIGATION ---
  const handleNavigateToPassword = (identifier: string) => {
    setLoginIdentifier(identifier); // On stocke l'identifiant propre
    setCurrentScreen('password');
  };

  const handleNavigateToRegistration = (
    phoneNumber: string,
    countryCode: string,
    googleEmail?: string,
    googleName?: string
  ) => {
    setTempPhoneNumber(phoneNumber);
    setTempCountryCode(countryCode);
    setTempGoogleEmail(googleEmail || '');
    setTempGoogleName(googleName || '');
    setCurrentScreen('registration');
  };

  const handleBackToLogin = () => {
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

  // Ce composant est affiché pendant que le AuthContext vérifie le token
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#121212', color: 'white' }}>
        Chargement de votre session...
      </div>
    );
  }

  // --- LE JSX CI-DESSOUS EST MODIFIÉ POUR UTILISER LA NOUVELLE LOGIQUE ---
  return (
    <ThemeProvider>
      {currentScreen === 'login' && (
        <LoginScreen 
          onNavigateToPassword={handleNavigateToPassword}
          onNavigateToRegistration={handleNavigateToRegistration}
        />
      )}
      
      {currentScreen === 'password' && (
        <PasswordLoginScreen
          identifier={loginIdentifier} // On passe la prop 'identifier'
          onBack={handleBackToLogin}
        />
      )}
      
      {currentScreen === 'registration' && (
        <RegistrationScreen
          phoneNumber={tempPhoneNumber}
          countryCode={tempCountryCode}
          googleEmail={tempGoogleEmail}
          googleName={tempGoogleName}
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