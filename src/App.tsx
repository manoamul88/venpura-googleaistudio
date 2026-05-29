import React, { useState, useEffect } from 'react';
import { Player, Expense, PaymentLog, Match, AvailabilityStatus, MatchScorecard, Tournament } from './types';
import { 
  INITIAL_PLAYERS, 
  INITIAL_EXPENSES, 
  INITIAL_PAYMENT_LOGS, 
  INITIAL_MATCHES,
  INITIAL_TOURNAMENTS
} from './initialData';
import FinanceTab from './components/FinanceTab';
import MatchesTab from './components/MatchesTab';
import RosterTab from './components/RosterTab';
import ScoreboardTab from './components/ScoreboardTab';
import TournamentsTab from './components/TournamentsTab';
import TeamLogo from './components/TeamLogo';
import { 
  Trophy, 
  DollarSign, 
  Calendar, 
  Users, 
  PiggyBank, 
  Award,
  Sparkles,
  RefreshCw,
  TrendingUp,
  Activity,
  UserCheck,
  UserCheck2,
  LogOut,
  KeyRound,
  Shield,
  Copy,
  Download,
  Upload,
  CircleUser,
  Crown,
  ChevronRight,
  Info,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // Load initial states from localStorage with safe initialData fallbacks
  const [players, setPlayers] = useState<Player[]>(() => {
    const stored = localStorage.getItem('cricket_players');
    return stored ? JSON.parse(stored) : INITIAL_PLAYERS;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const stored = localStorage.getItem('cricket_expenses');
    return stored ? JSON.parse(stored) : INITIAL_EXPENSES;
  });

  const [paymentLogs, setPaymentLogs] = useState<PaymentLog[]>(() => {
    const stored = localStorage.getItem('cricket_payment_logs');
    return stored ? JSON.parse(stored) : INITIAL_PAYMENT_LOGS;
  });

  const [matches, setMatches] = useState<Match[]>(() => {
    const stored = localStorage.getItem('cricket_matches');
    return stored ? JSON.parse(stored) : INITIAL_MATCHES;
  });

  const [tournaments, setTournaments] = useState<Tournament[]>(() => {
    const stored = localStorage.getItem('cricket_tournaments');
    return stored ? JSON.parse(stored) : INITIAL_TOURNAMENTS;
  });

  // Current session authenticated customer context
  const [currentUser, setCurrentUser] = useState<Player | null>(() => {
    const stored = localStorage.getItem('cricket_logged_user');
    return stored ? JSON.parse(stored) : null;
  });

  // Verify Admin privilege Mano details
  const isAdmin = currentUser?.name === 'Mano' && currentUser?.mobileNumber === '9566510045';

  // State to custom store uploaded team logo
  const [teamLogo, setTeamLogo] = useState<string | null>(() => {
    return localStorage.getItem('cricket_team_logo');
  });

  // State for Match Ball Duty Custom Override
  const [customBallDutyId, setCustomBallDutyId] = useState<string | null>(() => {
    return localStorage.getItem('cricket_custom_ball_duty_id');
  });

  // Inputs state for login screen
  const [loginName, setLoginName] = useState('');
  const [loginMobile, setLoginMobile] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showDemoLogins, setShowDemoLogins] = useState(false);

  // Database System sharing console states
  const [dbShareInput, setDbShareInput] = useState('');
  const [dbStatus, setDbStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Active Navigation Tab
  const [activeTab, setActiveTab2] = useState<'FINANCES' | 'MATCHES' | 'ROSTER' | 'SCOREBOARD' | 'TOURNAMENTS'>('FINANCES');

  // Push updates to localStorage whenever state mutations occur
  useEffect(() => {
    localStorage.setItem('cricket_players', JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    localStorage.setItem('cricket_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('cricket_payment_logs', JSON.stringify(paymentLogs));
  }, [paymentLogs]);

  useEffect(() => {
    localStorage.setItem('cricket_matches', JSON.stringify(matches));
  }, [matches]);

  useEffect(() => {
    localStorage.setItem('cricket_tournaments', JSON.stringify(tournaments));
  }, [tournaments]);

  useEffect(() => {
    if (customBallDutyId) {
      localStorage.setItem('cricket_custom_ball_duty_id', customBallDutyId);
    } else {
      localStorage.removeItem('cricket_custom_ball_duty_id');
    }
  }, [customBallDutyId]);

  // FINANCIAL MUTATIONS
  // Log expense purchased product
  const handleAddExpense = (newExpense: Omit<Expense, 'id'>) => {
    const expense: Expense = {
      ...newExpense,
      id: `expense_${Date.now()}`
    };
    setExpenses(prev => [expense, ...prev]);
  };

  // Delete wrong/accidental expense
  const handleDeleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  // Record a payment / fee collection contribution
  const handleAddContribution = (playerId: string, amount: number, date: string, notes?: string) => {
    const targetPlayer = players.find(p => p.id === playerId);
    if (!targetPlayer) return;

    // Create payment history entry
    const newLog: PaymentLog = {
      id: `log_${Date.now()}`,
      playerId,
      playerName: targetPlayer.name,
      amount,
      date,
      notes
    };

    // Update Logs and individual player total collections
    setPaymentLogs(prev => [...prev, newLog]);
    setPlayers(prev => prev.map(p => {
      if (p.id === playerId) {
        return {
          ...p,
          totalCollected: p.totalCollected + amount
        };
      }
      return p;
    }));
  };

  // MATCH STATS & POLL MUTATIONS
  // Create fixture event
  const handleAddMatch = (newMatch: Omit<Match, 'id' | 'poll'>) => {
    const match: Match = {
      ...newMatch,
      id: `match_${Date.now()}`,
      poll: {} // Starts empty, players are undecided
    };
    setMatches(prev => [match, ...prev]);
  };

  // Update a single player's RSVP response
  const handleUpdatePoll = (matchId: string, playerId: string, status: AvailabilityStatus) => {
    setMatches(prev => prev.map(m => {
      if (m.id === matchId) {
        return {
          ...m,
          poll: {
            ...m.poll,
            [playerId]: status
          }
        };
      }
      return m;
    }));
  };

  // Reset poll to blank undecided
  const handleClearPoll = (matchId: string) => {
    setMatches(prev => prev.map(m => {
      if (m.id === matchId) {
        return {
          ...m,
          poll: {}
        };
      }
      return m;
    }));
  };

  // Cancel upcoming game match row
  const handleDeleteMatch = (id: string) => {
    setMatches(prev => prev.filter(m => m.id !== id));
  };

  // SCORECARD MUTATIONS
  const handleUpdateMatchScorecard = (matchId: string, scorecard: MatchScorecard) => {
    setMatches(prev => prev.map(m => {
      if (m.id === matchId) {
        return {
          ...m,
          scorecard
        };
      }
      return m;
    }));
  };

  // ROSTER SQUAD MUTATIONS
  // Add new player to registration board
  const handleAddPlayer = (newPlayer: Omit<Player, 'id' | 'totalCollected'>) => {
    const player: Player = {
      ...newPlayer,
      id: `p_${Date.now()}`,
      totalCollected: 0
    };
    setPlayers(prev => [...prev, player]);
  };

  // Modify user name or jersey assignment
  const handleUpdatePlayer = (id: string, updatedFields: Partial<Omit<Player, 'id' | 'totalCollected'>>) => {
    setPlayers(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          ...updatedFields
        };
      }
      return p;
    }));
  };

  // Delete squad member entirely
  const handleDeletePlayer = (id: string) => {
    setPlayers(prev => prev.filter(p => p.id !== id));
    // Clean up payments logs referring to deleted player
    setPaymentLogs(prev => prev.filter(log => log.playerId !== id));
    // Clean up matches polls
    setMatches(prev => prev.map(m => {
      const copyPoll = { ...m.poll };
      delete copyPoll[id];
      return {
        ...m,
        poll: copyPoll
      };
    }));
  };

  // Reset whole storage to original preseeds
  const resetToFactoryDefault = () => {
    if (confirm("Reset everything to factory default? This wipes customized names, expenses logs, and responses.")) {
      localStorage.removeItem('cricket_players');
      localStorage.removeItem('cricket_expenses');
      localStorage.removeItem('cricket_payment_logs');
      localStorage.removeItem('cricket_matches');
      localStorage.removeItem('cricket_custom_ball_duty_id');
      setPlayers(INITIAL_PLAYERS);
      setExpenses(INITIAL_EXPENSES);
      setPaymentLogs(INITIAL_PAYMENT_LOGS);
      setMatches(INITIAL_MATCHES);
      setCustomBallDutyId(null);
      setActiveTab2('FINANCES');
    }
  };

  // Handle Submit on Login Screen
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!loginName || !loginMobile) {
      setErrorMsg('First Name and Mobile Number are mandatory!');
      return;
    }

    const cleanInputName = loginName.trim().toLowerCase();
    const cleanInputMobile = loginMobile.replace(/\s+/g, '').trim();

    // Search players in roster
    const matched = players.find(p => {
      if (!p.mobileNumber) return false;
      const cleanPlayerMobile = p.mobileNumber.replace(/\s+/g, '').trim();
      if (cleanPlayerMobile !== cleanInputMobile) return false;

      const pFirstName = p.name.split(' ')[0].toLowerCase().trim();
      const pFullName = p.name.toLowerCase().trim();

      return pFirstName === cleanInputName || pFullName === cleanInputName || pFullName.startsWith(cleanInputName);
    });

    if (matched) {
      setCurrentUser(matched);
      localStorage.setItem('cricket_logged_user', JSON.stringify(matched));
      setLoginName('');
      setLoginMobile('');
    } else {
      // Direct administrative match check for "Mano" and "9566510045"
      if (cleanInputName === 'mano' && cleanInputMobile === '9566510045') {
        const manoAdmin: Player = {
          id: 'p0',
          name: 'Mano',
          jerseyNumber: '7',
          role: 'Club Chairman (Admin)',
          totalCollected: 250,
          mobileNumber: '9566510045'
        };
        // Add if not already present
        if (!players.some(p => p.mobileNumber === '9566510045')) {
          setPlayers(prev => [manoAdmin, ...prev]);
        }
        setCurrentUser(manoAdmin);
        localStorage.setItem('cricket_logged_user', JSON.stringify(manoAdmin));
        setLoginName('');
        setLoginMobile('');
      } else {
        setErrorMsg('Invalid login credentials! First Name and registered Mobile Number must match a squad profile.');
      }
    }
  };

  // Database Import handler ("shar the database for me")
  const handleImportDatabase = (e: React.FormEvent) => {
    e.preventDefault();
    setDbStatus(null);
    if (!dbShareInput.trim()) return;

    try {
      const parsed = JSON.parse(dbShareInput);
      if (!parsed.players || !Array.isArray(parsed.players)) {
        throw new Error("Payload missing 'players' Roster array.");
      }
      if (!parsed.expenses || !Array.isArray(parsed.expenses)) {
        throw new Error("Payload missing 'expenses' ledger array.");
      }
      if (!parsed.paymentLogs || !Array.isArray(parsed.paymentLogs)) {
        throw new Error("Payload missing 'paymentLogs' array.");
      }
      if (!parsed.matches || !Array.isArray(parsed.matches)) {
        throw new Error("Payload missing 'matches' scheduled array.");
      }

      setPlayers(parsed.players);
      setExpenses(parsed.expenses);
      setPaymentLogs(parsed.paymentLogs);
      setMatches(parsed.matches);
      if (parsed.tournaments && Array.isArray(parsed.tournaments)) {
        setTournaments(parsed.tournaments);
      } else {
        setTournaments([]);
      }
      
      setDbShareInput('');
      setDbStatus({ type: 'success', msg: 'JSON Database loaded successfully! Active cache synced.' });
    } catch (err: any) {
      setDbStatus({ type: 'error', msg: `Import aborted: ${err?.message || 'Invalid JSON format.'}` });
    }
  };

  // 1. CHOOSE BALL BUYER ALPHABETICALLY DEFINITIONS
  // Filter out any administrative entries for rotation buying duty list
  const sortedPlayersAlpha = [...players]
    .filter(p => p.id !== 'p0' && p.name !== 'Mano')
    .sort((a, b) => a.name.localeCompare(b.name));

  const getWeekNumberDeterministic = () => {
    const today = new Date();
    const firstOfYr = new Date(today.getFullYear(), 0, 1);
    const diff = today.getTime() - firstOfYr.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const day = Math.floor(diff / oneDay);
    return Math.ceil((day + firstOfYr.getDay() + 1) / 7);
  };

  const currentWeekNumber = getWeekNumberDeterministic();
  
  // Pick alphabetically from sorted rotation index deterministically
  const rotatingDutyPlayer = sortedPlayersAlpha.length > 0 
    ? sortedPlayersAlpha[currentWeekNumber % sortedPlayersAlpha.length] 
    : null;

  // Actual active ball buyer details (first choice is customs admin override override if exists)
  const playerOnDutyNow = players.find(p => p.id === customBallDutyId) || rotatingDutyPlayer;

  // Stagger alphabetized rotational list preview of next buyers
  const upcomingDutyQueue = [];
  if (sortedPlayersAlpha.length > 0) {
    const currentActiveIdx = playerOnDutyNow ? sortedPlayersAlpha.findIndex(p => p.id === playerOnDutyNow.id) : -1;
    const rotationalBaseIdx = currentActiveIdx !== -1 ? currentActiveIdx : (currentWeekNumber % sortedPlayersAlpha.length);
    for (let i = 1; i <= 4; i++) {
      const idx = (rotationalBaseIdx + i) % sortedPlayersAlpha.length;
      upcomingDutyQueue.push({
        weeksOut: i,
        player: sortedPlayersAlpha[idx]
      });
    }
  }

  // Create current database string representation for sharing
  const databaseStringPayload = JSON.stringify({
    players,
    expenses,
    paymentLogs,
    matches,
    tournaments
  }, null, 2);

  const downloadDatabaseFile = () => {
    const blob = new Blob([databaseStringPayload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `venpura_cc_shared_database_ledger.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Computed metrics overview for sticky utility bar
  const totalCollectedSum = players.reduce((sum, p) => sum + p.totalCollected, 0);
  const totalSpentSum = expenses.reduce((sum, e) => sum + e.cost, 0);
  const remainingPotBalance = totalCollectedSum - totalSpentSum;

  // RENDER LOGIN SCREEN PORTAL IF GUEST GUEST UNAUTHENTICATED
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#070b13] flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
        {/* Subtle ground lights grass lines effects */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-indigo-600 to-amber-500 z-50 animate-pulse" />
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-indigo-650/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-emerald-650/10 blur-3xl pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6"
        >
          {/* Logo Heading */}
          <div className="text-center space-y-3 flex flex-col items-center">
            <TeamLogo customUrl={teamLogo} size="xl" className="mx-auto select-none" />
            <span className="p-1 px-3 bg-indigo-500/10 text-indigo-350 border border-indigo-500/20 rounded-full font-black text-[10px] uppercase tracking-widest inline-flex items-center gap-1.5 font-sans mt-2">
              <Trophy className="w-3.5 h-3.5 text-amber-500 animate-bounce" /> Venpura Command
            </span>
            <h1 className="text-3xl font-display font-black tracking-tight text-white uppercase mt-1">
              VENPURA CC
            </h1>
            <p className="text-xs text-slate-400">
              Each player should login through their registered first name and mobile number first. Mobile number is mandatory.
            </p>
          </div>

          {/* Login Form Box */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3.5 bg-red-950/40 border border-red-500/20 text-red-300 rounded-xl text-xs flex items-start gap-2 animate-shake">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-4 text-left">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                  <CircleUser className="w-3 h-3 text-indigo-400" /> Player First Name <span className="text-red-400">*</span>
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Jasprit"
                  value={loginName}
                  onChange={(e) => setLoginName(e.target.value)}
                  className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-indigo-400 transition"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                  <KeyRound className="w-3 h-3 text-indigo-400" /> Registered Mobile Number <span className="text-red-400">*</span>
                </label>
                <input
                  required
                  type="password"
                  placeholder="e.g. 9000000030"
                  value={loginMobile}
                  onChange={(e) => setLoginMobile(e.target.value)}
                  className="w-full text-xs font-mono bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-indigo-400 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold text-xs py-3.5 rounded-xl cursor-pointer transition shadow-lg hover:shadow-indigo-500/20 flex items-center justify-center gap-2 border border-indigo-500"
            >
              <UserCheck className="w-4 h-4" /> Sign In securely
            </button>
          </form>

          {/* Quick Demo Directory Helper Toggle */}
          <div className="border-t border-slate-800/80 pt-4 text-center">
            <button
              type="button"
              onClick={() => setShowDemoLogins(!showDemoLogins)}
              className="text-xs text-slate-400 hover:text-indigo-400 font-semibold transition inline-flex items-center gap-1.5"
            >
              <Database className="w-3.5 h-3.5" />
              {showDemoLogins ? "Hide Demo Roster Credentials" : "Reveal Registered Roster Accounts"}
            </button>

            <AnimatePresence>
              {showDemoLogins && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 text-left overflow-hidden bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 max-h-[190px] overflow-y-auto space-y-1.5"
                >
                  <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-wide border-b border-slate-800 pb-1">Demo login helper (click to autofill)</p>
                  
                  {/* Mano Admin user trigger details */}
                  <div 
                    onClick={() => { setLoginName('Mano'); setLoginMobile('9566510045'); }}
                    className="p-1.5 px-2 text-[11px] rounded bg-amber-950/20 hover:bg-amber-900/30 text-amber-300 border border-amber-900/25 cursor-pointer flex justify-between items-center transition"
                  >
                    <span><strong>Mano (Admin)</strong></span>
                    <span className="font-mono text-[10px] text-white font-bold">9566510045</span>
                  </div>

                  {players.slice(0, 5).map(p => {
                    if (p.name === 'Mano') return null;
                    return (
                      <div 
                        key={p.id}
                        onClick={() => { setLoginName(p.name.split(' ')[0]); setLoginMobile(p.mobileNumber || ''); }}
                        className="p-1.5 px-2 text-[11px] rounded bg-slate-900/40 hover:bg-slate-800/60 text-slate-300 border border-slate-850 cursor-pointer flex justify-between items-center transition"
                      >
                        <span className="truncate">{p.name} (Player)</span>
                        <span className="font-mono text-[10px] text-indigo-350">{p.mobileNumber || '9000000000'}</span>
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <p className="text-[10px] text-slate-600 mt-6 max-w-sm text-center font-sans tracking-wide">
          Offline secure cricket command registry in local environment storage index. Authorized squad members only.
        </p>
      </div>
    );
  }

  // LOGGED IN VIEW FOR THE APP
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col justify-between">
      
      {/* Top Session & Admin Control Status strip */}
      <div className="bg-slate-900 border-b border-slate-850 py-3 px-4 shadow-xl relative z-25 text-xs text-slate-300 select-none font-sans">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          
          <div className="flex items-center gap-2">
            {isAdmin ? (
              <span className="p-1 px-2.5 bg-amber-500/10 text-amber-450 border border-amber-500/20 font-black text-[10px] uppercase tracking-wider rounded-lg flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0 animate-pulse" />
                Admin Console Active (Logged in as Mano)
              </span>
            ) : (
              <span className="p-1 px-2.5 bg-indigo-500/10 text-indigo-350 border border-indigo-500/20 font-bold text-[10px] uppercase tracking-wider rounded-lg flex items-center gap-1.5">
                <CircleUser className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                Player Session: <strong className="text-white ml-0.5">{currentUser.name}</strong>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button 
              onClick={() => {
                localStorage.removeItem('cricket_logged_user');
                setCurrentUser(null);
              }}
              className="bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-black px-2.5 py-1.5 rounded-lg cursor-pointer transition flex items-center gap-1 tracking-wider uppercase"
            >
              <LogOut className="w-3 h-3" /> Log Out Portal
            </button>

            <span className="text-slate-800">|</span>

            <button 
              onClick={resetToFactoryDefault}
              className="text-[10px] bg-slate-950 border border-slate-850 text-slate-400 hover:text-white px-2.5 py-1 rounded-lg font-bold cursor-pointer transition flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3 inline" /> Wipe Cache
            </button>
          </div>

        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex-1 space-y-6">
        
        {/* Header Widget */}
        <div className="bg-slate-900 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden border border-slate-800">
          <div className="absolute right-0 bottom-0 top-0 w-32 bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 z-10 font-sans">
            {/* Interactive Logo section */}
            <div className="relative group/logo">
              <TeamLogo customUrl={teamLogo} size="md" />
              {isAdmin && (
                <div 
                  onClick={() => document.getElementById('team-logo-upload-input')?.click()}
                  className="absolute -bottom-1 -right-1 bg-indigo-600 hover:bg-indigo-500 text-white p-1.5 rounded-full shadow-lg border border-slate-800 cursor-pointer transition transform hover:scale-105 active:scale-95 flex items-center justify-center"
                  title="Upload team logo file (Mano Admin)"
                >
                  <Upload className="w-3 h-3" />
                </div>
              )}
              {/* Hidden file selector for team logo */}
              <input
                id="team-logo-upload-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      if (typeof reader.result === 'string') {
                        setTeamLogo(reader.result);
                        localStorage.setItem('cricket_team_logo', reader.result);
                      }
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="p-1 px-2.5 bg-indigo-500/10 text-indigo-300 rounded-full font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5 border border-indigo-500/25">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" /> Live Team Dashboard
                </span>
                {teamLogo && isAdmin && (
                  <button
                    onClick={() => {
                      if (window.confirm("Reset to default beautiful Venpura SVG Crest?")) {
                        setTeamLogo(null);
                        localStorage.removeItem('cricket_team_logo');
                      }
                    }}
                    className="text-[10px] text-slate-500 hover:text-red-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-850 cursor-pointer transition"
                  >
                    Reset Logo
                  </button>
                )}
              </div>
              
              <h1 className="text-4xl font-display font-black tracking-tight text-white uppercase">
                VENPURA CC <span className="text-indigo-505 text-lg ml-2 font-sans font-normal normal-case opacity-80">#TeamCommand</span>
              </h1>
              <p className="text-sm text-slate-400">
                High-fidelity bento board tracking roster fees, club outgoings, and interactive match RSVPs.
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-5 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 z-10 w-full md:w-auto overflow-x-auto shrink-0 font-sans">
            <div className="pr-5 border-r border-slate-800 shrink-0">
              <span className="text-[10px] font-black uppercase text-indigo-400 block tracking-widest">Available Pot</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <PiggyBank className="w-4.5 h-4.5 text-emerald-400" />
                <span className="font-mono text-lg font-black text-white">
                  ₹{remainingPotBalance.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="shrink-0">
              <span className="text-[10px] font-black uppercase text-indigo-400 block tracking-widest">Team Collected</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <TrendingUp className="w-4.5 h-4.5 text-indigo-400" />
                <span className="font-mono text-lg font-black text-white">
                  ₹{totalCollectedSum.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. MATCH BALL ROTATION SECTION PANEL */}
        <div id="ball-duty-panel" className="bg-slate-900 rounded-3xl border border-slate-800 p-5 shadow-xl relative overflow-hidden font-sans">
          <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-y from-amber-400 to-indigo-500 shrink-0" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
            
            {/* Active duty column */}
            <div className="lg:col-span-5 space-y-3.5 text-left">
              <div className="flex items-center gap-2">
                <span className="p-1 px-2.5 bg-amber-500/10 text-amber-405 border border-amber-500/20 text-[9px] uppercase font-bold tracking-wider rounded-lg">
                  🏏 Match Ball Duty This Week
                </span>
                <span className="text-slate-500 text-xs font-mono">Week {currentWeekNumber} Rotator</span>
              </div>

              <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-850 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">{playerOnDutyNow?.name || 'Roster Rotator'}</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">{playerOnDutyNow?.role || 'Cricket Player'} • Registered Mobile: {playerOnDutyNow?.mobileNumber || 'N/A'}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[9px] text-slate-500 block font-mono">Alphabetical Rank</span>
                  <span className="font-mono text-sm font-bold text-indigo-400">
                    {playerOnDutyNow ? sortedPlayersAlpha.findIndex(p => p.id === playerOnDutyNow.id) + 1 : '0'} / {sortedPlayersAlpha.length}
                  </span>
                </div>
              </div>

              {/* Duty Calculation Note */}
              <p className="text-[11px] text-slate-450 italic">
                The squad buys the match ball in <strong>alphabetical order</strong> each week. Check the upcoming rota below to see when you are next in line.
              </p>

              {/* Admin Override Controls */}
              {isAdmin && (
                <div className="pt-2 border-t border-slate-800/60 font-sans">
                  <label className="block text-[10px] font-bold uppercase text-amber-400 mb-1.5 flex items-center gap-1">
                    <Crown className="w-3 h-3 text-amber-400" /> 👑 Admin Override Buyer Duty (Mano controls)
                  </label>
                  <select
                    value={customBallDutyId || ''}
                    onChange={(e) => setCustomBallDutyId(e.target.value || null)}
                    className="w-full text-xs bg-slate-950 border border-amber-505/25 text-slate-205 outline-none p-2 rounded-lg focus:border-amber-450 transition"
                  >
                    <option value="" className="bg-slate-950 text-slate-400 font-sans">Rotate Alphabetically (Default)</option>
                    {players.map(p => (
                      <option key={p.id} value={p.id} className="bg-slate-950">{p.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Rotator preview timeline */}
            <div className="lg:col-span-7 space-y-3 text-left">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Upcoming Alphabetical Buyers Rota Queue</h4>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {upcomingDutyQueue.map((queue, i) => (
                  <div key={i} className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl relative hover:bg-slate-950 transition">
                    <span className="absolute top-2 right-2 text-[8px] font-mono font-bold text-slate-650">+{queue.weeksOut}W</span>
                    <span className="text-[8px] uppercase tracking-widest font-black text-indigo-400 block mb-1 font-mono">Week {currentWeekNumber + queue.weeksOut}</span>
                    <p className="text-xs font-bold text-white truncate">{queue.player?.name || 'Roster Full'}</p>
                    <span className="text-[9px] text-slate-500 mt-0.5 block truncate font-mono">{queue.player?.role || 'Cricket Player'}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Custom Segmented Navigation Controls */}
        <div id="tabs-group" className="flex border-b border-slate-800 font-sans select-none">
          <button
            id="tab-btn-finances"
            onClick={() => setActiveTab2('FINANCES')}
            className={`pb-3.5 px-5 text-sm font-semibold border-b-2 transition duration-200 flex items-center gap-2 cursor-pointer ${
              activeTab === 'FINANCES' 
                ? 'border-indigo-500 text-indigo-400 font-bold' 
                : 'border-transparent text-slate-500 hover:text-slate-350'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            Finances & Expenses
          </button>
          
          <button
            id="tab-btn-matches"
            onClick={() => setActiveTab2('MATCHES')}
            className={`pb-3.5 px-5 text-sm font-semibold border-b-2 transition duration-200 flex items-center gap-2 cursor-pointer ${
              activeTab === 'MATCHES' 
                ? 'border-indigo-500 text-indigo-400 font-bold' 
                : 'border-transparent text-slate-500 hover:text-slate-350'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Matches & Availability Poll
          </button>

          <button
            id="tab-btn-roster"
            onClick={() => setActiveTab2('ROSTER')}
            className={`pb-3.5 px-5 text-sm font-semibold border-b-2 transition duration-200 flex items-center gap-2 cursor-pointer ${
              activeTab === 'ROSTER' 
                ? 'border-indigo-500 text-indigo-400 font-bold' 
                : 'border-transparent text-slate-500 hover:text-slate-350'
            }`}
          >
            <Users className="w-4 h-4" />
            Team Roster ({players.length})
          </button>

          <button
            id="tab-btn-scoreboard"
            onClick={() => setActiveTab2('SCOREBOARD')}
            className={`pb-3.5 px-5 text-sm font-semibold border-b-2 transition duration-200 flex items-center gap-2 cursor-pointer ${
              activeTab === 'SCOREBOARD' 
                ? 'border-indigo-500 text-indigo-400 font-bold' 
                : 'border-transparent text-slate-500 hover:text-slate-350'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            Match Scoreboards
          </button>

          <button
            id="tab-btn-tournaments"
            onClick={() => setActiveTab2('TOURNAMENTS')}
            className={`pb-3.5 px-5 text-sm font-semibold border-b-2 transition duration-200 flex items-center gap-2 cursor-pointer ${
              activeTab === 'TOURNAMENTS' 
                ? 'border-indigo-500 text-indigo-400 font-bold' 
                : 'border-transparent text-slate-500 hover:text-slate-350'
            }`}
          >
            <Trophy className="w-4 h-4 text-indigo-400" />
            Upcoming Tournaments
          </button>
        </div>

        {/* Dynamic Display of Sub-components */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.16 }}
        >
          {activeTab === 'FINANCES' && (
            <FinanceTab
              players={players}
              expenses={expenses}
              paymentLogs={paymentLogs}
              onAddExpense={handleAddExpense}
              onAddContribution={handleAddContribution}
              onDeleteExpense={handleDeleteExpense}
              isAdmin={isAdmin}
            />
          )}

          {activeTab === 'MATCHES' && (
            <MatchesTab
              players={players}
              matches={matches}
              onAddMatch={handleAddMatch}
              onUpdatePoll={handleUpdatePoll}
              onClearPoll={handleClearPoll}
              onDeleteMatch={handleDeleteMatch}
              isAdmin={isAdmin}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'ROSTER' && (
            <RosterTab
              players={players}
              onAddPlayer={handleAddPlayer}
              onUpdatePlayer={handleUpdatePlayer}
              onDeletePlayer={handleDeletePlayer}
              isAdmin={isAdmin}
            />
          )}

          {activeTab === 'SCOREBOARD' && (
            <ScoreboardTab
              players={players}
              matches={matches}
              onUpdateMatchScorecard={handleUpdateMatchScorecard}
              isAdmin={isAdmin}
            />
          )}

          {activeTab === 'TOURNAMENTS' && (
            <TournamentsTab
              players={players}
              tournaments={tournaments}
              onUpdateTournaments={setTournaments}
              isAdmin={isAdmin}
            />
          )}
        </motion.div>

        {/* 3. SHARE DATABASE AND COMMAND RECOVERY CONSOLE */}
        <div id="database-sharing-system" className="bg-slate-900 rounded-3xl border border-slate-800 p-5 shadow-2xl relative font-sans text-left">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-1.5">
                <Database className="w-4.5 h-4.5 text-indigo-400" /> Share & Sync Database Console
              </h3>
              <p className="text-xs text-slate-400 mt-1">Export, copy, or restore the club system database payload offline.</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(databaseStringPayload);
                  alert("VENPURA JSON Database String copied to your clipboard!");
                }}
                className="px-3.5 py-2 bg-slate-950 hover:bg-slate-850 text-slate-300 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-800"
              >
                <Copy className="w-3.5 h-3.5 text-indigo-400" /> Copy Database payload
              </button>

              <button
                type="button"
                onClick={downloadDatabaseFile}
                className="px-3.5 py-2 bg-slate-950 hover:bg-slate-850 hover:text-white text-slate-300 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer border border-slate-800"
              >
                <Download className="w-3.5 h-3.5" /> Export DB File
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-4">
            <div className="lg:col-span-8 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Live DB JSON Payload Data State</span>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 h-[155px] overflow-auto text-[10px] font-mono text-indigo-300 text-left select-all whitespace-pre">
                {databaseStringPayload}
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col justify-between font-sans">
              <form onSubmit={handleImportDatabase} className="space-y-2.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest text-slate-400">
                  Import Shared Database State
                </label>
                <textarea
                  placeholder="Paste shared JSON database payload here..."
                  value={dbShareInput}
                  onChange={(e) => setDbShareInput(e.target.value)}
                  className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-300 outline-none h-[95px] font-mono focus:border-indigo-400"
                />

                <button
                  type="submit"
                  className="w-full bg-[#111827] hover:bg-slate-800 hover:text-white border border-slate-750 py-2 rounded-lg text-xs font-bold text-indigo-300 transition cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 inline mr-1" /> Load & Restore Payload
                </button>
              </form>

              {dbStatus && (
                <div className={`mt-2 p-2.5 rounded-lg border text-[10px] ${
                  dbStatus.type === 'success' 
                    ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-300' 
                    : 'bg-red-950/20 border-red-500/20 text-red-300'
                }`}>
                  {dbStatus.msg}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Styled Footer bar */}
      <footer className="bg-slate-950/40 border-t border-slate-900 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4 font-sans">
          <p>© 2026 VENPURA CC Command. Designed offline-first with absolute local persistence.</p>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <span className="text-[11px] font-semibold text-slate-450 uppercase tracking-wider">Local Cache Ledger is Syncing Live</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
