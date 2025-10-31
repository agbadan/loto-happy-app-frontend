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
  
  const [loginIdentifier, setLoginIdentifier] = useState<string>('');
  
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

  const handleLogout = () => {
    logout();
    setCurrentScreen('login');
  };

  const handleNavigateToPassword = (identifier: string) => {
    setLoginIdentifier(identifier);
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

  // --- LOGIQUE DE REDIRECTION CORRIGÉE ET COMPLÉTÉE ---
  const handleNavigateToRegistrationFromPassword = (identifier: string) => {
    let phone = '';
    let code = '';
    let email = '';

    if (identifier.includes('@')) {
      // Si l'identifiant est un email, on le pré-remplit.
      email = identifier;
    } else if (identifier.startsWith('+')) {
      // Si c'est un numéro, on essaie de le décomposer.
      // Hypothèse : les codes pays font 4 caractères (ex: +228).
      code = identifier.substring(0, 4);
      phone = identifier.substring(4);
    } else {
      // Cas peu probable (ex: email sans '@'), on ne pré-remplit rien
      // pour que l'utilisateur puisse corriger.
      console.warn("Identifiant inattendu pour la redirection vers l'inscription:", identifier);
    }
    
    setTempPhoneNumber(phone);
    setTempCountryCode(code);
    setTempGoogleEmail(email);
    setTempGoogleName(''); // Pas de nom dans ce flux
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

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#121212', color: 'white' }}>
        Chargement de votre session...
      </div>
    );
  }

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
          identifier={loginIdentifier}
          onBack={handleBackToLogin}
          onNavigateToRegistration={handleNavigateToRegistrationFromPassword}
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