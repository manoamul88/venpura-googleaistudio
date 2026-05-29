import React, { useState, useMemo } from 'react';
import { Player, Match, AvailabilityStatus, MatchPoll } from '../types';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Plus, 
  UserCheck, 
  UserX, 
  HelpCircle, 
  AlertCircle, 
  Search, 
  Gamepad2, 
  Users, 
  RotateCcw,
  Sparkles,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MatchesTabProps {
  players: Player[];
  matches: Match[];
  onAddMatch: (match: Omit<Match, 'id' | 'poll'>) => void;
  onUpdatePoll: (matchId: string, playerId: string, status: AvailabilityStatus) => void;
  onClearPoll: (matchId: string) => void;
  onDeleteMatch: (id: string) => void;
  isAdmin?: boolean;
  currentUser?: Player | null;
}

export default function MatchesTab({
  players,
  matches,
  onAddMatch,
  onUpdatePoll,
  onClearPoll,
  onDeleteMatch,
  isAdmin = false,
  currentUser = null
}: MatchesTabProps) {
  // State variables
  const [selectedMatchId, setSelectedMatchId] = useState<string>(matches[0]?.id || '');
  const [showMatchForm, setShowMatchForm] = useState(false);
  const [pollSearch, setPollSearch] = useState('');
  const [pollStatusFilter, setPollStatusFilter] = useState<'ALL' | 'YES' | 'NO' | 'MAYBE' | 'UNDECIDED'>('ALL');

  // New Match Form fields
  const [opponent, setOpponent] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [venue, setVenue] = useState('');
  const [format, setFormat] = useState<'T20' | 'ODI' | 'Friendly' | 'Tournament'>('T20');
  const [notes, setNotes] = useState('');

  // Selected Match object
  const activeMatch = useMemo(() => {
    return matches.find(m => m.id === selectedMatchId) || matches[0] || null;
  }, [matches, selectedMatchId]);

  // If activeMatch is deleted or missing, reset selectedMatchId
  React.useEffect(() => {
    if (matches.length > 0 && (!selectedMatchId || !matches.some(m => m.id === selectedMatchId))) {
      setSelectedMatchId(matches[0].id);
    }
  }, [matches, selectedMatchId]);

  // Availability statistics for the active match
  const stats = useMemo(() => {
    if (!activeMatch) return { yes: 0, no: 0, maybe: 0, undecided: 30 };
    
    let yes = 0;
    let no = 0;
    let maybe = 0;
    
    players.forEach(p => {
      const response = activeMatch.poll[p.id];
      if (response === 'YES') yes++;
      else if (response === 'NO') no++;
      else if (response === 'MAYBE') maybe++;
    });

    const undecided = players.length - (yes + no + maybe);

    return { yes, no, maybe, undecided };
  }, [players, activeMatch]);

  // Squad status recommendation (Cricket needs 11 players!)
  const squadPrompt = useMemo(() => {
    if (stats.yes >= 11) {
      return {
        style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        text: `Squad Ready! You have ${stats.yes} players confirmed. A full XI is available.`,
        ready: true
      };
    } else if (stats.yes + stats.maybe >= 11) {
      return {
        style: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        text: `Nearing XI: ${stats.yes} confirmed, ${stats.maybe} on watch. Encourage non-respondents to vote!`,
        ready: false
      };
    } else {
      return {
        style: 'bg-rose-500/10 text-rose-400 border-rose-200/10',
        text: `Recruiting Squad: Only ${stats.yes} confirmed. Cricket requires at least 11 players!`,
        ready: false
      };
    }
  }, [stats]);

  // Form submit callback
  const handleMatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!opponent || !date || !time) return;

    onAddMatch({
      opponent,
      date,
      time,
      venue: venue || 'Home Ground Stadium',
      format,
      notes
    });

    // Reset Form
    setOpponent('');
    setDate('');
    setTime('');
    setVenue('');
    setFormat('T20');
    setNotes('');
    setShowMatchForm(false);
  };

  // Filtered player availability list
  const filteredPlayersForPoll = useMemo(() => {
    if (!activeMatch) return [];

    return players.filter(p => {
      // Name search
      const matchesSearch = p.name.toLowerCase().includes(pollSearch.toLowerCase()) || 
                            (p.role && p.role.toLowerCase().includes(pollSearch.toLowerCase()));
      
      // RSVP category filter
      const response = activeMatch.poll[p.id];
      let matchesFilter = true;
      if (pollStatusFilter === 'YES') matchesFilter = response === 'YES';
      else if (pollStatusFilter === 'NO') matchesFilter = response === 'NO';
      else if (pollStatusFilter === 'MAYBE') matchesFilter = response === 'MAYBE';
      else if (pollStatusFilter === 'UNDECIDED') matchesFilter = !response;

      return matchesSearch && matchesFilter;
    });
  }, [players, activeMatch, pollSearch, pollStatusFilter]);

  return (
    <div className="space-y-6">
      
      {/* Matches Tabs Selector or Creation Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left side: Match list feed */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-display font-bold text-white uppercase tracking-tight">Upcoming Fixtures</h3>
              <p className="text-xs text-slate-400 mt-0.5">Select a fixture to view interactive polls</p>
            </div>
            
            {isAdmin ? (
              <button
                id="btn-new-match"
                type="button"
                onClick={() => setShowMatchForm(!showMatchForm)}
                className="p-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition shadow-md whitespace-nowrap shrink-0"
              >
                <Plus className="w-3.5 h-3.5" /> New Fixture
              </button>
            ) : (
              <span className="text-[10px] font-bold text-slate-500 uppercase bg-slate-950 px-2 py-1.5 rounded-lg border border-slate-850">
                🔒 Matches Lock Active
              </span>
            )}
          </div>

          {/* New Match Form Dropdown Container */}
          <AnimatePresence>
            {showMatchForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-slate-900 p-5 rounded-2xl border border-indigo-500/30 shadow-2xl overflow-hidden"
              >
                <form onSubmit={handleMatchSubmit} className="space-y-3.5">
                  <h4 className="text-xs font-bold text-white uppercase tracking-widest border-b border-slate-800 pb-2">Schedule New Match</h4>
                  
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Opponent Team</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Pretoria Titans CC"
                      value={opponent}
                      onChange={(e) => setOpponent(e.target.value)}
                      className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-indigo-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Date</label>
                      <input
                        required
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-indigo-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Time</label>
                      <input
                        required
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-indigo-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Venue / Ground</label>
                      <input
                        type="text"
                        placeholder="Ground B Oval"
                        value={venue}
                        onChange={(e) => setVenue(e.target.value)}
                        className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-indigo-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Format</label>
                      <select
                        value={format}
                        onChange={(e) => setFormat(e.target.value as any)}
                        className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 outline-none focus:border-indigo-400"
                      >
                        <option value="T20" className="bg-slate-950">T20 Overs Match</option>
                        <option value="ODI" className="bg-slate-950">50-Overs (ODI)</option>
                        <option value="Friendly" className="bg-slate-950">Friendly Match</option>
                        <option value="Tournament" className="bg-slate-950">Tournament Elite</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Match Captain Notes</label>
                    <textarea
                      placeholder="Special instructions, uniforms..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                      className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-indigo-400 resize-none font-sans"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowMatchForm(false)}
                      className="px-3 py-2 border border-slate-800 text-slate-400 rounded-lg text-[11px] font-bold hover:bg-slate-800 hover:text-white transition cursor-pointer"
                    >
                      Close
                    </button>
                    <button
                      id="btn-create-fixture"
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] px-3.5 py-2 font-bold cursor-pointer transition"
                    >
                      Add Fixture
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* List of Scheduled Matches */}
          <div className="space-y-3">
            {matches.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-slate-900 rounded-2xl border border-slate-800 italic">
                No matches scheduled yet.
              </div>
            ) : (
              matches.map((m) => {
                const isActive = m.id === selectedMatchId;
                const yesCount = Object.values(m.poll).filter(status => status === 'YES').length;
                
                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedMatchId(m.id)}
                    className={`p-4 rounded-2xl border transition cursor-pointer text-left ${
                      isActive 
                        ? 'bg-slate-900 border-indigo-500/80 text-white shadow-xl ring-1 ring-indigo-500/20' 
                        : 'bg-slate-905 border-slate-800/80 hover:border-slate-800 text-slate-350 hover:bg-slate-900/50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-indigo-500/25 text-indigo-300 border border-indigo-500/20' : 'bg-slate-900 text-slate-400 border border-slate-850'
                      }`}>
                        {m.format}
                      </span>
                      <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5 text-indigo-400" /> {m.time}
                      </span>
                    </div>

                    <h4 className="font-display font-bold text-sm tracking-tight text-white mt-2">
                      vs {m.opponent}
                    </h4>

                    <div className="mt-3 space-y-1 text-xs text-slate-400">
                      <p className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {new Date(m.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                      </p>
                      <p className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        {m.venue}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/60 flex justify-between items-center text-xs">
                      <span className="text-[10px] uppercase font-bold text-slate-500">Availability Tally</span>
                      <span className={`font-mono text-xs font-bold ${yesCount >= 11 ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded' : 'text-slate-405 bg-slate-900 px-2 py-0.5 rounded border border-slate-850'}`}>
                        {yesCount} YES RSVPs
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right side: Active poll interactive editor */}
        <div className="lg:col-span-8">
          {activeMatch ? (
            <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-6 shadow-2xl">
              
              {/* Active Match Header Details */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full">
                      Active Fixture: {activeMatch.format}
                    </span>
                    <span className="text-slate-400 text-xs font-mono">{activeMatch.date} @ {activeMatch.time}</span>
                  </div>
                  <h2 className="text-2xl font-display font-black tracking-tight text-white mt-1">
                    Squad Poll vs {activeMatch.opponent}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400" /> Played at {activeMatch.venue}
                  </p>
                </div>

                {/* Reset / Delete Match Operations */}
                {isAdmin && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm("Are you sure you want to reset all responses to Undecided?")) {
                          onClearPoll(activeMatch.id);
                        }
                      }}
                      className="p-1 px-3 py-2 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg text-xs flex items-center gap-1.5 cursor-pointer transition"
                      title="Clear RSVP Poll data"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Clear Tally
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Remove this match fixture against ${activeMatch.opponent}?`)) {
                          onDeleteMatch(activeMatch.id);
                        }
                      }}
                      className="p-1 px-3 py-2 border border-rose-500/20 hover:bg-rose-500/10 hover:border-rose-550/30 text-rose-405 rounded-lg text-xs flex items-center gap-1 cursor-pointer transition"
                      title="Delete matchmaking event"
                    >
                      Delete Fixture
                    </button>
                  </div>
                )}
              </div>

              {/* Match Notes Alert */}
              {activeMatch.notes && (
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/60 text-xs text-slate-300 flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-200">Match Day Guidelines:</span>
                    <p className="mt-0.5 italic text-slate-400">{activeMatch.notes}</p>
                  </div>
                </div>
              )}

              {/* Squad Readiness Progress Widget */}
              <div className={`p-4 rounded-xl border text-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 ${squadPrompt.style}`}>
                <div className="flex items-start gap-3">
                  <Gamepad2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold uppercase tracking-widest block mb-0.5">XI Squad Advisory</span>
                    <p>{squadPrompt.text}</p>
                  </div>
                </div>

                {/* Progress Mini Bar (Goal: 11) */}
                <div className="w-full md:w-36 shrink-0 space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400">
                    <span>Squad Metric</span>
                    <span>{stats.yes}/11 YES</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-full ${squadPrompt.ready ? 'bg-emerald-400' : 'bg-amber-400'}`} 
                      style={{ width: `${Math.min(100, (stats.yes / 11) * 100)}%` }} 
                    />
                  </div>
                </div>
              </div>

              {/* Live Tallies Count Grid */}
              <div className="grid grid-cols-4 gap-3 bg-slate-950/30 p-3 rounded-xl border border-slate-800/50 text-center">
                <div className="bg-slate-950/85 border border-slate-850 p-2.5 rounded-lg shadow-2xs">
                  <span className="font-mono text-lg font-bold text-emerald-400">{stats.yes}</span>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Yes</p>
                </div>
                <div className="bg-slate-950/85 border border-slate-850 p-2.5 rounded-lg shadow-2xs">
                  <span className="font-mono text-lg font-bold text-rose-450">{stats.no}</span>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">No</p>
                </div>
                <div className="bg-slate-950/85 border border-slate-850 p-2.5 rounded-lg shadow-2xs">
                  <span className="font-mono text-lg font-bold text-amber-400">{stats.maybe}</span>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Maybe</p>
                </div>
                <div className="bg-slate-950/85 border border-slate-850 p-2.5 rounded-lg shadow-2xs">
                  <span className="font-mono text-lg font-bold text-slate-400">{stats.undecided}</span>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Needs Vote</p>
                </div>
              </div>

              {/* Advanced RSVP Filter Panel with Player Search */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-indigo-400" />
                    Interactive Player RSVP Poll
                  </h3>

                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    {/* Search Field */}
                    <div className="relative flex-1 sm:flex-none">
                      <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Search roster..."
                        value={pollSearch}
                        onChange={(e) => setPollSearch(e.target.value)}
                        className="pl-8 pr-3 py-1 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white outline-none focus:border-indigo-400 w-full sm:w-40"
                      />
                    </div>

                    {/* Filter Category Tabs */}
                    <select
                      value={pollStatusFilter}
                      onChange={(e) => setPollStatusFilter(e.target.value as any)}
                      className="text-xs bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-2 py-1 outline-none focus:border-indigo-400"
                    >
                      <option value="ALL" className="bg-slate-950">All Players (30)</option>
                      <option value="YES" className="bg-slate-950">Confirmed (YES)</option>
                      <option value="NO" className="bg-slate-950">Unavailable (NO)</option>
                      <option value="MAYBE" className="bg-slate-950">Tentative (MAYBE)</option>
                      <option value="UNDECIDED" className="bg-slate-950">Needs Vote (UNDECIDED)</option>
                    </select>
                  </div>
                </div>

                {/* List of 30 Players with YES / NO / MAYBE Click-to-Vote Actions */}
                <div className="border border-slate-850 rounded-xl divide-y divide-slate-850/60 bg-slate-950/20 max-h-[460px] overflow-y-auto">
                  {filteredPlayersForPoll.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-xs">
                      No players match the search or filter criteria. Try showing "All Players".
                    </div>
                  ) : (
                    filteredPlayersForPoll.map((player) => {
                      const userResponse = activeMatch.poll[player.id];
                      
                      return (
                        <div key={player.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-950/50 transition duration-150">
                          
                          {/* Player info */}
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-slate-900 border border-slate-805 font-mono text-xs font-bold text-slate-400 flex items-center justify-center">
                              {player.jerseyNumber ? `#${player.jerseyNumber}` : '?'}
                            </span>
                            <div>
                              <div className="font-semibold text-slate-200 text-sm flex items-center gap-2">
                                {player.name}
                                {player.role?.includes('Captain') && (
                                  <span className="bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 rounded text-[9px] font-extrabold px-1 tracking-wider uppercase">
                                    C
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400">{player.role || 'Player Roster'}</p>
                            </div>
                          </div>

                          {/* Interactive Poll Radio-Toggles */}
                          {(() => {
                            const canVote = isAdmin || (currentUser && player.id === currentUser.id);
                            return (
                              <div className="flex flex-col items-end gap-1 select-none">
                                <div className="flex items-center gap-1">
                                  {/* YES BUTTON */}
                                  <button
                                    id={`poll-yes-${player.id}`}
                                    type="button"
                                    onClick={() => {
                                      if (canVote) onUpdatePoll(activeMatch.id, player.id, 'YES');
                                    }}
                                    disabled={!canVote}
                                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                                      !canVote ? 'opacity-30 cursor-not-allowed text-slate-600' : 'cursor-pointer'
                                    } ${
                                      userResponse === 'YES'
                                        ? 'bg-emerald-600 text-white font-bold shadow-md'
                                        : 'bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-white'
                                    }`}
                                  >
                                    <UserCheck className="w-3.5 h-3.5" /> YES
                                  </button>

                                  {/* NO BUTTON */}
                                  <button
                                    id={`poll-no-${player.id}`}
                                    type="button"
                                    onClick={() => {
                                      if (canVote) onUpdatePoll(activeMatch.id, player.id, 'NO');
                                    }}
                                    disabled={!canVote}
                                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                                      !canVote ? 'opacity-30 cursor-not-allowed text-slate-600' : 'cursor-pointer'
                                    } ${
                                      userResponse === 'NO'
                                        ? 'bg-red-650 text-white font-bold shadow-md'
                                        : 'bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-white'
                                    }`}
                                  >
                                    <UserX className="w-3.5 h-3.5" /> NO
                                  </button>

                                  {/* MAYBE BUTTON */}
                                  <button
                                    id={`poll-maybe-${player.id}`}
                                    type="button"
                                    onClick={() => {
                                      if (canVote) onUpdatePoll(activeMatch.id, player.id, 'MAYBE');
                                    }}
                                    disabled={!canVote}
                                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                                      !canVote ? 'opacity-30 cursor-not-allowed text-slate-600' : 'cursor-pointer'
                                    } ${
                                      userResponse === 'MAYBE'
                                        ? 'bg-amber-500 text-white font-bold shadow-md'
                                        : 'bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-white'
                                    }`}
                                  >
                                    <HelpCircle className="w-3.5 h-3.5" /> MAYBE
                                  </button>
                                </div>
                                {!canVote && (
                                  <span className="text-[8px] text-slate-600 uppercase font-bold tracking-wider mr-1">Roster Locked</span>
                                )}
                              </div>
                            );
                          })()}

                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl p-12 text-center text-slate-500">
              <AlertCircle className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <h3 className="text-white font-bold uppercase tracking-wider">No Fixtures Active</h3>
              <p className="text-xs text-slate-400">Create a new fixture on the panel to open the availability polls tracker.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
