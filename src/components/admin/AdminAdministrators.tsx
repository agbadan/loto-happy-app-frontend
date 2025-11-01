// src/components/admin/AdminAdministrators.tsx

import { useState, useEffect } from "react";
import { getAdmins, createAdmin, updateAdminRole, updateAdminStatus } from "../../utils/adminAPI";
import { AdminUser } from "../../types";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Shield, UserPlus, Edit, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

const ADMIN_ROLES = ['Support Client', 'Admin du Jeu', 'Admin Financier', 'Super Admin'] as const;
type AdminRole = typeof ADMIN_ROLES[number];

export function AdminAdministrators() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<AdminRole>('Support Client');
  const [showPassword, setShowPassword] = useState(false);
  
  const [editRole, setEditRole] = useState<AdminRole>('Support Client');
  
  const fetchAdmins = async () => {
    setIsLoading(true); setError(null);
    try {
      const data = await getAdmins();
      setAdmins(data);
    } catch (err) { setError("Impossible de charger la liste des administrateurs."); console.error(err); } 
    finally { setIsLoading(false); }
  };
  
  useEffect(() => { fetchAdmins(); }, []);
  
  const handleCreateAdmin = async () => {
    if (!newUsername || !newEmail || !newPassword || !newRole) { return toast.error('Veuillez remplir tous les champs'); }
    if (newPassword.length < 8) { return toast.error('Le mot de passe doit faire au moins 8 caractères'); }
    
    setIsSubmitting(true);
    try {
      await createAdmin({ username: newUsername, email: newEmail, password: newPassword, role: newRole } as any);
      toast.success("Administrateur créé avec succès !");
      await fetchAdmins();
      setCreateModalOpen(false);
      setNewUsername(''); setNewEmail(''); setNewPassword(''); setNewRole('Support Client');
    } catch (err: any) { toast.error(err?.response?.data?.detail || "Erreur lors de la création."); } 
    finally { setIsSubmitting(false); }
  };
  
  const handleEditAdmin = async () => {
    if (!selectedAdmin) return;
    setIsSubmitting(true);
    try {
      // CORRECTION : On utilise bien 'id' comme confirmé par le backend
      await updateAdminRole(selectedAdmin.id, editRole);
      toast.success("Rôle de l'administrateur mis à jour.");
      await fetchAdmins();
      setEditModalOpen(false);
      setSelectedAdmin(null);
    } catch (err: any) { toast.error(err?.response?.data?.detail || "Erreur lors de la mise à jour."); } 
    finally { setIsSubmitting(false); }
  };
  
  const handleToggleStatus = async (admin: AdminUser) => {
    const newStatus = admin.status === 'active' ? 'suspended' : 'active';
    toast.info("Mise à jour du statut en cours...");
    try {
      // CORRECTION : On utilise bien 'id' comme confirmé par le backend
      await updateAdminStatus(admin.id, newStatus);
      toast.success("Statut mis à jour avec succès !");
      setEditModalOpen(false);
      await fetchAdmins();
    } catch (err) { toast.error("Échec de la mise à jour du statut."); }
  };
  
  const openEditModal = (admin: AdminUser) => {
    setSelectedAdmin(admin);
    setEditRole(admin.role as AdminRole);
    setEditModalOpen(true);
  };
  
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Super Admin': return 'bg-red-500 hover:bg-red-600';
      case 'Admin Financier': return 'bg-blue-500 hover:bg-blue-600';
      case 'Admin du Jeu': return 'bg-purple-500 hover:bg-purple-600';
      case 'Support Client': return 'bg-green-500 hover:bg-green-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };
  
  if (isLoading) { return <div className="p-8 flex justify-center items-center"><Loader2 className="h-8 w-8 animate-spin" /></div>; }
  if (error) { return <div className="p-8 text-center text-red-500">{error}</div>; }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div><h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3"><Shield className="h-7 w-7 text-yellow-400" />Gestion des Administrateurs</h1><p className="text-sm text-muted-foreground mt-1">Gérez les comptes et permissions de votre équipe</p></div>
        <Button onClick={() => setCreateModalOpen(true)} className="bg-yellow-400 text-black hover:bg-yellow-500 w-full sm:w-auto"><UserPlus className="mr-2 h-4 w-4" />Nouvel Administrateur</Button>
      </div>
      <Card className="border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted"><tr className="border-b"><th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Utilisateur</th><th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Rôle</th><th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Statut</th><th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider">Actions</th></tr></thead>
            <tbody className="divide-y divide-border">
              {admins.map((admin) => (
                // CORRECTION : On utilise bien 'id' pour la clé unique
                <tr key={admin.id} className="hover:bg-accent/50">
                  <td className="px-4 py-4">
                    <div className="font-medium text-foreground">{admin.username}</div>
                    <div className="text-xs text-muted-foreground">{admin.email}</div>
                  </td>
                  <td className="px-4 py-4"><Badge className={`${getRoleBadgeColor(admin.role)} text-white`}>{admin.role}</Badge></td>
                  <td className="px-4 py-4"><Badge variant={admin.status === 'active' ? 'default' : 'destructive'} className={admin.status === 'active' ? 'bg-green-500' : ''}>{admin.status === 'active' ? 'Actif' : 'Suspendu'}</Badge></td>
                  <td className="px-4 py-4 text-right"><div className="flex justify-end gap-2"><Button size="sm" variant="outline" onClick={() => openEditModal(admin)}><Edit className="h-4 w-4" /></Button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-md"><DialogHeader><DialogTitle>Créer un Nouvel Administrateur</DialogTitle><DialogDescription>Remplissez les informations du nouvel administrateur</DialogDescription></DialogHeader>
          <div className="space-y-4 py-4">
            <div><Label htmlFor="username">Nom d'utilisateur</Label><Input id="username" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} className="mt-1" /></div>
            <div><Label htmlFor="email">Email</Label><Input id="email" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="mt-1" /></div>
            <div><Label htmlFor="password">Mot de passe</Label><div className="relative mt-1"><Input id="password" type={showPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Minimum 8 caractères" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>
            <div><Label htmlFor="role">Assigner un Rôle</Label><Select value={newRole} onValueChange={(value: AdminRole) => setNewRole(value)}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{ADMIN_ROLES.map(role => <SelectItem key={role} value={role}>{role}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setCreateModalOpen(false)}>Annuler</Button><Button onClick={handleCreateAdmin} disabled={isSubmitting} className="bg-yellow-400 text-black hover:bg-yellow-500">{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Créer le compte</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-md"><DialogHeader><DialogTitle>Modifier: {selectedAdmin?.username}</DialogTitle><DialogDescription>Modifiez les informations de {selectedAdmin?.username}</DialogDescription></DialogHeader>
          {selectedAdmin && (
            <div className="space-y-4 py-4">
              <div><Label>Nom d'utilisateur</Label><p className="text-sm text-muted-foreground mt-1">{selectedAdmin.username}</p></div>
              <div><Label>Email</Label><p className="text-sm text-muted-foreground mt-1">{selectedAdmin.email}</p></div>
              <div><Label htmlFor="edit-role">Rôle</Label><Select value={editRole} onValueChange={(value: AdminRole) => setEditRole(value)}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{ADMIN_ROLES.map(role => <SelectItem key={role} value={role}>{role}</SelectItem>)}</SelectContent></Select></div>
              <div className="pt-2 border-t border-border">
                <Button variant="outline" onClick={() => handleToggleStatus(selectedAdmin)} className={`w-full ${selectedAdmin.status === 'active' ? 'text-red-500 border-red-500 hover:bg-red-500/10' : 'text-green-500 border-green-500 hover:bg-green-500/10'}`}>
                  {selectedAdmin.status === 'active' ? 'Suspendre le compte' : 'Réactiver le compte'}
                </Button>
              </div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => { setEditModalOpen(false); setSelectedAdmin(null); }}>Annuler</Button><Button onClick={handleEditAdmin} disabled={isSubmitting} className="bg-yellow-400 text-black hover:bg-yellow-500">{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Enregistrer</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}