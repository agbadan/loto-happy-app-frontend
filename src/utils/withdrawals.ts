// Gestion des demandes de retrait

import { WithdrawalRequest } from './auth';

const WITHDRAWAL_REQUESTS_KEY = 'loto_happy_withdrawal_requests';

// Récupérer toutes les demandes de retrait
export function getWithdrawalRequests(): WithdrawalRequest[] {
  const stored = localStorage.getItem(WITHDRAWAL_REQUESTS_KEY);
  return stored ? JSON.parse(stored) : [];
}

// Sauvegarder les demandes de retrait
function saveWithdrawalRequests(requests: WithdrawalRequest[]): void {
  localStorage.setItem(WITHDRAWAL_REQUESTS_KEY, JSON.stringify(requests));
}

// Créer une nouvelle demande de retrait
export function createWithdrawalRequest(
  userId: string,
  username: string,
  phoneNumber: string,
  amount: number,
  provider: string,
  withdrawalPhoneNumber: string
): WithdrawalRequest {
  const requests = getWithdrawalRequests();
  
  const request: WithdrawalRequest = {
    id: `withdrawal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    username,
    phoneNumber,
    amount,
    provider,
    withdrawalPhoneNumber,
    status: 'pending',
    requestDate: new Date().toISOString(),
  };
  
  requests.unshift(request); // Ajouter au début (plus récent en premier)
  saveWithdrawalRequests(requests);
  
  return request;
}

// Approuver une demande de retrait
export function approveWithdrawalRequest(requestId: string): boolean {
  const requests = getWithdrawalRequests();
  const index = requests.findIndex(r => r.id === requestId);
  
  if (index !== -1) {
    requests[index].status = 'approved';
    requests[index].processedDate = new Date().toISOString();
    saveWithdrawalRequests(requests);
    return true;
  }
  
  return false;
}

// Rejeter une demande de retrait
export function rejectWithdrawalRequest(requestId: string): boolean {
  const requests = getWithdrawalRequests();
  const index = requests.findIndex(r => r.id === requestId);
  
  if (index !== -1) {
    requests[index].status = 'rejected';
    requests[index].processedDate = new Date().toISOString();
    saveWithdrawalRequests(requests);
    return true;
  }
  
  return false;
}

// Récupérer les demandes d'un utilisateur
export function getUserWithdrawalRequests(userId: string): WithdrawalRequest[] {
  return getWithdrawalRequests().filter(r => r.userId === userId);
}

// Récupérer les demandes en attente
export function getPendingWithdrawalRequests(): WithdrawalRequest[] {
  return getWithdrawalRequests().filter(r => r.status === 'pending');
}
