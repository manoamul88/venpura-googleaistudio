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
  Database,
  UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

export default function App() {
  // Direct firestore real-time state streams instead of local mocks
  const [players, setPlayers] = useState<Player[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [paymentLogs, setPaymentLogs] = useState<PaymentLog[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);

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

  // SQUAD PORTAL ENTRANCE STATES
  const [playerFirstName, setPlayerFirstName] = useState('');
  const [playerLastName, setPlayerLastName] = useState('');
  const [playerRole, setPlayerRole] = useState('Batsman');
  const [playerMobile, setPlayerMobile] = useState('');

  // SECURE CHAIRMAN (MANO) ADMIN ENTRANCE STATES
  const [adminFirstName, setAdminFirstName] = useState('Mano');
  const [adminMobile, setAdminMobile] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [showDemoLogins, setShowDemoLogins] = useState(false);

  // Database System sharing console states
  const [dbShareInput, setDbShareInput] = useState('');
  const [dbStatus, setDbStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Active Navigation Tab
  const [activeTab, setActiveTab2] = useState<'FINANCES' | 'MATCHES' | 'ROSTER' | 'SCOREBOARD' | 'TOURNAMENTS'>('FINANCES');

  // REALTIME FIRESTORE SYNCHRONIZATION LISTENERS
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'players'), (snapshot) => {
      const list: Player[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as Player);
      });
      setPlayers(list);
    }, (error) => {
      console.error("Firestore error listening to players registration: ", error);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'expenses'), (snapshot) => {
      const list: Expense[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as Expense);
      });
      list.sort((a, b) => b.date.localeCompare(a.date));
      setExpenses(list);
    }, (error) => {
      console.error("Firestore error listening to expenses: ", error);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'payment_logs'), (snapshot) => {
      const list: PaymentLog[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as PaymentLog);
      });
      list.sort((a, b) => b.date.localeCompare(a.date));
      setPaymentLogs(list);
    }, (error) => {
      console.error("Firestore error listening to payment logs: ", error);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'matches'), (snapshot) => {
      const list: Match[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as Match);
      });
      list.sort((a, b) => b.date.localeCompare(a.date));
      setMatches(list);
    }, (error) => {
      console.error("Firestore error listening to matches: ", error);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'tournaments'), (snapshot) => {
      const list: Tournament[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as Tournament);
      });
      list.sort((a, b) => b.startDate.localeCompare(a.startDate));
      setTournaments(list);
    }, (error) => {
      console.error("Firestore error listening to tournaments: ", error);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (customBallDutyId) {
      localStorage.setItem('cricket_custom_ball_duty_id', customBallDutyId);
    } else {
      localStorage.removeItem('cricket_custom_ball_duty_id');
    }
  }, [customBallDutyId]);

  // FINANCIAL MUTATIONS
  // Log expense purchased product
  const handleAddExpense = async (newExpense: Omit<Expense, 'id'>) => {
    const id = `expense_${Date.now()}`;
    const expense: Expense = {
      ...newExpense,
      id
    };
    try {
      await setDoc(doc(db, 'expenses', id), expense);
    } catch (e) {
      console.error("Error adding expense:", e);
    }
  };

  // Delete wrong/accidental expense
  const handleDeleteExpense = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'expenses', id));
    } catch (e) {
      console.error("Error deleting expense:", e);
    }
  };

  // Record a payment / fee collection contribution
  const handleAddContribution = async (playerId: string, amount: number, date: string, notes?: string) => {
    const targetPlayer = players.find(p => p.id === playerId);
    if (!targetPlayer) return;

    const logId = `log_${Date.now()}`;
    const newLog: PaymentLog = {
      id: logId,
      playerId,
      playerName: targetPlayer.name,
      amount,
      date,
      notes: notes || ''
    };

    try {
      await setDoc(doc(db, 'payment_logs', logId), newLog);
      await updateDoc(doc(db, 'players', playerId), {
        totalCollected: (targetPlayer.totalCollected || 0) + amount
      });
    } catch (e) {
      console.error("Error recording contribution:", e);
    }
  };

  // MATCH STATS & POLL MUTATIONS
  // Create fixture event
  const handleAddMatch = async (newMatch: Omit<Match, 'id' | 'poll'>) => {
    const id = `match_${Date.now()}`;
    const match: Match = {
      ...newMatch,
      id,
      poll: {}
    };
    try {
      await setDoc(doc(db, 'matches', id), match);
    } catch (e) {
      console.error("Error creating match:", e);
    }
  };

  // Update a single player's RSVP response
  const handleUpdatePoll = async (matchId: string, playerId: string, status: AvailabilityStatus) => {
    try {
      await updateDoc(doc(db, 'matches', matchId), {
        [`poll.${playerId}`]: status
      });
    } catch (e) {
      console.error("Error updating match poll response:", e);
    }
  };

  // Reset poll to blank undecided
  const handleClearPoll = async (matchId: string) => {
    try {
      await updateDoc(doc(db, 'matches', matchId), {
        poll: {}
      });
    } catch (e) {
      console.error("Error clearing match poll:", e);
    }
  };

  // Cancel upcoming game match row
  const handleDeleteMatch = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'matches', id));
    } catch (e) {
      console.error("Error cancelling match:", e);
    }
  };

  // SCORECARD MUTATIONS
  const handleUpdateMatchScorecard = async (matchId: string, scorecard: MatchScorecard) => {
    try {
      await updateDoc(doc(db, 'matches', matchId), {
        scorecard
      });
    } catch (e) {
      console.error("Error updating match stats scorecard:", e);
    }
  };

  // ROSTER SQUAD MUTATIONS
  // Add new player to registration board (Sign up can also trigger this)
  const handleAddPlayer = async (newPlayer: Omit<Player, 'id' | 'totalCollected'>) => {
    const id = `p_${Date.now()}`;
    const player: Player = {
      ...newPlayer,
      id,
      totalCollected: 0
    };
    try {
      await setDoc(doc(db, 'players', id), player);
    } catch (e) {
      console.error("Error adding squad player:", e);
    }
  };

  // Modify user name or jersey assignment
  const handleUpdatePlayer = async (id: string, updatedFields: Partial<Omit<Player, 'id' | 'totalCollected'>>) => {
    try {
      await updateDoc(doc(db, 'players', id), updatedFields);
    } catch (e) {
      console.error("Error updating squad player profile:", e);
    }
  };

  // Delete squad member entirely
  const handleDeletePlayer = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'players', id));
    } catch (e) {
      console.error("Error removing squad player:", e);
    }
  };

  // Reset whole storage to original preseeds
  const resetToFactoryDefault = async () => {
    if (confirm("Reset everything in cloud database? This wipes customized names, expenses logs, and responses.")) {
      try {
        for (const p of players) {
          await deleteDoc(doc(db, 'players', p.id));
        }
        for (const ex of expenses) {
          await deleteDoc(doc(db, 'expenses', ex.id));
        }
        for (const l of paymentLogs) {
          await deleteDoc(doc(db, 'payment_logs', l.id));
        }
        for (const m of matches) {
          await deleteDoc(doc(db, 'matches', m.id));
        }
        for (const t of tournaments) {
          await deleteDoc(doc(db, 'tournaments', t.id));
        }
        setCustomBallDutyId(null);
        setActiveTab2('FINANCES');
      } catch (err: any) {
        console.error("Error resetting Cloud Firestore database:", err);
      }
    }
  };

  // Handle Player Register and Login submitting First Name, Last Name, Role, and Mobile Number
  const handlePlayerRegisterAndLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const fName = playerFirstName.trim();
    const lName = playerLastName.trim();
    const role = playerRole;
    const mobile = playerMobile.replace(/\s+/g, '').trim();

    if (!fName || !lName || !mobile) {
      setErrorMsg('First Name, Last Name, and Mobile Number are mandatory!');
      return;
    }

    if (mobile.length < 8) {
      setErrorMsg('Please enter a valid mobile number (minimum 8 digits).');
      return;
    }

    const fullName = `${fName} ${lName}`;

    if (fName.toLowerCase() === 'mano' && mobile === '9566510045') {
      setErrorMsg('Mano is the Admin! Please use the designated Admin Login section below.');
      return;
    }

    // Lookup if player with this mobile exists in registered squad
    const existingPlayer = players.find(p => {
      if (!p.mobileNumber) return false;
      const cleanP = p.mobileNumber.replace(/\s+/g, '').trim();
      return cleanP === mobile;
    });

    if (existingPlayer) {
      // Existing player signs in securely
      setCurrentUser(existingPlayer);
      localStorage.setItem('cricket_logged_user', JSON.stringify(existingPlayer));
      
      // Clear inputs
      setPlayerFirstName('');
      setPlayerLastName('');
      setPlayerRole('Batsman');
      setPlayerMobile('');
    } else {
      // Create and register new player profile live
      const playerId = `p_${Date.now()}`;
      const newPlayer: Player = {
        id: playerId,
        name: fullName,
        role: role,
        totalCollected: 0,
        mobileNumber: mobile
      };

      try {
        await setDoc(doc(db, 'players', playerId), newPlayer);
        setCurrentUser(newPlayer);
        localStorage.setItem('cricket_logged_user', JSON.stringify(newPlayer));

        // Clear inputs
        setPlayerFirstName('');
        setPlayerLastName('');
        setPlayerRole('Batsman');
        setPlayerMobile('');
      } catch (err: any) {
        setErrorMsg(`Failed to register and login player: ${err.message || err}`);
      }
    }
  };

  // Handle Admin Access Portal Specifically for Club Chairman Mano only
  const handleAdminManoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanInputName = adminFirstName.trim().toLowerCase();
    const cleanInputMobile = adminMobile.replace(/\s+/g, '').trim();

    if (!cleanInputName || !cleanInputMobile) {
      setErrorMsg('Both Admin First Name and mobile number are required!');
      return;
    }

    if (cleanInputName === 'mano' && cleanInputMobile === '9566510045') {
      const manoAdmin: Player = {
        id: 'p0',
        name: 'Mano',
        jerseyNumber: '7',
        role: 'Club Chairman (Admin)',
        totalCollected: 250,
        mobileNumber: '9566510045'
      };

      try {
        if (!players.some(p => p.mobileNumber === '9566510045')) {
          await setDoc(doc(db, 'players', 'p0'), manoAdmin);
        }
        setCurrentUser(manoAdmin);
        localStorage.setItem('cricket_logged_user', JSON.stringify(manoAdmin));
        setAdminFirstName('Mano');
        setAdminMobile('');
      } catch (err: any) {
        setErrorMsg(`Admin authorization failed: ${err.message || err}`);
      }
    } else {
      setErrorMsg('Invalid Admin Access! This panel is restricted strictly for Mano only.');
    }
  };

  // Database Import handler ("shar the database for me")
  const handleImportDatabase = async (e: React.FormEvent) => {
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

      setDbStatus({ type: 'success', msg: 'importing records to firestore...' });

      // Save each to cloud database
      for (const p of parsed.players) {
        await setDoc(doc(db, 'players', p.id), p);
      }
      for (const ex of parsed.expenses) {
        await setDoc(doc(db, 'expenses', ex.id), ex);
      }
      for (const log of parsed.paymentLogs) {
        await setDoc(doc(db, 'payment_logs', log.id), log);
      }
      for (const m of parsed.matches) {
        await setDoc(doc(db, 'matches', m.id), m);
      }
      if (parsed.tournaments && Array.isArray(parsed.tournaments)) {
        for (const t of parsed.tournaments) {
          await setDoc(doc(db, 'tournaments', t.id), t);
        }
      }
      
      setDbShareInput('');
      setDbStatus({ type: 'success', msg: 'JSON Database successfully loaded and synced to Firestore!' });
    } catch (err: any) {
      setDbStatus({ type: 'error', msg: `Import aborted: ${err?.message || 'Invalid JSON format.'}` });
    }
  };

  // Live Sync tournaments update mapping
  const handleUpdateTournaments = async (updatedTournaments: Tournament[]) => {
    try {
      for (const t of updatedTournaments) {
        await setDoc(doc(db, 'tournaments', t.id), t);
      }
      // If any tournament is deleted in the updated, wipe it from Cloud
      const existingIds = updatedTournaments.map(t => t.id);
      const deletedTournaments = tournaments.filter(t => !existingIds.includes(t.id));
      for (const d of deletedTournaments) {
        await deleteDoc(doc(db, 'tournaments', d.id));
      }
    } catch (e) {
      console.error("Firestore error updating tournaments list: ", e);
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
              Enter your squad details below. New players will be registered instantly.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 bg-red-950/40 border border-red-500/20 text-red-300 rounded-xl text-xs flex items-start gap-2 animate-shake">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Unified Player Registration and Signed-In Portal */}
          <form onSubmit={handlePlayerRegisterAndLogin} className="space-y-4">
            <div className="space-y-3 text-left">
              <div className="grid grid-cols-2 gap-35">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 shadow-sm">
                    First Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Jasprit"
                    value={playerFirstName}
                    onChange={(e) => setPlayerFirstName(e.target.value)}
                    className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-indigo-400 transition"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 shadow-sm">
                    Last Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Bumrah"
                    value={playerLastName}
                    onChange={(e) => setPlayerLastName(e.target.value)}
                    className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-indigo-400 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 shadow-sm">
                  Player Role
                </label>
                <select
                  value={playerRole}
                  onChange={(e) => setPlayerRole(e.target.value)}
                  className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-indigo-400 transition cursor-pointer"
                >
                  <option value="Batsman">Batsman</option>
                  <option value="Bowler">Bowler</option>
                  <option value="All-Rounder">All-Rounder</option>
                  <option value="Wicket-Keeper">Wicket-Keeper</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 shadow-sm">
                  Mobile Number <span className="text-red-400">*</span>
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. 9000000030"
                  value={playerMobile}
                  onChange={(e) => setPlayerMobile(e.target.value)}
                  className="w-full text-xs font-mono bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-indigo-400 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold text-xs py-3.5 rounded-xl cursor-pointer transition shadow-lg hover:shadow-indigo-500/20 flex items-center justify-center gap-2 border border-indigo-500"
            >
              <UserCheck className="w-4 h-4" /> Enter Squad Portal
            </button>
          </form>

          {/* Secure Administration Control Center specifically for MANO */}
          <div className="border-t border-slate-800 pt-5 mt-4 text-left">
            <div className="flex items-center gap-2 mb-3">
              <Crown className="w-4 h-4 text-amber-500 animate-pulse animate-duration-1000" />
              <span className="text-xs font-extrabold text-amber-400 uppercase tracking-widest select-none">Mano Admin Control Gateway</span>
            </div>
            
            <form onSubmit={handleAdminManoSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-black text-amber-500/80 uppercase tracking-wider mb-1">Chairman Name</label>
                  <input
                    required
                    type="text"
                    placeholder="Mano"
                    value={adminFirstName}
                    onChange={(e) => setAdminFirstName(e.target.value)}
                    className="w-full text-xs bg-slate-950 border border-amber-950/40 rounded-xl p-2.5 text-white outline-none focus:border-amber-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-amber-500/80 uppercase tracking-wider mb-1">Admin Mobile</label>
                  <input
                    required
                    type="password"
                    placeholder="••••••••••••"
                    value={adminMobile}
                    onChange={(e) => setAdminMobile(e.target.value)}
                    className="w-full text-xs font-mono bg-slate-950 border border-amber-950/40 rounded-xl p-2.5 text-white outline-none focus:border-amber-500 transition"
                  />
                </div>
              </div>
              
              <button
                type="submit"
                className="w-full bg-amber-600/10 hover:bg-amber-655 active:scale-98 text-amber-400 hover:text-white font-extrabold text-[11px] py-2.5 rounded-xl cursor-pointer transition border border-amber-500/30 flex items-center justify-center gap-1.5 hover:shadow-lg hover:shadow-amber-500/10"
              >
                <Crown className="w-3.5 h-3.5" /> Access Administration (MANO Only)
              </button>
            </form>
          </div>

          {/* Quick Demo Directory Helper Toggle */}
          <div className="border-t border-slate-800/85 pt-4 text-center">
            <button
              type="button"
              onClick={() => setShowDemoLogins(!showDemoLogins)}
              className="text-[11px] text-slate-400 hover:text-indigo-400 font-semibold transition inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Database className="w-3.5 h-3.5" />
              {showDemoLogins ? "Hide Registered Squad Members" : "Show Registered Squad Members"}
            </button>

            <AnimatePresence>
              {showDemoLogins && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 text-left overflow-hidden bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 max-h-[190px] overflow-y-auto space-y-1.5"
                >
                  <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-wide border-b border-slate-800 pb-1">Signed-up roster directory (Autofill support)</p>
                  
                  {/* Mano Admin block fallback */}
                  <div 
                    onClick={() => { setAdminFirstName('Mano'); setAdminMobile('9566510045'); }}
                    className="p-1.5 px-2 text-[11px] rounded bg-amber-950/25 hover:bg-amber-900/35 text-amber-300 border border-amber-900/30 cursor-pointer flex justify-between items-center transition"
                  >
                    <span><strong>Mano (Club Chairman)</strong></span>
                    <span className="font-mono text-[10px] text-white font-bold">9566510045</span>
                  </div>

                  {players.length === 0 ? (
                    <p className="text-[10px] text-slate-500 italic p-2 text-center">No other squad players registered yet.</p>
                  ) : (
                    players.map(p => {
                      if (p.name === 'Mano') return null;
                      return (
                        <div 
                          key={p.id}
                          onClick={() => { 
                            const parts = p.name.split(' ');
                            setPlayerFirstName(parts[0] || '');
                            setPlayerLastName(parts.slice(1).join(' ') || '');
                            setPlayerRole(p.role || 'Batsman');
                            setPlayerMobile(p.mobileNumber || '');
                          }}
                          className="p-1.5 px-2 text-[11px] rounded bg-slate-900/40 hover:bg-slate-800/60 text-slate-300 border border-slate-850 cursor-pointer flex justify-between items-center transition"
                        >
                          <span className="truncate">{p.name} ({p.role || 'Player'})</span>
                          <span className="font-mono text-[10px] text-indigo-350">{p.mobileNumber || '9000000000'}</span>
                        </div>
                      );
                    })
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <p className="text-[10px] text-slate-650 mt-6 max-w-sm text-center font-sans tracking-wide">
          Cloud-persisted and real-time synchronized cricket club ledger. Authorized squad members only.
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
              onUpdateTournaments={handleUpdateTournaments}
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
