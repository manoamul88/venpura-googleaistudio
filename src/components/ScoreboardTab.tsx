import React, { useState, useMemo } from 'react';
import { Player, Match, MatchScorecard, BatsmanPerformance, BowlerPerformance } from '../types';
import { 
  Trophy, 
  Award, 
  Calendar, 
  User, 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Zap, 
  Flame, 
  Check, 
  AlertCircle,
  HelpCircle,
  PlusCircle,
  Clock,
  Sparkles,
  Search,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ScoreboardTabProps {
  players: Player[];
  matches: Match[];
  onUpdateMatchScorecard: (matchId: string, scorecard: MatchScorecard) => void;
  isAdmin?: boolean;
}

export default function ScoreboardTab({
  players,
  matches,
  onUpdateMatchScorecard,
  isAdmin = false
}: ScoreboardTabProps) {
  // State variables
  const [selectedMonth, setSelectedMonth] = useState<string>('all'); // 'all' or 'YYYY-MM'
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);
  
  // Analytics sub-view: "SUMMARY" or "STATS_LEADERBOARD"
  const [summaryView, setSummaryView] = useState<'WEEKLY_MONTHLY' | 'PLAYER_STATS'>('WEEKLY_MONTHLY');

  // Roster players map for lookup
  const playersMap = useMemo(() => {
    const map: { [id: string]: Player } = {};
    players.forEach(p => {
      map[p.id] = p;
    });
    return map;
  }, [players]);

  // Played matches (matches with a scorecard record)
  const playedMatches = useMemo(() => {
    return matches
      .filter(m => !!m.scorecard)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [matches]);

  // Match dates list to build month filter dropdown
  const availableMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    playedMatches.forEach(m => {
      const matchMonth = m.date.substring(0, 7); // 'YYYY-MM'
      monthsSet.add(matchMonth);
    });
    return Array.from(monthsSet).sort((a, b) => b.localeCompare(a));
  }, [playedMatches]);

  // Filtered played matches based on month
  const filteredPlayedMatches = useMemo(() => {
    if (selectedMonth === 'all') return playedMatches;
    return playedMatches.filter(m => m.date.startsWith(selectedMonth));
  }, [playedMatches, selectedMonth]);

  // 1. CALCULATE WEEKLY STARS
  // Defines "Latest Week" as matches played within the most recent 7 days of the latest match date
  const weeklyStars = useMemo(() => {
    if (playedMatches.length === 0) return null;
    
    // Find absolute latest match date
    const latestMatch = playedMatches[0];
    const latestDate = new Date(latestMatch.date);
    
    // Grab all matches played within 7 days prior to that latest date
    const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
    const latestWeekMatches = playedMatches.filter(m => {
      const mDate = new Date(m.date);
      const diff = latestDate.getTime() - mDate.getTime();
      return diff >= 0 && diff <= oneWeekMs;
    });

    // Find top batter, top bowler, and player of match from these matches
    let topBatterPerf: BatsmanPerformance | null = null;
    let topBatterMatchOpponent = '';
    
    let topBowlerPerf: BowlerPerformance | null = null;
    let topBowlerMatchOpponent = '';

    const potmCountMap: { [id: string]: number } = {};

    latestWeekMatches.forEach(m => {
      if (!m.scorecard) return;
      
      // Batting
      m.scorecard.batsmen.forEach(bat => {
        if (!topBatterPerf || bat.runs > topBatterPerf.runs) {
          topBatterPerf = bat;
          topBatterMatchOpponent = m.opponent;
        }
      });

      // Bowling
      m.scorecard.bowlers.forEach(bowl => {
        if (!topBowlerPerf || bowl.wickets > topBowlerPerf.wickets || 
           (bowl.wickets === topBowlerPerf.wickets && bowl.runsConceded < topBowlerPerf.runsConceded)) {
          topBowlerPerf = bowl;
          topBowlerMatchOpponent = m.opponent;
        }
      });

      // POTM tracker
      if (m.scorecard.playerOfTheMatchId) {
        potmCountMap[m.scorecard.playerOfTheMatchId] = (potmCountMap[m.scorecard.playerOfTheMatchId] || 0) + 1;
      }
    });

    // Find player with highest POTM in this week matches
    let weeklyPOTMId = '';
    let maxWeeklyPOTMs = 0;
    Object.entries(potmCountMap).forEach(([pid, count]) => {
      if (count > maxWeeklyPOTMs) {
        maxWeeklyPOTMs = count;
        weeklyPOTMId = pid;
      }
    });

    // Fallback to top batter if no POTM assigned
    if (!weeklyPOTMId && topBatterPerf) {
      weeklyPOTMId = (topBatterPerf as BatsmanPerformance).playerId;
    }

    return {
      weekDateStr: latestMatch.date,
      matchesPlayedCount: latestWeekMatches.length,
      topBatter: topBatterPerf ? {
        player: playersMap[topBatterPerf.playerId] || { name: topBatterPerf.playerName },
        runs: topBatterPerf.runs,
        balls: topBatterPerf.balls,
        opponent: topBatterMatchOpponent
      } : null,
      topBowler: topBowlerPerf ? {
        player: playersMap[topBowlerPerf.playerId] || { name: topBowlerPerf.playerName },
        wickets: topBowlerPerf.wickets,
        runsConceded: topBowlerPerf.runsConceded,
        overs: topBowlerPerf.overs,
        opponent: topBowlerMatchOpponent
      } : null,
      potm: weeklyPOTMId ? {
        player: playersMap[weeklyPOTMId] || null
      } : null
    };
  }, [playedMatches, playersMap]);


  // 2. CALCULATE MONTHLY STARS
  const monthlyStars = useMemo(() => {
    if (playedMatches.length === 0) return null;

    // Get current/selected month matches
    const monthKey = selectedMonth === 'all' 
      ? playedMatches[0].date.substring(0, 7) // newest month available
      : selectedMonth;

    const targetMatches = playedMatches.filter(m => m.date.startsWith(monthKey));
    if (targetMatches.length === 0) return null;

    // Aggregate stats per player for that month
    const playerBattingStats: { [id: string]: { runs: number; balls: number; fours: number; sixes: number; playerName: string } } = {};
    const playerBowlingStats: { [id: string]: { wickets: number; runsConceded: number; overs: number; playerName: string } } = {};
    const potmCountMap: { [id: string]: number } = {};

    targetMatches.forEach(m => {
      if (!m.scorecard) return;

      m.scorecard.batsmen.forEach(bat => {
        if (!playerBattingStats[bat.playerId]) {
          playerBattingStats[bat.playerId] = { runs: 0, balls: 0, fours: 0, sixes: 0, playerName: bat.playerName };
        }
        playerBattingStats[bat.playerId].runs += bat.runs;
        playerBattingStats[bat.playerId].balls += bat.balls;
        playerBattingStats[bat.playerId].fours += bat.fours;
        playerBattingStats[bat.playerId].sixes += bat.sixes;
      });

      m.scorecard.bowlers.forEach(bowl => {
        if (!playerBowlingStats[bowl.playerId]) {
          playerBowlingStats[bowl.playerId] = { wickets: 0, runsConceded: 0, overs: 0, playerName: bowl.playerName };
        }
        playerBowlingStats[bowl.playerId].wickets += bowl.wickets;
        playerBowlingStats[bowl.playerId].runsConceded += bowl.runsConceded;
        playerBowlingStats[bowl.playerId].overs += bowl.overs;
      });

      if (m.scorecard.playerOfTheMatchId) {
        potmCountMap[m.scorecard.playerOfTheMatchId] = (potmCountMap[m.scorecard.playerOfTheMatchId] || 0) + 1;
      }
    });

    // Sort batting to find winner
    const topBatterMonthlyDesc = Object.entries(playerBattingStats)
      .map(([pid, stats]) => ({ pid, ...stats }))
      .sort((a, b) => b.runs - a.runs)[0] || null;

    // Sort bowling to find winner
    const topBowlerMonthlyDesc = Object.entries(playerBowlingStats)
      .map(([pid, stats]) => ({ pid, ...stats }))
      .sort((a, b) => {
        if (b.wickets !== a.wickets) return b.wickets - a.wickets;
        return a.runsConceded - b.runsConceded; // lower runs conceded is better
      })[0] || null;

    // Sort POTM
    const topPOTMMonthlyDesc = Object.entries(potmCountMap)
      .map(([pid, count]) => ({ pid, count }))
      .sort((a, b) => b.count - a.count)[0] || null;

    // Visual formatting of Month name
    const monthLabelMap: { [key: string]: string } = {
      '01': 'January', '02': 'February', '03': 'March', '04': 'April',
      '05': 'May', '06': 'June', '07': 'July', '08': 'August',
      '09': 'September', '10': 'October', '11': 'November', '12': 'December'
    };
    const [yearPart, monthPart] = monthKey.split('-');
    const formattedMonthName = `${monthLabelMap[monthPart] || 'Month'} ${yearPart}`;

    return {
      monthLabel: formattedMonthName,
      matchesPlayedCount: targetMatches.length,
      topBatter: topBatterMonthlyDesc ? {
        player: playersMap[topBatterMonthlyDesc.pid] || { name: topBatterMonthlyDesc.playerName },
        runs: topBatterMonthlyDesc.runs,
        balls: topBatterMonthlyDesc.balls,
        fours: topBatterMonthlyDesc.fours,
        sixes: topBatterMonthlyDesc.sixes
      } : null,
      topBowler: topBowlerMonthlyDesc ? {
        player: playersMap[topBowlerMonthlyDesc.pid] || { name: topBowlerMonthlyDesc.playerName },
        wickets: topBowlerMonthlyDesc.wickets,
        runsConceded: topBowlerMonthlyDesc.runsConceded,
        overs: topBowlerMonthlyDesc.overs
      } : null,
      potm: topPOTMMonthlyDesc ? {
        player: playersMap[topPOTMMonthlyDesc.pid] || null,
        count: topPOTMMonthlyDesc.count
      } : null
    };
  }, [playedMatches, selectedMonth, playersMap]);


  // 3. AGGREGATED ALL-TIME / OVERALL SEASONS CAREER LEADERBOARDS
  const playerStatsLeaderboard = useMemo(() => {
    const list: { 
      [id: string]: {
        playerId: string;
        playerName: string;
        jerseyNumber?: string;
        role?: string;
        matchesPlayed: number;
        
        // Batting
        runsScored: number;
        ballsFaced: number;
        fours: number;
        sixes: number;
        highScore: number;
        inningsPlayed: number;
        notOutsCount: number;
        
        // Bowling
        oversBowled: number;
        maidensCount: number;
        runsConceded: number;
        wicketsTaken: number;
        bestBowlingWickets: number;
        bestBowlingRuns: number;

        // Awards
        potmAwardCount: number;
      }
    } = {};

    // Initialize all roster players
    players.forEach(p => {
      // Exclude admin if wanted, but generally we include whoever has played
      list[p.id] = {
        playerId: p.id,
        playerName: p.name,
        jerseyNumber: p.jerseyNumber,
        role: p.role,
        matchesPlayed: 0,
        runsScored: 0,
        ballsFaced: 0,
        fours: 0,
        sixes: 0,
        highScore: 0,
        inningsPlayed: 0,
        notOutsCount: 0,
        oversBowled: 0,
        maidensCount: 0,
        runsConceded: 0,
        wicketsTaken: 0,
        bestBowlingWickets: 0,
        bestBowlingRuns: 0,
        potmAwardCount: 0
      };
    });

    // Scan matches with scorecards
    playedMatches.forEach(m => {
      if (!m.scorecard) return;

      // Track who actually played this match by checking who is in batsmen or bowlers
      const playerInvolvedIds = new Set<string>();

      m.scorecard.batsmen.forEach(bat => {
        playerInvolvedIds.add(bat.playerId);
        
        // Check if player exists in list
        if (!list[bat.playerId]) {
          list[bat.playerId] = {
            playerId: bat.playerId,
            playerName: bat.playerName,
            matchesPlayed: 0,
            runsScored: 0,
            ballsFaced: 0,
            fours: 0,
            sixes: 0,
            highScore: 0,
            inningsPlayed: 0,
            notOutsCount: 0,
            oversBowled: 0,
            maidensCount: 0,
            runsConceded: 0,
            wicketsTaken: 0,
            bestBowlingWickets: 0,
            bestBowlingRuns: 0,
            potmAwardCount: 0
          };
        }

        const stats = list[bat.playerId];
        stats.runsScored += bat.runs;
        stats.ballsFaced += bat.balls;
        stats.fours += bat.fours;
        stats.sixes += bat.sixes;
        stats.inningsPlayed++;

        if (bat.runs > stats.highScore) {
          stats.highScore = bat.runs;
        }
        if (bat.outStatus === 'not out') {
          stats.notOutsCount++;
        }
      });

      m.scorecard.bowlers.forEach(bowl => {
        playerInvolvedIds.add(bowl.playerId);

        if (!list[bowl.playerId]) {
          list[bowl.playerId] = {
            playerId: bowl.playerId,
            playerName: bowl.playerName,
            matchesPlayed: 0,
            runsScored: 0,
            ballsFaced: 0,
            fours: 0,
            sixes: 0,
            highScore: 0,
            inningsPlayed: 0,
            notOutsCount: 0,
            oversBowled: 0,
            maidensCount: 0,
            runsConceded: 0,
            wicketsTaken: 0,
            bestBowlingWickets: 0,
            bestBowlingRuns: 0,
            potmAwardCount: 0
          };
        }

        const stats = list[bowl.playerId];
        stats.oversBowled += bowl.overs;
        stats.maidensCount += bowl.maidens;
        stats.runsConceded += bowl.runsConceded;
        stats.wicketsTaken += bowl.wickets;

        // Check Best Bowling figures
        if (bowl.wickets > stats.bestBowlingWickets) {
          stats.bestBowlingWickets = bowl.wickets;
          stats.bestBowlingRuns = bowl.runsConceded;
        } else if (bowl.wickets === stats.bestBowlingWickets && bowl.runsConceded < stats.bestBowlingRuns) {
          stats.bestBowlingRuns = bowl.runsConceded;
        }
      });

      // Award count
      if (m.scorecard.playerOfTheMatchId && list[m.scorecard.playerOfTheMatchId]) {
        list[m.scorecard.playerOfTheMatchId].potmAwardCount++;
      }

      playerInvolvedIds.forEach(pid => {
        if (list[pid]) {
          list[pid].matchesPlayed++;
        }
      });
    });

    return Object.values(list).filter(item => item.matchesPlayed > 0);
  }, [playedMatches, players]);


  // Sort stats based on custom selection inside Career Stats Sub-View
  const [careerTabSort, setCareerTabSort] = useState<'RUNS' | 'WICKETS' | 'POTM'>('RUNS');
  const sortedCareerStats = useMemo(() => {
    const data = [...playerStatsLeaderboard];
    if (careerTabSort === 'RUNS') {
      return data.sort((a, b) => b.runsScored - a.runsScored);
    } else if (careerTabSort === 'WICKETS') {
      return data.sort((a, b) => {
        if (b.wicketsTaken !== a.wicketsTaken) return b.wicketsTaken - a.wicketsTaken;
        return a.runsConceded - b.runsConceded;
      });
    } else {
      return data.sort((a, b) => b.potmAwardCount - a.potmAwardCount);
    }
  }, [playerStatsLeaderboard, careerTabSort]);


  // 4. ADMIN SCORECARD EDITOR PORTAL STATE
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
  
  // Local score editor inputs
  const [teamRuns, setTeamRuns] = useState<number>(150);
  const [teamWickets, setTeamWickets] = useState<number>(5);
  const [opponentRuns, setOpponentRuns] = useState<number>(140);
  const [opponentWickets, setOpponentWickets] = useState<number>(10);
  const [resultMsg, setResultMsg] = useState<string>('');
  const [potmId, setPotmId] = useState<string>('');
  const [bestBatId, setBestBatId] = useState<string>('');
  const [bestBowlId, setBestBowlId] = useState<string>('');

  // Batsman performance lists
  const [battingPerformances, setBattingPerformances] = useState<BatsmanPerformance[]>([]);
  const [bowlingPerformances, setBowlingPerformances] = useState<BowlerPerformance[]>([]);

  // Add individual row helper state variables
  const [tempBatId, setTempBatId] = useState<string>('');
  const [tempBatRuns, setTempBatRuns] = useState<string>('0');
  const [tempBatBalls, setTempBatBalls] = useState<string>('0');
  const [tempBat4s, setTempBat4s] = useState<string>('0');
  const [tempBat6s, setTempBat6s] = useState<string>('0');
  const [tempBatStatus, setTempBatStatus] = useState<BatsmanPerformance['outStatus']>('not out');

  const [tempBowlId, setTempBowlId] = useState<string>('');
  const [tempBowlOvers, setTempBowlOvers] = useState<string>('4.0');
  const [tempBowlMaidens, setTempBowlMaidens] = useState<string>('0');
  const [tempBowlRuns, setTempBowlRuns] = useState<string>('0');
  const [tempBowlWickets, setTempBowlWickets] = useState<string>('0');

  // Trigger editing modal
  const handleOpenScorecardEditor = (match: Match) => {
    setEditingMatchId(match.id);
    if (match.scorecard) {
      setTeamRuns(match.scorecard.teamRuns);
      setTeamWickets(match.scorecard.teamWickets);
      setOpponentRuns(match.scorecard.opponentRuns);
      setOpponentWickets(match.scorecard.opponentWickets);
      setResultMsg(match.scorecard.result);
      setPotmId(match.scorecard.playerOfTheMatchId || '');
      setBestBatId(match.scorecard.bestBatterId || '');
      setBestBowlId(match.scorecard.bestBowlerId || '');
      setBattingPerformances(match.scorecard.batsmen);
      setBowlingPerformances(match.scorecard.bowlers);
    } else {
      // Empty fresh draft
      setTeamRuns(120);
      setTeamWickets(5);
      setOpponentRuns(115);
      setOpponentWickets(10);
      setResultMsg(`Venpura CC won by ${10 - 5} wickets`);
      setPotmId('');
      setBestBatId('');
      setBestBowlId('');
      setBattingPerformances([]);
      setBowlingPerformances([]);
    }

    // Reset default temp selections to first player in list
    if (players.length > 0) {
      setTempBatId(players[0].id);
      setTempBowlId(players[0].id);
    }
  };

  const handleAddTempBatRow = () => {
    if (!tempBatId) return;
    const player = playersMap[tempBatId];
    if (!player) return;

    // Avoid duplicating player in scorecard batting
    if (battingPerformances.some(b => b.playerId === tempBatId)) {
      alert("This player's batting performance is already added! Edit or remove that first.");
      return;
    }

    const row: BatsmanPerformance = {
      playerId: tempBatId,
      playerName: player.name,
      runs: parseInt(tempBatRuns) || 0,
      balls: parseInt(tempBatBalls) || 0,
      fours: parseInt(tempBat4s) || 0,
      sixes: parseInt(tempBat6s) || 0,
      outStatus: tempBatStatus
    };

    setBattingPerformances(p => [...p, row]);
    
    // Auto populate awards suggestions if blank
    if (!bestBatId || battingPerformances.length === 0) {
      setBestBatId(tempBatId);
    }

    // Reset variables
    setTempBatRuns('0');
    setTempBatBalls('0');
    setTempBat4s('0');
    setTempBat6s('0');
    setTempBatStatus('not out');
  };

  const handleAddTempBowlRow = () => {
    if (!tempBowlId) return;
    const player = playersMap[tempBowlId];
    if (!player) return;

    if (bowlingPerformances.some(b => b.playerId === tempBowlId)) {
      alert("This player's bowling performance is already added!");
      return;
    }

    const row: BowlerPerformance = {
      playerId: tempBowlId,
      playerName: player.name,
      overs: parseFloat(tempBowlOvers) || 0,
      maidens: parseInt(tempBowlMaidens) || 0,
      runsConceded: parseInt(tempBowlRuns) || 0,
      wickets: parseInt(tempBowlWickets) || 0
    };

    setBowlingPerformances(p => [...p, row]);
    
    if (!bestBowlId || bowlingPerformances.length === 0) {
      setBestBowlId(tempBowlId);
    }

    setTempBowlOvers('4.0');
    setTempBowlMaidens('0');
    setTempBowlRuns('0');
    setTempBowlWickets('0');
  };

  const handleRemoveBatRow = (pid: string) => {
    setBattingPerformances(p => p.filter(item => item.playerId !== pid));
  };

  const handleRemoveBowlRow = (pid: string) => {
    setBowlingPerformances(p => p.filter(item => item.playerId !== pid));
  };

  // Submit complete scorecard back to store
  const handleSaveScorecard = () => {
    if (!editingMatchId) return;
    
    if (!resultMsg) {
      alert("Please enter a short match result text! (e.g. 'Venpura CC won by 6 wickets')");
      return;
    }

    const compiledScorecard: MatchScorecard = {
      teamRuns,
      teamWickets,
      opponentRuns,
      opponentWickets,
      result: resultMsg,
      batsmen: battingPerformances,
      bowlers: bowlingPerformances,
      playerOfTheMatchId: potmId || undefined,
      bestBatterId: bestBatId || undefined,
      bestBowlerId: bestBowlId || undefined
    };

    onUpdateMatchScorecard(editingMatchId, compiledScorecard);
    setEditingMatchId(null);
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* SECTION HEADER BLOCK */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800">
        <div className="space-y-1">
          <h2 className="text-xl font-display font-black text-white uppercase tracking-tight flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" /> CC Scoreboard & Performance Analytics
          </h2>
          <p className="text-xs text-slate-400">
            Real performance records of Venpura batsmen & bowlers. Track match results and honors dynamically.
          </p>
        </div>

        {/* View Switchers */}
        <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-800 shrink-0 text-xs font-bold font-sans">
          <button
            onClick={() => setSummaryView('WEEKLY_MONTHLY')}
            className={`px-3 py-1.5 rounded-lg transition duration-150 cursor-pointer ${summaryView === 'WEEKLY_MONTHLY' ? 'bg-indigo-650 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Weekly / Monthly Stars
          </button>
          <button
            onClick={() => setSummaryView('PLAYER_STATS')}
            className={`px-3 py-1.5 rounded-lg transition duration-150 cursor-pointer ${summaryView === 'PLAYER_STATS' ? 'bg-indigo-650 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Squad Career Leaders
          </button>
        </div>
      </div>

      {/* 1. HERO WEEKLY & MONTHLY PERFORMANCE BADGES SECTION */}
      {summaryView === 'WEEKLY_MONTHLY' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* WEEKLY REEL */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-5 rounded-3xl relative overflow-hidden flex flex-col justify-between min-h-[290px]">
            <div className="absolute right-0 top-0 w-36 h-36 bg-amber-500/5 blur-3xl pointer-events-none rounded-full" />
            <div className="absolute top-2 right-4 text-[10px] uppercase font-mono font-black text-amber-500/20">WEEKLY ACCONCOLADES</div>
            
            <div className="space-y-2">
              <span className="p-1 px-2.5 bg-amber-500/10 text-amber-405 border border-amber-500/20 text-[9px] font-black uppercase tracking-widest rounded-lg inline-flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Stars of the Match Week
              </span>
              <p className="text-xs text-slate-450 italic">
                Dynamic star performers based on played match scorecards in the most recent game cycle.
              </p>
            </div>

            {weeklyStars ? (
              <div className="grid grid-cols-3 gap-3.5 pt-4 border-t border-slate-850">
                
                {/* Weekly Batter */}
                <div className="flex flex-col items-center text-center space-y-2 p-2 bg-slate-950/40 rounded-xl border border-slate-850">
                  <div className="w-9 h-9 rounded-full bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center">
                    <Award className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <span className="text-[8px] font-bold text-indigo-400 uppercase tracking-wider block">Best Batter</span>
                    <h4 className="text-[11px] font-black text-white truncate max-w-[90px]">{weeklyStars.topBatter?.player.name || 'N/A'}</h4>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold block mt-0.5 mt-0.5">{weeklyStars.topBatter ? `${weeklyStars.topBatter.runs} Runs` : '0'}</span>
                    <span className="text-[8px] text-slate-500 truncate max-w-[85px] block">vs {weeklyStars.topBatter?.opponent || 'Opp'}</span>
                  </div>
                </div>

                {/* POTM */}
                <div className="flex flex-col items-center text-center space-y-2 p-2 bg-amber-500/5 rounded-xl border border-amber-500/10 scale-105 shadow-md">
                  <div className="w-10 h-10 rounded-full bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
                    <Trophy className="w-5.5 h-5.5 text-amber-400 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[8px] font-bold text-amber-400 uppercase tracking-widest block">Match POTM</span>
                    <h4 className="text-[11px] font-black text-white truncate max-w-[95px]">{weeklyStars.potm?.player?.name || 'In Progress'}</h4>
                    <span className="text-[8px] text-slate-400 block mt-0.5">{weeklyStars.potm?.player?.role || 'All-rounder'}</span>
                    <span className="text-[8px] font-bold text-yellow-300 font-mono block mt-1.5 uppercase">Match Star 👑</span>
                  </div>
                </div>

                {/* Weekly Bowler */}
                <div className="flex flex-col items-center text-center space-y-2 p-2 bg-slate-950/40 rounded-xl border border-slate-850">
                  <div className="w-9 h-9 rounded-full bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center">
                    <Flame className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <span className="text-[8px] font-bold text-rose-450 uppercase tracking-wider block">Best Bowler</span>
                    <h4 className="text-[11px] font-black text-white truncate max-w-[90px]">{weeklyStars.topBowler?.player.name || 'N/A'}</h4>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold block mt-0.5">{weeklyStars.topBowler ? `${weeklyStars.topBowler.wickets} Wkts` : '0'}</span>
                    <span className="text-[8px] text-slate-500 truncate max-w-[85px] block">vs {weeklyStars.topBowler?.opponent || 'Opp'}</span>
                  </div>
                </div>

              </div>
            ) : (
              <div className="p-4 py-8 bg-slate-950/20 text-center rounded-2xl border border-slate-850 flex flex-col items-center justify-center gap-2">
                <HelpCircle className="w-7 h-7 text-slate-500" />
                <span className="text-xs text-slate-400 font-medium">No played match scorecards recorded in this cycle.</span>
              </div>
            )}

            <div className="pt-2.5 text-[9px] text-slate-500 font-mono border-t border-slate-900 flex justify-between items-center mt-3">
              <span>Dynamic auto calculation</span>
              <span>Based on latest {weeklyStars?.matchesPlayedCount || 0} fixtures</span>
            </div>
          </div>

          {/* MONTHLY REEL */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-5 rounded-3xl relative overflow-hidden flex flex-col justify-between min-h-[290px]">
            <div className="absolute right-0 top-0 w-36 h-36 bg-indigo-500/5 blur-3xl pointer-events-none rounded-full" />
            <div className="absolute top-2 right-4 text-[10px] uppercase font-mono font-black text-indigo-500/20">MONTHLY SUMMARY</div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="p-1 px-2.5 bg-indigo-500/10 text-indigo-350 border border-indigo-500/20 text-[9px] font-black uppercase tracking-widest rounded-lg inline-flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Club Legends of the Month
                </span>
                
                {/* Month Selector Mini Dropdown */}
                {availableMonths.length > 0 && (
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="text-[10px] bg-slate-950 border border-slate-800 rounded-lg text-slate-300 px-1.5 py-1 outline-none font-bold"
                  >
                    <option value="all" className="bg-slate-950">Show Newest Month</option>
                    {availableMonths.map(mon => (
                      <option key={mon} value={mon} className="bg-slate-950">{mon}</option>
                    ))}
                  </select>
                )}
              </div>
              <p className="text-xs text-slate-450 italic">
                Aggregated statistics and awards for our squad computed purely on a month-by-month timeline.
              </p>
            </div>

            {monthlyStars ? (
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-850 text-xs">
                
                {/* Month Batter */}
                <div className="flex items-center gap-2.5 p-2 bg-slate-950/40 rounded-xl border border-slate-850">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0">
                    <Award className="w-4.5 h-4.5 text-indigo-400" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[8px] font-bold text-indigo-400 uppercase tracking-wider block">Batter of Month</span>
                    <h4 className="font-bold text-white truncate text-[11px]">{monthlyStars.topBatter?.player.name || 'N/A'}</h4>
                    <span className="font-mono text-[10px] text-emerald-400 font-bold block">{monthlyStars.topBatter ? `${monthlyStars.topBatter.runs} Total Runs` : '0 runs'}</span>
                  </div>
                </div>

                {/* Month Bowler */}
                <div className="flex items-center gap-2.5 p-2 bg-slate-950/40 rounded-xl border border-slate-850">
                  <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                    <Flame className="w-4.5 h-4.5 text-red-400" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[8px] font-bold text-rose-450 uppercase tracking-wider block">Bowler of Month</span>
                    <h4 className="font-bold text-white truncate text-[11px]">{monthlyStars.topBowler?.player.name || 'N/A'}</h4>
                    <span className="font-mono text-[10px] text-emerald-400 font-bold block">{monthlyStars.topBowler ? `${monthlyStars.topBowler.wickets} Wickets` : '0 wickets'}</span>
                  </div>
                </div>

                {/* Month POTM Leader */}
                <div className="flex items-center gap-2.5 p-2 bg-amber-500/5 rounded-xl border border-amber-500/10 col-span-2">
                  <div className="w-8 h-8 rounded-full bg-amber-550/10 flex items-center justify-center shrink-0">
                    <Trophy className="w-4.5 h-4.5 text-amber-400" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[8px] font-bold text-amber-450 uppercase tracking-widest block">Most Valued Player (MVP POTMs)</span>
                    <h4 className="font-bold text-white truncate text-[11px]">{monthlyStars.potm?.player?.name || 'Shared Honors'}</h4>
                    <span className="font-mono text-[10px] text-indigo-350">{monthlyStars.potm ? `${monthlyStars.potm.count} player of the match awards in ${monthlyStars.monthLabel}` : `1 award`}</span>
                  </div>
                </div>

              </div>
            ) : (
              <div className="p-4 py-8 bg-slate-950/20 text-center rounded-2xl border border-slate-850 flex flex-col items-center justify-center gap-2">
                <HelpCircle className="w-7 h-7 text-slate-500" />
                <span className="text-xs text-slate-400 font-medium font-sans">No played match scorecards recorded in this selected month.</span>
              </div>
            )}

            <div className="pt-2.5 text-[9px] text-slate-500 font-mono border-t border-slate-900 flex justify-between items-center mt-3">
              <span>Active Period: {monthlyStars?.monthLabel || 'N/A'}</span>
              <span>Based on {monthlyStars?.matchesPlayedCount || 0} fixtures</span>
            </div>
          </div>

        </div>
      )}

      {/* 2. CAREER INDIVIDUAL LEADERS TAB PANEL */}
      {summaryView === 'PLAYER_STATS' && (
        <div id="player-all-time-careers" className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-white text-sm font-bold uppercase tracking-wider flex items-center gap-1">
                <Award className="w-4 h-4 text-indigo-400" /> Squad Career Performance Stats
              </h3>
              <p className="text-slate-450 text-xs mt-0.5">Aggregated individual statistics of batting and bowling contributions in matches played.</p>
            </div>

            {/* Metric select */}
            <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-850 text-[10px] font-bold font-sans">
              <button 
                onClick={() => setCareerTabSort('RUNS')}
                className={`p-1 px-2.5 rounded transition ${careerTabSort === 'RUNS' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Top Runs
              </button>
              <button 
                onClick={() => setCareerTabSort('WICKETS')}
                className={`p-1 px-2.5 rounded transition ${careerTabSort === 'WICKETS' ? 'bg-indigo-650 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Top Wickets
              </button>
              <button 
                onClick={() => setCareerTabSort('POTM')}
                className={`p-1 px-2.5 rounded transition ${careerTabSort === 'POTM' ? 'bg-indigo-650 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                POTMs
              </button>
            </div>
          </div>

          <div className="overflow-x-auto select-none border border-slate-850 rounded-xl bg-slate-950/30">
            <table className="w-full text-xs text-left text-slate-355">
              <thead className="bg-slate-950 text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-850">
                <tr>
                  <th className="py-2.5 px-4">Player</th>
                  <th className="py-2.5 px-3 text-center">Matches</th>
                  <th className="py-2.5 px-3 text-right text-indigo-300">Innings</th>
                  <th className="py-2.5 px-3 text-right">Runs</th>
                  <th className="py-2.5 px-3 text-right">High Score</th>
                  <th className="py-2.5 px-3 text-right">Bat S/R</th>
                  <th className="py-2.5 px-3 text-right">Overs</th>
                  <th className="py-2.5 px-3 text-right text-rose-400">Wickets</th>
                  <th className="py-2.5 px-3 text-right">Bowl Econ</th>
                  <th className="py-2.5 px-4 text-right text-amber-400">POTMs</th>
                </tr>
              </thead>
              <tbody>
                {sortedCareerStats.length > 0 ? (
                  sortedCareerStats.map((item, idx) => {
                    const strikeRate = item.ballsFaced > 0 ? Math.round((item.runsScored / item.ballsFaced) * 100) : 0;
                    const econ = item.oversBowled > 0 ? parseFloat((item.runsConceded / item.oversBowled).toFixed(2)) : 0;
                    return (
                      <tr key={idx} className="border-b border-slate-850 hover:bg-slate-900/60 transition font-sans">
                        <td className="py-3 px-4 font-bold text-white flex items-center gap-1.5">
                          {idx === 0 && <span className="text-amber-500 font-mono">👑</span>}
                          {item.playerName}
                          <span className="text-[10px] font-mono text-slate-500">#{item.jerseyNumber || '?'}</span>
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-slate-300">{item.matchesPlayed}</td>
                        <td className="py-3 px-3 text-right text-indigo-300">{item.inningsPlayed}</td>
                        <td className="py-3 px-3 text-right font-black text-slate-200">{item.runsScored}</td>
                        <td className="py-3 px-3 text-right font-mono">{item.highScore}{item.notOutsCount > 0 ? '*' : ''}</td>
                        <td className="py-3 px-3 text-right font-mono text-indigo-400 font-bold">{strikeRate > 0 ? `${strikeRate}%` : '0%'}</td>
                        <td className="py-3 px-3 text-right font-mono text-slate-450">{item.oversBowled.toFixed(1)}</td>
                        <td className="py-3 px-3 text-right font-black text-rose-400">{item.wicketsTaken}</td>
                        <td className="py-3 px-3 text-right font-mono text-slate-355">{econ > 0 ? econ : '0.00'}</td>
                        <td className="py-3 px-4 text-right">
                          {item.potmAwardCount > 0 ? (
                            <span className="p-1 px-2.5 bg-amber-500/10 border border-amber-500/20 rounded font-black text-[10px] text-amber-400 inline-block">
                              🏆 {item.potmAwardCount}
                            </span>
                          ) : (
                            <span className="text-slate-700 font-sans">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={10} className="text-center py-6 text-slate-500 text-xs font-sans">
                      No matching records found. Please write match scorecards in the Matches section or complete a scorecard below.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}


      {/* 3. LIST OF SCORED MATCHES & DRAFT FIXTURES */}
      <div id="played-matches-scorecards" className="grid grid-cols-1 gap-4 text-left">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-4.5 h-4.5 text-indigo-400" /> Match Scorecards & Play History
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Click any match record to view complete squad batsmen, bowling stats & honors.</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 uppercase font-mono font-bold">Filter Month</span>
            {availableMonths.length > 0 && (
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-300 p-1.5 outline-none font-bold focus:border-indigo-550"
              >
                <option value="all" className="bg-slate-950">All Played Months</option>
                {availableMonths.map(mon => (
                  <option key={mon} value={mon} className="bg-slate-950">{mon}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Dynamic scorecards loop listings */}
        <div className="space-y-4">
          {matches.map(m => {
            const hasScorecard = !!m.scorecard;
            const isExpanded = expandedMatchId === m.id;

            return (
              <div 
                key={m.id} 
                className={`bg-slate-900 border rounded-2xl p-4 transition-all duration-200 relative ${
                  hasScorecard 
                    ? 'border-slate-800 hover:border-slate-750' 
                    : 'border-slate-850/50 bg-slate-900/40 opacity-70 border-dashed'
                }`}
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="p-1 px-2.5 bg-slate-950 text-slate-400 font-mono text-[9px] uppercase tracking-wider rounded-lg border border-slate-850">
                        🗓️ {m.date}
                      </span>
                      <span className="p-1 px-2.5 bg-indigo-500/10 text-indigo-300 font-bold text-[9px] uppercase tracking-wider rounded-lg border border-indigo-500/15">
                        {m.format} Game
                      </span>
                      {hasScorecard ? (
                        <span className="p-1 px-2.5 bg-emerald-500/15 text-emerald-400 font-black text-[9px] uppercase tracking-wider rounded-lg border border-emerald-500/25 flex items-center gap-1 shrink-0">
                          <Check className="w-3 h-3" /> Scorecard Saved
                        </span>
                      ) : (
                        <span className="p-1 px-2.5 bg-slate-800/40 text-slate-500 font-bold text-[9px] uppercase tracking-wider rounded-lg border border-slate-800 flex items-center gap-1 shrink-0">
                          <Clock className="w-3 h-3 text-slate-550" /> Scheduled Fixture
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-black text-white uppercase mt-1">
                      Venpura CC <span className="text-slate-550 lowercase font-normal italic">vs</span> {m.opponent}
                    </h4>
                    <p className="text-xs text-slate-400">{m.venue} • {m.time}</p>
                  </div>

                  {/* Summary outcome bubble */}
                  {hasScorecard ? (
                    <div className="flex items-center gap-4 shrink-0 w-full md:w-auto text-left md:text-right md:justify-end">
                      <div className="space-y-0.5">
                        <div className="text-[10px] text-slate-505 uppercase tracking-widest font-mono font-bold">Match Outcome</div>
                        <p className="text-xs font-black text-amber-450 uppercase">{m.scorecard?.result}</p>
                        <p className="text-xs text-white font-bold font-mono">
                          VCC: {m.scorecard?.teamRuns}/{m.scorecard?.teamWickets} <span className="text-slate-600">vs</span> OPP: {m.scorecard?.opponentRuns}/{m.scorecard?.opponentWickets}
                        </p>
                      </div>

                      <button
                        onClick={() => setExpandedMatchId(isExpanded ? null : m.id)}
                        className="p-2 bg-slate-950 hover:bg-slate-850 border border-slate-850 rounded-xl transition cursor-pointer shrink-0 inline-flex items-center gap-1 text-xs font-bold text-slate-300 hover:text-white"
                      >
                        {isExpanded ? "Hide Details" : "View Scorecard"}
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-indigo-400" /> : <ChevronDown className="w-4 h-4 text-indigo-400" />}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 shrink-0 uppercase tracking-wider">
                      {isAdmin ? (
                        <button
                          onClick={() => handleOpenScorecardEditor(m)}
                          className="px-4 py-2 bg-indigo-650 hover:bg-indigo-700 active:scale-98 text-white font-bold text-xs rounded-xl cursor-pointer transition shadow border border-indigo-500 flex items-center gap-1"
                        >
                          <PlusCircle className="w-4 h-4 shrink-0" /> Input Scorecard
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-500 italic font-mono">Scorecard input active post match</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Scorecard Detailed Accordion Box */}
                {hasScorecard && isExpanded && m.scorecard && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="border-t border-slate-800/80 mt-4 pt-4 space-y-5 overflow-hidden"
                  >
                    
                    {/* ACCORDION HEADER BLOCK */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      
                      {/* Player Of Match */}
                      {m.scorecard.playerOfTheMatchId && (
                        <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-amber-500/15 border border-amber-500/25 flex items-center justify-center shrink-0">
                            <Trophy className="w-5 h-5 text-amber-400" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[8px] font-bold text-amber-400 uppercase tracking-widest block">Player of match</span>
                            <h5 className="text-[11px] font-black text-white truncate">
                              {playersMap[m.scorecard.playerOfTheMatchId]?.name || 'Cricket Player'}
                            </h5>
                            <span className="text-[9px] text-slate-400 font-mono block">Jersey #{playersMap[m.scorecard.playerOfTheMatchId]?.jerseyNumber || 'N/A'}</span>
                          </div>
                        </div>
                      )}

                      {/* Best Batter */}
                      {m.scorecard.bestBatterId && (
                        <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl flex items-center gap-3 w-full">
                          <div className="w-9 h-9 rounded-full bg-indigo-550/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                            <Award className="w-5 h-5 text-indigo-400" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[8px] font-bold text-indigo-400 uppercase tracking-widest block">Best Batter Award</span>
                            <h5 className="text-[11px] font-black text-white truncate">
                              {playersMap[m.scorecard.bestBatterId]?.name || 'Cricket Player'}
                            </h5>
                            <span className="text-[9px] text-slate-400 font-mono block">Jersey #{playersMap[m.scorecard.bestBatterId]?.jerseyNumber || 'N/A'}</span>
                          </div>
                        </div>
                      )}

                      {/* Best Bowler */}
                      {m.scorecard.bestBowlerId && (
                        <div className="p-3 bg-indigo-500/5 border border-indigo-505/10 rounded-xl flex items-center gap-3 w-full">
                          <div className="w-9 h-9 rounded-full bg-indigo-550/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                            <Flame className="w-5 h-5 text-red-400" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[8px] font-bold text-rose-450 uppercase tracking-widest block">Best Bowler Award</span>
                            <h5 className="text-[11px] font-black text-white truncate">
                              {playersMap[m.scorecard.bestBowlerId]?.name || 'Cricket Player'}
                            </h5>
                            <span className="text-[9px] text-slate-400 font-mono block">Jersey #{playersMap[m.scorecard.bestBowlerId]?.jerseyNumber || 'N/A'}</span>
                          </div>
                        </div>
                      )}

                    </div>

                    {/* SCORECARD DATA TABLES GRIDS */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 font-sans select-none">
                      
                      {/* BATTING SCORECARD */}
                      <div className="space-y-2 text-left">
                        <div className="flex justify-between items-center bg-slate-950 p-2 px-3 rounded-lg border border-slate-850">
                          <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-wider">🏏 Batting Scorecard (Venpura CC)</h5>
                          <span className="text-[10px] text-slate-500 font-mono">{m.scorecard.batsmen.length} Batter Innings</span>
                        </div>

                        <div className="overflow-x-auto border border-slate-850 rounded-xl">
                          <table className="w-full text-[11px] text-left text-slate-300">
                            <thead className="bg-slate-950/60 text-[9px] text-slate-500 uppercase tracking-wider border-b border-slate-850">
                              <tr>
                                <th className="py-2 px-3">Batsman</th>
                                <th className="py-2 px-2">How Out</th>
                                <th className="py-2 px-2 text-right">Runs</th>
                                <th className="py-2 px-2 text-right">Balls</th>
                                <th className="py-2 px-2 text-right">4s</th>
                                <th className="py-2 px-2 text-right">6s</th>
                                <th className="py-2 px-3 text-right">S/R</th>
                              </tr>
                            </thead>
                            <tbody>
                              {m.scorecard.batsmen.map((b, i) => {
                                const sr = b.balls > 0 ? Math.round((b.runs / b.balls) * 100) : 0;
                                return (
                                  <tr key={i} className="border-b border-slate-850 hover:bg-slate-950/40 transition">
                                    <td className="py-2 px-3 font-bold text-white">
                                      {b.playerName}
                                      {m.scorecard?.bestBatterId === b.playerId && <span className="text-indigo-400 ml-1 text-[10px]" title="Best Batter of Match">🏏</span>}
                                    </td>
                                    <td className="py-2 px-2 text-slate-400 italic font-medium">{b.outStatus}</td>
                                    <td className="py-2 px-2 text-right font-black text-amber-400">{b.runs}</td>
                                    <td className="py-2 px-2 text-right font-mono text-slate-450">{b.balls}</td>
                                    <td className="py-2 px-2 text-right font-mono text-slate-350">{b.fours}</td>
                                    <td className="py-2 px-2 text-right font-mono text-slate-350">{b.sixes}</td>
                                    <td className="py-2 px-3 text-right font-mono font-bold text-indigo-400">{sr}%</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* BOWLING SCORECARD */}
                      <div className="space-y-2 text-left">
                        <div className="flex justify-between items-center bg-slate-950 p-2 px-3 rounded-lg border border-slate-850">
                          <h5 className="text-[10px] font-black text-rose-400 uppercase tracking-wider">🍒 Bowling Scorecard</h5>
                          <span className="text-[10px] text-slate-500 font-mono">{m.scorecard.bowlers.length} Bowler Figures</span>
                        </div>

                        <div className="overflow-x-auto border border-slate-850 rounded-xl">
                          <table className="w-full text-[11px] text-left text-slate-300">
                            <thead className="bg-slate-950/60 text-[9px] text-slate-500 uppercase tracking-wider border-b border-slate-850">
                              <tr>
                                <th className="py-2 px-3">Bowler</th>
                                <th className="py-2 px-2 text-center">Overs</th>
                                <th className="py-2 px-2 text-center">Mdn</th>
                                <th className="py-2 px-2 text-right">Runs Conceded</th>
                                <th className="py-2 px-2 text-right text-rose-455">Wickets</th>
                                <th className="py-2 px-3 text-right">Econ</th>
                              </tr>
                            </thead>
                            <tbody>
                              {m.scorecard.bowlers.map((b, i) => {
                                const econ = b.overs > 0 ? (b.runsConceded / b.overs).toFixed(2) : '0.00';
                                return (
                                  <tr key={i} className="border-b border-slate-850 hover:bg-slate-950/40 transition">
                                    <td className="py-2 px-3 font-bold text-white">
                                      {b.playerName}
                                      {m.scorecard?.bestBowlerId === b.playerId && <span className="text-red-400 ml-1 text-[10px]" title="Best Bowler of Match">🍒</span>}
                                    </td>
                                    <td className="py-2 px-2 text-center font-mono text-slate-400">{b.overs.toFixed(1)}</td>
                                    <td className="py-2 px-2 text-center font-mono text-slate-450">{b.maidens}</td>
                                    <td className="py-2 px-2 text-right font-mono text-slate-300">{b.runsConceded}</td>
                                    <td className="py-2 px-2 text-right font-black text-emerald-400">{b.wickets}</td>
                                    <td className="py-2 px-3 text-right font-mono text-slate-400 font-semibold">{econ}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>

                    </div>

                    {/* Admin Modify Buttons */}
                    {isAdmin && (
                      <div className="pt-3 border-t border-slate-850 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleOpenScorecardEditor(m)}
                          className="text-xs bg-slate-950 border border-slate-800 hover:border-indigo-500 hover:text-white px-3 py-1.5 rounded-lg text-indigo-300 font-semibold cursor-pointer transition flex items-center gap-1"
                        >
                          Modify / Override Scorecard
                        </button>
                      </div>
                    )}

                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </div>


      {/* 4. ADMIN MODAL DIALOG / PORTAL FOR WRITING SCORECARDS */}
      <AnimatePresence>
        {editingMatchId !== null && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-max flex justify-center items-center p-4 overflow-y-auto select-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative space-y-5 max-h-[88vh] overflow-y-auto mt-6"
            >
              
              {/* Header */}
              <div className="pb-3 border-b border-slate-800 flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-400" /> Compile Scorecard (Mano Admin Panel)
                  </h3>
                  <p className="text-[11px] text-slate-450 mt-0.5">
                    Match with: <strong className="text-white">{matches.find(m => m.id === editingMatchId)?.opponent || 'Opponent'}</strong> • Date: {matches.find(m => m.id === editingMatchId)?.date}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingMatchId(null)}
                  className="p-1 px-2.5 text-xs text-slate-400 hover:text-white bg-slate-950/60 rounded-lg cursor-pointer border border-slate-800"
                >
                  Close
                </button>
              </div>

              {/* CORE TEAM SCORE PANEL */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-850 font-sans">
                
                <div className="md:col-span-5 space-y-3.5">
                  <h5 className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Team Runs Sums</h5>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Venpura CC runs</label>
                      <input 
                        type="number" 
                        value={teamRuns} 
                        onChange={(e) => setTeamRuns(parseInt(e.target.value) || 0)}
                        className="w-full text-xs bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Venpura Wickets</label>
                      <input 
                        type="number" 
                        min="0" max="10"
                        value={teamWickets} 
                        onChange={(e) => setTeamWickets(parseInt(e.target.value) || 0)}
                        className="w-full text-xs bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Opponent runs</label>
                      <input 
                        type="number" 
                        value={opponentRuns} 
                        onChange={(e) => setOpponentRuns(parseInt(e.target.value) || 0)}
                        className="w-full text-xs bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Opponent Wickets</label>
                      <input 
                        type="number" 
                        min="0" max="10"
                        value={opponentWickets} 
                        onChange={(e) => setOpponentWickets(parseInt(e.target.value) || 0)}
                        className="w-full text-xs bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="md:col-span-7 space-y-3">
                  <h5 className="text-[10px] font-bold text-slate-455 uppercase tracking-widest block">Summary & Select Awards</h5>
                  
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1.5 flex items-center justify-between">
                      <span>Match Result Text Description</span>
                      <button 
                        type="button" 
                        onClick={() => {
                          const oppName = matches.find(m => m.id === editingMatchId)?.opponent || 'Opponent';
                          if (teamRuns > opponentRuns) {
                            setResultMsg(`Venpura CC won by ${teamRuns - opponentRuns} runs`);
                          } else if (opponentRuns > teamRuns) {
                            setResultMsg(`${oppName} won by ${opponentRuns - teamRuns} runs`);
                          } else {
                            setResultMsg('Match Tied');
                          }
                        }}
                        className="text-[9px] text-indigo-400 hover:underline font-semibold"
                      >
                        Auto-generate Result
                      </button>
                    </label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. Venpura CC won by 6 wickets"
                      value={resultMsg} 
                      onChange={(e) => setResultMsg(e.target.value)}
                      className="w-full text-xs bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-indigo-455"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[9px] font-bold text-amber-400 uppercase mb-1">Match POTM 🏆</label>
                      <select
                        value={potmId}
                        onChange={(e) => setPotmId(e.target.value)}
                        className="w-full text-[10px] bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-300"
                      >
                        <option value="">-- Choose --</option>
                        {players.map(p => (
                          <option key={p.id} value={p.id} className="bg-slate-950">{p.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-indigo-400 uppercase mb-1">Best Batter 🏏</label>
                      <select
                        value={bestBatId}
                        onChange={(e) => setBestBatId(e.target.value)}
                        className="w-full text-[10px] bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-300"
                      >
                        <option value="">-- Choose --</option>
                        {players.map(p => (
                          <option key={p.id} value={p.id} className="bg-slate-950">{p.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-rose-450 uppercase mb-1">Best Bowler 🍒</label>
                      <select
                        value={bestBowlId}
                        onChange={(e) => setBestBowlId(e.target.value)}
                        className="w-full text-[10px] bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-300"
                      >
                        <option value="">-- Choose --</option>
                        {players.map(p => (
                          <option key={p.id} value={p.id} className="bg-slate-950">{p.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                </div>

              </div>

              {/* DYNAMIC RECORD BATSMEN TABLE */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 font-sans">
                
                {/* BATTS EDIT BOARD */}
                <div className="space-y-3 p-4 bg-slate-950/40 rounded-2xl border border-slate-800/80">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                    <h5 className="text-[10px] uppercase font-black text-indigo-300 flex items-center gap-1.5">
                      🏏 Input Batsman Performance
                    </h5>
                    <span className="text-[9px] text-slate-450 font-mono italic">{battingPerformances.length} added</span>
                  </div>

                  {/* Add Temp fields form panel */}
                  <div className="grid grid-cols-12 gap-2 items-end pt-1 bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                    <div className="col-span-4">
                      <label className="block text-[8px] uppercase text-slate-450 font-bold mb-1">Pick Player</label>
                      <select
                        value={tempBatId}
                        onChange={(e) => setTempBatId(e.target.value)}
                        className="w-full text-[10px] bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-300 outline-none"
                      >
                        {players.map(p => (
                          <option key={p.id} value={p.id} className="bg-slate-950">{p.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-2">
                      <label className="block text-[8px] uppercase text-slate-450 font-bold mb-1">Runs</label>
                      <input 
                        type="number" min="0"
                        value={tempBatRuns} 
                        onChange={(e) => setTempBatRuns(e.target.value)}
                        className="w-full text-[10px] bg-slate-900 border border-slate-800 rounded p-1 text-white text-center"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-[8px] uppercase text-slate-450 font-bold mb-1">Balls</label>
                      <input 
                        type="number" min="0"
                        value={tempBatBalls} 
                        onChange={(e) => setTempBatBalls(e.target.value)}
                        className="w-full text-[10px] bg-slate-900 border border-slate-800 rounded p-1 text-white text-center"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-[8px] uppercase text-slate-450 font-bold mb-1">4s / 6s</label>
                      <div className="flex gap-1">
                        <input 
                          type="number" min="0" placeholder="4"
                          value={tempBat4s} 
                          onChange={(e) => setTempBat4s(e.target.value)}
                          className="w-full text-[10px] bg-slate-900 border border-slate-800 rounded p-1 text-white text-center text-[9px]"
                        />
                        <input 
                          type="number" min="0" placeholder="6"
                          value={tempBat6s} 
                          onChange={(e) => setTempBat6s(e.target.value)}
                          className="w-full text-[10px] bg-slate-900 border border-slate-800 rounded p-1 text-white text-center text-[9px]"
                        />
                      </div>
                    </div>

                    <div className="col-span-2">
                      <button
                        type="button"
                        onClick={handleAddTempBatRow}
                        className="w-full p-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] rounded cursor-pointer transition flex items-center justify-center"
                        title="Add batting innings"
                      >
                        <Plus className="w-3.5 h-3.5" /> Post
                      </button>
                    </div>

                    <div className="col-span-12">
                      <label className="block text-[8px] uppercase text-slate-400 font-bold mb-1">Out Dismissal Type State</label>
                      <select
                        value={tempBatStatus}
                        onChange={(e) => setTempBatStatus(e.target.value as BatsmanPerformance['outStatus'])}
                        className="w-full text-[9px] bg-slate-900 border border-slate-800 rounded p-1 text-slate-300"
                      >
                        <option value="not out">not out</option>
                        <option value="bowled">bowled</option>
                        <option value="caught">caught</option>
                        <option value="lbw">lbw</option>
                        <option value="run out">run out</option>
                        <option value="stumped">stumped</option>
                        <option value="did not bat">did not bat</option>
                      </select>
                    </div>
                  </div>

                  {/* Active List output */}
                  <div className="border border-slate-850 rounded-xl overflow-hidden max-h-[190px] overflow-y-auto">
                    <table className="w-full text-[10px] text-left text-slate-300 bg-slate-950/20">
                      <thead className="bg-slate-950 text-[9px] text-slate-500 uppercase tracking-wider">
                        <tr>
                          <th className="py-1 px-2">Player</th>
                          <th className="py-1 px-1">How Out</th>
                          <th className="py-1 px-1 text-right">Runs</th>
                          <th className="py-1 px-1 text-right">Balls</th>
                          <th className="py-1 px-2 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {battingPerformances.length > 0 ? (
                          battingPerformances.map((b, idx) => (
                            <tr key={idx} className="border-b border-slate-850/60 hover:bg-slate-900/45">
                              <td className="py-1.5 px-2 font-bold text-white max-w-[100px] truncate">{b.playerName}</td>
                              <td className="py-1.5 px-1 italic text-slate-400">{b.outStatus}</td>
                              <td className="py-1.5 px-1 text-right font-bold text-amber-450">{b.runs}</td>
                              <td className="py-1.5 px-1 text-right font-mono text-slate-500">{b.balls}</td>
                              <td className="py-1.5 px-2 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveBatRow(b.playerId)}
                                  className="p-1 hover:text-red-400 transition cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="py-4 text-center text-slate-600">No batsman performances added yet. Click post to sum up.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* BOWLS EDIT BOARD */}
                <div className="space-y-3 p-4 bg-slate-950/40 rounded-2xl border border-slate-800/80">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                    <h5 className="text-[10px] uppercase font-black text-rose-300 flex items-center gap-1.5">
                      🍒 Input Bowler Performance
                    </h5>
                    <span className="text-[9px] text-slate-455 font-mono italic">{bowlingPerformances.length} added</span>
                  </div>

                  {/* Add Temp fields form panel */}
                  <div className="grid grid-cols-12 gap-2 items-end pt-1 bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                    <div className="col-span-4">
                      <label className="block text-[8px] uppercase text-slate-450 font-bold mb-1">Pick Player</label>
                      <select
                        value={tempBowlId}
                        onChange={(e) => setTempBowlId(e.target.value)}
                        className="w-full text-[10px] bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-300 outline-none"
                      >
                        {players.map(p => (
                          <option key={p.id} value={p.id} className="bg-slate-950">{p.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-2">
                      <label className="block text-[8px] uppercase text-slate-450 font-bold mb-1">Overs</label>
                      <input 
                        type="text" placeholder="e.g. 4.0"
                        value={tempBowlOvers} 
                        onChange={(e) => setTempBowlOvers(e.target.value)}
                        className="w-full text-[10px] bg-slate-900 border border-slate-800 rounded p-1 text-white text-center"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-[8px] uppercase text-slate-455 font-bold mb-1">Maiden/Runs</label>
                      <div className="flex gap-1">
                        <input 
                          type="number" min="0" placeholder="M"
                          value={tempBowlMaidens} 
                          onChange={(e) => setTempBowlMaidens(e.target.value)}
                          className="w-full text-[10px] bg-slate-900 border border-slate-800 rounded p-1 text-white text-center text-[9px]"
                        />
                        <input 
                          type="number" min="0" placeholder="R"
                          value={tempBowlRuns} 
                          onChange={(e) => setTempBowlRuns(e.target.value)}
                          className="w-full text-[10px] bg-slate-900 border border-slate-800 rounded p-1 text-white text-center text-[9px]"
                        />
                      </div>
                    </div>

                    <div className="col-span-2">
                      <label className="block text-[8px] uppercase text-slate-450 font-bold mb-1">Wkts</label>
                      <input 
                        type="number" min="0"
                        value={tempBowlWickets} 
                        onChange={(e) => setTempBowlWickets(e.target.value)}
                        className="w-full text-[10px] bg-slate-900 border border-slate-800 rounded p-1 text-white text-center"
                      />
                    </div>

                    <div className="col-span-2">
                      <button
                        type="button"
                        onClick={handleAddTempBowlRow}
                        className="w-full p-2 bg-indigo-650 hover:bg-indigo-705 text-white font-bold text-[10px] rounded cursor-pointer transition flex items-center justify-center"
                        title="Add bowling figures"
                      >
                        <Plus className="w-3.5 h-3.5" /> Post
                      </button>
                    </div>
                  </div>

                  {/* Active List output */}
                  <div className="border border-slate-850 rounded-xl overflow-hidden max-h-[190px] overflow-y-auto">
                    <table className="w-full text-[10px] text-left text-slate-300 bg-slate-950/20">
                      <thead className="bg-slate-950 text-[9px] text-slate-500 uppercase tracking-wider">
                        <tr>
                          <th className="py-1 px-2">Player</th>
                          <th className="py-1 px-1 text-center">Overs</th>
                          <th className="py-1 px-1 text-right">Runs Conceded</th>
                          <th className="py-1 px-1 text-right">Wickets</th>
                          <th className="py-1 px-2 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bowlingPerformances.length > 0 ? (
                          bowlingPerformances.map((b, idx) => (
                            <tr key={idx} className="border-b border-slate-850/60 hover:bg-slate-900/45 font-sans">
                              <td className="py-1.5 px-2 font-bold text-white max-w-[100px] truncate">{b.playerName}</td>
                              <td className="py-1.5 px-1 text-center text-slate-400 font-mono">{b.overs.toFixed(1)}</td>
                              <td className="py-1.5 px-1 text-right font-mono text-slate-300">{b.runsConceded}</td>
                              <td className="py-1.5 px-1 text-right font-bold text-emerald-400">{b.wickets}</td>
                              <td className="py-1.5 px-2 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveBowlRow(b.playerId)}
                                  className="p-1 hover:text-red-400 transition cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="py-4 text-center text-slate-605">No bowler performances added yet. Click post to sum up.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

              {/* Action buttons */}
              <div className="pt-4 border-t border-slate-800 flex justify-between items-center bg-slate-950/20 p-3.5 rounded-2xl">
                <span className="text-[10px] text-slate-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  Ensure you save batsman & bowler names correctly to sync results.
                </span>
                
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingMatchId(null)}
                    className="px-4 py-2 border border-slate-800 rounded-xl text-xs text-slate-300 hover:text-white transition cursor-pointer hover:bg-slate-850"
                  >
                    Cancel Draft
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveScorecard}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 hover:scale-101 active:scale-98 text-white text-xs font-black rounded-xl transition cursor-pointer shadow border border-indigo-505"
                  >
                    Save & Sync Scorecard
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
