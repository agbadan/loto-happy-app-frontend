import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Trophy, Sparkles, X, Gift, Star, PartyPopper } from 'lucide-react';
import { getUnreadWinNotifications, markNotificationAsRead, markAllNotificationsAsRead, WinNotification } from '../utils/draws';
import { useTheme } from './ThemeProvider';

interface WinNotificationProps {
  userId: string;
}

export function WinNotificationPanel({ userId }: WinNotificationProps) {
  const [notifications, setNotifications] = useState<WinNotification[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const { isDark } = useTheme();

  useEffect(() => {
    // Charger les notifications non lues
    const unreadNotifications = getUnreadWinNotifications(userId);
    if (unreadNotifications.length > 0) {
      setNotifications(unreadNotifications);
      setShowModal(true);
    }
  }, [userId]);

  const currentNotification = notifications[currentIndex];

  const handleNext = () => {
    if (currentNotification) {
      markNotificationAsRead(currentNotification.id);
    }
    
    if (currentIndex < notifications.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    // Marquer toutes comme lues
    notifications.forEach(n => markNotificationAsRead(n.id));
    setShowModal(false);
    setNotifications([]);
    setCurrentIndex(0);
  };

  if (!currentNotification) return null;

  const getMatchText = (matchCount: number) => {
    if (matchCount === 5) return "JACKPOT ! 5 NUMÉROS CORRECTS !";
    if (matchCount === 4) return "BRAVO ! 4 NUMÉROS CORRECTS !";
    if (matchCount === 3) return "FÉLICITATIONS ! 3 NUMÉROS CORRECTS !";
    return "";
  };

  const getMatchColor = (matchCount: number) => {
    if (matchCount === 5) return "#FFD700"; // Or
    if (matchCount === 4) return "#FF6B00"; // Orange
    return "#4F00BC"; // Violet
  };

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent 
        className="max-w-lg border-0 p-0 max-h-[90vh] overflow-y-auto scrollbar-visible"
        style={{
          backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
        }}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Notification de gain</DialogTitle>
          <DialogDescription>Vous avez gagné à la loterie</DialogDescription>
        </DialogHeader>

        {/* Confettis animés en arrière-plan */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              initial={{ 
                top: -20, 
                left: `${Math.random() * 100}%`,
                rotate: 0,
                opacity: 1
              }}
              animate={{ 
                top: '110%',
                rotate: 360,
                opacity: 0
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                delay: Math.random() * 2,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              {i % 3 === 0 ? (
                <Sparkles className="h-4 w-4 text-[#FFD700]" />
              ) : i % 3 === 1 ? (
                <Star className="h-3 w-3 text-[#FF6B00]" />
              ) : (
                <div className="h-2 w-2 rounded-full bg-[#4F00BC]" />
              )}
            </motion.div>
          ))}
        </div>

        {/* Contenu principal */}
        <div className="relative p-8 pb-6">
          {/* Icône principale */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 200, 
              damping: 15,
              delay: 0.2 
            }}
            className="flex justify-center mb-6"
          >
            <div 
              className="relative p-6 rounded-full"
              style={{
                background: `linear-gradient(135deg, ${getMatchColor(currentNotification.matchCount)}40, ${getMatchColor(currentNotification.matchCount)}20)`
              }}
            >
              <Trophy 
                className="h-16 w-16" 
                style={{ color: getMatchColor(currentNotification.matchCount) }}
              />
              <motion.div
                className="absolute -top-1 -right-1"
                animate={{ 
                  rotate: [0, 15, -15, 0],
                  scale: [1, 1.2, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <PartyPopper className="h-8 w-8 text-[#FFD700]" />
              </motion.div>
            </div>
          </motion.div>

          {/* Texte principal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center mb-6"
          >
            <h2 
              className="text-2xl font-bold mb-2"
              style={{ color: getMatchColor(currentNotification.matchCount) }}
            >
              {getMatchText(currentNotification.matchCount)}
            </h2>
            <p className="text-muted-foreground mb-4">
              Tirage {currentNotification.game} du {currentNotification.drawDate}
            </p>
          </motion.div>

          {/* Montant gagné */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring",
              stiffness: 300,
              damping: 20,
              delay: 0.6 
            }}
            className="mb-6"
          >
            <Card 
              className="p-6 text-center border-2"
              style={{
                borderColor: getMatchColor(currentNotification.matchCount),
                background: isDark 
                  ? `linear-gradient(135deg, ${getMatchColor(currentNotification.matchCount)}15, transparent)`
                  : `linear-gradient(135deg, ${getMatchColor(currentNotification.matchCount)}10, transparent)`
              }}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Gift className="h-5 w-5 text-[#FFD700]" />
                <span className="text-sm text-muted-foreground">Vous avez gagné</span>
              </div>
              <div 
                className="text-4xl font-bold"
                style={{ color: getMatchColor(currentNotification.matchCount) }}
              >
                {currentNotification.winAmount.toLocaleString()} F
              </div>
            </Card>
          </motion.div>

          {/* Numéros */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="space-y-3 mb-6"
          >
            <div>
              <p className="text-xs text-muted-foreground mb-2">Numéros gagnants</p>
              <div className="flex gap-2 justify-center flex-wrap">
                {(Array.isArray(currentNotification.winningNumbers) 
                  ? currentNotification.winningNumbers 
                  : currentNotification.winningNumbers.toString().split(',')
                ).map((num, i) => {
                  const numStr = num.toString().trim();
                  const isMatched = currentNotification.playerNumbers.split(',').map(n => n.trim()).includes(numStr);
                  return (
                    <Badge
                      key={i}
                      className={`text-base px-3 py-1 ${
                        isMatched 
                          ? 'border-2' 
                          : 'opacity-50'
                      }`}
                      style={{
                        backgroundColor: isMatched ? getMatchColor(currentNotification.matchCount) + '20' : 'transparent',
                        borderColor: isMatched ? getMatchColor(currentNotification.matchCount) : 'currentColor',
                        color: isMatched ? getMatchColor(currentNotification.matchCount) : 'currentColor'
                      }}
                    >
                      {numStr}
                    </Badge>
                  );
                })}
              </div>
            </div>
            
            <div>
              <p className="text-xs text-muted-foreground mb-2">Vos numéros</p>
              <div className="flex gap-2 justify-center flex-wrap">
                {currentNotification.playerNumbers.split(',').map((num, i) => (
                  <Badge key={i} variant="outline" className="text-base px-3 py-1">
                    {num.trim()}
                  </Badge>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Info crédit automatique */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mb-6 p-3 rounded-lg bg-green-500/10 border border-green-500/30"
          >
            <p className="text-sm text-center text-green-600 dark:text-green-400">
              ✓ Les gains ont été automatiquement crédités sur votre Solde des Gains
            </p>
          </motion.div>

          {/* Progression */}
          {notifications.length > 1 && (
            <div className="text-center text-sm text-muted-foreground mb-4">
              Gain {currentIndex + 1} sur {notifications.length}
            </div>
          )}

          {/* Boutons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="flex gap-3"
          >
            {currentIndex < notifications.length - 1 ? (
              <>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleClose}
                >
                  Voir plus tard
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleNext}
                  style={{
                    backgroundColor: getMatchColor(currentNotification.matchCount),
                    color: '#FFFFFF'
                  }}
                >
                  Suivant
                </Button>
              </>
            ) : (
              <Button
                className="w-full"
                onClick={handleClose}
                style={{
                  backgroundColor: getMatchColor(currentNotification.matchCount),
                  color: '#FFFFFF'
                }}
              >
                Continuer à jouer
              </Button>
            )}
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
