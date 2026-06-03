import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Users, Search, UserPlus, Check, X,
  ChevronRight, Trash2, Mail, Compass, ShieldCheck,
  AlertCircle, ArrowRight, Settings, LogOut, Eye,
  Info, Loader2, UserCheck, UserMinus, ShieldAlert,
  Download
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { teamApi } from '../services/api';
import AppLayout from '../components/layout/AppLayout';
import Header from '../components/layout/Header';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import { printTeamReport } from '../utils/printReport';

const stagger = { animate: { transition: { staggerChildren: 0.05 } } };
const fadeUp = { initial: { opacity: 0, y: 15 }, animate: { opacity: 1, y: 0 } };

export default function Teams() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // Role detection
  const isCoach = user?.role === 'coach';

  // State common
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('my-teams'); // 'my-teams' | 'explore' (for athletes)

  // Coach-specific state
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedTeamDetails, setSelectedTeamDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: '', description: '' });
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [showDeleteTeamModal, setShowDeleteTeamModal] = useState(false);
  const [deletingTeam, setDeletingTeam] = useState(false);
  const [showRemoveMemberModal, setShowRemoveMemberModal] = useState(null); // stores { teamId, athleteId, name }
  const [removingMember, setRemovingMember] = useState(false);
  const [exportingReport, setExportingReport] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportPeriod, setExportPeriod] = useState('all'); // 'all' | 'month' | 'week' | 'day'

  // Athlete-specific state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showLeaveTeamModal, setShowLeaveTeamModal] = useState(null); // stores team object
  const [leavingTeam, setLeavingTeam] = useState(false);

  // Fetch coach/athlete teams
  const fetchTeams = useCallback(async (selectFirst = false) => {
    setLoading(true);
    try {
      const { data } = await teamApi.list();
      setTeams(data);
      if (isCoach && data.length > 0) {
        if (selectFirst || !selectedTeam) {
          setSelectedTeam(data[0]);
        } else {
          // If we already have one selected, update it
          const updated = data.find(t => t.id === selectedTeam.id);
          if (updated) setSelectedTeam(updated);
          else setSelectedTeam(data[0]);
        }
      }
    } catch (err) {
      toast('Erro ao carregar equipes', 'error');
    } finally {
      setLoading(false);
    }
  }, [isCoach, selectedTeam, toast]);

  // Fetch team details for selected team (coaches)
  const fetchTeamDetails = useCallback(async (teamId) => {
    if (!teamId) return;
    setDetailsLoading(true);
    try {
      const { data } = await teamApi.getOne(teamId);
      setSelectedTeamDetails(data);
    } catch (err) {
      toast('Erro ao buscar detalhes da equipe', 'error');
    } finally {
      setDetailsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTeams(true);
  }, []);

  useEffect(() => {
    if (isCoach && selectedTeam?.id) {
      fetchTeamDetails(selectedTeam.id);
    }
  }, [selectedTeam?.id, isCoach, fetchTeamDetails]);

  // Create team handler (Coach)
  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!newTeam.name.trim()) {
      toast('Nome da equipe é obrigatório', 'warning');
      return;
    }
    setCreatingTeam(true);
    try {
      const { data } = await teamApi.create(newTeam);
      toast('Equipe criada com sucesso!', 'success');
      setNewTeam({ name: '', description: '' });
      setShowCreateModal(false);
      await fetchTeams();
      setSelectedTeam(data);
    } catch (err) {
      toast(err.response?.data?.error || 'Erro ao criar equipe', 'error');
    } finally {
      setCreatingTeam(false);
    }
  };

  // Delete team handler (Coach)
  const handleDeleteTeam = async () => {
    if (!selectedTeam?.id) return;
    setDeletingTeam(true);
    try {
      await teamApi.delete(selectedTeam.id);
      toast('Equipe excluída com sucesso!', 'success');
      setShowDeleteTeamModal(false);
      setSelectedTeamDetails(null);
      setSelectedTeam(null);
      await fetchTeams(true);
    } catch (err) {
      toast('Erro ao excluir equipe', 'error');
    } finally {
      setDeletingTeam(false);
    }
  };

  // Invite athlete handler (Coach)
  const handleInviteAthlete = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) {
      toast('Digite o e-mail do atleta', 'warning');
      return;
    }
    setInviting(true);
    try {
      const { data } = await teamApi.invite(selectedTeam.id, inviteEmail.trim());
      if (data.status === 'accepted') {
        toast('Atleta adicionado à equipe (já possuía solicitação pendente)!', 'success');
      } else {
        toast('Convite enviado com sucesso!', 'success');
      }
      setInviteEmail('');
      fetchTeamDetails(selectedTeam.id);
    } catch (err) {
      toast(err.response?.data?.error || 'Erro ao convidar atleta', 'error');
    } finally {
      setInviting(false);
    }
  };

  // Respond to request (Coach accepting/declining join request or Athlete accepting/declining coach invite)
  const handleRespondRequest = async (teamId, athleteId, action) => {
    try {
      await teamApi.respond(teamId, { athleteId, action });
      toast(action === 'accept' ? 'Solicitação aceita!' : 'Solicitação recusada', 'success');
      if (isCoach) {
        fetchTeamDetails(teamId);
      } else {
        fetchTeams();
        if (activeTab === 'explore') {
          handleSearch();
        }
      }
    } catch (err) {
      toast('Erro ao responder solicitação', 'error');
    }
  };

  // Remove member handler (Coach)
  const handleRemoveMember = async () => {
    if (!showRemoveMemberModal) return;
    const { teamId, athleteId } = showRemoveMemberModal;
    setRemovingMember(true);
    try {
      await teamApi.removeMember(teamId, athleteId);
      toast('Atleta removido da equipe', 'success');
      setShowRemoveMemberModal(null);
      fetchTeamDetails(teamId);
    } catch (err) {
      toast('Erro ao remover atleta', 'error');
    } finally {
      setRemovingMember(false);
    }
  };

  const handleExportReport = async () => {
    if (!selectedTeam?.id) return;
    setExportingReport(true);
    try {
      const { data } = await teamApi.getReport(selectedTeam.id, exportPeriod);
      printTeamReport(data);
      setShowExportModal(false);
      toast('Relatório da equipe gerado com sucesso!', 'success');
    } catch (err) {
      toast(err.response?.data?.error || 'Erro ao exportar relatório da equipe', 'error');
    } finally {
      setExportingReport(false);
    }
  };

  // Search teams handler (Athlete)
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const { data } = await teamApi.search(searchTerm.trim());
      setSearchResults(data);
    } catch (err) {
      toast('Erro ao buscar equipes', 'error');
    } finally {
      setSearching(false);
    }
  };

  // Request to join team handler (Athlete)
  const handleRequestToJoin = async (teamId) => {
    try {
      const { data } = await teamApi.join(teamId);
      if (data.status === 'accepted') {
        toast('Você agora é membro desta equipe (já possuía convite do treinador)!', 'success');
      } else {
        toast('Solicitação de entrada enviada ao treinador!', 'success');
      }
      handleSearch();
      fetchTeams();
    } catch (err) {
      toast(err.response?.data?.error || 'Erro ao solicitar entrada', 'error');
    }
  };

  // Leave team handler (Athlete)
  const handleLeaveTeam = async () => {
    if (!showLeaveTeamModal) return;
    setLeavingTeam(true);
    try {
      await teamApi.leave(showLeaveTeamModal.id);
      toast(`Você saiu da equipe "${showLeaveTeamModal.name}"`, 'success');
      setShowLeaveTeamModal(null);
      await fetchTeams();
    } catch (err) {
      toast('Erro ao sair da equipe', 'error');
    } finally {
      setLeavingTeam(false);
    }
  };

  // Navigate to athlete profile details in read-only mode
  const viewAthleteDetails = (athleteId, page = 'dashboard') => {
    navigate(`/${page}?userId=${athleteId}`);
  };

  return (
    <AppLayout>
      <Header title="Equipes & Times" />
      <div className="page-container md:max-w-6xl">
        <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-6">

          {/* Intro Section */}
          <motion.div variants={fadeUp} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-xs text-white/40 font-bold uppercase tracking-widest">Painel Coletivo</p>
              <h1 className="text-2xl font-black mt-0.5">
                {isCoach ? 'Suas Equipes de Treinamento' : 'Gerenciamento de Equipes'}
              </h1>
              <p className="text-xs text-white/50 mt-1">
                {isCoach
                  ? 'Crie equipes, aprove solicitações de entrada e acompanhe os relatórios e métricas de hidratação de seus atletas.'
                  : 'Participe de equipes gerenciadas por treinadores para compartilhar seus treinos e receber acompanhamento biológico.'}
              </p>
            </div>

            {isCoach && (
              <Button
                variant="primary"
                onClick={() => setShowCreateModal(true)}
                icon={<Plus size={16} />}
                className="flex-shrink-0"
              >
                Criar Equipe
              </Button>
            )}
          </motion.div>

          {/* Coach Layout: Master-Detail side-by-side on desktop */}
          {isCoach ? (
            <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Left Column: Team list */}
              <div className="md:col-span-1 space-y-4">
                <p className="section-title mb-1 flex items-center gap-2">
                  <Users size={14} className="text-white/40" /> Minhas Equipes ({teams.length})
                </p>

                {loading ? (
                  <div className="flex flex-col items-center justify-center p-8 bg-surface-1 rounded-2xl border border-border">
                    <Loader2 className="animate-spin text-primary mb-2" size={24} />
                    <p className="text-xs text-white/30">Carregando equipes...</p>
                  </div>
                ) : teams.length === 0 ? (
                  <Card className="p-6 text-center flex flex-col items-center justify-center border-dashed">
                    <Users size={36} className="text-white/10 mb-2" />
                    <p className="font-bold text-sm text-white/70">Nenhuma equipe criada</p>
                    <p className="text-xs text-white/40 mt-1 mb-4 max-w-xs">
                      Você ainda não possui equipes. Crie sua primeira equipe para começar a treinar e monitorar seus atletas.
                    </p>
                    <Button variant="outline" size="sm" onClick={() => setShowCreateModal(true)} icon={<Plus size={14} />}>
                      Criar Equipe
                    </Button>
                  </Card>
                ) : (
                  <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                    {teams.map((t) => {
                      const isSelected = selectedTeam?.id === t.id;
                      return (
                        <Card
                          key={t.id}
                          onClick={() => setSelectedTeam(t)}
                          className={`p-4 transition-all border ${
                            isSelected
                              ? 'border-primary bg-primary/5 shadow-red-glow'
                              : 'border-border bg-surface-1 hover:border-white/20'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="min-w-0">
                              <h3 className="font-bold text-sm text-white truncate">{t.name}</h3>
                              {t.description && (
                                <p className="text-xs text-white/40 line-clamp-1 mt-0.5">{t.description}</p>
                              )}
                            </div>
                            <Badge variant="primary" className="flex-shrink-0">
                              {t.members_count} {t.members_count === 1 ? 'atleta' : 'atletas'}
                            </Badge>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Column: Selected team details */}
              <div className="md:col-span-2 space-y-6">
                {selectedTeam ? (
                  <div className="space-y-6">
                    {/* Team Main Card */}
                    <Card glow className="relative overflow-hidden p-5">
                      <div className="absolute top-0 right-0 w-36 h-36 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                      
                      {detailsLoading ? (
                        <div className="flex flex-col items-center justify-center p-12">
                          <Loader2 className="animate-spin text-primary mb-2" size={24} />
                          <p className="text-xs text-white/30">Buscando informações da equipe...</p>
                        </div>
                      ) : selectedTeamDetails ? (
                        <div className="space-y-5">
                          {/* Header info */}
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-border">
                            <div>
                              <h2 className="text-lg font-black text-white">{selectedTeamDetails.name}</h2>
                              <p className="text-xs text-white/50 mt-1">
                                {selectedTeamDetails.description || 'Sem descrição cadastrada para esta equipe.'}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 self-start sm:self-center">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowExportModal(true)}
                                icon={<Download size={13} />}
                              >
                                Exportar Relatório
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => setShowDeleteTeamModal(true)}
                                icon={<Trash2 size={13} />}
                              >
                                Excluir Equipe
                              </Button>
                            </div>
                          </div>

                          {/* Members List */}
                          <div>
                            <p className="section-title mb-2.5 flex items-center gap-1.5">
                              <Users size={13} className="text-white/40" /> Atletas Vinculados ({selectedTeamDetails.members?.length || 0})
                            </p>

                            {selectedTeamDetails.members?.length === 0 ? (
                              <div className="p-4 text-center bg-surface-2/40 rounded-xl border border-border">
                                <Users size={24} className="text-white/10 mx-auto mb-1.5" />
                                <p className="text-xs font-semibold text-white/60">Sem atletas nesta equipe</p>
                                <p className="text-[10px] text-white/30 mt-0.5">Convide atletas usando o formulário abaixo para começar.</p>
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {selectedTeamDetails.members?.map((athlete) => (
                                  <Card key={athlete.id} className="p-3.5 bg-surface-2/40 border border-border/80 flex flex-col justify-between">
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="min-w-0">
                                        <p className="font-bold text-xs text-white truncate">{athlete.name}</p>
                                        <p className="text-[10px] text-white/30 truncate mt-0.5">{athlete.email}</p>
                                        {(athlete.sport || athlete.position) && (
                                          <div className="flex items-center gap-1 mt-1">
                                            {athlete.sport && <Badge className="text-[9px] px-1.5 py-0.5 bg-white/5 text-white/40">{athlete.sport}</Badge>}
                                            {athlete.position && <Badge className="text-[9px] px-1.5 py-0.5 bg-white/5 text-white/40">{athlete.position}</Badge>}
                                          </div>
                                        )}
                                      </div>
                                      
                                      {/* Remove from team button */}
                                      <button
                                        onClick={() => setShowRemoveMemberModal({
                                          teamId: selectedTeamDetails.id,
                                          athleteId: athlete.id,
                                          name: athlete.name
                                        })}
                                        className="text-white/30 hover:text-rose-400 p-1 hover:bg-surface-3 rounded-lg transition-all"
                                        title="Remover atleta da equipe"
                                      >
                                        <Trash2 size={13} />
                                      </button>
                                    </div>

                                    {/* Action Links to Athlete Bio */}
                                    <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-white/5">
                                      <button
                                        onClick={() => viewAthleteDetails(athlete.id, 'dashboard')}
                                        className="flex-1 flex items-center justify-center gap-1 text-[10px] font-bold bg-primary/10 hover:bg-primary/25 border border-primary/20 text-rose-300 py-1 rounded-lg transition-colors"
                                        title="Ver Painel do Atleta"
                                      >
                                        <Eye size={10} /> Painel
                                      </button>
                                      <button
                                        onClick={() => viewAthleteDetails(athlete.id, 'analytics')}
                                        className="flex-1 flex items-center justify-center gap-1 text-[10px] font-bold bg-surface-3 hover:bg-surface-4 text-white/70 hover:text-white py-1 rounded-lg transition-colors"
                                        title="Ver Análises"
                                      >
                                        Análises
                                      </button>
                                      <button
                                        onClick={() => viewAthleteDetails(athlete.id, 'history')}
                                        className="flex-1 flex items-center justify-center gap-1 text-[10px] font-bold bg-surface-3 hover:bg-surface-4 text-white/70 hover:text-white py-1 rounded-lg transition-colors"
                                        title="Ver Histórico de Treino"
                                      >
                                        Histórico
                                      </button>
                                    </div>
                                  </Card>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Join Requests Pending */}
                          {selectedTeamDetails.pendingRequests?.length > 0 && (
                            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-3">
                              <p className="text-xs font-black text-rose-300 flex items-center gap-1.5 uppercase tracking-wider">
                                <ShieldAlert size={14} /> Solicitações de Adesão ({selectedTeamDetails.pendingRequests.length})
                              </p>
                              <div className="space-y-2">
                                {selectedTeamDetails.pendingRequests.map((req) => (
                                  <div key={req.id} className="flex items-center justify-between gap-3 bg-surface-1 border border-border/80 p-2.5 rounded-xl">
                                    <div className="min-w-0">
                                      <p className="font-bold text-xs text-white truncate">{req.name}</p>
                                      <p className="text-[10px] text-white/40 truncate">{req.email}</p>
                                    </div>
                                    <div className="flex gap-1.5 flex-shrink-0">
                                      <button
                                        onClick={() => handleRespondRequest(selectedTeamDetails.id, req.id, 'accept')}
                                        className="w-7 h-7 bg-emerald-500/15 border border-emerald-500/30 rounded-lg flex items-center justify-center text-emerald-400 hover:bg-emerald-500/25 transition-colors"
                                        title="Aceitar Atleta"
                                      >
                                        <Check size={13} />
                                      </button>
                                      <button
                                        onClick={() => handleRespondRequest(selectedTeamDetails.id, req.id, 'decline')}
                                        className="w-7 h-7 bg-rose-500/10 border border-rose-500/25 rounded-lg flex items-center justify-center text-rose-400 hover:bg-rose-500/20 transition-colors"
                                        title="Recusar Solicitação"
                                      >
                                        <X size={13} />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Invite Form */}
                          <div className="pt-2 border-t border-border">
                            <p className="section-title mb-2 flex items-center gap-1.5">
                              <UserPlus size={13} className="text-white/40" /> Convidar Novo Atleta
                            </p>
                            <form onSubmit={handleInviteAthlete} className="flex gap-2">
                              <Input
                                placeholder="E-mail do atleta (ex: joao@atleta.com)"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                disabled={inviting}
                                icon={<Mail size={14} />}
                                className="!py-2.5 !text-xs"
                              />
                              <Button
                                variant="primary"
                                type="submit"
                                loading={inviting}
                                size="sm"
                                className="flex-shrink-0"
                              >
                                Convidar
                              </Button>
                            </form>
                          </div>

                          {/* Invites Sent Pending */}
                          {selectedTeamDetails.pendingInvites?.length > 0 && (
                            <div className="pt-2 border-t border-border space-y-2">
                              <p className="section-title mb-1 flex items-center gap-1.5">
                                <Mail size={13} className="text-white/40" /> Convites Enviados Pendentes ({selectedTeamDetails.pendingInvites.length})
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {selectedTeamDetails.pendingInvites.map((invite) => (
                                  <div key={invite.id} className="flex items-center justify-between gap-3 bg-surface-2/30 border border-border p-2 rounded-xl">
                                    <div className="min-w-0">
                                      <p className="font-semibold text-xs text-white/70 truncate">{invite.name}</p>
                                      <p className="text-[9px] text-white/30 truncate">{invite.email}</p>
                                    </div>
                                    <Badge className="text-[8px] bg-white/5 text-white/40 border border-white/10">Aguardando</Badge>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        </div>
                      ) : (
                        <div className="p-8 text-center text-white/30 text-xs">Erro ao buscar detalhes</div>
                      )}
                    </Card>
                  </div>
                ) : (
                  <Card className="p-12 text-center flex flex-col items-center justify-center border-dashed">
                    <Users size={48} className="text-white/10 mb-3" />
                    <p className="font-bold text-base text-white/70">Nenhuma equipe selecionada</p>
                    <p className="text-xs text-white/40 mt-1 max-w-sm">
                      Por favor, selecione uma equipe na lista lateral ou crie uma nova equipe para visualizar seus atletas e gerenciar convites.
                    </p>
                  </Card>
                )}
              </div>

            </motion.div>
          ) : (
            /* Athlete Layout: Tabs for joined teams and explore */
            <motion.div variants={fadeUp} className="space-y-4">
              
              {/* Tab navigation */}
              <div className="flex gap-2 border-b border-border pb-px">
                <button
                  onClick={() => setActiveTab('my-teams')}
                  className={`pb-2.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 px-3 ${
                    activeTab === 'my-teams'
                      ? 'border-primary text-white'
                      : 'border-transparent text-white/40 hover:text-white/60'
                  }`}
                >
                  Minhas Equipes
                </button>
                <button
                  onClick={() => setActiveTab('explore')}
                  className={`pb-2.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 px-3 ${
                    activeTab === 'explore'
                      ? 'border-primary text-white'
                      : 'border-transparent text-white/40 hover:text-white/60'
                  }`}
                >
                  Buscar & Entrar
                </button>
              </div>

              {/* My Teams Tab */}
              {activeTab === 'my-teams' && (
                <div className="space-y-4">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center p-12 bg-surface-1 rounded-2xl border border-border">
                      <Loader2 className="animate-spin text-primary mb-2" size={24} />
                      <p className="text-xs text-white/30">Carregando suas equipes...</p>
                    </div>
                  ) : teams.length === 0 ? (
                    <Card className="p-10 text-center flex flex-col items-center justify-center border-dashed">
                      <Compass size={40} className="text-white/10 mb-3" />
                      <p className="font-bold text-sm text-white/70">Você não faz parte de nenhuma equipe</p>
                      <p className="text-xs text-white/40 mt-1 mb-4 max-w-sm">
                        Para participar de uma equipe, você pode buscar por times abertos ou aceitar convites enviados pelo seu treinador nas notificações.
                      </p>
                      <Button variant="primary" size="sm" onClick={() => setActiveTab('explore')} icon={<Search size={14} />}>
                        Buscar Equipes
                      </Button>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {teams.map((t) => {
                        const isAccepted = t.status === 'accepted';
                        const isInvited = t.status === 'invited';
                        const isRequested = t.status === 'requested';

                        return (
                          <Card key={t.id} glow={isAccepted} className="p-4 flex flex-col justify-between gap-4">
                            <div className="flex justify-between items-start gap-3">
                              <div className="min-w-0">
                                <h3 className="font-bold text-base text-white truncate">{t.name}</h3>
                                <p className="text-xs text-white/40 mt-0.5 flex items-center gap-1">
                                  <span>Treinador:</span>
                                  <span className="font-semibold text-white/70">{t.coach_name}</span>
                                </p>
                                {t.description && (
                                  <p className="text-xs text-white/50 mt-2 line-clamp-2 leading-relaxed bg-surface-2/45 p-2 rounded-lg">
                                    {t.description}
                                  </p>
                                )}
                              </div>

                              <div className="flex-shrink-0">
                                {isAccepted && <Badge variant="success">Membro</Badge>}
                                {isInvited && <Badge variant="warning">Convidado</Badge>}
                                {isRequested && <Badge variant="info">Solicitado</Badge>}
                              </div>
                            </div>

                            {/* Actions according to status */}
                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/5">
                              {isInvited && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRespondRequest(t.id, user.id, 'decline')}
                                    icon={<X size={14} />}
                                    className="text-rose-400 font-bold"
                                  >
                                    Recusar
                                  </Button>
                                  <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => handleRespondRequest(t.id, user.id, 'accept')}
                                    icon={<Check size={14} />}
                                  >
                                    Aceitar Convite
                                  </Button>
                                </>
                              )}

                              {isRequested && (
                                <p className="text-[10px] text-white/40 italic">Aguardando aprovação do treinador...</p>
                              )}

                              {isAccepted && (
                                <button
                                  onClick={() => setShowLeaveTeamModal(t)}
                                  className="flex items-center gap-1 text-[11px] font-bold text-rose-400/70 hover:text-rose-400 bg-rose-500/5 hover:bg-rose-500/10 px-3 py-1.5 border border-rose-500/20 rounded-xl transition-all"
                                >
                                  <LogOut size={11} /> Sair da Equipe
                                </button>
                              )}
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Search Teams Tab */}
              {activeTab === 'explore' && (
                <div className="space-y-4">
                  {/* Search Bar */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Pesquisar por nome da equipe ou nome do treinador..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      icon={<Search size={16} />}
                      suffix={
                        searchTerm.trim() && (
                          <button onClick={() => setSearchTerm('')} className="text-white/20 hover:text-white/50">
                            ✕
                          </button>
                        )
                      }
                    />
                    <Button variant="primary" onClick={handleSearch} loading={searching} icon={<Search size={15} />}>
                      Buscar
                    </Button>
                  </div>

                  {/* Search Results */}
                  {searching ? (
                    <div className="flex flex-col items-center justify-center p-12 bg-surface-1 rounded-2xl border border-border">
                      <Loader2 className="animate-spin text-primary mb-2" size={24} />
                      <p className="text-xs text-white/30">Buscando equipes...</p>
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="p-8 text-center bg-surface-1 rounded-2xl border border-border text-white/30 text-xs">
                      {searchTerm.trim()
                        ? 'Nenhuma equipe encontrada para os termos inseridos.'
                        : 'Digite um termo acima para pesquisar equipes abertas para solicitação.'}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {searchResults.map((t) => {
                        const status = t.my_status;
                        const isAccepted = status === 'accepted';
                        const isInvited = status === 'invited';
                        const isRequested = status === 'requested';

                        return (
                          <Card key={t.id} className="p-4 flex flex-col justify-between gap-4">
                            <div>
                              <div className="flex justify-between items-start gap-3">
                                <div className="min-w-0">
                                  <h3 className="font-bold text-sm text-white truncate">{t.name}</h3>
                                  <p className="text-xs text-white/40 mt-0.5">
                                    Treinador: <span className="font-semibold text-white/70">{t.coach_name}</span>
                                  </p>
                                </div>
                                <div className="flex-shrink-0">
                                  {isAccepted && <Badge variant="success">Membro</Badge>}
                                  {isInvited && <Badge variant="warning">Convidado</Badge>}
                                  {isRequested && <Badge variant="info">Solicitado</Badge>}
                                </div>
                              </div>
                              {t.description && (
                                <p className="text-xs text-white/50 mt-2.5 line-clamp-2 leading-relaxed bg-surface-2/45 p-2 rounded-lg">
                                  {t.description}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                              {!status && (
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleRequestToJoin(t.id)}
                                  icon={<UserPlus size={14} />}
                                >
                                  Pedir para Entrar
                                </Button>
                              )}

                              {isInvited && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRespondRequest(t.id, user.id, 'decline')}
                                    icon={<X size={14} />}
                                    className="text-rose-400 font-bold"
                                  >
                                    Recusar
                                  </Button>
                                  <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => handleRespondRequest(t.id, user.id, 'accept')}
                                    icon={<Check size={14} />}
                                  >
                                    Aceitar Convite
                                  </Button>
                                </>
                              )}

                              {isRequested && (
                                <span className="text-[10px] text-white/30 italic">Solicitação pendente de aprovação</span>
                              )}

                              {isAccepted && (
                                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                                  <ShieldCheck size={12} /> Você já é membro desta equipe
                                </span>
                              )}
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

            </motion.div>
          )}

        </motion.div>
      </div>

      {/* CREATE TEAM MODAL (Coach) */}
      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)} title="Criar Nova Equipe">
        <form onSubmit={handleCreateTeam} className="space-y-4">
          <Input
            label="Nome da Equipe"
            placeholder="Ex: Equipe de Corrida de Rua - A"
            value={newTeam.name}
            onChange={(e) => setNewTeam(prev => ({ ...prev, name: e.target.value }))}
            required
            disabled={creatingTeam}
          />
          <div>
            <label className="label">Descrição (Opcional)</label>
            <textarea
              className="input-field min-h-[90px] resize-none"
              placeholder="Descreva os objetivos, treinos ou requisitos desta equipe..."
              value={newTeam.description}
              onChange={(e) => setNewTeam(prev => ({ ...prev, description: e.target.value }))}
              disabled={creatingTeam}
            />
          </div>
          <Button
            variant="primary"
            type="submit"
            loading={creatingTeam}
            size="xl"
          >
            Criar Equipe
          </Button>
        </form>
      </Modal>

      {/* CONFIRM DELETE TEAM MODAL (Coach) */}
      <Modal open={showDeleteTeamModal} onClose={() => setShowDeleteTeamModal(false)} title="Excluir Equipe">
        <div className="space-y-4">
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl flex items-start gap-3">
            <ShieldAlert size={20} className="flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold">Atenção! Esta ação é irreversível.</p>
              <p className="mt-1 opacity-80">
                A exclusão da equipe removerá o vínculo de todos os atletas e apagará todos os convites/solicitações pendentes.
                Os atletas não perderão seus históricos de treinos individuais, mas você perderá o acesso compartilhado aos dados deles.
              </p>
            </div>
          </div>
          <p className="text-sm font-semibold text-white/70 text-center">
            Deseja realmente excluir a equipe <span className="text-white font-bold">"{selectedTeam?.name}"</span>?
          </p>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowDeleteTeamModal(false)} disabled={deletingTeam}>
              Cancelar
            </Button>
            <Button variant="danger" loading={deletingTeam} onClick={handleDeleteTeam}>
              Sim, Excluir
            </Button>
          </div>
        </div>
      </Modal>

      {/* CONFIRM REMOVE MEMBER MODAL (Coach) */}
      <Modal
        open={!!showRemoveMemberModal}
        onClose={() => setShowRemoveMemberModal(null)}
        title="Remover Membro da Equipe"
      >
        <div className="space-y-4">
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-xl flex items-start gap-3">
            <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold">Remover acesso de monitoramento</p>
              <p className="mt-1 opacity-80">
                Ao remover o atleta, você perderá a autorização para visualizar seu painel de hidratação, histórico e relatórios de treinos.
              </p>
            </div>
          </div>
          <p className="text-sm font-semibold text-white/70 text-center">
            Remover o atleta <span className="text-white font-bold">"{showRemoveMemberModal?.name}"</span> da equipe?
          </p>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowRemoveMemberModal(null)} disabled={removingMember}>
              Cancelar
            </Button>
            <Button variant="danger" loading={removingMember} onClick={handleRemoveMember}>
              Sim, Remover
            </Button>
          </div>
        </div>
      </Modal>

      {/* CONFIRM LEAVE TEAM MODAL (Athlete) */}
      <Modal
        open={!!showLeaveTeamModal}
        onClose={() => setShowLeaveTeamModal(null)}
        title="Sair da Equipe"
      >
        <div className="space-y-4">
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl flex items-start gap-3">
            <LogOut size={20} className="flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold">Interromper compartilhamento de dados</p>
              <p className="mt-1 opacity-80">
                Ao sair da equipe, o treinador perderá a capacidade de acompanhar suas sessões de treinamento e seus relatórios biológicos de hidratação.
              </p>
            </div>
          </div>
          <p className="text-sm font-semibold text-white/70 text-center">
            Deseja mesmo sair da equipe <span className="text-white font-bold">"{showLeaveTeamModal?.name}"</span>?
          </p>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowLeaveTeamModal(null)} disabled={leavingTeam}>
              Cancelar
            </Button>
            <Button variant="danger" loading={leavingTeam} onClick={handleLeaveTeam}>
              Sim, Sair da Equipe
            </Button>
          </div>
        </div>
      </Modal>

      {/* EXPORT TEAM REPORT MODAL (Coach) */}
      <Modal open={showExportModal} onClose={() => setShowExportModal(false)} title="Exportar Relatório da Equipe">
        <div className="space-y-4">
          <p className="text-xs text-white/50">
            Selecione o intervalo de tempo para consolidar os dados das sessões dos atletas no relatório.
          </p>

          <div className="space-y-2">
            {[
              { val: 'all', label: 'Todo o histórico', desc: 'Consolidar todas as sessões registradas' },
              { val: 'month', label: 'Últimos 30 dias (Mês)', desc: 'Consolidar sessões dos últimos 30 dias' },
              { val: 'week', label: 'Últimos 7 dias (Semana)', desc: 'Consolidar sessões dos últimos 7 dias' },
              { val: 'day', label: 'Últimas 24 horas (Dia)', desc: 'Consolidar sessões do último dia' },
            ].map(({ val, label, desc }) => (
              <button
                key={val}
                type="button"
                onClick={() => setExportPeriod(val)}
                className={`w-full p-3 rounded-xl border text-left transition-all ${
                  exportPeriod === val
                    ? 'bg-primary/10 border-primary/40 text-white'
                    : 'bg-surface-2 border-border text-white/40 hover:border-border-bright'
                }`}
              >
                <div className="font-bold text-sm text-white">{label}</div>
                <div className="text-[10px] text-white/40 mt-0.5">{desc}</div>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowExportModal(false)} disabled={exportingReport}>
              Cancelar
            </Button>
            <Button variant="primary" loading={exportingReport} onClick={handleExportReport} icon={<Download size={14} />}>
              Gerar Relatório
            </Button>
          </div>
        </div>
      </Modal>

    </AppLayout>
  );
}
