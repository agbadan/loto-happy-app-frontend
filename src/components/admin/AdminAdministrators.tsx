import { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { 
  getAllAdmins, 
  createAdmin, 
  updateAdmin,
  type AdminUser 
} from "../../utils/auth";
import { 
  Shield, 
  UserPlus, 
  Edit,
  Eye,
  EyeOff,
  Calendar,
  Mail,
  User
} from "lucide-react";
import { toast } from "sonner@2.0.3";

export function AdminAdministrators() {
  const [admins, setAdmins] = useState<AdminUser[]>(getAllAdmins());
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  
  // Formulaire création
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'Super Admin' | 'Admin Financier' | 'Admin du Jeu' | 'Support Client'>('Support Client');
  const [showPassword, setShowPassword] = useState(false);
  
  // Formulaire édition
  const [editRole, setEditRole] = useState<'Super Admin' | 'Admin Financier' | 'Admin du Jeu' | 'Support Client'>('Support Client');
  
  const refreshAdmins = () => {
    setAdmins(getAllAdmins());
  };
  
  const handleCreateAdmin = () => {
    if (!newUsername || !newEmail || !newPassword) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    
    const result = createAdmin(newUsername, newEmail, newPassword, newRole);
    
    if (result.success) {
      toast.success(result.message);
      refreshAdmins();
      setCreateModalOpen(false);
      // Reset form
      setNewUsername('');
      setNewEmail('');
      setNewPassword('');
      setNewRole('Support Client');
    } else {
      toast.error(result.message);
    }
  };
  
  const handleEditAdmin = () => {
    if (!selectedAdmin) return;
    
    const result = updateAdmin(selectedAdmin.id, { role: editRole });
    
    if (result.success) {
      toast.success(result.message);
      refreshAdmins();
      setEditModalOpen(false);
      setSelectedAdmin(null);
    } else {
      toast.error(result.message);
    }
  };
  
  const handleToggleStatus = (adminId: string) => {
    const result = toggleAdminStatus(adminId);
    
    if (result.success) {
      toast.success(result.message);
      refreshAdmins();
    } else {
      toast.error(result.message);
    }
  };
  
  const openEditModal = (admin: AdminUser) => {
    setSelectedAdmin(admin);
    setEditRole(admin.role);
    setEditModalOpen(true);
  };
  
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Super Admin':
        return 'bg-red-500 hover:bg-red-600';
      case 'Admin Financier':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'Admin du Jeu':
        return 'bg-purple-500 hover:bg-purple-600';
      case 'Support Client':
        return 'bg-green-500 hover:bg-green-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };
  
  const formatDate = (dateString: string) => {
    if (dateString === 'Jamais connecté') return dateString;
    try {
      return new Date(dateString).toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
            <Shield className="h-7 w-7 text-[#FFD700]" />
            Gestion des Administrateurs et des Rôles
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gérez les comptes et permissions de votre équipe d'administration
          </p>
        </div>
        
        <Button
          onClick={() => setCreateModalOpen(true)}
          className="bg-[#FFD700] text-[#121212] hover:bg-[#FFD700]/90 w-full sm:w-auto"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Nouvel Administrateur
        </Button>
      </div>

      {/* Tableau des administrateurs */}
      <Card className="border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Nom d'utilisateur
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                  Email / Contact
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Rôle
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                  Statut
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden xl:table-cell">
                  Dernière connexion
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-accent/50 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-[#FFD700]/10 flex items-center justify-center">
                        <User className="h-4 w-4 text-[#FFD700]" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{admin.username}</p>
                        <p className="text-xs text-muted-foreground md:hidden">{admin.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{admin.email}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <Badge className={`${getRoleBadgeColor(admin.role)} text-white`}>
                      {admin.role}
                    </Badge>
                    <Badge 
                      className={`lg:hidden ml-2 ${
                        admin.status === 'Actif' 
                          ? 'bg-green-500 hover:bg-green-600' 
                          : 'bg-gray-500 hover:bg-gray-600'
                      } text-white`}
                    >
                      {admin.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 hidden lg:table-cell">
                    <Badge 
                      className={`${
                        admin.status === 'Actif' 
                          ? 'bg-green-500 hover:bg-green-600' 
                          : 'bg-gray-500 hover:bg-gray-600'
                      } text-white`}
                    >
                      {admin.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 hidden xl:table-cell">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {formatDate(admin.lastLogin)}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditModal(admin)}
                        className="hover:bg-[#FFD700]/10 hover:border-[#FFD700]"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modale Créer un Administrateur */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-foreground">Créer un Nouvel Administrateur</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Remplissez les informations du nouvel administrateur
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4 overflow-y-auto scrollbar-visible flex-1">
            <div>
              <Label htmlFor="username">Nom d'utilisateur</Label>
              <Input
                id="username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Ex: Jean Dupont"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email / Numéro de contact</Label>
              <Input
                id="email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="admin@example.com"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="password">Mot de passe temporaire</Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 caractères"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            <div>
              <Label htmlFor="role">Assigner un Rôle</Label>
              <Select value={newRole} onValueChange={(value: any) => setNewRole(value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Support Client">Support Client</SelectItem>
                  <SelectItem value="Admin du Jeu">Admin du Jeu</SelectItem>
                  <SelectItem value="Admin Financier">Admin Financier</SelectItem>
                  <SelectItem value="Super Admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setCreateModalOpen(false)}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              onClick={handleCreateAdmin}
              className="flex-1 bg-[#FFD700] text-[#121212] hover:bg-[#FFD700]/90"
            >
              Créer le compte
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modale Modifier un Administrateur */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-foreground">Modifier un Administrateur</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Modifiez les informations de {selectedAdmin?.username}
            </DialogDescription>
          </DialogHeader>
          
          {selectedAdmin && (
            <div className="space-y-4 py-4">
              <div>
                <Label>Nom d'utilisateur</Label>
                <p className="text-sm text-muted-foreground mt-1">{selectedAdmin.username}</p>
              </div>
              
              <div>
                <Label>Email</Label>
                <p className="text-sm text-muted-foreground mt-1">{selectedAdmin.email}</p>
              </div>
              
              <div>
                <Label htmlFor="edit-role">Rôle</Label>
                <Select value={editRole} onValueChange={(value: any) => setEditRole(value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Support Client">Support Client</SelectItem>
                    <SelectItem value="Admin du Jeu">Admin du Jeu</SelectItem>
                    <SelectItem value="Admin Financier">Admin Financier</SelectItem>
                    <SelectItem value="Super Admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="pt-2 border-t border-border">
                <Button
                  variant="outline"
                  onClick={() => handleToggleStatus(selectedAdmin.id)}
                  className={`w-full ${
                    selectedAdmin.status === 'Actif'
                      ? 'text-red-500 hover:bg-red-500/10 hover:border-red-500'
                      : 'text-green-500 hover:bg-green-500/10 hover:border-green-500'
                  }`}
                >
                  {selectedAdmin.status === 'Actif' ? 'Suspendre le compte' : 'Réactiver le compte'}
                </Button>
              </div>
            </div>
          )}
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setEditModalOpen(false);
                setSelectedAdmin(null);
              }}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              onClick={handleEditAdmin}
              className="flex-1 bg-[#FFD700] text-[#121212] hover:bg-[#FFD700]/90"
            >
              Enregistrer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
