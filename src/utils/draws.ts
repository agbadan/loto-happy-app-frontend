// Système de gestion des tirages et gains - VERSION REFACTORISÉE
// Un tirage = Un opérateur + date/heure
// Les joueurs choisissent leur type de pari pour un tirage

import { 
  getOperatorById,
  getAllOperators,
  BetType, 
  BET_TYPES_CONFIG, 
  generateNAP2Combinations, 
  invertNumber,
  Draw as DrawType
} from './games';

// ===== INTERFACES =====

// On utilise Draw de games.ts, mais on ajoute des champs supplémentaires pour l'admin
export interface DrawExtended extends DrawType {
  participants?: number;
  winners?: number;
  totalBets?: number;
  totalWinnings?: number;
  profit?: number;
}

export interface Ticket {
  id: string;
  userId: string;
  username: string;
  drawId: string; // ID du tirage (pas drawId number, maintenant string)
  numbers: string; // Numéros choisis par le joueur
  betAmount: number;
  purchaseDate: string; // ISO string
  status?: 'pending' | 'won' | 'lost'; // Statut du ticket
  winAmount?: number; // Montant gagné si gagnant
  // Champs pour les paris avancés
  betType?: BetType; // Type de pari
  baseNumber?: number; // Pour BANKA
  associatedNumbers?: number[]; // Pour BANKA
  position?: 'first' | 'last'; // Pour CHANCE_PLUS
  combinations?: number[][]; // Pour PERMUTATION (toutes les combinaisons générées)
}

export interface BetHistoryItem {
  id: string;
  drawId: string;
  operatorName: string;
  numbers: string;
  betAmount: number;
  purchaseDate: string;
  drawDate: string;
  drawTime: string;
  status: 'upcoming' | 'pending' | 'won' | 'lost';
  winAmount?: number;
  winningNumbers?: number[];
  betType?: BetType;
}

export interface WinNotification {
  id: number;
  userId: string;
  drawId: string;
  operatorName: string;
  drawDate: string;
  winningNumbers: number[];
  playerNumbers: string;
  matchCount: number;
  winAmount: number;
  timestamp: string;
  read: boolean;
}

// Clés de stockage
const TICKETS_KEY = 'loto_happy_tickets';
const WIN_NOTIFICATIONS_KEY = 'loto_happy_win_notifications';
const USERS_KEY = 'loto_happy_users';
const CURRENT_USER_KEY = 'lottoHappyUser';

// ===== GESTION DES TIRAGES =====
// Note: Les tirages sont maintenant gérés dans games.ts via localStorage 'loto_happy_draws'

import { 
  getDrawsFromLocalStorage, 
  saveDrawsToLocalStorage, 
  getDrawById as getDrawByIdFromGames,
  getAllUpcomingDraws as getAllUpcomingDrawsFromGames
} from './games';

// Wrapper pour compatibilité
export function getDraws(): DrawExtended[] {
  return getDrawsFromLocalStorage() as DrawExtended[];
}

export function saveDraws(draws: DrawExtended[]): void {
  saveDrawsToLocalStorage(draws);
}

export function getDrawsByStatus(status: 'upcoming' | 'pending' | 'completed'): DrawExtended[] {
  return getDraws().filter(draw => draw.status === status);
}

// Mettre à jour les statuts des tirages (upcoming → pending si date/heure passée)
export function updateDrawStatuses(): void {
  const draws = getDraws();
  const now = new Date();
  let updated = false;
  
  draws.forEach(draw => {
    if (draw.status === 'upcoming') {
      const drawDateTime = new Date(`${draw.date}T${draw.time}:00`);
      if (now > drawDateTime) {
        draw.status = 'pending';
        updated = true;
      }
    }
  });
  
  if (updated) {
    saveDraws(draws);
  }
}

// ===== GESTION DES TICKETS (PARIS) =====

export function getTickets(): Ticket[] {
  const stored = localStorage.getItem(TICKETS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function saveTickets(tickets: Ticket[]): void {
  localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));
}

// Créer un nouveau ticket (pari)
export function createTicket(
  userId: string,
  username: string,
  drawId: string,
  numbers: string,
  betAmount: number,
  betType?: BetType,
  additionalData?: {
    baseNumber?: number;
    associatedNumbers?: number[];
    position?: 'first' | 'last';
    combinations?: number[][];
  }
): Ticket {
  const tickets = getTickets();
  
  const ticket: Ticket = {
    id: `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    username,
    drawId,
    numbers,
    betAmount,
    purchaseDate: new Date().toISOString(),
    status: 'pending',
    betType: betType || 'NAP2', // Par défaut NAP2
    ...additionalData
  };
  
  tickets.push(ticket);
  saveTickets(tickets);
  
  // Mettre à jour le nombre de participants du tirage
  updateDrawParticipants(drawId);
  
  return ticket;
}

// Récupérer les tickets pour un tirage
export function getTicketsForDraw(drawId: string): Ticket[] {
  return getTickets().filter(ticket => ticket.drawId === drawId);
}

// Récupérer l'historique des paris d'un joueur
export function getBetHistory(userId: string): BetHistoryItem[] {
  const tickets = getTickets().filter(t => t.userId === userId);
  const draws = getDraws();
  
  return tickets.map(ticket => {
    const draw = draws.find(d => d.id === ticket.drawId);
    if (!draw) return null;
    
    const operator = getOperatorById(draw.operatorId);
    const operatorName = operator ? operator.name : 'Opérateur inconnu';
    
    let status: 'upcoming' | 'pending' | 'won' | 'lost' = draw.status === 'completed' 
      ? (ticket.status === 'won' ? 'won' : 'lost')
      : draw.status;
    
    return {
      id: ticket.id,
      drawId: ticket.drawId,
      operatorName,
      numbers: ticket.numbers,
      betAmount: ticket.betAmount,
      purchaseDate: ticket.purchaseDate,
      drawDate: draw.date,
      drawTime: draw.time,
      status,
      winAmount: ticket.winAmount,
      winningNumbers: draw.winningNumbers,
      betType: ticket.betType
    };
  }).filter(item => item !== null) as BetHistoryItem[];
}

// Mettre à jour le nombre de participants d'un tirage
function updateDrawParticipants(drawId: string): void {
  const draws = getDraws();
  const drawIndex = draws.findIndex(d => d.id === drawId);
  
  if (drawIndex !== -1) {
    const tickets = getTicketsForDraw(drawId);
    draws[drawIndex].participants = tickets.length;
    saveDraws(draws);
  }
}

// ===== GESTION DES GAINS ET RÉSULTATS =====

// Comparer les numéros et compter les correspondances
function countMatches(playerNumbers: string, winningNumbers: number[]): number {
  const playerNums = playerNumbers.split(',').map(n => parseInt(n.trim()));
  return playerNums.filter(num => winningNumbers.includes(num)).length;
}

/**
 * Calculer les gains selon le type de pari avancé
 */
export function calculateAdvancedWinAmount(ticket: Ticket, draw: DrawExtended): number {
  const betType = ticket.betType || 'NAP2';
  const betConfig = BET_TYPES_CONFIG[betType];
  if (!betConfig) return 0;

  // Utiliser le multiplicateur du tirage si disponible, sinon celui par défaut
  const multiplier = draw.multipliers?.[betType] ?? betConfig.defaultMultiplier;

  const winningNums = draw.winningNumbers || [];

  switch (betType) {
    case 'NAP1':
    case 'NAP2':
    case 'NAP3':
    case 'NAP4':
    case 'NAP5': {
      // Paris NAP simples : compter les correspondances exactes
      const playerNums = ticket.numbers.split(',').map(n => parseInt(n.trim()));
      const matchCount = playerNums.filter(num => winningNums.includes(num)).length;
      
      // Pour gagner, il faut TOUS les numéros
      if (matchCount === playerNums.length) {
        return ticket.betAmount * multiplier;
      }
      return 0;
    }

    case 'PERMUTATION': {
      // Pour PERMUTATION, vérifier si au moins UNE combinaison NAP2 est gagnante
      const combinations = ticket.combinations || [];
      let winningCombos = 0;
      
      for (const combo of combinations) {
        if (combo.every(num => winningNums.includes(num))) {
          winningCombos++;
        }
      }
      
      if (winningCombos > 0) {
        // Gain = nombre de combos gagnantes × (mise par combo) × multiplicateur
        const betPerCombo = ticket.betAmount / combinations.length;
        return Math.floor(winningCombos * betPerCombo * multiplier);
      }
      return 0;
    }

    case 'BANKA': {
      // Pour BANKA, vérifier que le numéro de base ET au moins un autre sont sortis
      const baseNumber = ticket.baseNumber;
      const associatedNumbers = ticket.associatedNumbers || [];
      
      if (!baseNumber) return 0;
      
      // Le numéro de base doit sortir
      if (!winningNums.includes(baseNumber)) return 0;
      
      // Au moins un des numéros associés doit sortir
      const matchingAssociated = associatedNumbers.filter(num => winningNums.includes(num));
      
      if (matchingAssociated.length > 0) {
        // Gain proportionnel au nombre de numéros associés gagnants
        return Math.floor(ticket.betAmount * multiplier * matchingAssociated.length / associatedNumbers.length);
      }
      return 0;
    }

    case 'CHANCE_PLUS': {
      // Pour CHANCE_PLUS, vérifier la position exacte
      const playerNum = parseInt(ticket.numbers);
      const position = ticket.position;
      
      if (position === 'first' && winningNums[0] === playerNum) {
        return ticket.betAmount * multiplier;
      }
      if (position === 'last' && winningNums[winningNums.length - 1] === playerNum) {
        return ticket.betAmount * multiplier;
      }
      return 0;
    }

    case 'ANAGRAMME': {
      // Pour ANAGRAMME, vérifier si le numéro OU son inversé est sorti
      const playerNum = parseInt(ticket.numbers);
      const inverted = invertNumber(playerNum);
      
      if (winningNums.includes(playerNum) || (inverted && winningNums.includes(inverted))) {
        return ticket.betAmount * multiplier;
      }
      return 0;
    }

    default:
      return 0;
  }
}

// Récupérer tous les utilisateurs
function getUsers(): any[] {
  const stored = localStorage.getItem(USERS_KEY);
  return stored ? JSON.parse(stored) : [];
}

// Sauvegarder tous les utilisateurs
function saveUsers(users: any[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Créditer les gains au joueur
function creditWinningsToPlayer(userId: string, amount: number, operatorName: string): void {
  const users = getUsers();
  const userIndex = users.findIndex((u: any) => u.id === userId);
  
  if (userIndex !== -1) {
    // Ajouter au solde de gains
    users[userIndex].balanceWinnings = (users[userIndex].balanceWinnings || 0) + amount;
    
    // Ajouter une transaction dans l'historique
    if (!users[userIndex].playerTransactionHistory) {
      users[userIndex].playerTransactionHistory = [];
    }
    
    users[userIndex].playerTransactionHistory.unshift({
      id: `win_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'WIN',
      description: `Gain au ${operatorName}`,
      amount: amount,
      balanceAfter: users[userIndex].balanceWinnings,
      date: new Date().toISOString(),
      metadata: {
        operatorName: operatorName
      }
    });
    
    saveUsers(users);
    
    // Mettre à jour aussi l'utilisateur connecté si c'est lui
    const currentUserStored = localStorage.getItem(CURRENT_USER_KEY);
    if (currentUserStored) {
      const currentUser = JSON.parse(currentUserStored);
      if (currentUser.id === userId) {
        currentUser.balanceWinnings = users[userIndex].balanceWinnings;
        currentUser.playerTransactionHistory = users[userIndex].playerTransactionHistory;
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
      }
    }
    
    // Synchroniser avec lottoHappyAllPlayers
    const allPlayersKey = 'lottoHappyAllPlayers';
    const playersStored = localStorage.getItem(allPlayersKey);
    if (playersStored) {
      const allPlayers = JSON.parse(playersStored);
      const playerIndex = allPlayers.findIndex((p: any) => p.id === userId);
      if (playerIndex !== -1) {
        allPlayers[playerIndex].balanceWinnings = users[userIndex].balanceWinnings;
        allPlayers[playerIndex].playerTransactionHistory = users[userIndex].playerTransactionHistory;
        localStorage.setItem(allPlayersKey, JSON.stringify(allPlayers));
      }
    }
  }
}

// Créer une notification de gain
function createWinNotification(data: Omit<WinNotification, 'id' | 'timestamp' | 'read'>): void {
  const notifications = getWinNotifications();
  const newNotification: WinNotification = {
    ...data,
    id: Math.max(...notifications.map(n => n.id), 0) + 1,
    timestamp: new Date().toISOString(),
    read: false
  };
  notifications.push(newNotification);
  localStorage.setItem(WIN_NOTIFICATIONS_KEY, JSON.stringify(notifications));
}

// Saisir les résultats d'un tirage et distribuer les gains
export function submitDrawResults(drawId: string, winningNumbers: number[]): void {
  const draws = getDraws();
  const drawIndex = draws.findIndex(d => d.id === drawId);
  
  if (drawIndex === -1) return;
  
  const draw = draws[drawIndex];
  const operator = getOperatorById(draw.operatorId);
  const operatorName = operator ? operator.name : 'Opérateur inconnu';
  
  // Mettre à jour le tirage avec les numéros gagnants
  draws[drawIndex].winningNumbers = winningNumbers;
  
  const tickets = getTicketsForDraw(drawId);
  
  let totalWinnings = 0;
  let winnersCount = 0;
  let totalBets = 0;
  
  // Mettre à jour tous les tickets
  const allTickets = getTickets();
  
  tickets.forEach(ticket => {
    totalBets += ticket.betAmount;
    
    // Calculer les gains
    const winAmount = calculateAdvancedWinAmount(ticket, draws[drawIndex]);
    
    // Calcul du matchCount pour les notifications
    const matchCount = countMatches(ticket.numbers, winningNumbers);
    
    if (winAmount > 0) {
      // Marquer le ticket comme gagnant
      const ticketIndex = allTickets.findIndex(t => t.id === ticket.id);
      if (ticketIndex !== -1) {
        allTickets[ticketIndex].status = 'won';
        allTickets[ticketIndex].winAmount = winAmount;
      }
      
      // Créer une notification de gain
      createWinNotification({
        userId: ticket.userId,
        drawId: draw.id,
        operatorName,
        drawDate: `${draw.date} ${draw.time}`,
        winningNumbers: winningNumbers,
        playerNumbers: ticket.numbers,
        matchCount: matchCount,
        winAmount: winAmount
      });
      
      // Créditer le solde de gains du joueur
      creditWinningsToPlayer(ticket.userId, winAmount, operatorName);
      
      totalWinnings += winAmount;
      winnersCount++;
    } else {
      // Marquer le ticket comme perdant
      const ticketIndex = allTickets.findIndex(t => t.id === ticket.id);
      if (ticketIndex !== -1) {
        allTickets[ticketIndex].status = 'lost';
      }
    }
  });
  
  // Sauvegarder les tickets mis à jour
  saveTickets(allTickets);
  
  const profit = totalBets - totalWinnings;
  
  // Mettre à jour le tirage et le marquer comme complété
  draws[drawIndex] = {
    ...draw,
    status: 'completed',
    winningNumbers: winningNumbers,
    winners: winnersCount,
    participants: tickets.length,
    totalBets: totalBets,
    totalWinnings: totalWinnings,
    profit: profit
  };
  
  saveDraws(draws);
}

// ===== GESTION DES NOTIFICATIONS =====

export function getWinNotifications(userId?: string): WinNotification[] {
  const stored = localStorage.getItem(WIN_NOTIFICATIONS_KEY);
  const notifications: WinNotification[] = stored ? JSON.parse(stored) : [];
  
  if (userId) {
    return notifications.filter(n => n.userId === userId);
  }
  
  return notifications;
}

export function getUnreadWinNotifications(userId: string): WinNotification[] {
  return getWinNotifications(userId).filter(n => !n.read);
}

export function markNotificationAsRead(notificationId: number): void {
  const notifications = getWinNotifications();
  const index = notifications.findIndex(n => n.id === notificationId);
  
  if (index !== -1) {
    notifications[index].read = true;
    localStorage.setItem(WIN_NOTIFICATIONS_KEY, JSON.stringify(notifications));
  }
}

export function markAllNotificationsAsRead(userId: string): void {
  const notifications = getWinNotifications();
  const updated = notifications.map(n => 
    n.userId === userId ? { ...n, read: true } : n
  );
  localStorage.setItem(WIN_NOTIFICATIONS_KEY, JSON.stringify(updated));
}

// ===== STATISTIQUES DES COMBINAISONS =====

export type TimePeriod = '1h' | 'today' | 'week' | 'all';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface CombinationStat {
  combination: number[];
  combinationStr: string;
  count: number;
  totalAmount: number;
  operatorId: string;
  operatorName: string;
  riskLevel: RiskLevel;
  lastPlayed: string;
  potentialPayout: number;
}

// Calculer le niveau de risque
function calculateRiskLevel(potentialPayout: number): RiskLevel {
  if (potentialPayout > 5000000) return 'critical';
  if (potentialPayout > 2000000) return 'high';
  if (potentialPayout > 500000) return 'medium';
  return 'low';
}

// Filtrer les tickets par période
function filterTicketsByPeriod(tickets: Ticket[], period: TimePeriod): Ticket[] {
  if (period === 'all') return tickets;
  
  const now = new Date();
  const filterDate = new Date();
  
  switch (period) {
    case '1h':
      filterDate.setHours(now.getHours() - 1);
      break;
    case 'today':
      filterDate.setHours(0, 0, 0, 0);
      break;
    case 'week':
      filterDate.setDate(now.getDate() - 7);
      break;
  }
  
  return tickets.filter(ticket => {
    const ticketDate = new Date(ticket.purchaseDate);
    return ticketDate >= filterDate;
  });
}

// Analyser les combinaisons les plus jouées
export function getCombinationStats(period: TimePeriod = 'today'): CombinationStat[] {
  let tickets = getTickets();
  tickets = filterTicketsByPeriod(tickets, period);
  
  // Filtrer uniquement les tickets en attente
  const draws = getDraws();
  const upcomingDrawIds = draws
    .filter(d => d.status === 'upcoming' || d.status === 'pending')
    .map(d => d.id);
  
  tickets = tickets.filter(ticket => upcomingDrawIds.includes(ticket.drawId));
  
  // Grouper par combinaison
  const combinationMap = new Map<string, {
    combination: number[];
    count: number;
    totalAmount: number;
    drawId: string;
    lastPlayed: string;
  }>();
  
  tickets.forEach(ticket => {
    const numbers = ticket.numbers.split(',').map(n => parseInt(n.trim())).sort((a, b) => a - b);
    const key = `${ticket.drawId}_${numbers.join(',')}`;
    
    const existing = combinationMap.get(key);
    
    if (existing) {
      existing.count++;
      existing.totalAmount += ticket.betAmount;
      if (ticket.purchaseDate > existing.lastPlayed) {
        existing.lastPlayed = ticket.purchaseDate;
      }
    } else {
      combinationMap.set(key, {
        combination: numbers,
        count: 1,
        totalAmount: ticket.betAmount,
        drawId: ticket.drawId,
        lastPlayed: ticket.purchaseDate
      });
    }
  });
  
  // Convertir en tableau et calculer les statistiques
  const stats: CombinationStat[] = [];
  
  combinationMap.forEach((value) => {
    const draw = draws.find(d => d.id === value.drawId);
    if (!draw) return;
    
    const operator = getOperatorById(draw.operatorId);
    const operatorName = operator ? operator.name : 'Inconnu';
    
    // Estimation simple du gain potentiel : totalAmount * multiplicateur moyen
    const avgMultiplier = 500; // Valeur moyenne
    const potentialPayout = value.totalAmount * avgMultiplier;
    
    const riskLevel = calculateRiskLevel(potentialPayout);
    
    stats.push({
      combination: value.combination,
      combinationStr: value.combination.join(', '),
      count: value.count,
      totalAmount: value.totalAmount,
      operatorId: draw.operatorId,
      operatorName,
      riskLevel,
      lastPlayed: value.lastPlayed,
      potentialPayout
    });
  });
  
  // Trier par gain potentiel décroissant
  stats.sort((a, b) => b.potentialPayout - a.potentialPayout);
  
  return stats;
}

// Obtenir un résumé des risques
export function getRiskSummary(period: TimePeriod = 'today'): {
  totalCombinations: number;
  totalAtRisk: number;
  criticalRisk: number;
  highRisk: number;
  mediumRisk: number;
  lowRisk: number;
  maxPotentialPayout: number;
} {
  const stats = getCombinationStats(period);
  
  return {
    totalCombinations: stats.length,
    totalAtRisk: stats.reduce((sum, s) => sum + s.totalAmount, 0),
    criticalRisk: stats.filter(s => s.riskLevel === 'critical').length,
    highRisk: stats.filter(s => s.riskLevel === 'high').length,
    mediumRisk: stats.filter(s => s.riskLevel === 'medium').length,
    lowRisk: stats.filter(s => s.riskLevel === 'low').length,
    maxPotentialPayout: Math.max(...stats.map(s => s.potentialPayout), 0)
  };
}

// ===== STATISTIQUES POUR LE DASHBOARD ADMIN =====

// Filtrer les tickets par période
function filterTicketsByDate(tickets: Ticket[], period: 'today' | 'week' | 'all'): Ticket[] {
  if (period === 'all') return tickets;
  
  const now = new Date();
  const filterDate = new Date();
  
  if (period === 'today') {
    filterDate.setHours(0, 0, 0, 0);
  } else if (period === 'week') {
    filterDate.setDate(now.getDate() - 7);
  }
  
  return tickets.filter(ticket => {
    const ticketDate = new Date(ticket.purchaseDate);
    return ticketDate >= filterDate;
  });
}

// Obtenir les statistiques du dashboard
export function getDashboardStats(period: 'today' | 'week' | 'all' = 'today'): {
  totalRevenue: number;
  totalWinnings: number;
  totalProfit: number;
  newPlayers: number;
  totalPlayers: number;
  totalBets: number;
} {
  const tickets = filterTicketsByDate(getTickets(), period);
  const draws = getDraws();
  
  // Calculer le chiffre d'affaires (somme des mises)
  const totalRevenue = tickets.reduce((sum, ticket) => sum + ticket.betAmount, 0);
  
  // Calculer les gains payés (somme des gains)
  const totalWinnings = tickets
    .filter(ticket => ticket.status === 'won' && ticket.winAmount)
    .reduce((sum, ticket) => sum + (ticket.winAmount || 0), 0);
  
  // Calculer le bénéfice brut
  const totalProfit = totalRevenue - totalWinnings;
  
  // Compter les nouveaux joueurs (enregistrés dans la période)
  const USERS_KEY = 'loto_happy_users';
  const stored = localStorage.getItem(USERS_KEY);
  const allUsers = stored ? JSON.parse(stored) : [];
  
  const filterDate = new Date();
  if (period === 'today') {
    filterDate.setHours(0, 0, 0, 0);
  } else if (period === 'week') {
    filterDate.setDate(filterDate.getDate() - 7);
  }
  
  const newPlayers = period === 'all' ? allUsers.length : allUsers.filter((user: any) => {
    if (!user.createdAt) return false;
    const userDate = new Date(user.createdAt);
    return userDate >= filterDate;
  }).length;
  
  return {
    totalRevenue,
    totalWinnings,
    totalProfit,
    newPlayers,
    totalPlayers: allUsers.length,
    totalBets: tickets.length
  };
}

// Obtenir les revenus des 7 derniers jours
export function getLast7DaysRevenue(): { day: string; amount: number }[] {
  const tickets = getTickets();
  const result: { day: string; amount: number }[] = [];
  const now = new Date();
  
  // Jours de la semaine en français
  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    
    const dayTickets = tickets.filter(ticket => {
      const ticketDate = new Date(ticket.purchaseDate);
      return ticketDate >= date && ticketDate < nextDate;
    });
    
    const amount = dayTickets.reduce((sum, ticket) => sum + ticket.betAmount, 0);
    
    result.push({
      day: dayNames[date.getDay()],
      amount
    });
  }
  
  return result;
}

// Obtenir les statistiques des opérateurs les plus populaires
export function getOperatorStats(): { name: string; value: number; color: string }[] {
  const tickets = getTickets();
  const draws = getDraws();
  const operators = getAllOperators();
  
  // Compter les paris par opérateur
  const operatorCounts: { [key: string]: number } = {};
  
  tickets.forEach(ticket => {
    const draw = draws.find(d => d.id === ticket.drawId);
    if (draw && draw.operatorId) {
      const operator = getOperatorById(draw.operatorId);
      if (operator) {
        operatorCounts[operator.name] = (operatorCounts[operator.name] || 0) + 1;
      }
    }
  });
  
  // Calculer le total des paris
  const totalBets = tickets.length;
  
  // Si aucune donnée, retourner les 5 opérateurs avec 0%
  if (totalBets === 0 || Object.keys(operatorCounts).length === 0) {
    return operators.map(op => ({
      name: op.name,
      value: 0,
      color: op.color
    }));
  }
  
  // Convertir en tableau avec pourcentages
  const stats = Object.entries(operatorCounts).map(([name, count]) => {
    const operator = operators.find(op => op.name === name);
    return {
      name,
      value: totalBets > 0 ? Math.round((count / totalBets) * 100) : 0,
      color: operator?.color || '#888888'
    };
  });
  
  // Trier par popularité décroissante
  stats.sort((a, b) => b.value - a.value);
  
  return stats;
}
