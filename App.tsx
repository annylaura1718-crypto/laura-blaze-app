import React, { useEffect, useState, useRef } from 'react';
import { fetchBlazeHistory } from './services/blazeService';
import { calculateNextSignal } from './utils/strategy';
import { BlazeRoll, Signal, Stats, BlazeColor } from './types';
import { HistoryStrip } from './components/HistoryStrip';
import { SignalCard } from './components/SignalCard';
import { StatsPanel } from './components/StatsPanel';
import { Zap, WifiOff, Bot, Settings2, Fingerprint, Timer, Lock, LogIn, UserPlus, CreditCard, CheckCircle2, MessageSquarePlus, X, Send, Users, ShieldCheck, Trash2, AlertTriangle, Clock, Power, Activity, MessageSquare } from 'lucide-react';

const LINK_DE_PAGAMENTO = "https://mpago.li/2jWUmuK"; 

const INITIAL_STATS: Stats = {
  wins: 0,
  losses: 0,
  winRate: 0,
  totalSignals: 0,
  assertivity: '0%'
};

const BETTING_WINDOW_SECONDS = 15;

interface User {
    email: string;
    password: string;
    status: 'pending' | 'active';
    createdAt: string;
}

interface Feedback {
    id: string;
    date: string;
    message: string;
    read: boolean;
}

const FeedbackModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const existingFeedbacks: Feedback[] = JSON.parse(localStorage.getItem('laura_feedbacks') || '[]');
    const newFeedback: Feedback = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        message: message,
        read: false
    };
    localStorage.setItem('laura_feedbacks', JSON.stringify([newFeedback, ...existingFeedbacks]));

    setSent(true);
    setTimeout(() => {
      setSent(false);
      setMessage("");
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-zinc-950 border border-red-900/50 rounded-2xl p-6 relative shadow-[0_0_50px_rgba(220,38,38,0.2)]">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors">
          <X size={20} />
        </button>
        <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2 brand-font">
            <MessageSquarePlus className="text-red-500" /> Feedback
        </h3>
        <p className="text-zinc-500 text-xs mb-6">Encontrou um bug ou tem uma sugestão? Conte para a Laura.</p>
        {sent ? (
             <div className="py-8 text-center animate-in zoom-in duration-300">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <p className="text-white font-bold text-lg">Obrigado!</p>
                <p className="text-zinc-500 text-sm mt-1">Sua mensagem foi enviada para nossa equipe.</p>
             </div>
        ) : (
            <form onSubmit={handleSubmit}>
                <textarea
                    className="w-full h-32 bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-red-600 focus:outline-none transition-colors text-sm resize-none custom-scrollbar"
                    placeholder="Digite sua mensagem aqui..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                ></textarea>
                <button
                    type="submit"
                    className="w-full mt-4 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-lg uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)] flex items-center justify-center gap-2 group"
                >
                    <Send size={16} className="group-hover:translate-x-1 transition-transform" /> Enviar Feedback
                </button>
            </form>
        )}
      </div>
    </div>
  );
};

const AdminPanel = ({ isOpen, onClose, systemStatus, setSystemStatus }: { isOpen: boolean; onClose: () => void, systemStatus: boolean, setSystemStatus: (s: boolean) => void }) => {
    const [activeTab, setActiveTab] = useState<'control' | 'users' | 'feedbacks'>('control');
    const [users, setUsers] = useState<User[]>([]);
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

    useEffect(() => {
        if (isOpen) {
            const storedUsers = JSON.parse(localStorage.getItem('laura_users') || '[]');
            setUsers(storedUsers);
            const storedFeedbacks = JSON.parse(localStorage.getItem('laura_feedbacks') || '[]');
            setFeedbacks(storedFeedbacks);
        }
    }, [isOpen, activeTab]);

    const toggleStatus = (email: string) => {
        const updatedUsers = users.map(u => {
            if (u.email === email) {
                return { ...u, status: u.status === 'pending' ? 'active' : 'pending' as 'pending' | 'active' };
            }
            return u;
        });
        setUsers(updatedUsers);
        localStorage.setItem('laura_users', JSON.stringify(updatedUsers));
    };

    const deleteUser = (email: string) => {
        if(confirm('Tem certeza que deseja excluir este usuário?')) {
            const updatedUsers = users.filter(u => u.email !== email);
            setUsers(updatedUsers);
            localStorage.setItem('laura_users', JSON.stringify(updatedUsers));
        }
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
            <div className="w-full max-w-4xl bg-zinc-950 border border-red-900 rounded-2xl p-0 relative shadow-2xl h-[85vh] flex flex-col overflow-hidden">
                <div className="p-6 border-b border-zinc-900 flex items-center justify-between bg-black">
                    <h2 className="text-2xl font-black text-white flex items-center gap-2 brand-font">
                        <ShieldCheck className="text-red-500" /> PAINEL ADMIN
                    </h2>
                    <button onClick={onClose} className="text-zinc-500 hover:text-white">
                        <X size={24} />
                    </button>
                </div>
                <div className="flex border-b border-zinc-900 bg-zinc-950">
                    <button onClick={() => setActiveTab('control')} className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors ${activeTab === 'control' ? 'bg-red-900/20 text-red-500 border-b-2 border-red-500' : 'text-zinc-500 hover:text-white'}`}><Settings2 size={16} /> Sistema</button>
                    <button onClick={() => setActiveTab('users')} className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors ${activeTab === 'users' ? 'bg-red-900/20 text-red-500 border-b-2 border-red-500' : 'text-zinc-500 hover:text-white'}`}><Users size={16} /> Assinantes</button>
                    <button onClick={() => setActiveTab('feedbacks')} className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors ${activeTab === 'feedbacks' ? 'bg-red-900/20 text-red-500 border-b-2 border-red-500' : 'text-zinc-500 hover:text-white'}`}><MessageSquare size={16} /> Feedbacks</button>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/50 p-6">
                    {activeTab === 'control' && (
                        <div className="space-y-8">
                            <div className="text-center">
                                <h3 className="text-white font-bold uppercase mb-6 text-sm tracking-widest">Status Geral da Geração de Sinais</h3>
                                <div className="flex items-center justify-center gap-6">
                                    <button onClick={() => setSystemStatus(false)} className={`flex flex-col items-center justify-center w-40 h-40 rounded-2xl border-2 transition-all duration-300 ${!systemStatus ? 'bg-red-900 border-red-500 shadow-[0_0_30px_red] scale-105' : 'bg-zinc-900 border-zinc-800 opacity-50 hover:opacity-100'}`}><Power size={48} className="text-white mb-2" /><span className="text-white font-black uppercase text-lg">DESLIGAR</span></button>
                                    <button onClick={() => setSystemStatus(true)} className={`flex flex-col items-center justify-center w-40 h-40 rounded-2xl border-2 transition-all duration-300 ${systemStatus ? 'bg-green-900 border-green-500 shadow-[0_0_30px_green] scale-105' : 'bg-zinc-900 border-zinc-800 opacity-50 hover:opacity-100'}`}><Activity size={48} className="text-white mb-2" /><span className="text-white font-black uppercase text-lg">LIGAR</span></button>
                                </div>
                                <p className="mt-8 text-zinc-500 text-xs">* Ao desligar, todos os usuários verão a tela de manutenção imediatamente.</p>
                            </div>
                        </div>
                    )}
                    {activeTab === 'users' && (
                        <div>
                             <div className="bg-zinc-900/30 p-4 rounded-lg mb-6 border border-zinc-800 flex items-start gap-3"><CheckCircle2 className="text-green-500 shrink-0 mt-0.5" size={16} /><p className="text-xs text-zinc-400">Aprove os pagamentos clicando no botão verde. O usuário terá acesso imediato após a aprovação.</p></div>
                            {users.length === 0 ? <div className="text-center py-10 text-zinc-500">Nenhum usuário cadastrado.</div> : (
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-zinc-900/50 text-[10px] uppercase text-zinc-500 font-bold sticky top-0"><tr><th className="p-3">Email</th><th className="p-3">Data</th><th className="p-3">Status</th><th className="p-3 text-right">Ações</th></tr></thead>
                                    <tbody className="divide-y divide-zinc-800">
                                        {users.map((user) => (
                                            <tr key={user.email} className="hover:bg-zinc-900/30 transition-colors">
                                                <td className="p-3 text-xs text-zinc-300 font-mono">{user.email}</td>
                                                <td className="p-3 text-xs text-zinc-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                                                <td className="p-3"><span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${user.status === 'active' ? 'bg-green-900/30 text-green-500 border border-green-900' : 'bg-yellow-900/30 text-yellow-500 border border-yellow-900 animate-pulse'}`}>{user.status === 'active' ? 'ATIVO' : 'PENDENTE'}</span></td>
                                                <td className="p-3 flex justify-end gap-2">
                                                    <button onClick={() => toggleStatus(user.email)} className={`p-1.5 rounded transition-all transform active:scale-95 ${user.status === 'pending' ? 'bg-green-600 hover:bg-green-500 text-white shadow-[0_0_10px_green] animate-pulse' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400'}`}><CheckCircle2 size={16} /></button>
                                                    <button onClick={() => deleteUser(user.email)} className="p-1.5 rounded bg-red-900/20 hover:bg-red-900/50 text-red-500 transition-colors"><Trash2 size={16} /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                    {activeTab === 'feedbacks' && (
                        <div>
                             {feedbacks.length === 0 ? <div className="text-center py-10 text-zinc-500">Caixa de entrada vazia.</div> : (
                                <div className="space-y-4">
                                    {feedbacks.map((fb) => (
                                        <div key={fb.id} className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl">
                                            <div className="flex justify-between items-start mb-2"><span className="text-[10px] text-zinc-500 font-mono">{new Date(fb.date).toLocaleString()}</span></div>
                                            <p className="text-sm text-zinc-300 italic">"{fb.message}"</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const LoginPage = ({ onLogin, onGoToRegister }: { onLogin: (isAdmin: boolean) => void, onGoToRegister: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (email === 'annylaura1718@gmail.com' && password === 'lauraiablaze89') {
      onLogin(true); 
      return;
    }
    const users: User[] = JSON.parse(localStorage.getItem('laura_users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        if (user.status === 'active') {
            onLogin(false);
        } else {
            setError('PAGAMENTO EM ANÁLISE: Aguarde a confirmação do pagamento para liberação.');
        }
    } else {
        setError('Acesso negado. Email ou senha incorretos.');
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-black to-black"></div>
        <div className="z-10 w-full max-w-md bg-zinc-950 border border-red-900/30 p-8 rounded-2xl shadow-[0_0_50px_rgba(220,38,38,0.1)] relative">
            <div className="text-center mb-8">
                <div className="w-16 h-16 border-2 border-red-600 rounded-full mx-auto mb-4 flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.5)]"><Bot className="text-red-500 w-8 h-8" /></div>
                <h1 className="text-3xl font-black italic text-white neon-text-red brand-font">LAURA <span className="text-red-600">AI</span></h1>
                <p className="text-zinc-500 text-xs mt-2 uppercase tracking-widest">Acesso Restrito</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
                {error && (<div className="bg-red-950/40 border border-red-500/50 p-4 rounded-lg flex items-start gap-3"><AlertTriangle className="text-red-500 shrink-0" size={18} /><p className="text-red-200 text-xs font-bold leading-relaxed">{error}</p></div>)}
                <div><label className="block text-zinc-500 text-[10px] uppercase font-bold mb-1">E-mail</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-red-600 focus:outline-none transition-colors" placeholder="seu@email.com"/></div>
                <div><label className="block text-zinc-500 text-[10px] uppercase font-bold mb-1">Senha</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-red-600 focus:outline-none transition-colors" placeholder="••••••••"/></div>
                <button type="submit" className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-lg uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)] mt-6 flex items-center justify-center gap-2"><LogIn size={18} /> Acessar App</button>
            </form>
            <div className="mt-8 pt-6 border-t border-zinc-900 text-center"><p className="text-zinc-600 text-xs mb-3">Ainda não tem acesso?</p><button onClick={onGoToRegister} className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold uppercase rounded-lg border border-zinc-800 transition-colors flex items-center justify-center gap-2 group"><UserPlus size={14} className="text-red-500 group-hover:text-white transition-colors" /> Criar Conta Premium</button></div>
        </div>
    </div>
  );
};

const RegisterPage = ({ onBack }: { onBack: () => void }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [step, setStep] = useState<'form' | 'success'>('form');

    const handleRegisterAndPay = () => {
        if (!email || !password || !confirmPassword) { setError('Preencha todos os campos.'); return; }
        if (password !== confirmPassword) { setError('As senhas não coincidem.'); return; }
        if (password.length < 6) { setError('A senha deve ter no mínimo 6 caracteres.'); return; }
        const users: User[] = JSON.parse(localStorage.getItem('laura_users') || '[]');
        if (users.find(u => u.email === email)) { setError('Este email já está cadastrado. Faça login.'); return; }
        const newUser: User = { email, password, status: 'pending', createdAt: new Date().toISOString() };
        users.push(newUser);
        localStorage.setItem('laura_users', JSON.stringify(users));
        window.open(LINK_DE_PAGAMENTO, '_blank');
        setStep('success');
    };

    if (step === 'success') {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-900/20 via-black to-black"></div>
                <div className="z-10 w-full max-w-md bg-zinc-950 border border-green-900/30 p-8 rounded-2xl shadow-[0_0_50px_rgba(34,197,94,0.1)] text-center">
                    <div className="w-16 h-16 bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30"><Clock className="w-8 h-8 text-green-500 animate-pulse" /></div>
                    <h2 className="text-2xl font-black text-white uppercase brand-font mb-2">Conta Criada!</h2>
                    <p className="text-sm text-zinc-400 mb-6 leading-relaxed">Seu cadastro foi salvo com sucesso. Se você já realizou o pagamento na aba que abriu, aguarde a liberação do seu acesso.</p>
                    <div className="bg-zinc-900/50 p-4 rounded-lg mb-8 text-left border border-zinc-800"><p className="text-xs text-zinc-500 mb-1 uppercase font-bold">Próximo Passo:</p><p className="text-xs text-white">Faça login com seu email e senha. Se o status estiver <span className="text-yellow-500">PENDENTE</span>, aguarde alguns minutos até o admin confirmar seu pagamento.</p></div>
                    <button onClick={onBack} className="w-full bg-white hover:bg-zinc-200 text-black font-bold py-3 rounded-lg uppercase tracking-widest transition-colors flex items-center justify-center gap-2"><LogIn size={18} /> Ir para Login</button>
                </div>
            </div>
        );
    }

    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/10 via-black to-black"></div>
          <div className="z-10 w-full max-w-md bg-zinc-950 border border-red-900/30 p-6 rounded-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
              <button onClick={onBack} className="absolute top-4 left-4 text-zinc-500 hover:text-white text-xs uppercase font-bold">&larr; Voltar</button>
              <div className="text-center mb-6 mt-6"><h2 className="text-2xl font-black text-white brand-font uppercase">Plano Premium</h2><p className="text-red-500 font-bold text-xs uppercase tracking-widest mt-1">Crie sua conta para assinar</p></div>
              <div className="text-center p-4 bg-gradient-to-b from-red-950/40 to-black rounded-xl border border-red-900/50 mb-6"><div className="flex items-baseline justify-center gap-1"><span className="text-sm font-bold text-red-500">R$</span><span className="text-4xl font-black text-white neon-text-red">69,99</span></div><p className="text-zinc-400 text-[10px] uppercase mt-1">Plano Mensal (Sem Fidelidade)</p></div>
              <div className="space-y-4 mb-6">
                  {error && (<div className="bg-red-950/50 border border-red-500/50 p-2 rounded text-red-400 text-xs font-bold text-center">{error}</div>)}
                  <div><label className="block text-zinc-500 text-[10px] uppercase font-bold mb-1">Seu E-mail</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-red-600 focus:outline-none transition-colors text-sm" placeholder="exemplo@email.com"/></div>
                  <div><label className="block text-zinc-500 text-[10px] uppercase font-bold mb-1">Crie uma Senha</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-red-600 focus:outline-none transition-colors text-sm" placeholder="Mínimo 6 caracteres"/></div>
                  <div><label className="block text-zinc-500 text-[10px] uppercase font-bold mb-1">Confirme a Senha</label><input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-red-600 focus:outline-none transition-colors text-sm" placeholder="Repita a senha"/></div>
              </div>
              <button onClick={handleRegisterAndPay} className="w-full bg-green-600 hover:bg-green-500 text-white font-black py-4 rounded-xl uppercase tracking-widest transition-all shadow-[0_0_30px_rgba(34,197,94,0.4)] animate-pulse flex items-center justify-center gap-2"><CreditCard size={20} /> PAGAR E FINALIZAR</button>
              <p className="text-center text-zinc-600 text-[10px] mt-4 max-w-xs mx-auto">Ao clicar, você será redirecionado para o Mercado Pago. Sua conta será ativada após a confirmação do pagamento.</p>
          </div>
      </div>
    );
  };

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [history, setHistory] = useState<BlazeRoll[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);
  const [isAutoMode, setIsAutoMode] = useState(true);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isSystemOnline, setIsSystemOnline] = useState(true);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [isBettingOpen, setIsBettingOpen] = useState(false);
  const [signal, setSignal] = useState<Signal>({ type: 'buy', color: null, status: 'waiting', message: 'Aguardando...', predictedColorName: '' });
  const [stats, setStats] = useState<Stats>(INITIAL_STATS);
  const lastUpdateRef = useRef<number>(Date.now());
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const lastProcessedRollId = useRef<string | null>(null);
  const activeSignalRef = useRef<Signal | null>(null);

  useEffect(() => {
    const requestWakeLock = async () => {
      if ('wakeLock' in navigator) {
        try {
          const wakeLock = await navigator.wakeLock.request('screen');
          wakeLockRef.current = wakeLock;
        } catch (err) { console.warn('Erro ao solicitar Wake Lock:', err); }
      }
    };
    requestWakeLock();
    const handleVisibilityChange = () => { if (document.visibilityState === 'visible') { requestWakeLock(); } };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => { document.removeEventListener('visibilitychange', handleVisibilityChange); if (wakeLockRef.current) wakeLockRef.current.release(); };
  }, []);

  useEffect(() => {
    const watchdogInterval = setInterval(() => {
        const timeSinceLastUpdate = Date.now() - lastUpdateRef.current;
        if (timeSinceLastUpdate > 300000) { window.location.reload(); }
    }, 60000);
    return () => clearInterval(watchdogInterval);
  }, []);

  useEffect(() => {
    const savedStatus = localStorage.getItem('laura_system_status');
    if (savedStatus) { setIsSystemOnline(savedStatus === 'online'); }
    const today = new Date().toLocaleDateString();
    const savedStatsJson = localStorage.getItem('laura_stats_data');
    if (savedStatsJson) {
        const parsed = JSON.parse(savedStatsJson);
        if (parsed.date === today) { setStats(parsed.stats); } 
        else { localStorage.setItem('laura_stats_data', JSON.stringify({ date: today, stats: INITIAL_STATS })); setStats(INITIAL_STATS); }
    } else { localStorage.setItem('laura_stats_data', JSON.stringify({ date: today, stats: INITIAL_STATS })); }

    const loadData = async () => {
      try {
        const data = await fetchBlazeHistory();
        if (data.length > 0) { setHistory(data); processHistory(data); setConnectionError(false); lastUpdateRef.current = Date.now(); } 
        else { setConnectionError(true); }
      } catch (error) { setConnectionError(true); } finally { setLoading(false); }
    };
    loadData();
  }, []);

  const handleSystemStatusChange = (status: boolean) => { setIsSystemOnline(status); localStorage.setItem('laura_system_status', status ? 'online' : 'offline'); };

  useEffect(() => {
    const intervalId = setInterval(async () => {
      const data = await fetchBlazeHistory();
      if (data.length > 0) {
        setHistory(prevHistory => {
            if (prevHistory.length > 0 && data[0].id !== prevHistory[0].id) { handleNewRoll(data); return data; }
            if (prevHistory.length === 0) return data;
            return prevHistory;
        });
        setConnectionError(false);
        lastUpdateRef.current = Date.now();
      }
    }, 2000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (secondsRemaining > 0) {
        setIsBettingOpen(true);
        const timerId = setTimeout(() => { setSecondsRemaining(prev => prev - 1); }, 1000);
        return () => clearTimeout(timerId);
    } else { setIsBettingOpen(false); }
  }, [secondsRemaining]);

  const handleNewRoll = (currentHistory: BlazeRoll[]) => { setSecondsRemaining(BETTING_WINDOW_SECONDS); processHistory(currentHistory); };
  const isAutoModeRef = useRef(isAutoMode);
  useEffect(() => { isAutoModeRef.current = isAutoMode; }, [isAutoMode]);

  const processHistory = (currentHistory: BlazeRoll[]) => {
    const latestRoll = currentHistory[0];
    const isNewRoll = lastProcessedRollId.current !== latestRoll.id;
    if (activeSignalRef.current && activeSignalRef.current.status === 'active') {
        if (isNewRoll) {
            lastProcessedRollId.current = latestRoll.id;
            const prediction = activeSignalRef.current.color;
            const isWin = latestRoll.color === prediction || latestRoll.color === BlazeColor.WHITE;
            const resultSignal: Signal = { ...activeSignalRef.current, status: isWin ? 'win' : 'loss', message: isWin ? 'WIN SG' : 'LOSS' };
            setSignal(resultSignal);
            activeSignalRef.current = null;
            updateStats(isWin);
        }
    } else if ((signal.status === 'win' || signal.status === 'loss') && isNewRoll) {
       lastProcessedRollId.current = latestRoll.id;
       setSignal(prev => ({ ...prev, status: 'waiting', color: null, message: "Aguardando..." }));
       activeSignalRef.current = null;
       if (isAutoModeRef.current) { generateSignalLogic(currentHistory); }
    } else if (!activeSignalRef.current && isNewRoll) {
        lastProcessedRollId.current = latestRoll.id;
        if (isAutoModeRef.current) { generateSignalLogic(currentHistory); }
    }
  };

  const generateSignalLogic = (currentHistory: BlazeRoll[]) => {
      const storedStatus = localStorage.getItem('laura_system_status');
      if (storedStatus === 'offline') return; 
      const predictedColor = calculateNextSignal(currentHistory);
      if (predictedColor !== null) {
          const newSignal: Signal = { type: 'buy', color: predictedColor, status: 'active', message: 'Entrada Confirmada', predictedColorName: predictedColor === BlazeColor.RED ? 'Vermelho' : 'Preto' };
          setSignal(newSignal);
          activeSignalRef.current = newSignal;
      }
  };

  const handleManualGenerate = () => {
      const storedStatus = localStorage.getItem('laura_system_status');
      if (storedStatus === 'offline') return;
      if (activeSignalRef.current) return;
      if (!isBettingOpen) return; 
      generateSignalLogic(history);
  };

  const updateStats = (isWin: boolean) => {
      setStats(prev => {
          const newWins = isWin ? prev.wins + 1 : prev.wins;
          const newLosses = !isWin ? prev.losses + 1 : prev.losses;
          const total = newWins + newLosses;
          const rate = total === 0 ? 0 : (newWins / total) * 100;
          const newStats = { wins: newWins, losses: newLosses, totalSignals: total, winRate: rate, assertivity: `${rate.toFixed(1)}%` };
          const today = new Date().toLocaleDateString();
          localStorage.setItem('laura_stats_data', JSON.stringify({ date: today, stats: newStats }));
          return newStats;
      });
  };

  if (loading) {
      return (
          <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden scanline">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/40 via-black to-black"></div>
              <div className="relative z-10 text-center">
                  <div className="w-24 h-24 border-4 border-red-600 border-t-white border-b-red-900 rounded-full animate-spin mx-auto mb-8 shadow-[0_0_50px_rgba(220,38,38,0.6)]"></div>
                  <h2 className="text-4xl font-black text-white tracking-[0.2em] animate-pulse brand-font neon-text-red">LAURA <span className="text-red-600">AI</span></h2>
                  <p className="text-red-500/70 text-sm mt-4 font-mono uppercase tracking-widest">Iniciando Sistema...</p>
              </div>
          </div>
      );
  }

  if (!isAuthenticated) {
      if (showRegister) { return <RegisterPage onBack={() => setShowRegister(false)} />; }
      return <LoginPage onLogin={(admin) => { setIsAuthenticated(true); setIsAdmin(admin); }} onGoToRegister={() => setShowRegister(true)} />;
  }

  return (
    <div className="min-h-screen bg-black text-white pb-20 scanline relative">
      <div className="fixed inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0"></div>
      <div className="fixed top-0 left-0 w-full h-[500px] bg-gradient-to-b from-red-900/20 to-transparent pointer-events-none z-0"></div>
      <header className="bg-black/80 backdrop-blur-xl border-b border-red-900/30 sticky top-0 z-50 shadow-[0_4px_30px_rgba(255,0,0,0.1)]">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="relative group"><div className="absolute -inset-2 bg-red-600 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity animate-pulse"></div><div className="relative bg-black p-2 rounded-lg border border-red-900/50"><Bot className="text-red-500 w-6 h-6" /></div></div>
             <div><h1 className="text-2xl font-black italic leading-none tracking-tighter text-white neon-text-red">LAURA <span className="text-red-600">AI</span></h1><div className="flex items-center gap-2 mt-0.5"><div className="h-0.5 w-6 bg-red-600 rounded-full shadow-[0_0_10px_red]"></div><p className="text-[9px] font-bold text-red-500/70 tracking-[0.3em] uppercase">No Gale System</p></div></div>
          </div>
          <div className="flex items-center gap-3">
             {isAdmin && (<button onClick={() => setIsAdminPanelOpen(true)} className="px-3 py-1 bg-red-900/30 border border-red-600 rounded text-[10px] font-bold uppercase text-red-400 hover:bg-red-900/50 transition-colors flex items-center gap-1 animate-pulse"><ShieldCheck size={12} /> Admin</button>)}
             <div className={`px-3 py-1 rounded border flex items-center gap-2 bg-black ${connectionError ? 'border-red-500/50' : 'border-green-900/50 shadow-[0_0_10px_rgba(0,255,0,0.1)]'}`}><div className={`w-1.5 h-1.5 rounded-full ${connectionError ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`}></div><span className={`text-[10px] font-bold uppercase ${connectionError ? 'text-red-400' : 'text-green-500'}`}>{connectionError ? 'OFFLINE' : 'ONLINE'}</span></div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 relative z-10">
        {connectionError && (<div className="bg-red-950/30 border border-red-500/50 p-4 rounded-xl mb-6 text-center animate-pulse shadow-[inset_0_0_20px_rgba(255,0,0,0.1)]"><p className="text-red-400 text-sm font-bold flex items-center justify-center gap-2 uppercase tracking-widest"><WifiOff size={16} />Reconectando Servidor...</p></div>)}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="md:col-span-2 bg-gradient-to-r from-zinc-900 to-black border border-zinc-800 p-4 rounded-xl flex items-center gap-4 relative overflow-hidden">
                <div className="p-3 bg-red-900/10 rounded-lg border border-red-900/20"><Fingerprint className="text-red-600" size={24} /></div>
                <div><h3 className="text-sm font-bold text-white uppercase mb-0.5 flex items-center gap-2">Análise de Padrões <span className="text-[10px] bg-red-600 text-white px-1.5 rounded-sm font-black animate-pulse">LIVE</span></h3><p className="text-xs text-zinc-500 leading-tight">Inteligência Artificial conectada à API oficial.</p></div>
            </div>
            <div className="bg-black/40 border border-zinc-900 p-4 rounded-xl flex flex-col justify-center">
                <div className="flex items-center justify-between mb-2"><span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1"><Settings2 size={10} /> Operação</span></div>
                <div className="flex bg-zinc-950 p-1 rounded border border-zinc-900 relative">
                    <button onClick={() => setIsAutoMode(true)} className={`flex-1 py-1.5 text-xs font-bold uppercase rounded-sm transition-all z-10 ${isAutoMode ? 'text-white' : 'text-zinc-600 hover:text-zinc-400'}`} disabled={!isSystemOnline}>Auto</button>
                    <button onClick={() => setIsAutoMode(false)} className={`flex-1 py-1.5 text-xs font-bold uppercase rounded-sm transition-all z-10 ${!isAutoMode ? 'text-white' : 'text-zinc-600 hover:text-zinc-400'}`} disabled={!isSystemOnline}>Manual</button>
                    {isSystemOnline && (<div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-red-700 shadow-[0_0_10px_red] rounded-sm transition-all duration-300 ${isAutoMode ? 'left-1' : 'left-[calc(50%+2px)]'}`}></div>)}
                </div>
            </div>
        </div>

        <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2"><Timer size={14} className={isBettingOpen ? "text-green-500 animate-pulse" : "text-red-500"} /><span className={`text-xs font-bold uppercase tracking-widest ${isBettingOpen ? "text-green-500" : "text-red-500"}`}>{isBettingOpen ? "Apostas Abertas" : "Apostas Encerradas"}</span></div>
                <span className="text-xs font-mono text-zinc-500">{isBettingOpen ? `${secondsRemaining}s` : "Aguardando Giro..."}</span>
            </div>
            <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden"><div className={`h-full transition-all duration-1000 ease-linear ${isBettingOpen ? 'bg-green-500 shadow-[0_0_10px_green]' : 'bg-red-900'}`} style={{ width: `${(secondsRemaining / BETTING_WINDOW_SECONDS) * 100}%` }}></div></div>
        </div>

        <StatsPanel stats={stats} />

        <div className="relative">
            {isSystemOnline ? (
                <>
                    <SignalCard signal={signal} />
                    {!isAutoMode && signal.status === 'waiting' && (
                        <div className="absolute top-[60%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-xs z-20">
                            {isBettingOpen ? (<button onClick={handleManualGenerate} className="w-full group relative overflow-hidden bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-xl uppercase tracking-widest transition-all shadow-[0_0_30px_rgba(220,38,38,0.4)] hover:scale-105 active:scale-95 border border-red-500"><span className="relative z-10 flex items-center justify-center gap-2"><Zap size={20} className="text-white fill-white" />GERAR SINAL</span></button>) : (<button disabled className="w-full bg-zinc-900 text-zinc-600 font-bold py-4 rounded-xl uppercase tracking-widest border border-zinc-800 cursor-not-allowed flex items-center justify-center gap-2"><Lock size={16} />Giro em Andamento</button>)}
                        </div>
                    )}
                </>
            ) : (
                <div className="w-full max-w-sm mx-auto p-12 rounded-xl border border-red-900/50 bg-black/80 flex flex-col items-center text-center shadow-[0_0_50px_rgba(220,38,38,0.1)] mb-8"><WifiOff size={48} className="text-red-500 mb-4 animate-pulse" /><h2 className="text-xl font-black text-white brand-font uppercase mb-2">MANUTENÇÃO</h2><p className="text-zinc-500 text-xs">O sistema está temporariamente offline para atualizações da IA. Volte em instantes.</p></div>
            )}
        </div>

        <HistoryStrip history={history} />

        <div className="mt-12 border border-zinc-800 rounded-xl overflow-hidden bg-black/60 backdrop-blur">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50"><h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest brand-font">Histórico (100)</h3></div>
            {history.length === 0 ? (<div className="p-8 text-center"><p className="text-zinc-600 text-xs font-mono">Conectando API Blaze...</p></div>) : (
              <div className="overflow-x-auto max-h-[400px] overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse">
                      <thead className="sticky top-0 bg-black z-10 shadow-lg shadow-black"><tr className="text-[10px] text-zinc-600 uppercase tracking-widest border-b border-zinc-800"><th className="p-4 font-bold">Hora</th><th className="p-4 font-bold">Número</th><th className="p-4 font-bold">Cor</th><th className="p-4 font-bold text-right">Seed</th></tr></thead>
                      <tbody className="divide-y divide-zinc-900/50">
                          {history.slice(0, 100).map((roll) => (
                              <tr key={roll.id} className="hover:bg-red-900/10 transition-colors group">
                                  <td className="p-4 text-xs text-zinc-500 font-mono">{new Date(roll.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                  <td className="p-4"><span className={`text-sm font-bold ${roll.color === BlazeColor.WHITE ? 'text-black bg-white px-2 py-0.5 rounded shadow' : 'text-white'}`}>{roll.roll}</span></td>
                                  <td className="p-4">{roll.color === BlazeColor.RED && <span className="text-xs text-red-500 font-bold uppercase">Vermelho</span>}{roll.color === BlazeColor.BLACK && <span className="text-xs text-zinc-400 font-bold uppercase">Preto</span>}{roll.color === BlazeColor.WHITE && <span className="text-xs text-white font-bold uppercase drop-shadow-[0_0_5px_white]">Branco</span>}</td>
                                  <td className="p-4 text-right"><span className="text-[10px] text-zinc-700 font-mono block max-w-[80px] truncate ml-auto">{roll.server_seed}</span></td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
            )}
        </div>
      </main>

      <footer className="text-center py-6 text-zinc-800 text-[10px] font-mono border-t border-zinc-900 bg-black mt-10"><p className="mb-1">LAURA AI SYSTEM v2.1</p><p>BLAZE PROXY CONNECTION</p></footer>
      <button onClick={() => setIsFeedbackOpen(true)} className="fixed bottom-6 right-6 z-40 bg-zinc-900 border border-red-900/30 text-white p-3 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.5)] hover:bg-red-900/20 hover:border-red-600 transition-all group" title="Enviar Feedback"><MessageSquarePlus className="w-6 h-6 text-zinc-400 group-hover:text-red-500 transition-colors" /></button>
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
      <AdminPanel isOpen={isAdminPanelOpen} onClose={() => setIsAdminPanelOpen(false)} systemStatus={isSystemOnline} setSystemStatus={handleSystemStatusChange} />
    </div>
  );
}

export default App;