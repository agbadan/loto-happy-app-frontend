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
import { User } from "./utils/authAPI";

type Screen = 'login' | 'password' | 'registration' | 'dashboard' | 'reseller-dashboard' | 'admin-panel' | 'game' | 'profile' | 'resellers' | 'results';

export default function App() {
  const { user, isLoading, logout, refreshUser } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [selectedGame, setSelectedGame] = useState<string>('');
  const [tempPhoneNumber, setTempPhoneNumber] = useState<string>('');
  const [tempCountryCode, setTempCountryCode] = useState<string>('');
  const [tempGoogleEmail, setTempGoogleEmail] = useState<string>('');
  const [tempGoogleName, setTempGoogleName] = useState<string>('');
  const [rechargeAmount, setRechargeAmount] = useState<number>(0);

  const playBalance = user?.balanceGame ?? 0;
  const winningsBalance = user?.balanceWinnings ?? 0;

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        if (user.role === 'reseller') {
          setCurrentScreen('reseller-dashboard');
        } else if (user.role === 'admin') {
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
  
  const handleLogin = () => {
    // The context now handles the user state, so we just need to navigate.
    // The useEffect above will handle the navigation.
  };

  const handleNavigateToPassword = (phoneNumber: string, countryCode: string) => {
    setTempPhoneNumber(phoneNumber);
    setTempCountryCode(countryCode);
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

  const handleNavigateToGame = (drawId: string) => {
    setSelectedGame(drawId);
    setCurrentScreen('game');
  };

  const handleNavigateToProfile = () => {
    setCurrentScreen('profile');
  };

  const handleBackToDashboard = () => {
    setCurrentScreen('dashboard');
  };

  if (isLoading) {
    return <div>Loading...</div>; // Or a proper spinner component
  }

  return (
    <ThemeProvider>
      {currentScreen === 'login' && (
        <LoginScreen 
          onLogin={handleLogin}
          onNavigateToPassword={handleNavigateToPassword}
          onNavigateToRegistration={handleNavigateToRegistration}
        />
      )}
      
      {currentScreen === 'password' && (
        <PasswordLoginScreen
          phoneNumber={tempPhoneNumber}
          countryCode={tempCountryCode}
          onLogin={handleLogin}
          onLoginAsReseller={() => setCurrentScreen('reseller-dashboard')}
          onLoginAsAdmin={() => setCurrentScreen('admin-panel')}
          onBack={handleBackToLogin}
        />
      )}
      
      {currentScreen === 'registration' && (
        <RegistrationScreen
          phoneNumber={tempPhoneNumber}
          countryCode={tempCountryCode}
          googleEmail={tempGoogleEmail}
          googleName={tempGoogleName}
          onRegister={handleLogin}
          onBack={handleBackToLogin}
        />
      )}
      
      {currentScreen === 'dashboard' && user && (
        <Dashboard
          onNavigateToGame={handleNavigateToGame}
          onNavigateToProfile={handleNavigateToProfile}
          onNavigateToResellers={() => {}}
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
          onPlaceBet={() => false}
        />
      )}
      
      {currentScreen === 'profile' && user && (
        <ProfileScreen 
          onBack={handleBackToDashboard}
          playBalance={playBalance}
          winningsBalance={winningsBalance}
          onRecharge={() => {}}
          onConvertWinnings={() => false}
          onLogout={handleLogout}
        />
      )}
      
      {currentScreen === 'resellers' && user && (
        <ResellersScreen 
          onBack={handleBackToDashboard} 
          rechargeAmount={rechargeAmount}
          userPhoneNumber={user.phoneNumber}
          playBalance={playBalance}
          onRecharge={() => setCurrentScreen('dashboard')}
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